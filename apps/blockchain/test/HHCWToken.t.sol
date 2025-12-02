// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/HHCWToken.sol";

/**
 * @title HHCWTokenTest
 * @dev Unit tests for HHCWToken contract
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Test Coverage:
 * - Token deployment and initialization
 * - Treasury access control
 * - Minting functionality
 * - Burning functionality
 * - Access control enforcement
 * - Edge cases and error conditions
 */
contract HHCWTokenTest is Test {
    HHCWToken public token;
    address public owner;
    address public treasury;
    address public user1;
    address public user2;

    // Events to test
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount);

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy token
        token = new HHCWToken();
    }

    // ============ Deployment Tests ============

    function test_Deployment() public {
        assertEq(token.name(), "Haunted Halloween Coin Wrapped");
        assertEq(token.symbol(), "HHCW");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
        assertEq(token.treasury(), address(0));
    }

    // ============ Treasury Management Tests ============

    function test_SetTreasury() public {
        vm.expectEmit(true, true, false, true);
        emit TreasuryUpdated(address(0), treasury);
        
        token.setTreasury(treasury);
        
        assertEq(token.treasury(), treasury);
    }

    function test_SetTreasuryOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        token.setTreasury(treasury);
    }

    function test_SetTreasuryRevertZeroAddress() public {
        vm.expectRevert("HHCWToken: treasury cannot be zero address");
        token.setTreasury(address(0));
    }

    function test_UpdateTreasury() public {
        token.setTreasury(treasury);
        
        address newTreasury = makeAddr("newTreasury");
        
        vm.expectEmit(true, true, false, true);
        emit TreasuryUpdated(treasury, newTreasury);
        
        token.setTreasury(newTreasury);
        
        assertEq(token.treasury(), newTreasury);
    }

    // ============ Minting Tests ============

    function test_MintByTreasury() public {
        token.setTreasury(treasury);
        
        uint256 amount = 10 * 10**18; // 10 HHCW
        
        vm.expectEmit(true, false, false, true);
        emit TokensMinted(user1, amount, "upload");
        
        vm.prank(treasury);
        token.mint(user1, amount, "upload");
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_MintOnlyTreasury() public {
        token.setTreasury(treasury);
        
        vm.prank(user1);
        vm.expectRevert("HHCWToken: caller is not the treasury");
        token.mint(user1, 10 * 10**18, "upload");
    }

    function test_MintRevertZeroAddress() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        vm.expectRevert("HHCWToken: mint to zero address");
        token.mint(address(0), 10 * 10**18, "upload");
    }

    function test_MintRevertZeroAmount() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        vm.expectRevert("HHCWToken: mint amount must be greater than zero");
        token.mint(user1, 0, "upload");
    }

    function test_MintMultipleUsers() public {
        token.setTreasury(treasury);
        
        vm.startPrank(treasury);
        token.mint(user1, 10 * 10**18, "upload");
        token.mint(user2, 1 * 10**18, "view");
        vm.stopPrank();
        
        assertEq(token.balanceOf(user1), 10 * 10**18);
        assertEq(token.balanceOf(user2), 1 * 10**18);
        assertEq(token.totalSupply(), 11 * 10**18);
    }

    function test_MintMultipleTimes() public {
        token.setTreasury(treasury);
        
        vm.startPrank(treasury);
        token.mint(user1, 10 * 10**18, "upload");
        token.mint(user1, 1 * 10**18, "view");
        token.mint(user1, 50 * 10**18, "referral");
        vm.stopPrank();
        
        assertEq(token.balanceOf(user1), 61 * 10**18);
        assertEq(token.totalSupply(), 61 * 10**18);
    }

    // ============ Burning Tests ============

    function test_Burn() public {
        token.setTreasury(treasury);
        
        // Mint tokens first
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        // Burn tokens
        vm.expectEmit(true, false, false, true);
        emit TokensBurned(user1, 30 * 10**18);
        
        vm.prank(user1);
        token.burn(30 * 10**18);
        
        assertEq(token.balanceOf(user1), 70 * 10**18);
        assertEq(token.totalSupply(), 70 * 10**18);
    }

    function test_BurnRevertZeroAmount() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        vm.prank(user1);
        vm.expectRevert("HHCWToken: burn amount must be greater than zero");
        token.burn(0);
    }

    function test_BurnRevertInsufficientBalance() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 10 * 10**18, "test");
        
        vm.prank(user1);
        vm.expectRevert("HHCWToken: insufficient balance to burn");
        token.burn(20 * 10**18);
    }

    function test_BurnAllBalance() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        vm.prank(user1);
        token.burn(100 * 10**18);
        
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.totalSupply(), 0);
    }

    // ============ Transfer Tests ============

    function test_Transfer() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        vm.prank(user1);
        token.transfer(user2, 30 * 10**18);
        
        assertEq(token.balanceOf(user1), 70 * 10**18);
        assertEq(token.balanceOf(user2), 30 * 10**18);
    }

    function test_Approve() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        vm.prank(user1);
        token.approve(user2, 50 * 10**18);
        
        assertEq(token.allowance(user1, user2), 50 * 10**18);
    }

    function test_TransferFrom() public {
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, 100 * 10**18, "test");
        
        vm.prank(user1);
        token.approve(user2, 50 * 10**18);
        
        vm.prank(user2);
        token.transferFrom(user1, user2, 30 * 10**18);
        
        assertEq(token.balanceOf(user1), 70 * 10**18);
        assertEq(token.balanceOf(user2), 30 * 10**18);
        assertEq(token.allowance(user1, user2), 20 * 10**18);
    }

    // ============ Reward Scenario Tests ============

    function test_UploadRewardScenario() public {
        token.setTreasury(treasury);
        
        // User uploads content, receives 10 HHCW
        vm.prank(treasury);
        token.mint(user1, 10 * 10**18, "upload");
        
        assertEq(token.balanceOf(user1), 10 * 10**18);
    }

    function test_ViewRewardScenario() public {
        token.setTreasury(treasury);
        
        // User views content, receives 1 HHCW
        vm.prank(treasury);
        token.mint(user1, 1 * 10**18, "view");
        
        assertEq(token.balanceOf(user1), 1 * 10**18);
    }

    function test_ReferralRewardScenario() public {
        token.setTreasury(treasury);
        
        // User refers friend, receives 50 HHCW
        vm.prank(treasury);
        token.mint(user1, 50 * 10**18, "referral");
        
        assertEq(token.balanceOf(user1), 50 * 10**18);
    }

    function test_CompleteUserJourneyScenario() public {
        token.setTreasury(treasury);
        
        vm.startPrank(treasury);
        
        // User uploads content: +10 HHCW
        token.mint(user1, 10 * 10**18, "upload");
        
        // User views 5 pieces of content: +5 HHCW
        for (uint i = 0; i < 5; i++) {
            token.mint(user1, 1 * 10**18, "view");
        }
        
        // User refers 2 friends: +100 HHCW
        token.mint(user1, 50 * 10**18, "referral");
        token.mint(user1, 50 * 10**18, "referral");
        
        vm.stopPrank();
        
        // Total: 10 + 5 + 100 = 115 HHCW
        assertEq(token.balanceOf(user1), 115 * 10**18);
    }

    // ============ Fuzz Tests ============

    function testFuzz_Mint(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount > 0);
        vm.assume(amount < type(uint256).max / 2); // Prevent overflow
        
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(to, amount, "fuzz");
        
        assertEq(token.balanceOf(to), amount);
    }

    function testFuzz_Burn(uint256 mintAmount, uint256 burnAmount) public {
        vm.assume(mintAmount > 0);
        vm.assume(burnAmount > 0);
        vm.assume(burnAmount <= mintAmount);
        vm.assume(mintAmount < type(uint256).max / 2);
        
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, mintAmount, "fuzz");
        
        vm.prank(user1);
        token.burn(burnAmount);
        
        assertEq(token.balanceOf(user1), mintAmount - burnAmount);
    }

    function testFuzz_Transfer(uint256 mintAmount, uint256 transferAmount) public {
        vm.assume(mintAmount > 0);
        vm.assume(transferAmount > 0);
        vm.assume(transferAmount <= mintAmount);
        vm.assume(mintAmount < type(uint256).max / 2);
        
        token.setTreasury(treasury);
        
        vm.prank(treasury);
        token.mint(user1, mintAmount, "fuzz");
        
        vm.prank(user1);
        token.transfer(user2, transferAmount);
        
        assertEq(token.balanceOf(user1), mintAmount - transferAmount);
        assertEq(token.balanceOf(user2), transferAmount);
    }
}
