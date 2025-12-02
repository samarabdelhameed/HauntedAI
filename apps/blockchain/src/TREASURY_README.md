# Treasury Contract

**Managed by Kiro** | HauntedAI Platform | Smart Contract Documentation

## Overview

The Treasury contract is the central reward distribution and badge management system for the HauntedAI platform. It coordinates with the HHCWToken (ERC20) and GhostBadge (ERC721) contracts to reward users for platform activities and grant achievement badges.

## Features

### Reward Distribution

The Treasury manages three types of rewards:

1. **Upload Reward**: 10 HHCW tokens
   - Granted when a user uploads content (completes a room)
   - Increments user's room count
   - May trigger automatic badge grants

2. **View Reward**: 1 HHCW token
   - Granted when a user views content
   - Does not increment room count
   - Contributes to total earnings for badge eligibility

3. **Referral Reward**: 50 HHCW tokens
   - Granted when a user successfully refers a friend
   - Does not increment room count
   - Contributes to total earnings for badge eligibility

### Automatic Badge Granting

The Treasury automatically grants badges when users reach certain milestones:

| Badge Type | Criteria | Description |
|------------|----------|-------------|
| Ghost Novice | 1 room completed | First room achievement |
| Haunted Creator | 10 rooms completed | Active creator milestone |
| Haunted Master | 1000 HHCW earned | Token accumulation achievement |
| Spooky Legend | 100 rooms completed | Platform veteran status |

### User Statistics Tracking

The Treasury maintains statistics for each user:
- **Room Count**: Number of rooms completed (uploads)
- **Total Earned**: Total HHCW tokens earned from all sources

These statistics are used to determine badge eligibility and are updated with each reward distribution.

## Contract Architecture

```
Treasury
├── HHCWToken (ERC20)
│   └── Mints tokens for rewards
└── GhostBadge (ERC721)
    └── Mints badges for achievements
```

## Key Functions

### Reward Functions

#### `rewardUpload(address user)`
Rewards a user for uploading content.
- Mints 10 HHCW tokens
- Increments room count
- Updates total earned
- Checks and grants eligible badges
- **Access**: Owner only

#### `rewardView(address user)`
Rewards a user for viewing content.
- Mints 1 HHCW token
- Updates total earned
- Checks and grants eligible badges
- **Access**: Owner only

#### `rewardReferral(address user)`
Rewards a user for successful referral.
- Mints 50 HHCW tokens
- Updates total earned
- Checks and grants eligible badges
- **Access**: Owner only

### Badge Functions

#### `grantBadge(address user, string badgeType)`
Manually grants a badge to a user.
- Mints specified badge type
- Prevents duplicate badge types per user
- Emits BadgeGranted event
- **Access**: Owner only
- **Returns**: Token ID of minted badge

#### `isEligibleForBadge(address user, string badgeType)`
Checks if a user is eligible for a specific badge.
- Returns false if user already has the badge
- Checks criteria based on badge type
- **Access**: Public view
- **Returns**: Boolean eligibility status

### Query Functions

#### `getUserStats(address user)`
Returns user statistics.
- **Returns**: (roomCount, totalEarned)
- **Access**: Public view

#### `getRewardAmount(string action)`
Returns the reward amount for a specific action.
- **Parameters**: "upload", "view", or "referral"
- **Returns**: Reward amount in wei (18 decimals)
- **Access**: Public view

## Events

### RewardDistributed
```solidity
event RewardDistributed(
    address indexed user,
    uint256 amount,
    string reason,
    uint256 timestamp
);
```
Emitted when tokens are distributed to a user.

### BadgeGranted
```solidity
event BadgeGranted(
    address indexed user,
    uint256 indexed tokenId,
    string badgeType,
    uint256 timestamp
);
```
Emitted when a badge is granted to a user.

### UserStatsUpdated
```solidity
event UserStatsUpdated(
    address indexed user,
    uint256 roomCount,
    uint256 totalEarned
);
```
Emitted when user statistics are updated.

## Security Features

1. **Ownable**: Only contract owner can distribute rewards and grant badges
2. **ReentrancyGuard**: Prevents reentrancy attacks on reward functions
3. **Input Validation**: Validates all inputs (non-zero addresses, non-empty strings)
4. **Duplicate Prevention**: Prevents granting duplicate badge types to users
5. **Immutable References**: Token and badge contract addresses are immutable

## Deployment

### Prerequisites

1. Deploy HHCWToken contract
2. Deploy GhostBadge contract
3. Note both contract addresses

### Deploy Treasury

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export HHCW_TOKEN_ADDRESS=0x...
export GHOST_BADGE_ADDRESS=0x...

# Deploy to BSC Testnet
forge script script/DeployTreasury.s.sol:DeployTreasury \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify

# Or deploy all contracts at once (if addresses not set)
forge script script/DeployTreasury.s.sol:DeployTreasury \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify
```

### Post-Deployment Setup

After deployment, the script automatically:
1. Sets Treasury as authorized minter for HHCWToken
2. Sets Treasury as authorized minter for GhostBadge
3. Saves deployment addresses to `deployment-addresses.txt`

## Testing

Run the comprehensive test suite:

```bash
# Run all Treasury tests
forge test --match-contract TreasuryTest -vv

# Run specific test
forge test --match-test test_RewardUpload_MintsCorrectAmount -vvv

# Run with gas reporting
forge test --match-contract TreasuryTest --gas-report
```

### Test Coverage

The test suite includes:
- ✅ Constructor validation
- ✅ Upload reward distribution
- ✅ View reward distribution
- ✅ Referral reward distribution
- ✅ Manual badge granting
- ✅ Automatic badge granting
- ✅ User statistics tracking
- ✅ Reward amount queries
- ✅ Badge eligibility checks
- ✅ Access control
- ✅ Integration scenarios
- ✅ Multi-user scenarios

Total: 43 tests, all passing

## Integration with Backend

### Example: Reward User for Upload

```typescript
// Backend API (NestJS)
import { ethers } from 'ethers';

async function rewardUserForUpload(userAddress: string) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const treasury = new ethers.Contract(
    process.env.TREASURY_ADDRESS,
    TreasuryABI,
    wallet
  );
  
  // Reward user
  const tx = await treasury.rewardUpload(userAddress);
  await tx.wait();
  
  // Get updated stats
  const [roomCount, totalEarned] = await treasury.getUserStats(userAddress);
  
  return {
    roomCount: roomCount.toString(),
    totalEarned: ethers.formatEther(totalEarned),
    txHash: tx.hash
  };
}
```

### Example: Check Badge Eligibility

```typescript
async function checkBadgeEligibility(userAddress: string) {
  const treasury = new ethers.Contract(
    process.env.TREASURY_ADDRESS,
    TreasuryABI,
    provider
  );
  
  const badges = [
    'Ghost Novice',
    'Haunted Creator',
    'Haunted Master',
    'Spooky Legend'
  ];
  
  const eligibility = await Promise.all(
    badges.map(async (badge) => ({
      badge,
      eligible: await treasury.isEligibleForBadge(userAddress, badge)
    }))
  );
  
  return eligibility;
}
```

## Gas Optimization

The Treasury contract is optimized for gas efficiency:
- Uses immutable variables for contract references
- Batches state updates in single transactions
- Efficient badge eligibility checks
- Minimal storage operations

### Estimated Gas Costs

| Operation | Gas Cost |
|-----------|----------|
| rewardUpload (first time) | ~230,000 |
| rewardUpload (subsequent) | ~100,000 |
| rewardView | ~100,000 |
| rewardReferral | ~100,000 |
| grantBadge | ~130,000 |

## Upgrade Path

The Treasury contract is not upgradeable by design for security and transparency. If upgrades are needed:

1. Deploy new Treasury contract
2. Transfer ownership of HHCWToken and GhostBadge to new Treasury
3. Migrate user statistics (if needed)
4. Update backend to use new Treasury address

## Requirements Validation

This implementation satisfies the following requirements:

- ✅ **Requirement 9.1**: Upload reward (10 HHCW)
- ✅ **Requirement 9.2**: View reward (1 HHCW)
- ✅ **Requirement 9.3**: Referral reward (50 HHCW)
- ✅ **Requirement 16.1**: Badge minting for achievements
- ✅ **Requirement 16.2**: Multiple badge types
- ✅ **Requirement 16.3**: Badge transaction recording

## Support

For issues or questions:
- Review test suite: `test/Treasury.t.sol`
- Check deployment script: `script/DeployTreasury.s.sol`
- Refer to main README: `apps/blockchain/README.md`

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
