# HauntedAI Smart Contracts

**Managed by Kiro** | Blockchain Layer Documentation

## Overview

This directory contains the Solidity smart contracts for the HauntedAI platform's token economy and NFT badge system.

## Contracts

### HHCWToken.sol (ERC20)

The HHCW (Haunted Halloween Coin Wrapped) token is the platform's reward token.

**Token Details:**
- Name: Haunted Halloween Coin Wrapped
- Symbol: HHCW
- Decimals: 18
- Supply: Unlimited (minted by Treasury)

**Reward Structure:**
- Upload content: 10 HHCW
- View content: 1 HHCW
- Referral: 50 HHCW

**Key Features:**
- Treasury-controlled minting
- User-controlled burning
- Standard ERC20 functionality (transfer, approve, transferFrom)
- Access control via Ownable pattern

**Functions:**

```solidity
// Owner functions
function setTreasury(address _treasury) external onlyOwner

// Treasury functions
function mint(address to, uint256 amount, string calldata reason) external onlyTreasury

// User functions
function burn(uint256 amount) external
function transfer(address to, uint256 amount) external
function approve(address spender, uint256 amount) external
function transferFrom(address from, address to, uint256 amount) external
```

**Events:**

```solidity
event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)
event TokensMinted(address indexed to, uint256 amount, string reason)
event TokensBurned(address indexed from, uint256 amount)
```

## Deployment

### Local Development (Anvil)

```bash
# Start local node
anvil

# Deploy contract
forge script script/DeployHHCWToken.s.sol:DeployHHCWToken --rpc-url http://localhost:8545 --broadcast
```

### Testnet Deployment (BSC Testnet)

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# Deploy
forge script script/DeployHHCWToken.s.sol:DeployHHCWToken \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY

# Save contract address to .env
echo "HHCW_TOKEN_ADDRESS=<deployed_address>" >> .env
```

### Mainnet Deployment (BSC Mainnet)

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org

# Deploy
forge script script/DeployHHCWToken.s.sol:DeployHHCWToken \
  --rpc-url $BSC_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY
```

## Testing

### Run All Tests

```bash
forge test
```

### Run Specific Test Contract

```bash
forge test --match-contract HHCWTokenTest
```

### Run with Verbosity

```bash
forge test -vvv
```

### Run with Gas Report

```bash
forge test --gas-report
```

### Run with Coverage

```bash
forge coverage
```

## Integration with Backend

### Setting Up Treasury

After deploying HHCWToken, you need to set the Treasury address:

```typescript
// In your backend service
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const tokenContract = new ethers.Contract(
  process.env.HHCW_TOKEN_ADDRESS,
  HHCWTokenABI,
  wallet
);

// Set treasury address
const tx = await tokenContract.setTreasury(process.env.TREASURY_ADDRESS);
await tx.wait();
```

### Minting Rewards

```typescript
// In Treasury contract or backend service
async function rewardUpload(userAddress: string) {
  const amount = ethers.parseEther('10'); // 10 HHCW
  const tx = await tokenContract.mint(userAddress, amount, 'upload');
  await tx.wait();
  return tx.hash;
}

async function rewardView(userAddress: string) {
  const amount = ethers.parseEther('1'); // 1 HHCW
  const tx = await tokenContract.mint(userAddress, amount, 'view');
  await tx.wait();
  return tx.hash;
}

async function rewardReferral(userAddress: string) {
  const amount = ethers.parseEther('50'); // 50 HHCW
  const tx = await tokenContract.mint(userAddress, amount, 'referral');
  await tx.wait();
  return tx.hash;
}
```

### Checking Balance

```typescript
async function getBalance(userAddress: string): Promise<string> {
  const balance = await tokenContract.balanceOf(userAddress);
  return ethers.formatEther(balance);
}
```

## Security Considerations

1. **Access Control**: Only the Treasury contract can mint tokens
2. **Owner Control**: Only the owner can set the Treasury address
3. **No Backdoors**: No functions to arbitrarily transfer or burn user tokens
4. **Standard Compliance**: Fully ERC20 compliant
5. **Audited Dependencies**: Uses OpenZeppelin contracts

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `calldata` for string parameters
- Minimal storage operations
- Efficient event emissions

## Verification

After deployment, verify the contract on BSCScan:

```bash
forge verify-contract \
  --chain-id 97 \
  --compiler-version v0.8.20 \
  <CONTRACT_ADDRESS> \
  src/HHCWToken.sol:HHCWToken \
  --etherscan-api-key $BSCSCAN_API_KEY
```

## License

MIT License - See LICENSE file for details

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
