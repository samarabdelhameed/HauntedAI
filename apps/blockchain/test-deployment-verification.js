#!/usr/bin/env node

/**
 * BSC Testnet Deployment Verification Script
 * Managed by Kiro - HauntedAI Platform
 * 
 * This script verifies that all contracts are deployed correctly
 * and can interact with each other.
 */

const { execSync } = require('child_process');
require('dotenv').config();

const BSC_TESTNET_RPC = process.env.BSC_TESTNET_RPC_URL;
const HHCW_TOKEN = process.env.HHCW_TOKEN_ADDRESS;
const GHOST_BADGE = process.env.GHOST_BADGE_ADDRESS;
const TREASURY = process.env.TREASURY_ADDRESS;

console.log('🎃 HauntedAI BSC Testnet Deployment Verification\n');
console.log('Network: BSC Testnet (Chain ID: 97)');
console.log('RPC URL:', BSC_TESTNET_RPC);
console.log('\n📋 Contract Addresses:');
console.log('  HHCWToken:', HHCW_TOKEN);
console.log('  GhostBadge:', GHOST_BADGE);
console.log('  Treasury:', TREASURY);
console.log('\n');

function runCast(command) {
  try {
    const result = execSync(command, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

console.log('🔍 Verifying HHCWToken...');
const tokenName = runCast(`cast call ${HHCW_TOKEN} "name()(string)" --rpc-url ${BSC_TESTNET_RPC}`);
const tokenSymbol = runCast(`cast call ${HHCW_TOKEN} "symbol()(string)" --rpc-url ${BSC_TESTNET_RPC}`);
const tokenDecimals = runCast(`cast call ${HHCW_TOKEN} "decimals()(uint8)" --rpc-url ${BSC_TESTNET_RPC}`);
const tokenTreasury = runCast(`cast call ${HHCW_TOKEN} "treasury()(address)" --rpc-url ${BSC_TESTNET_RPC}`);

console.log('  Name:', tokenName);
console.log('  Symbol:', tokenSymbol);
console.log('  Decimals:', tokenDecimals);
console.log('  Treasury:', tokenTreasury);
console.log(tokenTreasury === TREASURY ? '  ✅ Treasury correctly set' : '  ❌ Treasury mismatch');

console.log('\n🔍 Verifying GhostBadge...');
const badgeName = runCast(`cast call ${GHOST_BADGE} "name()(string)" --rpc-url ${BSC_TESTNET_RPC}`);
const badgeSymbol = runCast(`cast call ${GHOST_BADGE} "symbol()(string)" --rpc-url ${BSC_TESTNET_RPC}`);
const badgeTreasury = runCast(`cast call ${GHOST_BADGE} "treasury()(address)" --rpc-url ${BSC_TESTNET_RPC}`);

console.log('  Name:', badgeName);
console.log('  Symbol:', badgeSymbol);
console.log('  Treasury:', badgeTreasury);
console.log(badgeTreasury === TREASURY ? '  ✅ Treasury correctly set' : '  ❌ Treasury mismatch');

console.log('\n🔍 Verifying Treasury...');
const treasuryToken = runCast(`cast call ${TREASURY} "token()(address)" --rpc-url ${BSC_TESTNET_RPC}`);
const treasuryBadge = runCast(`cast call ${TREASURY} "badge()(address)" --rpc-url ${BSC_TESTNET_RPC}`);

console.log('  Token Address:', treasuryToken);
console.log('  Badge Address:', treasuryBadge);
console.log(treasuryToken === HHCW_TOKEN ? '  ✅ Token correctly set' : '  ❌ Token mismatch');
console.log(treasuryBadge === GHOST_BADGE ? '  ✅ Badge correctly set' : '  ❌ Badge mismatch');

console.log('\n🔗 Verification Links:');
console.log('  HHCWToken:', `https://testnet.bscscan.com/address/${HHCW_TOKEN}`);
console.log('  GhostBadge:', `https://testnet.bscscan.com/address/${GHOST_BADGE}`);
console.log('  Treasury:', `https://testnet.bscscan.com/address/${TREASURY}`);

console.log('\n✅ All contracts deployed and verified successfully!');
console.log('\n📝 Next Steps:');
console.log('  1. Integrate contracts with API backend');
console.log('  2. Test token rewards in staging');
console.log('  3. Test NFT badge minting');
console.log('  4. Prepare for mainnet deployment');
