// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./OwnershipLib.sol";
import "./EriErrors.sol";
import "./IEri.sol";

contract Ownership {
    using OwnershipLib for *;

    address private immutable owner;

    mapping(string => IEri.UserProfile) public users;

    mapping(string itemId => address owner) public owners;

    mapping(address => mapping(string => IEri.Item)) public ownedItems;

    mapping(bytes32 => mapping(address => IEri.Item)) public tempOwners;

    mapping(bytes32 => IEri.Item) public changeOfOwnershipCode;

    event ContractCreated(
        address indexed contractAddress,
        address indexed owner
    );

    event UserRegistered(address indexed userAddress, string indexed username);
    event OwnershipCode(bytes32 indexed ownershipCode, address indexed newOwner);
    event ItemCreated(string indexed itemId, address indexed owner);
    event OwnershipClaimed(address indexed newOwner, address indexed oldOwner);


    constructor(address _owner) {
        owner = _owner;

        emit ContractCreated(address(this), _owner);
    }

    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ONLY_OWNER(_user);
        _;
    }

    modifier onlyOwner(address _caller, string memory itemId) {
        IEri.Item memory _item = ownedItems[_caller][itemId];

        if (_caller != _item.owner) revert EriErrors.ONLY_OWNER(_caller);

        _;
    }

    //on the frontend, when user wants to register, we check their address if they already have a basename,
    // if they have a basename, we save their basename as their username
    // if not, we suggest that they get a basename and register with a base name,
    // if not, we register them with their username
    function userRegisters(address userAddress, string memory username)
    external
    addressZeroCheck(userAddress)
    {
        //this delegates the logic to the library
        users._userRegisters(userAddress, username);

        emit UserRegistered(userAddress, username);
    }

    function isRegistered(string calldata _username)
    external
    view
    returns (bool)
    {
        return users[_username].isRegistered;
    }

    function setItemInOwnership(address user, IEri.Item memory item)
    external
    addressZeroCheck(user)
    {

        string memory id = item.itemId;
        ownedItems[user][id] = item;

        owners[id] = user;

        emit ItemCreated(item.itemId, user);
    }

    //when the owner wants to change ownership, he already knows who the new owner will be
    //so he generates a change of ownership code. he could he either give you the code or
    // you get a mail or you get an in-app notification with a link to claim ownership
    // if the new owner does not claim ownership, the owner remains the owner
    // owner can revoke change of ownership when the new owner have not claimed ownership
    //if the new owner claims ownership, old owner cannot revoke the change of ownership
    function generateChangeOfOwnershipCode(
        string memory itemId,
        address newOwner
    )
    external
    addressZeroCheck(msg.sender)
    addressZeroCheck(newOwner)
    onlyOwner(msg.sender, itemId) {

        IEri.Item memory _item = ownedItems[msg.sender][itemId];

        //this is the code the owner will give to the new owner to claim onwership
        bytes32 ownershipHash = keccak256(abi.encode(_item, newOwner));

        // if you have already generated the code, you don't need to generate anymore
        if (tempOwners[ownershipHash][newOwner].owner != address(0)) {
            revert EriErrors.CODE_ALREADY_GENERATED();
        }

        tempOwners[ownershipHash][newOwner] = _item;

        emit OwnershipCode(ownershipHash, newOwner);
    }

    function newOwnerClaimOwnership(bytes32 ownershipHash) external addressZeroCheck(msg.sender) {

        IEri.Item memory _item = tempOwners[ownershipHash][msg.sender];

        address oldOwner = _item.owner;

        string memory id = _item.itemId;

        if (oldOwner == address(0)) {
            revert EriErrors.UNAUTHORIZED(msg.sender);
        }

        _item.owner = msg.sender;

        ownedItems[msg.sender][id] = _item; //save the item with the new owner key

        owners[id] = msg.sender;

        delete ownedItems[oldOwner][id]; //delete the item from the old owner mapping
        delete tempOwners[ownershipHash][msg.sender]; //delete the item from the ownership code

        emit OwnershipClaimed(msg.sender, oldOwner);
    }

    //this function is meant to verify the owner of an item
    //it will return the item and all of it's information, including the owner
    function getItem(string memory itemId) external view returns (IEri.Item memory _item) {

        address user = owners[itemId];

        if (user == address(0)) {
            revert EriErrors.ITEM_DOESNT_EXIST(itemId);
        }

        return ownedItems[user][itemId];
    }

    function isOwner(address user, string memory itemId) external view returns (bool) {
        IEri.Item memory _item = ownedItems[user][itemId];

        return _item.owner == user;
    }
}
