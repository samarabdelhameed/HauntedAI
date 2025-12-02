# HauntedAI Smart Contracts Deployment Guide

**Managed by Kiro** | Step-by-Step Deployment Instructions

## Prerequisites

Before deploying, ensure you have:

1. ✅ Foundry installed (`forge --version`)
2. ✅ Wallet with testnet funds
3. ✅ RPC provider account (Alchemy/Infura)
4. ✅ Block explorer API key (Etherscan/Polygonscan)

## Getting Testnet Funds

### Sepolia ETH
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Mumbai MATIC (Deprecated - Use Amoy)
- [Mumbai Faucet](https://faucet.polygon.technology/)

### Amoy MATIC (Recommended)
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)

## Step 1: Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your `.env` file:
```bash
# Your deployment wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs (get from Alchemy/Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# API Keys for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

⚠️ **SECURITY WARNING**: Never commit your `.env` file or share your private key!

## Step 2: Compile Contracts

```bash
forge build
```

Expected output:
```
[⠊] Compiling...
[⠒] Compiling 3 files with 0.8.24
[⠢] Solc 0.8.24 finished in X.XXs
Compiler run successful!
```

## Step 3: Run Tests

Before deploying, ensure all tests pass:

```bash
forge test
```

Run with gas reporting:
```bash
forge test --gas-report
```

## Step 4: Deploy to Testnet

### Option A: Deploy to Amoy (Recommended)

```bash
forge script script/Deploy.s.sol \
  --rpc-url amoy \
  --broadcast \
  --verify \
  -vvvv
```

### Option B: Deploy to Sepolia

```bash
forge script script/Deploy.s.sol \
  --rpc-url sepolia \
  --broadcast \
  --verify \
  -vvvv
```

### Option C: Deploy to Local Anvil (Testing)

1. Start Anvil in a separate terminal:
```bash
anvil
```

2. Deploy:
```bash
forge script script/Deploy.s.sol \
  --rpc-url localhost \
  --broadcast
```

## Step 5: Verify Deployment

After deployment, you'll see output like:

```
== Logs ==
Deploying contracts with account: 0x...
Account balance: X.XXX ETH

Deploying HHCWToken...
HHCWToken deployed at: 0x1234...

Deploying GhostBadge...
GhostBadge deployed at: 0x5678...

Deploying Treasury...
Treasury deployed at: 0x9abc...

Setting up permissions...
✅ Treasury set as HHCWToken minter
✅ Treasury set as GhostBadge minter

Deployment complete!
```

## Step 6: Save Contract Addresses

1. Contract addresses are saved in:
```
broadcast/Deploy.s.sol/<chain-id>/run-latest.json
```

2. Update your `.env` file:
```bash
HHCW_TOKEN_ADDRESS=0x1234...
GHOST_BADGE_ADDRESS=0x5678...
TREASURY_ADDRESS=0x9abc...
```

3. Update the API Gateway `.env`:
```bash
cd ../../api
echo "HHCW_TOKEN_ADDRESS=0x1234..." >> .env
echo "GHOST_BADGE_ADDRESS=0x5678..." >> .env
echo "TREASURY_ADDRESS=0x9abc..." >> .env
```

## Step 7: Verify Contracts on Block Explorer

If automatic verification failed, manually verify:

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  <CONTRACT_NAME> \
  --chain-id <CHAIN_ID> \
  --etherscan-api-key <API_KEY>
```

Example for HHCWToken on Amoy:
```bash
forge verify-contract \
  0x1234... \
  src/HHCWToken.sol:HHCWToken \
  --chain-id 80002 \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

## Step 8: Test Deployed Contracts

### Using Cast (Foundry CLI)

Check token name:
```bash
cast call <HHCW_TOKEN_ADDRESS> "name()" --rpc-url amoy
```

Check treasury address:
```bash
cast call <HHCW_TOKEN_ADDRESS> "treasury()" --rpc-url amoy
```

### Using Block Explorer

1. Go to the contract address on the explorer
2. Navigate to "Read Contract" tab
3. Test view functions
4. Navigate to "Write Contract" tab
5. Connect wallet and test write functions

## Step 9: Integration with API

Update the API Gateway to use deployed contracts:

1. Install ethers.js in API:
```bash
cd ../../api
npm install ethers@6
```

2. Create blockchain service:
```typescript
// apps/api/src/blockchain/blockchain.service.ts
import { ethers } from 'ethers';

export class BlockchainService {
  private provider: ethers.Provider;
  private treasury: ethers.Contract;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    this.treasury = new ethers.Contract(
      process.env.TREASURY_ADDRESS,
      TreasuryABI,
      this.provider
    );
  }
  
  async rewardUpload(userAddress: string) {
    // Implementation
  }
}
```

## Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Get more testnet tokens from faucets

### Issue: "Nonce too low"
**Solution**: Reset your wallet nonce or wait for pending transactions

### Issue: "Verification failed"
**Solution**: 
- Check API key is correct
- Ensure contract is deployed
- Try manual verification with exact compiler settings

### Issue: "Transaction reverted"
**Solution**: 
- Check gas limit
- Verify function parameters
- Check contract permissions

## Network Information

### Amoy Testnet (Recommended)
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com
- Faucet: https://faucet.polygon.technology

### Sepolia Testnet
- Chain ID: 11155111
- RPC: https://eth-sepolia.g.alchemy.com/v2/
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

## Gas Optimization Tips

1. Use `optimizer = true` in foundry.toml
2. Set appropriate `optimizer_runs` (200 for balanced)
3. Batch transactions when possible
4. Use events instead of storage for logs
5. Minimize storage writes

## Security Checklist

Before mainnet deployment:

- [ ] All tests passing
- [ ] Code reviewed by team
- [ ] External audit completed
- [ ] Access controls verified
- [ ] Emergency pause mechanism tested
- [ ] Upgrade path documented
- [ ] Multi-sig wallet for ownership
- [ ] Testnet deployment successful
- [ ] Integration tests with API completed
- [ ] Documentation complete

## Next Steps

After successful deployment:

1. ✅ Update API Gateway with contract addresses
2. ✅ Test token reward distribution
3. ✅ Test badge minting
4. ✅ Update frontend with contract ABIs
5. ✅ Test end-to-end user flow
6. ✅ Monitor contract events
7. ✅ Set up alerts for critical functions

## Support

For issues or questions:
- Check [Foundry Book](https://book.getfoundry.sh/)
- Review [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- Ask in project Discord/Telegram

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
