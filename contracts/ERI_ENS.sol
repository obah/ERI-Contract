// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

// Interface for ENS Resolver on Base
interface IENSResolver {
    function addr(bytes32 node) external view returns (address);
}

// Basename Registry Contract
contract BasenameRegistry {
    // ENS Resolver address on Base (replace with actual Base resolver address)
    address public constant ENS_RESOLVER = 0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA; // Update with Base's resolver
    IENSResolver private resolver = IENSResolver(ENS_RESOLVER);

    // Mapping to store user profiles (Basename to user data)
    struct UserProfile {
        address userAddress;
        string basename; // e.g., "alice.base.eth"
        string profileData; // Optional: JSON or IPFS hash for user metadata
        bool isRegistered;
    }
    mapping(bytes32 => UserProfile) private users; // bytes32 is the namehash of the Basename

    // Event emitted on successful registration
    event UserRegistered(address indexed user, string basename, bytes32 namehash);

    // Register a Basename
    function register(string calldata basename, string calldata profileData) external {
        // Compute the namehash of the Basename (e.g., "alice.base.eth")
        bytes32 namehash = computeNamehash(basename);

        // Verify ownership: Check if Basename resolves to msg.sender
        address resolvedAddress = resolver.addr(namehash);
        require(resolvedAddress == msg.sender, "You do not own this Basename");

        // Prevent re-registration
        require(!users[namehash].isRegistered, "Basename already registered");

        // Store user profile using custom storage layout
        users[namehash] = UserProfile({
            userAddress: msg.sender,
            basename: basename,
            profileData: profileData,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, basename, namehash);
    }

    // Get user profile by Basename
    function getUserProfile(string calldata basename) external view returns (UserProfile memory) {
        bytes32 namehash = computeNamehash(basename);
        require(users[namehash].isRegistered, "Basename not registered");
        return users[namehash];
    }

    // Compute ENS namehash (simplified for Base's base.eth subdomains)
    function computeNamehash(string memory name) internal pure returns (bytes32) {
        // In production, use ENS's namehash algorithm (see ENS documentation)
        // Simplified: Hash the Basename for demo purposes
        return keccak256(abi.encodePacked(name));
    }

    // Optional: Update profile data (only by owner)
    function updateProfile(string calldata basename, string calldata newProfileData) external {
        bytes32 namehash = computeNamehash(basename);
        require(users[namehash].isRegistered, "Basename not registered");
        require(users[namehash].userAddress == msg.sender, "Not authorized");
        users[namehash].profileData = newProfileData;
    }
}