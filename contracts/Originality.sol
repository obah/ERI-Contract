// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/utils/Strings.sol";
import "contracts/OwnershipLib.sol";
import "./EriErrors.sol";
import "./IEri.sol";

contract Originality {

    using Strings for uint256;
    using Strings for bytes32;

    address immutable owner;
    uint256 immutable manufacturerId;

    mapping(string => IEri.Item) public items;
    mapping(string => IEri.Item) public changeOfOwnershipCode;

    event ItemCreated(string indexed itemId, address indexed owner);
    event ManufacturerCode(string indexed manufacturerCode, string indexed itemId);
    event OwnershipClaimed(address indexed newOwner, string indexed itemId);

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ADDRESS_ZERO(_user);
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert EriErrors.ONLY_OWNER(msg.sender);
        _;
    }

    // manufacturer contract will be a factory contract where a new contract will be ccreated at the registration of each manufacturer
    // this will help them manage their product
    // manufacturer contract will be a factory contract where a new contract will be ccreated at the registration of each manufacturer
    // this will help them manage their product
    // only the manufacturer should be able to create items but, again,
    // with this here, there's no way to verify who the manufacturer is
    function ownerCreatedItem(
        string memory itemId,
        string memory name,
        string[] memory metadata
    ) external addressZeroCheck(msg.sender) {
        IEri.Item storage item = items[itemId];

        item.itemId = itemId;
        item.name = name;
        item.owner = msg.sender;
        item.metadata = metadata;

        emit ItemCreated(itemId, msg.sender);
    }

    function getItem(string memory itemId) external view returns (IEri.Item memory) {
        return items[itemId];
    }

    function manufacturerGeneratesCode(string memory itemId) external returns (string memory){

        bytes32 ownershipHash = keccak256(abi.encode(itemId, block.timestamp, msg.sender));


        // convert bytes32 to uint256 first to access the toHexString function
        string memory shortHash = uint256(ownershipHash).toHexString();

        // extract first 32 characters
        bytes memory hashBytes = bytes(shortHash);
        bytes memory shortenedHash = new bytes(32);

        for (uint256 i = 0; i < 32 && (i + 2) < hashBytes.length; i++) {
            shortenedHash[i] = hashBytes[i + 2];
        }

        string memory manufacturerCode =  string(abi.encodePacked(
            manufacturerId.toString(),
            "-",
            shortenedHash
        ));

        //manufacturer generates the code for use to claim ownership for the first time
        changeOfOwnershipCode[manufacturerCode] = items[itemId];

        emit ManufacturerCode(manufacturerCode, itemId);

        return manufacturerCode;
    }

    // before the ownershipCode is passed into this function, the first digit before the dash is stripped away,
    // it's the manufacturer code to access this smart contract from the factory contract
    function userClaimOwnershipForTheFirstTime(string memory ownershipCode) external addressZeroCheck(msg.sender) {
        // this just makes anyone who's able to provide the ownership code
        // this might poses a security risk

        IEri.Item storage item = changeOfOwnershipCode[ownershipCode];

        item.owner = msg.sender;

        emit OwnershipClaimed(item.owner, item.itemId);

    }
}
