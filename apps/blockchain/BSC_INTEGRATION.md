# BSC (Binance Smart Chain) Integration Guide

**Managed by Kiro** | HauntedAI Platform

## Overview

This guide explains how to deploy and integrate HauntedAI smart contracts on Binance Smart Chain (BSC), leveraging the existing infrastructure and protocols available on BSC.

## Why BSC?

### Advantages
- ✅ **Low Gas Fees**: ~$0.10-0.30 per transaction vs $5-50 on Ethereum
- ✅ **Fast Confirmations**: ~3 seconds block time
- ✅ **EVM Compatible**: Same Solidity code works on BSC
- ✅ **Large Ecosystem**: PancakeSwap, Venus, Beefy, and more
- ✅ **High Liquidity**: Large user base and trading volume

### Use Cases for HauntedAI
- Token rewards (HHCW) with minimal gas costs
- NFT badge minting at low cost
- Integration with DeFi protocols (Venus, PancakeSwap)
- Cross-chain bridge opportunities

## Network Information

### BSC Mainnet
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed1.binance.org
- **Explorer**: https://bscscan.com
- **Native Token**: BNB
- **Block Time**: ~3 seconds

### BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.binance.org/faucet-smart

## Getting Started

### 1. Get BNB for Gas

**Testnet BNB**:
1. Visit [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
2. Enter your wallet address
3. Receive 0.5 BNB (enough for ~500 transactions)

**Mainnet BNB**:
1. Buy BNB on Binance or other exchanges
2. Withdraw to your wallet address
3. Ensure you have at least 0.1 BNB for deployment

### 2. Configure Environment

Update your `.env` file:

```bash
# BSC Configuration
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=your_bscscan_api_key
PRIVATE_KEY=your_private_key_without_0x
```

### 3. Deploy to BSC Testnet

```bash
# Deploy contracts
make deploy-bsc-test

# Or using forge directly
forge script script/Deploy.s.sol \
  --rpc-url bsc_testnet \
  --broadcast \
  --verify \
  -vvvv
```

### 4. Deploy to BSC Mainnet

```bash
# Deploy contracts
make deploy-bsc

# Or using forge directly
forge script script/Deploy.s.sol \
  --rpc-url bsc \
  --broadcast \
  --verify \
  -vvvv
```

## Protocol Integration Opportunities

### 1. Venus Protocol (Lending)

Venus is the leading lending protocol on BSC.

**Integration Ideas**:
- Stake HHCW tokens to earn interest
- Use HHCW as collateral for borrowing
- Integrate Venus vTokens for yield generation

**Contracts**:
```solidity
// Venus Comptroller
address constant VENUS_COMPTROLLER = 0xfD36E2c2a6789Db23113685031d7F16329158384;

// Venus vTokens
address constant VENUS_VBNB = 0xA07c5b74C9B40447a954e1466938b865b6BBea36;
address constant VENUS_VUSDT = 0xfD5840Cd36d94D7229439859C0112a4185BC0255;
```

### 2. PancakeSwap (DEX)

PancakeSwap is the largest DEX on BSC.

**Integration Ideas**:
- Create HHCW/BNB liquidity pool
- Stake LP tokens for CAKE rewards
- Enable token swaps in the platform

**Contracts**:
```solidity
// PancakeSwap Router
address constant PANCAKE_ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;

// PancakeSwap Factory
address constant PANCAKE_FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;

// MasterChef (Farming)
address constant PANCAKE_MASTERCHEF = 0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652;
```

### 3. Beefy Finance (Yield Optimizer)

Beefy automates yield farming strategies.

**Integration Ideas**:
- Create Beefy vault for HHCW
- Auto-compound rewards
- Maximize APY for users

### 4. Wombat Exchange (Stableswap)

Wombat specializes in stablecoin swaps.

**Integration Ideas**:
- Low-slippage stablecoin swaps
- Efficient liquidity provision
- Multi-asset pools

## Reference: AION Vault on BSC

The AION Vault project has successfully deployed on BSC Mainnet. Here's what we can learn:

### Deployed Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| Main Vault | `0xB176c1FA7B3feC56cB23681B6E447A7AE60C5254` | Central vault |
| Venus Strategy | `0x9D20A69E95CFEc37E5BC22c0D4218A705d90EdcB` | Venus integration |
| PancakeSwap Strategy | `0xf2116eE783Be82ba51a6Eda9453dFD6A1723d205` | PancakeSwap integration |

### Key Learnings

1. **Gas Optimization**: All contracts optimized for BSC's gas model
2. **Multi-Strategy**: 8 different strategies deployed successfully
3. **Verification**: All contracts verified on BSCScan
4. **Security**: Access controls and emergency functions working
5. **Integration**: Seamless integration with BSC protocols

### Verification Links

- [Main Vault](https://bscscan.com/address/0xB176c1FA7B3feC56cB23681B6E447A7AE60C5254)
- [Venus Strategy](https://bscscan.com/address/0x9d20a69e95cfec37e5bc22c0d4218a705d90edcb)
- [PancakeSwap Strategy](https://bscscan.com/address/0xf2116ee783be82ba51a6eda9453dfd6a1723d205)

## HauntedAI Deployment Strategy

### Phase 1: Testnet Deployment
1. Deploy HHCWToken to BSC Testnet
2. Deploy GhostBadge to BSC Testnet
3. Deploy Treasury to BSC Testnet
4. Test all functions
5. Verify contracts on BSCScan

### Phase 2: Mainnet Deployment
1. Audit smart contracts
2. Deploy to BSC Mainnet
3. Verify on BSCScan
4. Create HHCW/BNB pool on PancakeSwap
5. Add liquidity
6. Enable trading

### Phase 3: Protocol Integration
1. Integrate with Venus for lending
2. Create farming pools on PancakeSwap
3. Add Beefy vaults for auto-compounding
4. Enable cross-chain bridges

## Gas Cost Comparison

| Operation | Ethereum | Polygon | BSC |
|-----------|----------|---------|-----|
| Token Transfer | $5-10 | $0.01-0.05 | $0.10-0.30 |
| NFT Mint | $20-50 | $0.05-0.20 | $0.50-1.00 |
| Contract Deploy | $100-500 | $1-5 | $5-20 |
| Swap | $10-30 | $0.02-0.10 | $0.20-0.50 |

**Conclusion**: BSC offers 10-50x lower gas costs than Ethereum while maintaining EVM compatibility.

## Security Considerations

### 1. Centralization Risk
- BSC is more centralized than Ethereum (21 validators)
- Consider this when designing governance

### 2. Bridge Security
- Use reputable bridges (Binance Bridge, Multichain)
- Audit bridge contracts
- Monitor bridge transactions

### 3. Smart Contract Security
- Same security practices as Ethereum
- Use OpenZeppelin libraries
- Conduct audits before mainnet

### 4. Oracle Security
- Use Chainlink oracles on BSC
- Implement price feed validation
- Have fallback mechanisms

## Integration with API Gateway

### Example: Reward Distribution on BSC

```typescript
// apps/api/src/blockchain/bsc.service.ts
import { ethers } from 'ethers';

export class BSCService {
  private provider: ethers.JsonRpcProvider;
  private treasury: ethers.Contract;
  private wallet: ethers.Wallet;
  
  constructor() {
    // Connect to BSC
    this.provider = new ethers.JsonRpcProvider(
      process.env.BSC_RPC_URL
    );
    
    // Create wallet
    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      this.provider
    );
    
    // Connect to Treasury contract
    this.treasury = new ethers.Contract(
      process.env.TREASURY_ADDRESS,
      TreasuryABI,
      this.wallet
    );
  }
  
  async rewardUpload(userAddress: string): Promise<string> {
    try {
      // Call Treasury.rewardUpload
      const tx = await this.treasury.rewardUpload(userAddress);
      
      // Wait for confirmation (fast on BSC)
      const receipt = await tx.wait(1);
      
      // Return transaction hash
      return receipt.hash;
    } catch (error) {
      console.error('BSC reward failed:', error);
      throw error;
    }
  }
  
  async getBalance(userAddress: string): Promise<string> {
    const token = new ethers.Contract(
      process.env.HHCW_TOKEN_ADDRESS,
      ERC20ABI,
      this.provider
    );
    
    const balance = await token.balanceOf(userAddress);
    return ethers.formatEther(balance);
  }
}
```

## Testing on BSC

### Unit Tests

```bash
# Run tests with BSC fork
forge test --fork-url $BSC_RPC_URL
```

### Integration Tests

```javascript
// test-bsc-integration.js
const { ethers } = require('ethers');

async function testBSCIntegration() {
  // Connect to BSC Testnet
  const provider = new ethers.JsonRpcProvider(
    'https://data-seed-prebsc-1-s1.binance.org:8545'
  );
  
  // Test contract interaction
  const treasury = new ethers.Contract(
    TREASURY_ADDRESS,
    TreasuryABI,
    provider
  );
  
  // Check if contract is deployed
  const code = await provider.getCode(TREASURY_ADDRESS);
  console.log('Contract deployed:', code !== '0x');
  
  // Test read function
  const token = await treasury.token();
  console.log('Token address:', token);
}

testBSCIntegration();
```

## Monitoring and Analytics

### BSCScan API

```bash
# Get contract ABI
curl "https://api.bscscan.com/api?module=contract&action=getabi&address=0x..."

# Get transaction list
curl "https://api.bscscan.com/api?module=account&action=txlist&address=0x..."
```

### Event Monitoring

```typescript
// Monitor RewardDistributed events
treasury.on('RewardDistributed', (user, amount, rewardType) => {
  console.log(`Reward: ${user} received ${amount} for ${rewardType}`);
  
  // Update database
  await updateUserReward(user, amount, rewardType);
});
```

## Resources

### Official Documentation
- [BSC Documentation](https://docs.bnbchain.org/)
- [BSCScan](https://bscscan.com/)
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)

### DeFi Protocols
- [Venus Protocol](https://venus.io/)
- [PancakeSwap](https://pancakeswap.finance/)
- [Beefy Finance](https://beefy.finance/)
- [Wombat Exchange](https://www.wombat.exchange/)

### Development Tools
- [Foundry](https://book.getfoundry.sh/)
- [Hardhat BSC Plugin](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)
- [BSC Network Info](https://chainlist.org/?search=binance)

## Next Steps

1. ✅ Configure BSC in foundry.toml
2. ✅ Update .env with BSC credentials
3. ⏳ Deploy contracts to BSC Testnet
4. ⏳ Test all functions
5. ⏳ Verify on BSCScan
6. ⏳ Create liquidity pool
7. ⏳ Deploy to BSC Mainnet

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
