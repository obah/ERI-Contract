// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;


interface IEri {

    struct UserProfile { // I will create a different smart contract to manage the user profile
        address userAddress;
        string username;
        bool isRegistered;
        uint256 registeredAt;
    }

    struct Manufacturer {
        string name;
        address manufacturerAddress;
    }

    struct Certificate {
        string name;
        string uniqueId;
        string serial;
        uint256 date;
        address owner;
        string[] metadata;
    }

    struct Item {
        string name;
        string itemId; // something very unique like the IMEI of a phone
        string serial;
        uint256 date;
        address owner;
        string manufacturer;
        string[] metadata;
    }

    struct Owner {
        string name;
        string itemId; // something very unique like the IMEI of a phone
        string username;
        address owner;
    }

    function ownerCreatedItem(
        address _caller,
        string memory itemId,
        string memory name,
        string[] memory metadata
    ) external;

    function getItem(string memory itemId)
    external
    view
    returns (IEri.Item memory);

    function createItem(address _caller, IEri.Certificate memory certificate, string memory manufacturerName) external;

    //========

    function manufacturerGeneratesCode(string memory itemId)
    external
    returns (string memory);

    function userClaimOwnershipForTheFirstTime(address _caller, string memory ownershipCode) external;

    function setItemInOwnership(address user, IEri.Item memory item ) external;

    function getOwner() external view returns (address);
}