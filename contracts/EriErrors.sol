// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract EriErrors {
    error ONLY_OWNER(address);
    error ALREADY_REGISTERED(address);
    error ADDRESS_ZERO(address);
    error CODE_ALREADY_GENERATED();
    error UNATHORIZED(address);

}