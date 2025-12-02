// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HHCWToken.sol";
import "./GhostBadge.sol";

/**
 * @title Treasury
 * @dev Central treasury contract for managing HauntedAI platform rewards and badges
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Responsibilities:
 * - Distribute HHCW token rewards for user actions
 * - Grant Ghost Badge NFTs for achievements
 * - Track user statistics for badge eligibility
 * - Manage reward amounts and badge criteria
 * 
 * Reward Structure:
 * - Upload content: 10 HHCW
 * - View content: 1 HHCW
 * - Referral: 50 HHCW
 * 
 * Badge Criteria:
 * - "Ghost Novice": First room completed
 * - "Haunted Creator": 10 rooms completed
 * - "Haunted Master": 1000 HHCW tokens earned
 * - "Spooky Legend": 100 rooms completed
 */
contract Treasury is Ownable, ReentrancyGuard {
    HHCWToken public immutable token;
    GhostBadge public immutable badge;

    // Reward amounts (in wei, 18 decimals)
    uint256 public constant UPLOAD_REWARD = 10 * 10**18;  // 10 HHCW
    uint256 public constant VIEW_REWARD = 1 * 10**18;     // 1 HHCW
    uint256 public constant REFERRAL_REWARD = 50 * 10**18; // 50 HHCW

    // User statistics for badge eligibility
    mapping(address => uint256) public userRoomCount;
    mapping(address => uint256) public userTotalEarned;

    // Events
    event RewardDistributed(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event BadgeGranted(
        address indexed user,
        uint256 indexed tokenId,
        string badgeType,
        uint256 timestamp
    );

    event UserStatsUpdated(
        address indexed user,
        uint256 roomCount,
        uint256 totalEarned
    );

    /**
     * @dev Constructor sets token and badge contract addresses
     * @param _token Address of the HHCWToken contract
     * @param _badge Address of the GhostBadge contract
     */
    constructor(address _token, address _badge) Ownable(msg.sender) {
        require(_token != address(0), "Treasury: token address cannot be zero");
        require(_badge != address(0), "Treasury: badge address cannot be zero");
        
        token = HHCWToken(_token);
        badge = GhostBadge(_badge);
    }

    /**
     * @dev Rewards a user for uploading content
     * @param user Address of the user to reward
     */
    function rewardUpload(address user) external onlyOwner nonReentrant {
        require(user != address(0), "Treasury: user address cannot be zero");
        
        // Mint tokens
        token.mint(user, UPLOAD_REWARD, "Upload Reward");
        
        // Update user statistics
        userRoomCount[user]++;
        userTotalEarned[user] += UPLOAD_REWARD;
        
        emit RewardDistributed(user, UPLOAD_REWARD, "Upload", block.timestamp);
        emit UserStatsUpdated(user, userRoomCount[user], userTotalEarned[user]);
        
        // Check and grant badges based on achievements
        _checkAndGrantBadges(user);
    }

    /**
     * @dev Rewards a user for viewing content
     * @param user Address of the user to reward
     */
    function rewardView(address user) external onlyOwner nonReentrant {
        require(user != address(0), "Treasury: user address cannot be zero");
        
        // Mint tokens
        token.mint(user, VIEW_REWARD, "View Reward");
        
        // Update user statistics
        userTotalEarned[user] += VIEW_REWARD;
        
        emit RewardDistributed(user, VIEW_REWARD, "View", block.timestamp);
        emit UserStatsUpdated(user, userRoomCount[user], userTotalEarned[user]);
        
        // Check and grant badges based on achievements
        _checkAndGrantBadges(user);
    }

    /**
     * @dev Rewards a user for successful referral
     * @param user Address of the user to reward (referrer)
     */
    function rewardReferral(address user) external onlyOwner nonReentrant {
        require(user != address(0), "Treasury: user address cannot be zero");
        
        // Mint tokens
        token.mint(user, REFERRAL_REWARD, "Referral Reward");
        
        // Update user statistics
        userTotalEarned[user] += REFERRAL_REWARD;
        
        emit RewardDistributed(user, REFERRAL_REWARD, "Referral", block.timestamp);
        emit UserStatsUpdated(user, userRoomCount[user], userTotalEarned[user]);
        
        // Check and grant badges based on achievements
        _checkAndGrantBadges(user);
    }

    /**
     * @dev Grants a badge to a user
     * @param user Address of the user to receive the badge
     * @param badgeType Type of badge to grant
     * @return tokenId The ID of the newly minted badge
     */
    function grantBadge(address user, string calldata badgeType) 
        external 
        onlyOwner 
        nonReentrant 
        returns (uint256) 
    {
        require(user != address(0), "Treasury: user address cannot be zero");
        require(bytes(badgeType).length > 0, "Treasury: badge type cannot be empty");
        
        // Check if user already has this badge type
        require(
            !badge.hasBadgeType(user, badgeType),
            "Treasury: user already has this badge type"
        );
        
        // Mint the badge
        uint256 tokenId = badge.mintBadge(user, badgeType);
        
        emit BadgeGranted(user, tokenId, badgeType, block.timestamp);
        
        return tokenId;
    }

    /**
     * @dev Internal function to check achievements and grant badges automatically
     * @param user Address of the user to check
     */
    function _checkAndGrantBadges(address user) internal {
        // Ghost Novice: First room completed
        if (userRoomCount[user] == 1 && !badge.hasBadgeType(user, "Ghost Novice")) {
            uint256 tokenId = badge.mintBadge(user, "Ghost Novice");
            emit BadgeGranted(user, tokenId, "Ghost Novice", block.timestamp);
        }
        
        // Haunted Creator: 10 rooms completed
        if (userRoomCount[user] >= 10 && !badge.hasBadgeType(user, "Haunted Creator")) {
            uint256 tokenId = badge.mintBadge(user, "Haunted Creator");
            emit BadgeGranted(user, tokenId, "Haunted Creator", block.timestamp);
        }
        
        // Haunted Master: 1000 HHCW tokens earned
        if (userTotalEarned[user] >= 1000 * 10**18 && !badge.hasBadgeType(user, "Haunted Master")) {
            uint256 tokenId = badge.mintBadge(user, "Haunted Master");
            emit BadgeGranted(user, tokenId, "Haunted Master", block.timestamp);
        }
        
        // Spooky Legend: 100 rooms completed
        if (userRoomCount[user] >= 100 && !badge.hasBadgeType(user, "Spooky Legend")) {
            uint256 tokenId = badge.mintBadge(user, "Spooky Legend");
            emit BadgeGranted(user, tokenId, "Spooky Legend", block.timestamp);
        }
    }

    /**
     * @dev Returns user statistics
     * @param user Address of the user to query
     * @return roomCount Number of rooms completed by the user
     * @return totalEarned Total HHCW tokens earned by the user
     */
    function getUserStats(address user) 
        external 
        view 
        returns (uint256 roomCount, uint256 totalEarned) 
    {
        return (userRoomCount[user], userTotalEarned[user]);
    }

    /**
     * @dev Returns the reward amount for a specific action
     * @param action The action type ("upload", "view", or "referral")
     * @return The reward amount in wei
     */
    function getRewardAmount(string calldata action) external pure returns (uint256) {
        bytes32 actionHash = keccak256(bytes(action));
        
        if (actionHash == keccak256(bytes("upload"))) {
            return UPLOAD_REWARD;
        } else if (actionHash == keccak256(bytes("view"))) {
            return VIEW_REWARD;
        } else if (actionHash == keccak256(bytes("referral"))) {
            return REFERRAL_REWARD;
        } else {
            revert("Treasury: invalid action type");
        }
    }

    /**
     * @dev Checks if a user is eligible for a specific badge
     * @param user Address of the user to check
     * @param badgeType Type of badge to check eligibility for
     * @return True if the user is eligible, false otherwise
     */
    function isEligibleForBadge(address user, string calldata badgeType) 
        external 
        view 
        returns (bool) 
    {
        // Check if user already has the badge
        if (badge.hasBadgeType(user, badgeType)) {
            return false;
        }
        
        bytes32 typeHash = keccak256(bytes(badgeType));
        
        if (typeHash == keccak256(bytes("Ghost Novice"))) {
            return userRoomCount[user] >= 1;
        } else if (typeHash == keccak256(bytes("Haunted Creator"))) {
            return userRoomCount[user] >= 10;
        } else if (typeHash == keccak256(bytes("Haunted Master"))) {
            return userTotalEarned[user] >= 1000 * 10**18;
        } else if (typeHash == keccak256(bytes("Spooky Legend"))) {
            return userRoomCount[user] >= 100;
        }
        
        return false;
    }
}
