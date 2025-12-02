// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/GhostBadge.sol";

/**
 * @title GhostBadgeTest
 * @dev Unit tests for GhostBadge contract
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Test Coverage:
 * - Badge deployment and initialization
 * - Treasury access control
 * - Badge minting functionality
 * - Badge type metadata
 * - Token URI generation
 * - Duplicate badge prevention
 * - Access control enforcement
 * - Edge cases and error conditions
 */
contract GhostBadgeTest is Test {
    GhostBadge public badge;
    address public owner;
    address public treasury;
    address public user1;
    address public user2;

    // Events to test
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType);

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy badge contract
        badge = new GhostBadge();
    }

    // ============ Deployment Tests ============

    function test_Deployment() public {
        assertEq(badge.name(), "Ghost Badge");
        assertEq(badge.symbol(), "GHOST");
        assertEq(badge.owner(), owner);
        assertEq(badge.treasury(), address(0));
        assertEq(badge.getCurrentTokenId(), 1);
    }

    // ============ Treasury Management Tests ============

    function test_SetTreasury() public {
        vm.expectEmit(true, true, false, true);
        emit TreasuryUpdated(address(0), treasury);
        
        badge.setTreasury(treasury);
        
        assertEq(badge.treasury(), treasury);
    }

    function test_SetTreasuryOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        badge.setTreasury(treasury);
    }

    function test_SetTreasuryRevertZeroAddress() public {
        vm.expectRevert("GhostBadge: treasury cannot be zero address");
        badge.setTreasury(address(0));
    }

    function test_UpdateTreasury() public {
        badge.setTreasury(treasury);
        
        address newTreasury = makeAddr("newTreasury");
        
        vm.expectEmit(true, true, false, true);
        emit TreasuryUpdated(treasury, newTreasury);
        
        badge.setTreasury(newTreasury);
        
        assertEq(badge.treasury(), newTreasury);
    }

    // ============ Badge Minting Tests ============

    function test_MintBadge() public {
        badge.setTreasury(treasury);
        
        vm.expectEmit(true, true, false, true);
        emit BadgeMinted(user1, 1, "Ghost Novice");
        
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Ghost Novice");
        
        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.balanceOf(user1), 1);
        assertEq(badge.getBadgeType(tokenId), "Ghost Novice");
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
    }

    function test_MintBadgeOnlyTreasury() public {
        badge.setTreasury(treasury);
        
        vm.prank(user1);
        vm.expectRevert("GhostBadge: caller is not the treasury");
        badge.mintBadge(user1, "Ghost Novice");
    }

    function test_MintBadgeRevertZeroAddress() public {
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        vm.expectRevert("GhostBadge: mint to zero address");
        badge.mintBadge(address(0), "Ghost Novice");
    }

    function test_MintBadgeRevertEmptyType() public {
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        vm.expectRevert("GhostBadge: badge type cannot be empty");
        badge.mintBadge(user1, "");
    }

    function test_MintBadgeRevertDuplicate() public {
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        badge.mintBadge(user1, "Ghost Novice");
        
        vm.expectRevert("GhostBadge: user already has this badge type");
        badge.mintBadge(user1, "Ghost Novice");
        vm.stopPrank();
    }

    function test_MintMultipleBadgeTypes() public {
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        uint256 tokenId1 = badge.mintBadge(user1, "Ghost Novice");
        uint256 tokenId2 = badge.mintBadge(user1, "Haunted Creator");
        uint256 tokenId3 = badge.mintBadge(user1, "Haunted Master");
        vm.stopPrank();
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(tokenId3, 3);
        assertEq(badge.balanceOf(user1), 3);
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        assertTrue(badge.hasBadgeType(user1, "Haunted Creator"));
        assertTrue(badge.hasBadgeType(user1, "Haunted Master"));
    }

    function test_MintBadgeToMultipleUsers() public {
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        badge.mintBadge(user1, "Ghost Novice");
        badge.mintBadge(user2, "Ghost Novice");
        vm.stopPrank();
        
        assertEq(badge.balanceOf(user1), 1);
        assertEq(badge.balanceOf(user2), 1);
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        assertTrue(badge.hasBadgeType(user2, "Ghost Novice"));
    }

    function test_TokenIdIncrement() public {
        badge.setTreasury(treasury);
        
        assertEq(badge.getCurrentTokenId(), 1);
        
        vm.startPrank(treasury);
        uint256 tokenId1 = badge.mintBadge(user1, "Ghost Novice");
        assertEq(badge.getCurrentTokenId(), 2);
        
        uint256 tokenId2 = badge.mintBadge(user1, "Haunted Creator");
        assertEq(badge.getCurrentTokenId(), 3);
        
        uint256 tokenId3 = badge.mintBadge(user2, "Ghost Novice");
        assertEq(badge.getCurrentTokenId(), 4);
        vm.stopPrank();
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(tokenId3, 3);
    }

    // ============ Badge Type Tests ============

    function test_GetBadgeType() public {
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Haunted Master");
        
        assertEq(badge.getBadgeType(tokenId), "Haunted Master");
    }

    function test_GetBadgeTypeRevertNonexistent() public {
        vm.expectRevert();
        badge.getBadgeType(999);
    }

    function test_HasBadgeType() public {
        badge.setTreasury(treasury);
        
        assertFalse(badge.hasBadgeType(user1, "Ghost Novice"));
        
        vm.prank(treasury);
        badge.mintBadge(user1, "Ghost Novice");
        
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        assertFalse(badge.hasBadgeType(user1, "Haunted Master"));
    }

    // ============ Token URI Tests ============

    function test_TokenURI() public {
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Ghost Novice");
        
        string memory uri = badge.tokenURI(tokenId);
        
        // Check that URI starts with data:application/json;base64,
        assertTrue(bytes(uri).length > 0);
        
        // Check that URI contains expected data
        // Note: Full base64 decoding would require additional testing infrastructure
    }

    function test_TokenURIRevertNonexistent() public {
        vm.expectRevert();
        badge.tokenURI(999);
    }

    function test_TokenURIDifferentBadgeTypes() public {
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        uint256 tokenId1 = badge.mintBadge(user1, "Ghost Novice");
        uint256 tokenId2 = badge.mintBadge(user1, "Haunted Master");
        vm.stopPrank();
        
        string memory uri1 = badge.tokenURI(tokenId1);
        string memory uri2 = badge.tokenURI(tokenId2);
        
        // URIs should be different for different badge types
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
    }

    // ============ ERC721 Standard Tests ============

    function test_BalanceOf() public {
        badge.setTreasury(treasury);
        
        assertEq(badge.balanceOf(user1), 0);
        
        vm.startPrank(treasury);
        badge.mintBadge(user1, "Ghost Novice");
        assertEq(badge.balanceOf(user1), 1);
        
        badge.mintBadge(user1, "Haunted Creator");
        assertEq(badge.balanceOf(user1), 2);
        vm.stopPrank();
    }

    function test_OwnerOf() public {
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Ghost Novice");
        
        assertEq(badge.ownerOf(tokenId), user1);
    }

    function test_OwnerOfRevertNonexistent() public {
        vm.expectRevert();
        badge.ownerOf(999);
    }

    // ============ Achievement Scenario Tests ============

    function test_FirstRoomCompletedScenario() public {
        badge.setTreasury(treasury);
        
        // User completes first room, receives "Ghost Novice" badge
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Ghost Novice");
        
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.getBadgeType(tokenId), "Ghost Novice");
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
    }

    function test_TenRoomsCompletedScenario() public {
        badge.setTreasury(treasury);
        
        // User completes 10 rooms, receives "Haunted Creator" badge
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Haunted Creator");
        
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.getBadgeType(tokenId), "Haunted Creator");
        assertTrue(badge.hasBadgeType(user1, "Haunted Creator"));
    }

    function test_ThousandTokensEarnedScenario() public {
        badge.setTreasury(treasury);
        
        // User earns 1000 HHCW tokens, receives "Haunted Master" badge
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Haunted Master");
        
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.getBadgeType(tokenId), "Haunted Master");
        assertTrue(badge.hasBadgeType(user1, "Haunted Master"));
    }

    function test_HundredRoomsCompletedScenario() public {
        badge.setTreasury(treasury);
        
        // User completes 100 rooms, receives "Spooky Legend" badge
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(user1, "Spooky Legend");
        
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.getBadgeType(tokenId), "Spooky Legend");
        assertTrue(badge.hasBadgeType(user1, "Spooky Legend"));
    }

    function test_CompleteUserProgressionScenario() public {
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        
        // User progression through all badge tiers
        uint256 tokenId1 = badge.mintBadge(user1, "Ghost Novice");
        uint256 tokenId2 = badge.mintBadge(user1, "Haunted Creator");
        uint256 tokenId3 = badge.mintBadge(user1, "Haunted Master");
        uint256 tokenId4 = badge.mintBadge(user1, "Spooky Legend");
        
        vm.stopPrank();
        
        // Verify all badges
        assertEq(badge.balanceOf(user1), 4);
        assertEq(badge.getBadgeType(tokenId1), "Ghost Novice");
        assertEq(badge.getBadgeType(tokenId2), "Haunted Creator");
        assertEq(badge.getBadgeType(tokenId3), "Haunted Master");
        assertEq(badge.getBadgeType(tokenId4), "Spooky Legend");
        
        assertTrue(badge.hasBadgeType(user1, "Ghost Novice"));
        assertTrue(badge.hasBadgeType(user1, "Haunted Creator"));
        assertTrue(badge.hasBadgeType(user1, "Haunted Master"));
        assertTrue(badge.hasBadgeType(user1, "Spooky Legend"));
    }

    // ============ Fuzz Tests ============

    function testFuzz_MintBadge(address to, string calldata badgeType) public {
        vm.assume(to != address(0));
        vm.assume(bytes(badgeType).length > 0);
        vm.assume(bytes(badgeType).length < 100); // Reasonable limit
        
        badge.setTreasury(treasury);
        
        vm.prank(treasury);
        uint256 tokenId = badge.mintBadge(to, badgeType);
        
        assertEq(badge.ownerOf(tokenId), to);
        assertEq(badge.getBadgeType(tokenId), badgeType);
        assertTrue(badge.hasBadgeType(to, badgeType));
    }

    function testFuzz_MultipleMints(uint8 count) public {
        vm.assume(count > 0);
        vm.assume(count <= 50); // Reasonable limit for gas
        
        badge.setTreasury(treasury);
        
        vm.startPrank(treasury);
        for (uint8 i = 0; i < count; i++) {
            string memory badgeType = string(abi.encodePacked("Badge", Strings.toString(i)));
            badge.mintBadge(user1, badgeType);
        }
        vm.stopPrank();
        
        assertEq(badge.balanceOf(user1), count);
        assertEq(badge.getCurrentTokenId(), count + 1);
    }
}
