// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "contracts/Originality.sol";
import "contracts/IEri.sol";

contract OriginalityFactory {

    uint256 contractCounts;

    mapping (uint256 => IEri.Manufacturer) public manufacturer;

    event ManufacturerRegistered(
        address indexed ownerOfContract,
        address indexed contractAddress
    );

    function manufacturerRegisters(string memory name) external {

        contractCounts += 1;
        address _owner = msg.sender;

        address manufacturerContract = address(
            new Originality(_owner, contractCounts)
        );

        IEri.Manufacturer storage newManufacturer = manufacturer[contractCounts];

        newManufacturer.manufacturerContract = manufacturerContract;
        newManufacturer.manufacturerAddress = _owner;
        newManufacturer.manufacturerId = contractCounts;
        newManufacturer.name = name;

        emit ManufacturerRegistered(_owner, manufacturerContract);
    }

    function getContract(uint256 manufacturerId) public  view returns (address) {

        return manufacturer[manufacturerId].manufacturerContract;
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
