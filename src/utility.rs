use ethabi::ethereum_types::Address;
use ethers::middleware::SignerMiddleware;
use ethers::prelude::{Bytes, Http, LocalWallet, Provider, Signature};
use std::sync::Arc;
// use crate::services::certificate_service::Authenticity.sol;

// Convert Signature to Bytes
pub fn to_bytes(signature: Signature) -> Bytes {
    Bytes::from(signature.to_vec())
}

// App state to hold the project state
