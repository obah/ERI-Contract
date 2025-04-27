// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./EriErrors.sol";
import "./IEri.sol";

library OwnershipLib {


    function _userRegisters(
        mapping(address => IEri.UserProfile) storage users,
        address userAddress,
        string memory username
    ) external  {

        if (users[userAddress].isRegistered) {
            revert EriErrors.ALREADY_REGISTERED(userAddress);
        }

        IEri.UserProfile storage user = users[userAddress];
        user.userAddress = userAddress;
        user.username = username;
        user.isRegistered = true;
        user.registeredAt = block.timestamp;
    }
}