// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEri {

    struct UserProfile {
        address userAddress;
        string username;
        bool isRegistered;
        uint256 registeredAt;
    }

    struct Manufacturer {
        address manufacturerContract;
        address manufacturerAddress;
        uint256 manufacturerId;
        string name;
    }

    struct Item {
        address owner;
        string itemId; // something very unique like the IMEI of a phone
        string name;
        uint256 manufacturerId;
        string[] metadata;
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

    function manufacturerGeneratesCode(string memory itemId)
    external
    returns (string memory);

    function userClaimOwnershipForTheFirstTime(address _caller, string memory ownershipCode) external;

    function setItemInOwnership(address user, IEri.Item memory item ) external;
}