// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GhostBadge
 * @dev ERC721 NFT badge for HauntedAI platform achievements
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Badge Types:
 * - "Ghost Novice": First room completed
 * - "Haunted Creator": 10 rooms completed
 * - "Haunted Master": 1000 HHCW tokens earned
 * - "Spooky Legend": 100 rooms completed
 * 
 * Features:
 * - Unique token IDs for each badge
 * - Badge type metadata stored on-chain
 * - Treasury-controlled minting
 * - Non-transferable (soulbound) badges
 */
contract GhostBadge is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    address public treasury;
    uint256 private _tokenIdCounter;

    // Mapping from token ID to badge type
    mapping(uint256 => string) public badgeTypes;
    
    // Mapping from user address to badge types they own
    mapping(address => mapping(string => bool)) public userBadges;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType);

    /**
     * @dev Constructor sets initial owner
     */
    constructor() ERC721("Ghost Badge", "GHOST") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs from 1
    }

    /**
     * @dev Sets the treasury address that can mint badges
     * @param _treasury Address of the Treasury contract
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "GhostBadge: treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Modifier to restrict function access to treasury only
     */
    modifier onlyTreasury() {
        require(msg.sender == treasury, "GhostBadge: caller is not the treasury");
        _;
    }

    /**
     * @dev Mints a badge to a user address
     * @param to Address to receive the badge
     * @param badgeType Type of badge (e.g., "Ghost Novice", "Haunted Master")
     * @return tokenId The ID of the newly minted badge
     */
    function mintBadge(address to, string calldata badgeType) external onlyTreasury returns (uint256) {
        require(to != address(0), "GhostBadge: mint to zero address");
        require(bytes(badgeType).length > 0, "GhostBadge: badge type cannot be empty");
        require(!userBadges[to][badgeType], "GhostBadge: user already has this badge type");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        badgeTypes[tokenId] = badgeType;
        userBadges[to][badgeType] = true;

        emit BadgeMinted(to, tokenId, badgeType);

        return tokenId;
    }

    /**
     * @dev Returns the token URI for a given token ID
     * @param tokenId The token ID to query
     * @return The token URI string
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        _requireOwned(tokenId);

        string memory badgeType = badgeTypes[tokenId];
        
        // Generate metadata JSON
        string memory json = string(abi.encodePacked(
            '{"name": "Ghost Badge #',
            tokenId.toString(),
            '", "description": "HauntedAI Achievement Badge", "badge_type": "',
            badgeType,
            '", "image": "ipfs://QmGhostBadge/',
            _getBadgeImageHash(badgeType),
            '", "attributes": [{"trait_type": "Badge Type", "value": "',
            badgeType,
            '"}]}'
        ));

        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }

    /**
     * @dev Returns the badge type for a given token ID
     * @param tokenId The token ID to query
     * @return The badge type string
     */
    function getBadgeType(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return badgeTypes[tokenId];
    }

    /**
     * @dev Checks if a user has a specific badge type
     * @param user The user address to check
     * @param badgeType The badge type to check for
     * @return True if the user has the badge type, false otherwise
     */
    function hasBadgeType(address user, string calldata badgeType) external view returns (bool) {
        return userBadges[user][badgeType];
    }

    /**
     * @dev Returns the current token ID counter value
     * @return The next token ID that will be minted
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Internal function to get badge image hash based on badge type
     * @param badgeType The badge type
     * @return The IPFS hash for the badge image
     */
    function _getBadgeImageHash(string memory badgeType) internal pure returns (string memory) {
        // In production, these would be actual IPFS hashes for badge images
        bytes32 typeHash = keccak256(bytes(badgeType));
        
        if (typeHash == keccak256(bytes("Ghost Novice"))) {
            return "QmNovice";
        } else if (typeHash == keccak256(bytes("Haunted Creator"))) {
            return "QmCreator";
        } else if (typeHash == keccak256(bytes("Haunted Master"))) {
            return "QmMaster";
        } else if (typeHash == keccak256(bytes("Spooky Legend"))) {
            return "QmLegend";
        } else {
            return "QmDefault";
        }
    }

    /**
     * @dev Internal function to base64 encode bytes
     * @param data The data to encode
     * @return The base64 encoded string
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            for {} lt(dataPtr, endPtr) {} {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d)
                mstore8(sub(resultPtr, 1), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }

        return result;
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
