// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HHCWToken.sol";

/**
 * @title DeployHHCWToken
 * @dev Deployment script for HHCWToken contract
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Usage:
 * forge script script/DeployHHCWToken.s.sol:DeployHHCWToken --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployHHCWToken is Script {
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
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy HHCWToken
        HHCWToken token = new HHCWToken();
        
        console.log("HHCWToken deployed at:", address(token));
        console.log("Owner:", token.owner());
        console.log("Name:", token.name());
        console.log("Symbol:", token.symbol());
        console.log("Decimals:", token.decimals());

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment info for saving to .env
        console.log("\n=== Add to .env ===");
        console.log("HHCW_TOKEN_ADDRESS=", address(token));
    }
}
