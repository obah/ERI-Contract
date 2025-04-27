// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface IEri {

    struct UserProfile {
        address userAddress;
        string username;
        bool isRegistered;
        uint256 registeredAt;
    }

    struct Item {
        address owner;
        string itemId; // something very unique like the IMEI of a phone
        string name;
        string[] metadata;
    }

}