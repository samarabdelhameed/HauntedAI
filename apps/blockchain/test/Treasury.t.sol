// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Treasury.sol";
import "../src/HHCWToken.sol";
import "../src/GhostBadge.sol";

/**
 * @title TreasuryTest
 * @dev Comprehensive test suite for Treasury contract
 * @notice Managed by Kiro - HauntedAI Platform
 */
contract TreasuryTest is Test {
    Treasury public treasury;
    HHCWToken public token;
    GhostBadge public badge;

    address public owner;
    address public user1;
    address public user2;

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

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        // Deploy contracts
        token = new HHCWToken();
        badge = new GhostBadge();
        treasury = new Treasury(address(token), address(badge));

        // Set treasury as authorized minter
        token.setTreasury(address(treasury));
        badge.setTreasury(address(treasury));
    }

    // ============ Constructor Tests ============

    function test_Constructor_SetsTokenAndBadge() public view {
        assertEq(address(treasury.token()), address(token));
        assertEq(address(treasury.badge()), address(badge));
    }

    function test_Constructor_RevertsWithZeroTokenAddress() public {
        vm.expectRevert("Treasury: token address cannot be zero");
        new Treasury(address(0), address(badge));
    }

    function test_Constructor_RevertsWithZeroBadgeAddress() public {
        vm.expectRevert("Treasury: badge address cannot be zero");
        new Treasury(address(token), address(0));
    }

    // ============ Upload Reward Tests ============

    function test_RewardUpload_MintsCorrectAmount() public {
        treasury.rewardUpload(user1);
        
        uint256 balance = token.balanceOf(user1);
        assertEq(balance, 10 * 10**18, "Should mint 10 HHCW");
    }

    function test_RewardUpload_UpdatesUserStats() public {
        treasury.rewardUpload(user1);
        
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 1, "Room count should be 1");
        assertEq(totalEarned, 10 * 10**18, "Total earned should be 10 HHCW");
    }

    function test_RewardUpload_EmitsRewardDistributedEvent() public {
        vm.expectEmit(true, false, false, false);
        emit RewardDistributed(user1, 10 * 10**18, "Upload", block.timestamp);
        
        treasury.rewardUpload(user1);
    }

    function test_RewardUpload_EmitsUserStatsUpdatedEvent() public {
        vm.expectEmit(true, false, false, false);
        emit UserStatsUpdated(user1, 1, 10 * 10**18);
        
        treasury.rewardUpload(user1);
    }

    function test_RewardUpload_GrantsGhostNoviceBadge() public {
        treasury.rewardUpload(user1);
        
        bool hasBadge = badge.hasBadgeType(user1, "Ghost Novice");
        assertTrue(hasBadge, "Should grant Ghost Novice badge");
    }

    function test_RewardUpload_RevertsWithZeroAddress() public {
        vm.expectRevert("Treasury: user address cannot be zero");
        treasury.rewardUpload(address(0));
    }

    function test_RewardUpload_OnlyOwnerCanCall() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        treasury.rewardUpload(user2);
    }

    // ============ View Reward Tests ============

    function test_RewardView_MintsCorrectAmount() public {
        treasury.rewardView(user1);
        
        uint256 balance = token.balanceOf(user1);
        assertEq(balance, 1 * 10**18, "Should mint 1 HHCW");
    }

    function test_RewardView_UpdatesUserStats() public {
        treasury.rewardView(user1);
        
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 0, "Room count should remain 0");
        assertEq(totalEarned, 1 * 10**18, "Total earned should be 1 HHCW");
    }

    function test_RewardView_EmitsRewardDistributedEvent() public {
        vm.expectEmit(true, false, false, false);
        emit RewardDistributed(user1, 1 * 10**18, "View", block.timestamp);
        
        treasury.rewardView(user1);
    }

    function test_RewardView_RevertsWithZeroAddress() public {
        vm.expectRevert("Treasury: user address cannot be zero");
        treasury.rewardView(address(0));
    }

    function test_RewardView_OnlyOwnerCanCall() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        treasury.rewardView(user2);
    }

    // ============ Referral Reward Tests ============

    function test_RewardReferral_MintsCorrectAmount() public {
        treasury.rewardReferral(user1);
        
        uint256 balance = token.balanceOf(user1);
        assertEq(balance, 50 * 10**18, "Should mint 50 HHCW");
    }

    function test_RewardReferral_UpdatesUserStats() public {
        treasury.rewardReferral(user1);
        
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 0, "Room count should remain 0");
        assertEq(totalEarned, 50 * 10**18, "Total earned should be 50 HHCW");
    }

    function test_RewardReferral_EmitsRewardDistributedEvent() public {
        vm.expectEmit(true, false, false, false);
        emit RewardDistributed(user1, 50 * 10**18, "Referral", block.timestamp);
        
        treasury.rewardReferral(user1);
    }

    function test_RewardReferral_RevertsWithZeroAddress() public {
        vm.expectRevert("Treasury: user address cannot be zero");
        treasury.rewardReferral(address(0));
    }

    function test_RewardReferral_OnlyOwnerCanCall() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        treasury.rewardReferral(user2);
    }

    // ============ Badge Granting Tests ============

    function test_GrantBadge_MintsCorrectBadge() public {
        uint256 tokenId = treasury.grantBadge(user1, "Custom Badge");
        
        bool hasBadge = badge.hasBadgeType(user1, "Custom Badge");
        assertTrue(hasBadge, "Should grant custom badge");
        assertEq(badge.ownerOf(tokenId), user1, "User should own the badge");
    }

    function test_GrantBadge_EmitsBadgeGrantedEvent() public {
        vm.expectEmit(true, true, false, false);
        emit BadgeGranted(user1, 1, "Custom Badge", block.timestamp);
        
        treasury.grantBadge(user1, "Custom Badge");
    }

    function test_GrantBadge_RevertsWithZeroAddress() public {
        vm.expectRevert("Treasury: user address cannot be zero");
        treasury.grantBadge(address(0), "Custom Badge");
    }

    function test_GrantBadge_RevertsWithEmptyBadgeType() public {
        vm.expectRevert("Treasury: badge type cannot be empty");
        treasury.grantBadge(user1, "");
    }

    function test_GrantBadge_RevertsIfUserAlreadyHasBadge() public {
        treasury.grantBadge(user1, "Custom Badge");
        
        vm.expectRevert("Treasury: user already has this badge type");
        treasury.grantBadge(user1, "Custom Badge");
    }

    function test_GrantBadge_OnlyOwnerCanCall() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        treasury.grantBadge(user2, "Custom Badge");
    }

    // ============ Automatic Badge Granting Tests ============

    function test_AutoBadge_GrantsGhostNoviceAfterFirstRoom() public {
        treasury.rewardUpload(user1);
        
        bool hasBadge = badge.hasBadgeType(user1, "Ghost Novice");
        assertTrue(hasBadge, "Should auto-grant Ghost Novice badge");
    }

    function test_AutoBadge_GrantsHauntedCreatorAfter10Rooms() public {
        // Complete 10 rooms
        for (uint256 i = 0; i < 10; i++) {
            treasury.rewardUpload(user1);
        }
        
        bool hasBadge = badge.hasBadgeType(user1, "Haunted Creator");
        assertTrue(hasBadge, "Should auto-grant Haunted Creator badge");
    }

    function test_AutoBadge_GrantsHauntedMasterAfter1000Tokens() public {
        // Earn 1000 HHCW (100 uploads)
        for (uint256 i = 0; i < 100; i++) {
            treasury.rewardUpload(user1);
        }
        
        bool hasBadge = badge.hasBadgeType(user1, "Haunted Master");
        assertTrue(hasBadge, "Should auto-grant Haunted Master badge");
    }

    function test_AutoBadge_GrantsSpookyLegendAfter100Rooms() public {
        // Complete 100 rooms
        for (uint256 i = 0; i < 100; i++) {
            treasury.rewardUpload(user1);
        }
        
        bool hasBadge = badge.hasBadgeType(user1, "Spooky Legend");
        assertTrue(hasBadge, "Should auto-grant Spooky Legend badge");
    }

    function test_AutoBadge_DoesNotGrantDuplicateBadges() public {
        // Complete 2 rooms
        treasury.rewardUpload(user1);
        treasury.rewardUpload(user1);
        
        // User should only have 1 Ghost Novice badge
        uint256 balance = badge.balanceOf(user1);
        assertEq(balance, 1, "Should only have 1 badge");
    }

    // ============ User Stats Tests ============

    function test_GetUserStats_ReturnsCorrectValues() public {
        treasury.rewardUpload(user1);
        treasury.rewardView(user1);
        
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 1, "Room count should be 1");
        assertEq(totalEarned, 11 * 10**18, "Total earned should be 11 HHCW");
    }

    function test_GetUserStats_ReturnsZeroForNewUser() public view {
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 0, "Room count should be 0");
        assertEq(totalEarned, 0, "Total earned should be 0");
    }

    // ============ Reward Amount Tests ============

    function test_GetRewardAmount_ReturnsCorrectUploadAmount() public view {
        uint256 amount = treasury.getRewardAmount("upload");
        assertEq(amount, 10 * 10**18, "Upload reward should be 10 HHCW");
    }

    function test_GetRewardAmount_ReturnsCorrectViewAmount() public view {
        uint256 amount = treasury.getRewardAmount("view");
        assertEq(amount, 1 * 10**18, "View reward should be 1 HHCW");
    }

    function test_GetRewardAmount_ReturnsCorrectReferralAmount() public view {
        uint256 amount = treasury.getRewardAmount("referral");
        assertEq(amount, 50 * 10**18, "Referral reward should be 50 HHCW");
    }

    function test_GetRewardAmount_RevertsWithInvalidAction() public {
        vm.expectRevert("Treasury: invalid action type");
        treasury.getRewardAmount("invalid");
    }

    // ============ Badge Eligibility Tests ============

    function test_IsEligibleForBadge_GhostNovice() public {
        treasury.rewardUpload(user1);
        
        // User already has the badge, so not eligible
        bool eligible = treasury.isEligibleForBadge(user1, "Ghost Novice");
        assertFalse(eligible, "Should not be eligible (already has badge)");
        
        // New user should be eligible after 1 room
        bool eligible2 = treasury.isEligibleForBadge(user2, "Ghost Novice");
        assertFalse(eligible2, "Should not be eligible (no rooms completed)");
    }

    function test_IsEligibleForBadge_HauntedCreator() public {
        // Complete 10 rooms
        for (uint256 i = 0; i < 10; i++) {
            treasury.rewardUpload(user1);
        }
        
        // User already has the badge, so not eligible
        bool eligible = treasury.isEligibleForBadge(user1, "Haunted Creator");
        assertFalse(eligible, "Should not be eligible (already has badge)");
        
        // User with 5 rooms should not be eligible
        for (uint256 i = 0; i < 5; i++) {
            treasury.rewardUpload(user2);
        }
        bool eligible2 = treasury.isEligibleForBadge(user2, "Haunted Creator");
        assertFalse(eligible2, "Should not be eligible (only 5 rooms)");
    }

    function test_IsEligibleForBadge_HauntedMaster() public {
        // Earn 1000 HHCW
        for (uint256 i = 0; i < 100; i++) {
            treasury.rewardUpload(user1);
        }
        
        // User already has the badge, so not eligible
        bool eligible = treasury.isEligibleForBadge(user1, "Haunted Master");
        assertFalse(eligible, "Should not be eligible (already has badge)");
    }

    function test_IsEligibleForBadge_SpookyLegend() public {
        // Complete 100 rooms
        for (uint256 i = 0; i < 100; i++) {
            treasury.rewardUpload(user1);
        }
        
        // User already has the badge, so not eligible
        bool eligible = treasury.isEligibleForBadge(user1, "Spooky Legend");
        assertFalse(eligible, "Should not be eligible (already has badge)");
    }

    // ============ Integration Tests ============

    function test_Integration_CompleteUserJourney() public {
        // User completes first room
        treasury.rewardUpload(user1);
        assertEq(token.balanceOf(user1), 10 * 10**18);
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        
        // User views content
        treasury.rewardView(user1);
        assertEq(token.balanceOf(user1), 11 * 10**18);
        
        // User refers a friend
        treasury.rewardReferral(user1);
        assertEq(token.balanceOf(user1), 61 * 10**18);
        
        // User completes 9 more rooms (total 10)
        for (uint256 i = 0; i < 9; i++) {
            treasury.rewardUpload(user1);
        }
        assertEq(token.balanceOf(user1), 151 * 10**18);
        assertTrue(badge.hasBadgeType(user1, "Haunted Creator"));
        
        // Verify final stats
        (uint256 roomCount, uint256 totalEarned) = treasury.getUserStats(user1);
        assertEq(roomCount, 10);
        assertEq(totalEarned, 151 * 10**18);
    }

    function test_Integration_MultipleUsers() public {
        // User 1 completes 5 rooms
        for (uint256 i = 0; i < 5; i++) {
            treasury.rewardUpload(user1);
        }
        
        // User 2 completes 3 rooms
        for (uint256 i = 0; i < 3; i++) {
            treasury.rewardUpload(user2);
        }
        
        // Verify balances
        assertEq(token.balanceOf(user1), 50 * 10**18);
        assertEq(token.balanceOf(user2), 30 * 10**18);
        
        // Verify badges
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        assertTrue(badge.hasBadgeType(user2, "Ghost Novice"));
        assertFalse(badge.hasBadgeType(user1, "Haunted Creator"));
        assertFalse(badge.hasBadgeType(user2, "Haunted Creator"));
    }
}
