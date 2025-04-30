// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./Originality.sol";
import "contracts/IEri.sol";

contract OriginalityFactory {

    uint256 contractCounts;
    address immutable ownership;

    mapping (uint256 manufacturerID => IEri.Manufacturer) public manufacturers;

    event ManufacturerRegistered(
        address indexed ownerOfContract,
        address indexed contractAddress
    );


    modifier addressZeroCheck(address _user) {
        if (_user == address(0)) revert EriErrors.ONLY_OWNER(_user);
        _;
    }

    constructor (address ownershipAdd) {
        ownership = ownershipAdd;
    }


    function manufacturerRegisters(string memory name) external addressZeroCheck(msg.sender) { // this will be done on-chain

        contractCounts += 1;
        address _owner = msg.sender;

        address manufacturerContract = address(
            new Originality(ownership, _owner, contractCounts)
        );

        IEri.Manufacturer storage newManufacturer = manufacturers[contractCounts];

        newManufacturer.manufacturerContract = manufacturerContract;
        newManufacturer.manufacturerAddress = _owner;
        newManufacturer.manufacturerId = contractCounts;
        newManufacturer.name = name;

        emit ManufacturerRegistered(_owner, manufacturerContract);
    }

    function getContract(uint256 manufacturerId) public  view returns (address) {

        return manufacturers[manufacturerId].manufacturerContract;
    }

    function manufacturerCreateItem(
        uint256 manufacturerId,
        string memory itemId,
        string memory name,
        string[] memory metadata
    ) external {

        IEri originality = IEri(getContract(manufacturerId));

        //using msg.sender is very important for security to making sure
        //only owner of the contract is the only one to call this function
        originality.ownerCreatedItem(msg.sender, itemId, name, metadata);

    }

    function getItem(// we need to figure out how to know which manufacturer contract to call when we want to getItem
        uint256 manufacturerId, //the manufacturerId will come from the frontend
        string memory itemId
    ) external view returns (IEri.Item memory) {

        IEri originality = IEri(getContract(manufacturerId));

        return originality.getItem(itemId);
    }

    function manufacturerGeneratesCode(
        uint256 manufacturerId, //the manufacturerId will come from the frontend
        string memory itemId
    ) external returns (string memory) {

        IEri originality = IEri(getContract(manufacturerId));

        return originality.manufacturerGeneratesCode(itemId);
    }

    function userClaimOwnershipOfItem(
        uint256 manufacturerId, //on the frontend, these code are together like this '12-3435hk46434' but
        string memory ownershipCode //they'll be separated before being fed to this function
    ) external {

        IEri originality = IEri(getContract(manufacturerId));

        originality.userClaimOwnershipForTheFirstTime(msg.sender, ownershipCode);

    }



}
