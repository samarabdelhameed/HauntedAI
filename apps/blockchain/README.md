# HauntedAI Smart Contracts

**Managed by Kiro** | Blockchain & Token Economy

## Overview

This directory contains the Solidity smart contracts for the HauntedAI platform, including:

- **HHCWToken.sol**: ERC20 token for platform rewards
- **GhostBadge.sol**: ERC721 NFT badges for achievements
- **Treasury.sol**: Central contract for reward distribution and badge minting

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Node.js 20+ (for deployment scripts)
- Wallet with testnet funds (Sepolia ETH or Mumbai MATIC)

## Setup

1. Install dependencies:
```bash
forge install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - Private key for deployment
   - RPC URLs for networks
   - API keys for contract verification

## Build

Compile contracts:
```bash
forge build
```

## Test

Run all tests:
```bash
forge test
```

Run tests with gas reporting:
```bash
forge test --gas-report
```

Run tests with verbosity:
```bash
forge test -vvv
```

## Deploy

### Local Network (Anvil)

1. Start local node:
```bash
anvil
```

2. Deploy contracts:
```bash
forge script script/Deploy.s.sol --rpc-url localhost --broadcast
```

### Sepolia Testnet

```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### Mumbai Testnet (Polygon)

```bash
forge script script/Deploy.s.sol --rpc-url mumbai --broadcast --verify
```

### Amoy Testnet (Polygon)

```bash
forge script script/Deploy.s.sol --rpc-url amoy --broadcast --verify
```

## Contract Addresses

### BSC Testnet (Deployed - December 2, 2024) ✅

| Contract | Address |
|----------|---------|
| **HHCWToken** | `0x310Ee8C7c6c8669c93B5b73350e288825cd114e3` |
| **Treasury** | `0xdAFEE25F98Ff62504C1086eAcbb406190F3110D5` |

**Status**: ✅ Deployed and tested with real transactions  
**Test Report**: See `REAL_TEST_REPORT_AR.md` for complete test results  
**BSCScan**: https://testnet.bscscan.com/address/0x310Ee8C7c6c8669c93B5b73350e288825cd114e3

After deployment, addresses are saved in `.env` file

## Network Configuration

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Localhost | 31337 | http://localhost:8545 | - |
| Sepolia | 11155111 | Alchemy/Infura | etherscan.io |
| Mumbai | 80001 | Alchemy/Polygon | mumbai.polygonscan.com |
| Amoy | 80002 | Polygon RPC | amoy.polygonscan.com |
| Polygon | 137 | Alchemy/Polygon | polygonscan.com |

## Contract Architecture

```
Treasury (Owner)
├── HHCWToken (ERC20)
│   ├── mint() - Only Treasury
│   └── burn() - Anyone
└── GhostBadge (ERC721)
    ├── mintBadge() - Only Treasury
    └── tokenURI() - Metadata
```

## Token Economics

### HHCW Token Rewards
- Upload content: 10 HHCW
- View content: 1 HHCW
- Referral: 50 HHCW

### Ghost Badge NFTs
- 10 Rooms Completed: "Ghost Hunter" badge
- 1000 HHCW Earned: "Haunted Master" badge

## Security

- All contracts use OpenZeppelin libraries
- Access control via Ownable pattern
- Treasury has exclusive minting rights
- Contracts will be audited before mainnet deployment

## Testing Standards

All contracts must have:
- Unit tests for all functions
- Property-based tests for invariants
- Gas optimization tests
- Access control tests
- Edge case coverage

## Verification

After deployment, verify contracts on block explorer:

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
  --chain-id <CHAIN_ID> \
  --etherscan-api-key <API_KEY>
```

## Kiro Integration

This blockchain implementation showcases Kiro's capabilities:

- ✅ **Spec-driven**: Contracts follow design.md specifications
- ✅ **Type-safe**: Full Solidity type safety
- ✅ **Testable**: Comprehensive test coverage with Foundry
- ✅ **Documented**: Inline NatSpec and external docs
- ✅ **Auditable**: Clean, readable code following best practices

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Polygon Documentation](https://docs.polygon.technology/)

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
