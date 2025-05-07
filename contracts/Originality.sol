// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;


import "./EriErrors.sol";
import "./IEri.sol";

contract Originality {

    address private immutable owner;
//    IEri private immutable OWNERSHIP;

    error InvalidSignature(address signer, bool result);

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

    constructor (/*address ownershipContract,*/ address contractOwner) {

        owner = contractOwner;
//        OWNERSHIP = IEri(ownershipContract);
    }
    

    function getOwner() external view returns (address) {
        return owner;
    }
}