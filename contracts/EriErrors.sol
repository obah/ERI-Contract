// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract EriErrors {
    error ONLY_OWNER(address);
    error ALREADY_REGISTERED(address);
    error ADDRESS_ZERO(address);
    error CODE_ALREADY_GENERATED();
    error UNAUTHORIZED(address);
    error ITEM_DOESNT_EXIST(string);
    error CONTRACT_DOEST_NOT_EXIST();
    error NANE_ALREADY_EXIST(string);
    error INVALID_SIGNATURE();
}