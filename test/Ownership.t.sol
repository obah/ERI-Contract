// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "../contracts/Ownership.sol";
import "../contracts/EriErrors.sol";
import {IEri} from "../contracts/IEri.sol";
import {OwnershipLib} from "../contracts/OwnershipLib.sol";
import {Ownership} from "../contracts/Ownership.sol";
import {Test} from "forge-std/Test.sol";

contract OwnershipTest is Test {
    Ownership public ownership;
    address public owner = address(0x123);
    address public manufacturer = address(0x456);
    address public firstOwner = address(0x789);
    address public secondOwner = address(0x112);
    address public thirdOwner = address(0x222);
    address public zeroAddress = address(0);

    // Sample certificate for item creation
    IEri.Certificate public certificate;
    string public manufacturerName = "Xiaomi";

    // Events for testing
    event ContractCreated(address indexed contractAddress, address indexed owner);
    event UserRegistered(address indexed userAddress, string indexed username);
    event ItemCreated(string indexed itemId, address indexed owner);
    event OwnershipCode(bytes32 indexed ownershipCode, address indexed tempOwner);
    event OwnershipClaimed(address indexed newOwner, address indexed oldOwner);
    event CodeRevoked(bytes32);

//    error USERNAME_NOT_AVAILABLE(string);

    function setUp() public {
        // Deploy Ownership contract
        vm.prank(owner);
        ownership = new Ownership(owner); //owner is the one performing this transaction

        // Initialize certificate
        string[] memory metadata = new string[](2);
        metadata[0] = "Xiaomi";
        metadata[1] = "5G";

        certificate = IEri.Certificate({
            name: "Redmi Note 14",
            uniqueId: "XM123456",
            serial: "SN7890",
            date: block.timestamp,
            owner: manufacturer,
            metadata: metadata
        });
    }

    // Helper: Register a user
    function registerUser(address user, string memory username) internal {
        vm.prank(user);
        ownership.userRegisters(username);
    }

    // Helper: Create an item
    function createItem(address caller, IEri.Certificate memory cert) internal {
        vm.prank(caller);
        ownership.createItem(caller, cert, manufacturerName);
    }

    // Test: Contract deployment
    function testDeployContract() public {

        ownership = new Ownership(owner);
        address expectedAddress = address (ownership);

        assertEq(ownership.owner(), owner, "Owner should be set");
    }

    // Test: createItem
    function testCreateItem() public {
        registerUser(manufacturer, "alice");
        createItem(manufacturer, certificate);

        IEri.Item memory item = ownership.getItem("XM123456");
        assertEq(item.itemId, "XM123456", "Item ID should match");
        assertEq(item.owner, manufacturer, "Owner should match");
        assertEq(item.name, "Redmi Note 14", "Name should match");
        assertEq(item.serial, "SN7890", "Serial should match");
        assertEq(item.manufacturer, "Xiaomi", "Manufacturer should match");
        assertEq(item.metadata.length, 2, "Metadata length should match");
    }

    function testFailCreateItemNotRegistered() public {
        vm.prank(manufacturer);
        ownership.createItem(manufacturer, certificate, manufacturerName); // Should revert
    }

    function testFailCreateItemDuplicateItemId() public {
        registerUser(manufacturer, "alice");
        createItem(manufacturer, certificate);
        createItem(manufacturer, certificate); // Should revert
    }

    function testFailCreateItemZeroAddressCaller() public {
        registerUser(manufacturer, "alice");
        vm.prank(zeroAddress);
        ownership.createItem(manufacturer, certificate, manufacturerName); // Should revert
    }

    function testFailCreateItemZeroAddressOwner() public {
        registerUser(manufacturer, "alice");
        IEri.Certificate memory invalidCert = certificate;
        invalidCert.owner = zeroAddress;
        createItem(manufacturer, invalidCert); // Should revert
    }

    // Test: getAllItemsFor
    function testGetAllItemsFor() public {
        registerUser(manufacturer, "alice");
        createItem(manufacturer, certificate);

        IEri.Certificate memory cert2 = certificate;
        cert2.uniqueId = "XM789012";
        createItem(manufacturer, cert2);

        vm.prank(manufacturer);
        IEri.Item[] memory items = ownership.getAllItemsFor(manufacturer);
        assertEq(items.length, 2, "Should return 2 items");
        assertEq(items[0].itemId, "XM123456", "First item ID should match");
        assertEq(items[1].itemId, "XM789012", "Second item ID should match");
    }

    function testGetAllItemsForEmpty() public {
        registerUser(manufacturer, "alice");
        vm.prank(manufacturer);
        IEri.Item[] memory items = ownership.getAllItemsFor(manufacturer);
        assertEq(items.length, 0, "Should return empty array");
    }

    function testFailGetAllItemsForNonExistentUser() public {
        ownership.getAllItemsFor(manufacturer); // Should revert
    }

    // Test: generateChangeOfOwnershipCode
    function testGenerateChangeOfOwnershipCode() public {
        registerUser(manufacturer, "alice");
        registerUser(firstOwner, "bob");
        createItem(manufacturer, certificate);

        vm.prank(manufacturer);
        vm.expectEmit(true, true, false, true);
        emit OwnershipCode(keccak256(abi.encode(ownership.getItem("XM123456"))), firstOwner);
        ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
    }

    function testFailGenerateChangeOfOwnershipCodeNotOwner() public {
        registerUser(manufacturer, "alice");
        registerUser(firstOwner, "bob");
        createItem(manufacturer, certificate);

        vm.prank(firstOwner);
        ownership.generateChangeOfOwnershipCode("XM123456", firstOwner); // Should revert
    }

    function testFailGenerateChangeOfOwnershipCodeSelf() public {
        registerUser(manufacturer, "alice");
        createItem(manufacturer, certificate);

        vm.prank(manufacturer);
        ownership.generateChangeOfOwnershipCode("XM123456", manufacturer); // Should revert
    }

    function testFailGenerateChangeOfOwnershipCodeNotRegistered() public {
        registerUser(manufacturer, "alice");
        createItem(manufacturer, certificate);

        vm.prank(manufacturer);
        ownership.generateChangeOfOwnershipCode("XM123456", firstOwner); // Should revert
    }

    function testFailGenerateCodeAlreadyExists() public {
        registerUser(manufacturer, "alice");
        registerUser(firstOwner, "bob");
        createItem(manufacturer, certificate);

        vm.prank(manufacturer);
        ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
        vm.prank(manufacturer);
        ownership.generateChangeOfOwnershipCode("XM123456", firstOwner); // Should revert
    }

    // Test: newOwnerClaimOwnership
//    function testNewOwnerClaimOwnership() public {
//        registerUser(manufacturer, "alice");
//        registerUser(firstOwner, "bob");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        bytes32 itemHash = ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
//
//        vm.prank(firstOwner);
//        vm.expectEmit(true, true, false, true);
//        emit OwnershipClaimed(firstOwner, manufacturer);
//        ownership.newOwnerClaimOwnership(itemHash);
//
//        IEri.Item memory item = ownership.getItem("XM123456");
//        assertEq(item.owner, firstOwner, "New owner should be set");
//        assertEq(ownership.getAllItemsFor(manufacturer).length, 0, "Old owner should have no items");
//        assertEq(ownership.getAllItemsFor(firstOwner).length, 1, "New owner should have 1 item");
//    }

//    function testFailNewOwnerClaimOwnershipNotRegistered() public {
//        registerUser(manufacturer, "alice");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        bytes32 itemHash = ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
//
//        vm.prank(firstOwner);
//        ownership.newOwnerClaimOwnership(itemHash); // Should revert
//    }
//
//    function testFailNewOwnerClaimOwnershipUnauthorized() public {
//        registerUser(manufacturer, "alice");
//        registerUser(firstOwner, "bob");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        bytes32 itemHash = ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
//
//        vm.prank(manufacturer);
//        ownership.newOwnerClaimOwnership(itemHash); // Should revert
//    }
//
//    function testFailNewOwnerClaimOwnershipInvalidHash() public {
//        registerUser(manufacturer, "alice");
//        registerUser(firstOwner, "bob");
//        vm.prank(firstOwner);
//        ownership.newOwnerClaimOwnership(keccak256(abi.encode("invalid"))); // Should revert
//    }
//
//    // Test: ownerRevokeCode
//    function testOwnerRevokeCode() public {
//        registerUser(manufacturer, "alice");
//        registerUser(firstOwner, "bob");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        bytes32 itemHash = ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
//
//        vm.prank(manufacturer);
//        vm.expectEmit(true, false, false, true);
//        emit CodeRevoked(itemHash);
//        ownership.ownerRevokeCode(itemHash);
//
//        // Try claiming after revoke (should fail)
//        vm.prank(firstOwner);
//        vm.expectRevert(EriErrors.UNAUTHORIZED.selector);
//        ownership.newOwnerClaimOwnership(itemHash);
//    }
//
//    function testFailOwnerRevokeCodeNotOwner() public {
//        registerUser(manufacturer, "alice");
//        registerUser(firstOwner, "bob");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        bytes32 itemHash = ownership.generateChangeOfOwnershipCode("XM123456", firstOwner);
//
//        vm.prank(firstOwner);
//        ownership.ownerRevokeCode(itemHash); // Should revert
//    }
//
//    function testFailOwnerRevokeCodeInvalidHash() public {
//        registerUser(manufacturer, "alice");
//        vm.prank(manufacturer);
//        ownership.ownerRevokeCode(keccak256(abi.encode("invalid"))); // Should revert
//    }
//
//    // Test: getItem
//    function testGetItem() public {
//        registerUser(manufacturer, "alice");
//        createItem(manufacturer, certificate);
//
//        IEri.Item memory item = ownership.getItem("XM123456");
//        assertEq(item.itemId, "XM123456", "Item ID should match");
//        assertEq(item.owner, manufacturer, "Owner should match");
//    }
//
//    function testFailGetItemNonExistent() public {
//        ownership.getItem("nonexistent"); // Should revert
//    }
//
//    // Test: verifyOwnership
//    function testVerifyOwnership() public {
//        registerUser(manufacturer, "alice");
//        createItem(manufacturer, certificate);
//
//        IEri.Owner memory ownerInfo = ownership.verifyOwnership("XM123456");
//        assertEq(ownerInfo.itemId, "XM123456", "Item ID should match");
//        assertEq(ownerInfo.owner, manufacturer, "Owner should match");
//        assertEq(ownerInfo.username, "alice", "Username should match");
//        assertEq(ownerInfo.name, "Redmi Note 14", "Name should match");
//    }
//
//    function testFailVerifyOwnershipNonExistent() public {
//        ownership.verifyOwnership("nonexistent"); // Should revert
//    }
//
//    // Test: isOwner
//    function testIsOwner() public {
//        registerUser(manufacturer, "alice");
//        createItem(manufacturer, certificate);
//
//        assertTrue(ownership.isOwner(manufacturer, "XM123456"), "User1 should be owner");
//        assertFalse(ownership.isOwner(firstOwner, "XM123456"), "User2 should not be owner");
//    }
//
//    function testFailIsOwnerNonExistent() public {
//        ownership.isOwner(manufacturer, "nonexistent"); // Should revert
//    }
//
//    // Test: iOwn
//    function testIOwn() public {
//        registerUser(manufacturer, "alice");
//        createItem(manufacturer, certificate);
//
//        vm.prank(manufacturer);
//        assertTrue(ownership.iOwn("XM123456"), "User1 should own item");
//
//        vm.prank(firstOwner);
//        assertFalse(ownership.iOwn("XM123456"), "User2 should not own item");
//    }
//
//    function testFailIOwnNonExistent() public {
//        vm.prank(manufacturer);
//        ownership.iOwn("nonexistent"); // Should revert
//    }
}