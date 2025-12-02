// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Treasury.sol";
import "../src/HHCWToken.sol";
import "../src/GhostBadge.sol";

/**
 * @title DeployTreasury
 * @dev Deployment script for Treasury contract
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Usage:
 * forge script script/DeployTreasury.s.sol:DeployTreasury --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployTreasury is Script {
    function run() external {
        // Get deployer private key from environment
        // Try with 0x prefix first, fallback to without prefix
        uint256 deployerPrivateKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 key) {
            deployerPrivateKey = key;
        } catch {
            // If PRIVATE_KEY doesn't have 0x prefix, try adding it
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }
        
        // Get existing contract addresses from environment (if deploying to existing system)
        address tokenAddress = vm.envOr("HHCW_TOKEN_ADDRESS", address(0));
        address badgeAddress = vm.envOr("GHOST_BADGE_ADDRESS", address(0));
        
        vm.startBroadcast(deployerPrivateKey);
        
        HHCWToken token;
        GhostBadge badge;
        
        // Deploy HHCWToken if not provided
        if (tokenAddress == address(0)) {
            console.log("Deploying HHCWToken...");
            token = new HHCWToken();
            tokenAddress = address(token);
            console.log("HHCWToken deployed at:", tokenAddress);
        } else {
            console.log("Using existing HHCWToken at:", tokenAddress);
            token = HHCWToken(tokenAddress);
        }
        
        // Deploy GhostBadge if not provided
        if (badgeAddress == address(0)) {
            console.log("Deploying GhostBadge...");
            badge = new GhostBadge();
            badgeAddress = address(badge);
            console.log("GhostBadge deployed at:", badgeAddress);
        } else {
            console.log("Using existing GhostBadge at:", badgeAddress);
            badge = GhostBadge(badgeAddress);
        }
        
        // Deploy Treasury
        console.log("Deploying Treasury...");
        Treasury treasury = new Treasury(tokenAddress, badgeAddress);
        console.log("Treasury deployed at:", address(treasury));
        
        // Set Treasury as authorized minter for both contracts
        console.log("Setting Treasury as authorized minter...");
        token.setTreasury(address(treasury));
        badge.setTreasury(address(treasury));
        console.log("Treasury authorization complete");
        
        vm.stopBroadcast();
        
        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("HHCWToken:", tokenAddress);
        console.log("GhostBadge:", badgeAddress);
        console.log("Treasury:", address(treasury));
        console.log("========================\n");
        
        console.log("\n=== Add to .env ===");
        console.log("HHCW_TOKEN_ADDRESS=", vm.toString(tokenAddress));
        console.log("GHOST_BADGE_ADDRESS=", vm.toString(badgeAddress));
        console.log("TREASURY_ADDRESS=", vm.toString(address(treasury)));
    }
}
