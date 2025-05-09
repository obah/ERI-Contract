// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./Originality.sol";
import "contracts/IEri.sol";

contract OriginalityFactory is EIP712{

    string private constant SIGNING_DOMAIN = "CertificateAuth";
    string private constant SIGNATURE_VERSION = "1";

    bytes32 private constant CERTIFICATE_TYPE_HASH =
    keccak256(
        "Certificate(string name,string uniqueId,string serial,uint256 date,address owner,string[] metadata)"
    );

//    address private immutable OWNERSHIP;

    mapping(address manufacturer => IEri.Manufacturer) public manufacturers;
    mapping(string manufacturerName => address registeredAddress) private names;

    event ManufacturerRegistered(
        address indexed manufacturerAddress,
        address indexed manufacturerContract
    );

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ONLY_OWNER(_user);
        _;
    }

    constructor (/*address ownershipAdd*/) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)  {
//        OWNERSHIP = ownershipAdd;
    }


    function manufacturerRegisters(string memory name) external addressZeroCheck(msg.sender) { // this will be done on-chain

        address _owner = msg.sender;

        //making sure there's no duplicate registration
        if (manufacturers[_owner].manufacturerAddress != address(0) &&
            manufacturers[_owner].manufacturerContract != address(0)) {
            revert EriErrors.ALREADY_REGISTERED(msg.sender);
        }
        //just added this
        if (names[name] != address(0)) {
            revert EriErrors.NANE_ALREADY_EXIST(name);
        }

        address manufacturerContract = address( //create the manufacturer contract
            new Originality(/*OWNERSHIP, */_owner)
        );

        //caller will be the owner of the contract, that's why you must call from your wallet
        IEri.Manufacturer storage newManufacturer = manufacturers[msg.sender];

        newManufacturer.manufacturerContract = manufacturerContract;
        newManufacturer.manufacturerAddress = _owner;
        newManufacturer.name = name;

        names[name] = _owner;

        emit ManufacturerRegistered(_owner, manufacturerContract);
    }

    function getContract(address manufacturerAddress) internal view returns (address) {

        return manufacturers[manufacturerAddress].manufacturerContract;
    }

    function getManufacturerAddress(address expectedManufacturer) public view returns (address) {

        address manuContract = getContract(expectedManufacturer);

        if (manuContract == address(0)) {
            revert EriErrors.CONTRACT_DOEST_NOT_EXIST();
        }
        IEri originality = IEri(manuContract);

        return originality.getOwner();
    }

    //this would have made sense in the Originality contract but EIP-712 makes it complicated. this is the easy route
    function verifySignature(
        address expectedOwner,
        IEri.Certificate memory certificate,
        bytes memory signature
    ) external view returns (bool)  {

        bytes32 metadataHash = keccak256(abi.encode(certificate.metadata));
        bytes32 structHash = keccak256(
            abi.encode(
                CERTIFICATE_TYPE_HASH,
                keccak256(bytes(certificate.name)),
                keccak256(bytes(certificate.uniqueId)),
                keccak256(bytes(certificate.serial)),
                certificate.date,
                certificate.owner,
                metadataHash
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);

        //to get the owner of the contract
        address manufacturer = getManufacturerAddress(expectedOwner);

        if (signer != manufacturer) {
            revert EriErrors.INVALID_SIGNATURE();
        }

        return true;
    }
}
