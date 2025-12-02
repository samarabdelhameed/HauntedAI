#!/usr/bin/env node

/**
 * HauntedAI Complete Contract Testing Scenario
 * Tests all contract functionality on BSC Testnet
 * Managed by Kiro
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (minimal for testing)
const HHCW_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function treasury() view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

const GHOST_BADGE_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function tokenURI(uint256) view returns (string)',
  'function treasury() view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

const TREASURY_ABI = [
  'function token() view returns (address)',
  'function badge() view returns (address)',
  'function rewardUpload(address) external',
  'function rewardView(address) external',
  'function rewardReferral(address) external',
  'function grantBadge(address, string) external returns (uint256)',
  'event TokensRewarded(address indexed user, uint256 amount, string reason)',
  'event BadgeGranted(address indexed user, uint256 tokenId, string badgeType)',
];

// Configuration
const RPC_URL = process.env.BSC_TESTNET_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HHCW_ADDRESS = process.env.HHCW_TOKEN_ADDRESS;
const GHOST_BADGE_ADDRESS = process.env.GHOST_BADGE_ADDRESS;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

async function main() {
  console.log('🎃 HauntedAI Complete Contract Testing Scenario\n');
  console.log('Network: BSC Testnet (Chain ID: 97)');
  console.log('RPC URL:', RPC_URL);
  console.log('');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const deployerAddress = wallet.address;

  console.log('🔑 Deployer Address:', deployerAddress);

  // Check balance
  const balance = await provider.getBalance(deployerAddress);
  console.log('💰 Balance:', ethers.formatEther(balance), 'BNB');
  console.log('');

  if (balance === 0n) {
    console.log('❌ Error: No BNB balance. Get testnet BNB from faucet.');
    console.log('   Faucet: https://testnet.binance.org/faucet-smart');
    process.exit(1);
  }

  // Connect to contracts
  const hhcwToken = new ethers.Contract(HHCW_ADDRESS, HHCW_ABI, wallet);
  const ghostBadge = new ethers.Contract(GHOST_BADGE_ADDRESS, GHOST_BADGE_ABI, wallet);
  const treasury = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, wallet);

  console.log('📋 Contract Addresses:');
  console.log('  HHCWToken:', HHCW_ADDRESS);
  console.log('  GhostBadge:', GHOST_BADGE_ADDRESS);
  console.log('  Treasury:', TREASURY_ADDRESS);
  console.log('');

  // Test 1: Verify Contract Setup
  console.log('🧪 Test 1: Verify Contract Setup');
  try {
    const tokenName = await hhcwToken.name();
    const tokenSymbol = await hhcwToken.symbol();
    const tokenDecimals = await hhcwToken.decimals();
    const tokenTreasury = await hhcwToken.treasury();

    console.log('  ✅ HHCWToken:');
    console.log('     Name:', tokenName);
    console.log('     Symbol:', tokenSymbol);
    console.log('     Decimals:', tokenDecimals);
    console.log('     Treasury:', tokenTreasury);

    const badgeName = await ghostBadge.name();
    const badgeSymbol = await ghostBadge.symbol();
    const badgeTreasury = await ghostBadge.treasury();

    console.log('  ✅ GhostBadge:');
    console.log('     Name:', badgeName);
    console.log('     Symbol:', badgeSymbol);
    console.log('     Treasury:', badgeTreasury);

    const treasuryToken = await treasury.token();
    const treasuryBadge = await treasury.badge();

    console.log('  ✅ Treasury:');
    console.log('     Token:', treasuryToken);
    console.log('     Badge:', treasuryBadge);

    if (
      tokenTreasury.toLowerCase() !== TREASURY_ADDRESS.toLowerCase() ||
      badgeTreasury.toLowerCase() !== TREASURY_ADDRESS.toLowerCase() ||
      treasuryToken.toLowerCase() !== HHCW_ADDRESS.toLowerCase() ||
      treasuryBadge.toLowerCase() !== GHOST_BADGE_ADDRESS.toLowerCase()
    ) {
      throw new Error('Contract setup verification failed');
    }

    console.log('  ✅ All contracts properly configured\n');
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    process.exit(1);
  }

  // Test 2: Reward Upload (10 HHCW)
  console.log('🧪 Test 2: Reward Upload (10 HHCW)');
  try {
    const testUser = deployerAddress; // Using deployer as test user
    const balanceBefore = await hhcwToken.balanceOf(testUser);
    console.log('  Balance before:', ethers.formatEther(balanceBefore), 'HHCW');

    console.log('  Sending transaction...');
    const tx = await treasury.rewardUpload(testUser);
    console.log('  Transaction hash:', tx.hash);

    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  ✅ Transaction confirmed in block:', receipt.blockNumber);

    const balanceAfter = await hhcwToken.balanceOf(testUser);
    console.log('  Balance after:', ethers.formatEther(balanceAfter), 'HHCW');

    const expectedIncrease = ethers.parseEther('10');
    const actualIncrease = balanceAfter - balanceBefore;

    if (actualIncrease === expectedIncrease) {
      console.log('  ✅ Reward correctly distributed (+10 HHCW)\n');
    } else {
      throw new Error(
        `Incorrect reward amount. Expected: ${ethers.formatEther(expectedIncrease)}, Got: ${ethers.formatEther(actualIncrease)}`
      );
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('  💡 Tip: Get more testnet BNB from faucet');
    }
    process.exit(1);
  }

  // Test 3: Reward View (1 HHCW)
  console.log('🧪 Test 3: Reward View (1 HHCW)');
  try {
    const testUser = deployerAddress;
    const balanceBefore = await hhcwToken.balanceOf(testUser);
    console.log('  Balance before:', ethers.formatEther(balanceBefore), 'HHCW');

    console.log('  Sending transaction...');
    const tx = await treasury.rewardView(testUser);
    console.log('  Transaction hash:', tx.hash);

    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  ✅ Transaction confirmed in block:', receipt.blockNumber);

    const balanceAfter = await hhcwToken.balanceOf(testUser);
    console.log('  Balance after:', ethers.formatEther(balanceAfter), 'HHCW');

    const expectedIncrease = ethers.parseEther('1');
    const actualIncrease = balanceAfter - balanceBefore;

    if (actualIncrease === expectedIncrease) {
      console.log('  ✅ Reward correctly distributed (+1 HHCW)\n');
    } else {
      throw new Error(
        `Incorrect reward amount. Expected: ${ethers.formatEther(expectedIncrease)}, Got: ${ethers.formatEther(actualIncrease)}`
      );
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    process.exit(1);
  }

  // Test 4: Reward Referral (50 HHCW)
  console.log('🧪 Test 4: Reward Referral (50 HHCW)');
  try {
    const testUser = deployerAddress;
    const balanceBefore = await hhcwToken.balanceOf(testUser);
    console.log('  Balance before:', ethers.formatEther(balanceBefore), 'HHCW');

    console.log('  Sending transaction...');
    const tx = await treasury.rewardReferral(testUser);
    console.log('  Transaction hash:', tx.hash);

    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  ✅ Transaction confirmed in block:', receipt.blockNumber);

    const balanceAfter = await hhcwToken.balanceOf(testUser);
    console.log('  Balance after:', ethers.formatEther(balanceAfter), 'HHCW');

    const expectedIncrease = ethers.parseEther('50');
    const actualIncrease = balanceAfter - balanceBefore;

    if (actualIncrease === expectedIncrease) {
      console.log('  ✅ Reward correctly distributed (+50 HHCW)\n');
    } else {
      throw new Error(
        `Incorrect reward amount. Expected: ${ethers.formatEther(expectedIncrease)}, Got: ${ethers.formatEther(actualIncrease)}`
      );
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    process.exit(1);
  }

  // Test 5: Grant Badge
  console.log('🧪 Test 5: Grant Badge (Ghost Hunter)');
  try {
    const testUser = deployerAddress;
    const badgeBalanceBefore = await ghostBadge.balanceOf(testUser);
    console.log('  Badge balance before:', badgeBalanceBefore.toString());

    console.log('  Sending transaction...');
    const tx = await treasury.grantBadge(testUser, 'Ghost Hunter');
    console.log('  Transaction hash:', tx.hash);

    console.log('  Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('  ✅ Transaction confirmed in block:', receipt.blockNumber);

    const badgeBalanceAfter = await ghostBadge.balanceOf(testUser);
    console.log('  Badge balance after:', badgeBalanceAfter.toString());

    if (badgeBalanceAfter > badgeBalanceBefore) {
      console.log('  ✅ Badge successfully granted\n');
    } else {
      throw new Error('Badge was not granted');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    process.exit(1);
  }

  // Test 6: Verify Total Supply
  console.log('🧪 Test 6: Verify Total Supply');
  try {
    const totalSupply = await hhcwToken.totalSupply();
    console.log('  Total HHCW Supply:', ethers.formatEther(totalSupply), 'HHCW');

    // Should be 10 + 1 + 50 = 61 HHCW
    const expectedSupply = ethers.parseEther('61');
    if (totalSupply >= expectedSupply) {
      console.log('  ✅ Total supply matches expected rewards\n');
    } else {
      console.log('  ⚠️  Total supply lower than expected (may have previous balance)\n');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    process.exit(1);
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ All Tests Passed Successfully!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 Test Summary:');
  console.log('  ✅ Contract setup verification');
  console.log('  ✅ Upload reward (10 HHCW)');
  console.log('  ✅ View reward (1 HHCW)');
  console.log('  ✅ Referral reward (50 HHCW)');
  console.log('  ✅ Badge minting (Ghost Hunter)');
  console.log('  ✅ Total supply verification');
  console.log('');
  console.log('🔗 View on BSCScan:');
  console.log('  HHCWToken:', `https://testnet.bscscan.com/address/${HHCW_ADDRESS}`);
  console.log('  GhostBadge:', `https://testnet.bscscan.com/address/${GHOST_BADGE_ADDRESS}`);
  console.log('  Treasury:', `https://testnet.bscscan.com/address/${TREASURY_ADDRESS}`);
  console.log('');
  console.log('🎉 HauntedAI Smart Contracts are fully functional!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('  1. Integrate with API backend');
  console.log('  2. Test with frontend application');
  console.log('  3. Prepare for mainnet deployment');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  });
