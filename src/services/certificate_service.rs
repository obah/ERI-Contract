use crate::models::certificate_model::{Certificate, SignedCertificate, CustomEIP712Domain, Eip712Object, CertificateData};
use crate::models::events::ManufacturerRegistered;
use crate::utility::{to_bytes, AppState};
use axum::{Json, extract::State, extract::Path, http::StatusCode};
use ethabi::RawLog;
use ethers::types::transaction::eip712::Eip712;
use ethers::utils::hash_message;
use ethers::{
    contract::{EthEvent, abigen},
    prelude::*,
    signers::Signer,
    types::Signature,
};
use ethers::utils::hex::ToHexExt;
use hex::ToHex;
use crate::models::certificate_model::RegInput;

// abi path
abigen!(
    OriginalityFactory,
    "./hh-artifacts/contracts/Authenticity.sol/Authenticity.sol.json",
    event_derives(serde::Deserialize, serde::Serialize)
);

//=======================

#[utoipa::path(
    post,
    path = "/verify_authenticity",
    request_body = SignedCertificate,
    responses(
        (status = 200, description = "Signature verification result", body = String),
        (status = 400, description = "Invalid input"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn verify_authenticity(
    State(state): State<AppState>,
    Json(cert): Json<SignedCertificate>,
) -> Result<Json<String>, StatusCode> {
    let certificate: Certificate = cert
        .clone()
        .try_into()
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    // Parse the signature from hex string
    let signature_bytes = hex::decode(cert.signature.trim_start_matches("0x")).map_err(|e| {
        eprintln!("Invalid signature format: {:?}", e);
        StatusCode::BAD_REQUEST
    })?;

    eprintln!("Signature Byte: {:?}", signature_bytes);

    let signature = Signature::try_from(signature_bytes.as_slice()).map_err(|e| {
        eprintln!("Signature parsing error: {:?}", e);
        StatusCode::BAD_REQUEST
    })?;

    eprintln!("Signature: {:?}", signature);

    // Compute the EIP-712 digest
    let digest = certificate.encode_eip712().map_err(|e| {
        eprintln!("EIP-712 encoding error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    //this caused big issue until I removed it
    // let digest = hash_message(digest); // Prefix with \x19Ethereum Signed Message

    eprintln!("Digest: {:?}", digest);

    // Recover the signer
    let signer = signature.recover(digest).map_err(|e| {
        eprintln!("Signer recovery error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    eprintln!("Signer: {:?}", signer);
    // very important: double check to make sure the certificate owner is the signer of the signature
    assert_eq!(signer, certificate.owner);


    // Fetch the contract's owner
    let contract = OriginalityFactory::new(state.originality_factory, state.eth_client.clone());

    let manufacturer_address = contract
        .get_manufacturer_address(signer)
        .call()
        .await
        .map_err(|e| {
            eprintln!("Contract call error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    eprintln!("Manufacturer Address: {:?}", manufacturer_address);
    // Verify the signer matches the owner
    if signer == manufacturer_address {
        Ok(Json(format!(
            "Signature is valid! Signed by owner: {:?}",
            signer
        )))
    } else {
        Ok(Json(format!(
            "Signature is invalid. Recovered signer: {:?}, expected owner: {:?}",
            signer, manufacturer_address
        )))
    }
}

#[utoipa::path(
    post,
    path = "/create_certificate",
    request_body = CertificateData,
    responses(
        (status = 200, description = "EIP-712 object created successfully", body = Eip712Object),
        (status = 400, description = "Invalid input"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn create_certificate(
    Json(cert): Json<CertificateData>,
) -> Result<Json<Eip712Object>, StatusCode> {
    // Validate inputs
    if cert.name.is_empty() || cert.unique_id.is_empty() || cert.serial.is_empty() {
        eprintln!("Empty name, unique_id, or serial");
        return Err(StatusCode::BAD_REQUEST);
    }
    if cert.owner.is_empty() {
        eprintln!("Empty manufacturer_address");
        return Err(StatusCode::BAD_REQUEST);
    }
    
    println!("owner: {:?}", cert.owner);

    // Convert to Certificate
    let certificate: Certificate = cert
        .try_into()
        .map_err(|e| {
            eprintln!("Certificate conversion error: {:?}", e);
            StatusCode::BAD_REQUEST
        })?;

    // Create EIP-712 domain
    let domain = certificate
        .domain()
        .map_err(|e| {
            eprintln!("EIP-712 domain error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Convert to CustomEIP712Domain
    let custom_domain = CustomEIP712Domain::from(domain);

    // Define EIP-712 types
    let types = serde_json::json!({
        "Certificate": [
            { "name": "name", "type": "string" },
            { "name": "uniqueId", "type": "string" },
            { "name": "serial", "type": "string" },
            { "name": "date", "type": "uint256" },
            { "name": "owner", "type": "address" },
            { "name": "metadata", "type": "string[]" }
        ]
    });
    

    // Create EIP-712 value
    let value = serde_json::json!({
        "name": certificate.name,
        "uniqueId": certificate.unique_id,
        "serial": certificate.serial,
        "date": certificate.date.to_string(),
        "owner": ToHexExt::encode_hex_upper_with_prefix(&certificate.owner),
        "metadata": certificate.metadata
    });

    let eip712_object = Eip712Object {
        domain: custom_domain,
        types,
        value,
    };

    eprintln!("EIP-712 object created: {:?}", eip712_object);
    Ok(Json(eip712_object))
}

//============== FOR TEST ONLY => WILL BE REMOVED WHEN DONE =======================

#[utoipa::path(
    post,
    path = "/manufacturer_registers", //TODO: Registration will be done from the frontend
    request_body = RegInput,
    responses(
        (status = 200, description = "Signature verification result", body = String),
        (status = 400, description = "Invalid input"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn manufacturer_registers(
    State(state): State<AppState>,
    Json(input): Json<RegInput>,
) -> Result<Json<String>, StatusCode> {
    // Fetch the contract's owner
    let contract = OriginalityFactory::new(state.originality_factory, state.eth_client.clone());

    let receipt = contract
        .manufacturer_registers(input.name)
        .send()
        .await
        .map_err(|e| {
            eprintln!("Transaction send error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .await
        .map_err(|e| {
            eprintln!("Transaction confirmation error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    if receipt.status != Some(1.into()) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut event_res = ManufacturerRegistered::init();

    for log in receipt.logs.iter() {
        let raw_log = RawLog {
            topics: log.topics.clone(),
            data: log.data.clone().to_vec(),
        };

        if let Ok(event) = <ManufacturerRegistered as EthEvent>::decode_log(&raw_log) {

            event_res = ManufacturerRegistered::new(
                event.manufacturer_address,
                event.manufacturer_contract,
            );

            println!("📦 Manufacturer Registers:");
            println!(
                "    Manufacturer Address: {}",
                event.manufacturer_address
            );
            println!(
                "    Manufacturer Contract: {:?}",
                event.manufacturer_contract
            );
        }
    }

    Ok(Json(format!(
        "Manufacturer Address: {:?}, Manufacturer Contract: {:?}",
        event_res.manufacturer_address, event_res.manufacturer_contract
    )))
}

#[utoipa::path( //TODO: This was just used to check the contract status
    get,
    path = "/get_owner/{address}",
    params(
        ("address" = String, Path, description = "Address of the owner")
    ),
    responses(
        (status = 200, description = "Owner retrieved successfully", body = String),
        (status = 400, description = "Invalid Owner Address"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn get_owner(
    State(state): State<AppState>,
    Path(input): Path<String>,
) -> Result<Json<Address>, StatusCode> {

    let contract = OriginalityFactory::new(state.originality_factory, state.eth_client.clone());

    let owner = input.parse().unwrap();
    let manufacturer_address = contract
        .get_manufacturer_address(owner)
        .call()
        .await
        .map_err(|e| {
            eprintln!("Contract call error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(manufacturer_address))
}


#[utoipa::path( //TODO: This will be called from the frontend, just created this for test
    post,
    path = "/verify_signature",
    request_body = CertificateData,
    responses(
        (status = 200, description = "Signature verified on-chain successfully", body = String),
        (status = 400, description = "Invalid signature"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn verify_signature(
    State(state): State<AppState>,
    Json(cert): Json<CertificateData>,
) -> anyhow::Result<Json<String>, StatusCode> {
    let certificate: Certificate = cert
        .clone()
        .try_into()
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    // accessing the wallet from SignerMiddleware
    // Sign the certificate
    let signature: Signature = state
        .eth_client
        .signer()
        .sign_typed_data(&certificate)
        .await
        .map_err(|e| {
            eprintln!("Signature error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    eprintln!("Signature: {:?}", signature);

    // Convert to contract certificate
    let contract_cert: originality_factory::Certificate = certificate.into();
    let sig_bytes = to_bytes(signature);

    // Call create_item
    let contract = OriginalityFactory::new(state.originality_factory, state.eth_client.clone());

    eprintln!("Wallet Address: {:?}", state.wallet_address);
    eprintln!("Address: {:?}", state.eth_client.signer().address());

    let result = contract
        .verify_signature(contract_cert, sig_bytes)
        .call()
        .await
        .map_err(|e| {
            eprintln!("Transaction send error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

       eprintln!("Result: {:?}", result);

    Ok(Json(format!("Result: {:?}", result)))
}

#[utoipa::path( //TODO: This is purely for testing purpose
    post,
    path = "/generate_signature",
    request_body = CertificateData,
    responses(
        (status = 200, description = "Signature verification result", body = String),
        (status = 400, description = "Invalid input"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn generate_signature(
    State(state): State<AppState>,
    Json(cert): Json<CertificateData>,
) -> Result<Json<String>, StatusCode> {

    let certificate: Certificate = cert
        .clone()
        .try_into()
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let signature: Signature = state
        .eth_client
        .signer()
        .sign_typed_data(&certificate)
        .await
        .map_err(|e| {
            eprintln!("Signature error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(signature.to_string()))
}