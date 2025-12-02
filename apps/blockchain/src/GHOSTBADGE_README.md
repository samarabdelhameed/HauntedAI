# GhostBadge Contract Documentation

**Managed by Kiro** | HauntedAI Platform | ERC721 NFT Badge System

## Overview

The GhostBadge contract is an ERC721 NFT implementation that awards achievement badges to users of the HauntedAI platform. Each badge represents a milestone or achievement and is stored as a non-fungible token on the blockchain.

## Contract Details

- **Name**: Ghost Badge
- **Symbol**: GHOST
- **Standard**: ERC721 with URI Storage
- **Network**: Polygon (Mumbai Testnet / Mainnet)
- **Solidity Version**: ^0.8.20

## Features

### 1. Badge Types

The contract supports multiple badge types representing different achievements:

- **Ghost Novice**: First room completed
- **Haunted Creator**: 10 rooms completed
- **Haunted Master**: 1000 HHCW tokens earned
- **Spooky Legend**: 100 rooms completed

### 2. Unique Token IDs

Each badge minted receives a unique token ID, starting from 1 and incrementing sequentially.

### 3. Badge Type Metadata

- Badge type is stored on-chain for each token
- Users can query which badge types they own
- Prevents duplicate badge types per user

### 4. Token URI with Metadata

Each badge has a dynamically generated token URI containing:
- Badge name with token ID
- Description
- Badge type
- IPFS image reference
- Attributes for marketplaces

### 5. Treasury-Controlled Minting

Only the designated Treasury contract can mint badges, ensuring controlled distribution based on platform achievements.

## Contract Functions

### Admin Functions

#### `setTreasury(address _treasury)`
Sets the treasury address that can mint badges.
- **Access**: Owner only
- **Parameters**: 
  - `_treasury`: Address of the Treasury contract
- **Emits**: `TreasuryUpdated`

### Treasury Functions

#### `mintBadge(address to, string calldata badgeType) returns (uint256)`
Mints a new badge to a user.
- **Access**: Treasury only
- **Parameters**:
  - `to`: Recipient address
  - `badgeType`: Type of badge (e.g., "Ghost Novice")
- **Returns**: Token ID of the minted badge
- **Emits**: `BadgeMinted`
- **Requirements**:
  - Recipient cannot be zero address
  - Badge type cannot be empty
  - User must not already have this badge type

### View Functions

#### `getBadgeType(uint256 tokenId) returns (string)`
Returns the badge type for a given token ID.

#### `hasBadgeType(address user, string calldata badgeType) returns (bool)`
Checks if a user has a specific badge type.

#### `getCurrentTokenId() returns (uint256)`
Returns the next token ID that will be minted.

#### `tokenURI(uint256 tokenId) returns (string)`
Returns the metadata URI for a badge (base64-encoded JSON).

## Events

### `TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)`
Emitted when the treasury address is updated.

### `BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType)`
Emitted when a new badge is minted.

## Usage Examples

### Deploying the Contract

```solidity
GhostBadge badge = new GhostBadge();
badge.setTreasury(treasuryAddress);
```

### Minting a Badge

```solidity
// From Treasury contract
uint256 tokenId = badge.mintBadge(userAddress, "Ghost Novice");
```

### Checking User Badges

```solidity
bool hasNovice = badge.hasBadgeType(userAddress, "Ghost Novice");
uint256 badgeCount = badge.balanceOf(userAddress);
```

### Getting Badge Metadata

```solidity
string memory badgeType = badge.getBadgeType(tokenId);
string memory uri = badge.tokenURI(tokenId);
```

## Security Features

1. **Access Control**: Only treasury can mint badges
2. **Duplicate Prevention**: Users cannot receive the same badge type twice
3. **Input Validation**: All inputs are validated before processing
4. **Safe Minting**: Uses `_safeMint` to ensure recipient can receive NFTs

## Integration with HauntedAI Platform

The GhostBadge contract integrates with the platform as follows:

1. **Achievement Tracking**: Backend monitors user achievements
2. **Badge Granting**: When achievement unlocked, Treasury calls `mintBadge`
3. **Database Recording**: Transaction hash and token ID stored in database
4. **Profile Display**: Frontend fetches and displays user badges
5. **Marketplace**: Badges can be viewed on OpenSea and other NFT marketplaces

## Testing

Comprehensive test suite covers:
- ✅ Deployment and initialization
- ✅ Treasury access control
- ✅ Badge minting functionality
- ✅ Badge type metadata
- ✅ Token URI generation
- ✅ Duplicate prevention
- ✅ Achievement scenarios
- ✅ Fuzz testing

Run tests:
```bash
forge test --match-contract GhostBadgeTest -vv
```

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `uint256` for token IDs (standard)
- Efficient storage patterns
- Minimal external calls
- Optimized base64 encoding

## Deployment Checklist

Before deploying to production:

- [ ] Deploy contract
- [ ] Set treasury address
- [ ] Verify contract on block explorer
- [ ] Test minting on testnet
- [ ] Update frontend with contract address
- [ ] Configure backend integration
- [ ] Upload badge images to IPFS
- [ ] Update image hashes in contract

## Requirements Validation

This implementation satisfies:

- ✅ **Requirement 16.1**: Badge minting for achievements
- ✅ **Requirement 16.2**: Badge type metadata storage
- ✅ **Requirement 16.3**: Transaction recording capability
- ✅ **Requirement 16.4**: Badge display support
- ✅ **Requirement 16.5**: Metadata display support

## Future Enhancements

Potential improvements for future versions:

1. **Badge Levels**: Add levels to existing badge types
2. **Badge Burning**: Allow users to burn badges
3. **Badge Trading**: Enable marketplace functionality
4. **Dynamic Metadata**: Update metadata based on user progress
5. **Badge Combinations**: Special badges for owning multiple types

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
