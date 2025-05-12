// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./EriErrors.sol";
import "./IEri.sol";
import "contracts/OwnershipLib.sol";

contract Ownership {
    using OwnershipLib for *;

    address public immutable owner;
    // this links username to a user profile
    mapping(string => IEri.UserProfile) private users;
    //link wallet address to username
    mapping(address => string) private usernames;

    //this links itemId to the address of the owner
    mapping(string => address) private owners;
    // this links a user address to the itemId to the Item
    mapping(address => mapping(string => IEri.Item)) private ownedItems;
    //all items belonging to a user
    mapping(address => IEri.Item[]) private myItems;

    // this links the ownership code to the temp owner
    mapping(bytes32 => address) private temp;
    //this links change of ownership code to the new owner to the Item
    mapping(bytes32 => mapping(address => IEri.Item)) private tempOwners;

    event ContractCreated(
        address indexed contractAddress,
        address indexed owner
    );

    event UserRegistered(address indexed userAddress, string indexed username);
    event OwnershipCode(
        bytes32 indexed ownershipCode,
        address indexed tempOwner
    );
    event ItemCreated(string indexed itemId, address indexed owner);
    event OwnershipClaimed(address indexed newOwner, address indexed oldOwner);
    event CodeRevoked(bytes32);

    constructor(address _owner) {
        owner = _owner;

        emit ContractCreated(address(this), _owner);
    }



    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ADDRESS_ZERO(_user);
        _;
    }

    modifier onlyOwner(string memory itemId) {
        if (msg.sender != owners[itemId])
            revert EriErrors.ONLY_OWNER(msg.sender);
        _;
    }

    //on the frontend, when user wants to register, we check their address if they already have a basename,
    // if they have a basename, we save their basename as their username
    // if not, we suggest that they get a basename and register with a base name,
    // if not, we register them with their username
    function userRegisters(string calldata username)
    external
    addressZeroCheck(msg.sender) {
        address userAddress = msg.sender;
        users._userRegisters(usernames, userAddress, username);
        emit UserRegistered(userAddress, username);
    }

    function getUser(address userAddress)
    public
    view
    returns (IEri.UserProfile memory) {
        return users._getUser(usernames, userAddress);
    }

    //when a user claims item for the first time, the Originality contract call this function
    function createItem(
        address _caller,
        IEri.Certificate memory certificate,
        string memory manufacturerName
    ) external addressZeroCheck(msg.sender) addressZeroCheck(_caller) {
        users._createItem(
            owners,
            ownedItems,
            myItems,
            usernames,
            _caller,
            certificate,
            manufacturerName
        );

        emit ItemCreated(certificate.uniqueId, _caller);
    }

    function getAllItemsFor(address user)
    external
    view
    returns (IEri.Item[] memory) {
        return users._getAllItemsFor(usernames, ownedItems, myItems, user);
    }

    //========================================

    //when the owner wants to change ownership, he already knows who the new owner will be
    //so he generates a change of ownership code. he could he either give you the code or
    // you get a mail or you get an in-app notification with a link to claim ownership
    // if the new owner does not claim ownership, the owner remains the owner
    // owner can revoke change of ownership when the new owner have not claimed ownership
    //if the new owner claims ownership, old owner cannot revoke the change of ownership
    function generateChangeOfOwnershipCode(
        string memory itemId,
        address tempOwner
    )
    external
    addressZeroCheck(msg.sender) //make sure the caller is not address 0
    addressZeroCheck(tempOwner) // make sure the temp owner is not address 0
    onlyOwner(itemId) {
        bytes32 itemHash = users._generateChangeOfOwnershipCode(
            usernames,
            ownedItems,
            temp,
            tempOwners,
            itemId,
            tempOwner
        );
        emit OwnershipCode(itemHash, tempOwner);
    }

    function newOwnerClaimOwnership(bytes32 itemHash)
    external
    addressZeroCheck(msg.sender) {
        address oldOwner = users._newOwnerClaimOwnership(
            usernames,
            ownedItems,
            myItems,
            owners,
            temp,
            tempOwners,
            itemHash
        );
        emit OwnershipClaimed(msg.sender, oldOwner);
    }

    function ownerRevokeCode(bytes32 itemHash)
    external
    addressZeroCheck(msg.sender) {
        users._ownerRevokeCode(usernames, temp, tempOwners, itemHash);
        emit CodeRevoked(itemHash);
    }

    //this function is meant to verify the owner of an item
    //it will return the item and all of it's information, including the owner
    function getItem(string memory itemId)
    public
    view
    returns (IEri.Item memory) {
        return ownedItems._getItem(owners, itemId);
    }

    function verifyOwnership(string memory itemId)
    external
    view
    returns (IEri.Owner memory) {
        return ownedItems._verifyOwnership(owners, usernames, itemId);
    }

    function isOwner(address user, string memory itemId)
    external
    view
    returns (bool) {

        return ownedItems._isOwner(user, itemId);
    }

    function iOwn(string memory itemId) external view returns (bool) {

        return ownedItems._iOwn(itemId);
    }
}