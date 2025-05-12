// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;


import "./EriErrors.sol";
import "./IEri.sol";

contract Originality {

    address private immutable owner;

    event ItemCreated(string name, bytes32 indexed uniqueId, address indexed owner);
    event OwnershipClaimed(address indexed newOwner, string indexed itemId);

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ADDRESS_ZERO(_user);
        _;
    }

    modifier onlyOwner(address _caller) {
        if (_caller != owner) revert EriErrors.ONLY_OWNER(_caller);
        _;
    }

    constructor (address contractOwner) {
        owner = contractOwner;
    }
    

    function getOwner() external view returns (address) {
        return owner;
    }
}