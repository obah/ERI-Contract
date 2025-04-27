// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "contracts/OwnershipLib.sol";
import "./EriErrors.sol";
import "./IEri.sol";

contract Ownership {
    using OwnershipLib for *;

    address private immutable owner;

    mapping(address => IEri.UserProfile) public users;
    mapping(string => IEri.Item) public items;
    mapping(bytes32 => IEri.Item) public changeOfOwnershipCode;

    event ContractCreated(
        address indexed contractAddress,
        address indexed owner
    );

    event UserRegistered(address indexed userAddress, string indexed username);
    event OwnershipCode(bytes32 indexed ownershipCode);
    event ItemCreated(string indexed itemId, address indexed owner);

    constructor(address _owner) {
        owner = _owner;

        emit ContractCreated(address(this), _owner);
    }

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ONLY_OWNER(_user);
        _;
    }

    function userRegisters(address userAddress, string memory username)
    external
    addressZeroCheck(userAddress)
    {
        //this delegates the logic to the library
        users._userRegisters(userAddress, username);

        emit UserRegistered(userAddress, username);
    }

    function isRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }







    function generateChangeOfOwnershipCode(string memory itemId) external {
        address currentOwner = items[itemId].owner;

        if (currentOwner != msg.sender) revert EriErrors.ONLY_OWNER(msg.sender);

        bytes32 ownershipHash = keccak256(abi.encode(itemId, block.timestamp, currentOwner));

        changeOfOwnershipCode[ownershipHash] = items[itemId];


    }




}
