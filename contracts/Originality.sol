// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/utils/Strings.sol";
import "contracts/OwnershipLib.sol";
import "./EriErrors.sol";
import "./IEri.sol";

contract Originality {

    using Strings for uint256;

    address public immutable owner; //to be made private
    uint256 immutable manufacturerId;

    mapping(string => IEri.Item) public items; //to be made private
    mapping(bytes32 => IEri.Item) public changeOfOwnershipCode; //to be made private

    event ItemCreated(string indexed itemId, address indexed owner);
    event ManufacturerCode(
        string indexed manufacturerCode,
        string indexed itemId,
        bytes32 hashKey
    );
    event OwnershipClaimed(address indexed newOwner, string indexed itemId);

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ADDRESS_ZERO(_user);
        _;
    }

    modifier onlyOwner(address _caller) {
        if (_caller != owner) revert EriErrors.ONLY_OWNER(_caller);
        _;
    }

    //Not complete, will add manufacturerID and others
    constructor (address _owner, uint256 _manufacturerId) {
        owner = _owner;
        manufacturerId = _manufacturerId;
    }

    // manufacturer contract will be a factory contract where a new contract will be ccreated at the registration of each manufacturer
    // this will help them manage their product
    // manufacturer contract will be a factory contract where a new contract will be ccreated at the registration of each manufacturer
    // this will help them manage their product
    // only the manufacturer should be able to create items but, again,
    // with this here, there's no way to verify who the manufacturer is
    function ownerCreatedItem(
        address _caller,
        string memory itemId,
        string memory name,
        string[] memory metadata
    ) external addressZeroCheck(msg.sender) onlyOwner(_caller) {

        IEri.Item storage item = items[itemId];

        item.itemId = itemId;
        item.name = name;
        item.owner = owner;
        item.metadata = metadata;

        emit ItemCreated(itemId, _caller);
    }

    function getItem(string memory itemId)
    external
    view
    returns (IEri.Item memory)
    {
        return items[itemId];
    }

    function manufacturerGeneratesCode(string memory itemId)
    external
    returns (string memory)
    {
        bytes32 ownershipHash = keccak256(
            abi.encode(itemId, block.timestamp, msg.sender)
        );

        // convert bytes32 to uint256 first to access the toHexString function
        string memory shortHash = uint256(ownershipHash).toHexString();

        // extract first 32 characters
        bytes memory hashBytes = bytes(shortHash);
        bytes memory shortenedHash = new bytes(32);

        for (uint256 i = 0; i < 32 && (i + 2) < hashBytes.length; i++) {
            shortenedHash[i] = hashBytes[i + 2];
        }

        string memory manufacturerCode = string(
            abi.encodePacked(manufacturerId.toString(), "-", shortenedHash)
        );

        bytes32 hashKey = keccak256(abi.encode(shortenedHash));

        //manufacturer generates the code for use to claim ownership for the first time
        changeOfOwnershipCode[hashKey] = items[itemId];

        emit ManufacturerCode(manufacturerCode, itemId, hashKey); //this is what will be in the item pack and not emitted as event

        return manufacturerCode; //this will also be removed in production
    }

    // before the ownershipCode is passed into this function, the first digit before the dash is stripped away,
    // it's the manufacturer code to access this smart contract from the factory contract
    function userClaimOwnershipForTheFirstTime(address _caller, string memory ownershipCode)
    external
    addressZeroCheck(msg.sender)
    {
        // this just makes anyone who's able to provide the ownership code
        // this might poses a security risk

        bytes32 hashedCode = keccak256(abi.encode(ownershipCode));

        IEri.Item memory item = changeOfOwnershipCode[hashedCode];

        item.owner = _caller;

        items[item.itemId] = item;

        delete changeOfOwnershipCode[hashedCode];

        emit OwnershipClaimed(item.owner, item.itemId);
    }


    //     address public verifier; // Set in constructor

    // function userClaimOwnershipForTheFirstTime(
    //     string memory ownershipCode,
    //     bytes memory signature // Signed by verifier
    // ) external addressZeroCheck(msg.sender) {
    //     // Verify the signature
    //     bytes32 hash = keccak256(abi.encodePacked(msg.sender, ownershipCode));
    //     address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), signature);
    //     require(signer == verifier, "Invalid signature");

    //     _processOwnershipClaim(ownershipCode);
    // }
}
