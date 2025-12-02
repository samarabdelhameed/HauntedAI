# HHCWToken Quick Start Guide

**Managed by Kiro** | Fast Track to Deployment

## 🚀 Quick Deploy (5 minutes)

### 1. Prerequisites Check

```bash
# Check Foundry installation
forge --version

# Check you're in the right directory
cd apps/blockchain
```

### 2. Set Environment Variables

```bash
# Copy example
cp .env.example .env

# Edit .env and add:
# - PRIVATE_KEY (without 0x prefix)
# - BSC_TESTNET_RPC_URL or your preferred network
```

### 3. Compile Contract

```bash
forge build
```

Expected output: `Compiler run successful!`

### 4. Run Tests

```bash
forge test --match-contract HHCWTokenTest
```

Expected output: `25 tests passed`

### 5. Deploy to Testnet

```bash
# BSC Testnet
forge script script/DeployHHCWToken.s.sol:DeployHHCWToken \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

# Save the deployed address from console output
```

### 6. Verify on Block Explorer

```bash
forge verify-contract \
  --chain-id 97 \
  --compiler-version v0.8.20 \
  <DEPLOYED_ADDRESS> \
  src/HHCWToken.sol:HHCWToken \
  --etherscan-api-key $BSCSCAN_API_KEY
```

### 7. Set Treasury Address

```bash
# Using cast (Foundry CLI)
cast send <TOKEN_ADDRESS> \
  "setTreasury(address)" \
  <TREASURY_ADDRESS> \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

## 🧪 Quick Test Commands

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_MintByTreasury

# Run fuzz tests only
forge test --match-test testFuzz
```

## 📝 Quick Integration Examples

### Mint Tokens (TypeScript)

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const tokenABI = [
  'function mint(address to, uint256 amount, string reason) external',
  'function balanceOf(address account) view returns (uint256)',
];

const token = new ethers.Contract(process.env.HHCW_TOKEN_ADDRESS, tokenABI, wallet);

// Mint 10 HHCW for upload
const tx = await token.mint(userAddress, ethers.parseEther('10'), 'upload');
await tx.wait();

// Check balance
const balance = await token.balanceOf(userAddress);
console.log(`Balance: ${ethers.formatEther(balance)} HHCW`);
```

### Burn Tokens (TypeScript)

```typescript
const tokenABI = ['function burn(uint256 amount) external'];

const token = new ethers.Contract(process.env.HHCW_TOKEN_ADDRESS, tokenABI, userWallet);

// Burn 5 HHCW
const tx = await token.burn(ethers.parseEther('5'));
await tx.wait();
```

## 🔍 Quick Verification

### Check Deployment

```bash
# Get token name
cast call <TOKEN_ADDRESS> "name()" --rpc-url $BSC_TESTNET_RPC_URL

# Get token symbol
cast call <TOKEN_ADDRESS> "symbol()" --rpc-url $BSC_TESTNET_RPC_URL

# Get total supply
cast call <TOKEN_ADDRESS> "totalSupply()" --rpc-url $BSC_TESTNET_RPC_URL

# Get treasury address
cast call <TOKEN_ADDRESS> "treasury()" --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Balance

```bash
cast call <TOKEN_ADDRESS> \
  "balanceOf(address)" \
  <USER_ADDRESS> \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## 🎯 Reward Amounts Reference

| Action | Amount | Wei Value | Function Call |
|--------|--------|-----------|---------------|
| Upload | 10 HHCW | 10000000000000000000 | `mint(user, 10e18, "upload")` |
| View | 1 HHCW | 1000000000000000000 | `mint(user, 1e18, "view")` |
| Referral | 50 HHCW | 50000000000000000000 | `mint(user, 50e18, "referral")` |

## 🛠️ Troubleshooting

### "Insufficient funds for gas"
- Get testnet tokens from faucet
- BSC Testnet: https://testnet.binance.org/faucet-smart

### "Treasury not set"
- Run: `cast send <TOKEN_ADDRESS> "setTreasury(address)" <TREASURY_ADDRESS> ...`

### "Caller is not the treasury"
- Make sure you're calling mint from the treasury address
- Check: `cast call <TOKEN_ADDRESS> "treasury()"`

### Tests failing
- Run: `forge clean`
- Run: `forge build`
- Run: `forge test`

## 📚 Key Files

- **Contract**: `src/HHCWToken.sol`
- **Tests**: `test/HHCWToken.t.sol`
- **Deploy Script**: `script/DeployHHCWToken.s.sol`
- **Config**: `.env`

## 🔗 Useful Links

- [Foundry Book](https://book.getfoundry.sh/)
- [BSC Testnet Explorer](https://testnet.bscscan.com/)
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/)

## ⚡ One-Line Commands

```bash
# Full test suite
forge test --gas-report

# Deploy to testnet
forge script script/DeployHHCWToken.s.sol:DeployHHCWToken --rpc-url $BSC_TESTNET_RPC_URL --broadcast

# Check balance
cast call $HHCW_TOKEN_ADDRESS "balanceOf(address)" $USER_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL

# Mint tokens (from treasury)
cast send $HHCW_TOKEN_ADDRESS "mint(address,uint256,string)" $USER_ADDRESS 10000000000000000000 "upload" --rpc-url $BSC_TESTNET_RPC_URL --private-key $PRIVATE_KEY
```

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
