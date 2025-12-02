# HauntedAI Smart Contracts Architecture

**Managed by Kiro** | Technical Architecture Documentation

## Overview

The HauntedAI smart contract system implements a token economy with reward distribution and NFT badges. The architecture follows best practices for security, upgradability, and gas optimization.

## Contract Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         Treasury                             │
│                    (Central Controller)                      │
│  - Reward distribution                                       │
│  - Badge minting                                             │
│  - Access control                                            │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
             │                          │
    ┌────────▼────────┐        ┌───────▼────────┐
    │   HHCWToken     │        │  GhostBadge    │
    │    (ERC20)      │        │   (ERC721)     │
    │                 │        │                │
    │ - Minting       │        │ - Badge types  │
    │ - Burning       │        │ - Metadata     │
    │ - Transfers     │        │ - Token URI    │
    └─────────────────┘        └────────────────┘
```

## Contract Specifications

### 1. HHCWToken (ERC20)

**Purpose**: Platform reward token

**Key Features**:
- Standard ERC20 implementation
- Controlled minting (only Treasury)
- Public burning
- 18 decimals
- No maximum supply

**Functions**:
```solidity
// Public functions
function transfer(address to, uint256 amount) external returns (bool)
function approve(address spender, uint256 amount) external returns (bool)
function transferFrom(address from, address to, uint256 amount) external returns (bool)
function burn(uint256 amount) external

// Treasury-only functions
function mint(address to, uint256 amount) external onlyTreasury
function setTreasury(address newTreasury) external onlyOwner
```

**Events**:
```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
event Approval(address indexed owner, address indexed spender, uint256 value)
event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)
```

**Access Control**:
- Owner: Can set treasury address
- Treasury: Can mint tokens
- Anyone: Can burn their own tokens

### 2. GhostBadge (ERC721)

**Purpose**: Achievement NFT badges

**Key Features**:
- Standard ERC721 implementation
- Controlled minting (only Treasury)
- Badge type metadata
- IPFS-based token URI
- Non-transferable (soulbound) option

**Functions**:
```solidity
// Public functions
function balanceOf(address owner) external view returns (uint256)
function ownerOf(uint256 tokenId) external view returns (address)
function tokenURI(uint256 tokenId) external view returns (string memory)
function getBadgeType(uint256 tokenId) external view returns (string memory)

// Treasury-only functions
function mintBadge(address to, string memory badgeType) external onlyTreasury returns (uint256)
function setBaseURI(string memory newBaseURI) external onlyOwner
function setTreasury(address newTreasury) external onlyOwner
```

**Badge Types**:
1. **Ghost Hunter**: Awarded for completing 10 rooms
2. **Haunted Master**: Awarded for earning 1000 HHCW tokens
3. **Early Adopter**: Awarded to first 100 users
4. **Content Creator**: Awarded for 50 content uploads

**Events**:
```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType)
event BaseURIUpdated(string newBaseURI)
event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury)
```

### 3. Treasury

**Purpose**: Central controller for rewards and badges

**Key Features**:
- Reward distribution logic
- Badge minting logic
- Access control
- Event logging
- Pausable operations

**Functions**:
```solidity
// Reward functions
function rewardUpload(address user) external onlyAuthorized
function rewardView(address user) external onlyAuthorized
function rewardReferral(address user) external onlyAuthorized

// Badge functions
function grantBadge(address user, string memory badgeType) external onlyAuthorized

// Admin functions
function setRewardAmount(string memory rewardType, uint256 amount) external onlyOwner
function addAuthorizedCaller(address caller) external onlyOwner
function removeAuthorizedCaller(address caller) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

**Reward Amounts**:
- Upload: 10 HHCW (10 * 10^18 wei)
- View: 1 HHCW (1 * 10^18 wei)
- Referral: 50 HHCW (50 * 10^18 wei)

**Events**:
```solidity
event RewardDistributed(address indexed user, uint256 amount, string rewardType)
event BadgeGranted(address indexed user, uint256 tokenId, string badgeType)
event RewardAmountUpdated(string rewardType, uint256 oldAmount, uint256 newAmount)
event AuthorizedCallerAdded(address indexed caller)
event AuthorizedCallerRemoved(address indexed caller)
event Paused(address account)
event Unpaused(address account)
```

**Access Control**:
- Owner: Can update settings, add/remove authorized callers
- Authorized Callers: Can distribute rewards and grant badges (API Gateway)
- Anyone: Can view public data

## Security Features

### 1. Access Control

**Ownable Pattern**:
- All contracts inherit from OpenZeppelin's Ownable
- Owner can transfer ownership
- Critical functions restricted to owner

**Role-Based Access**:
- Treasury has minting rights
- API Gateway is authorized caller
- Multi-level permission system

### 2. Reentrancy Protection

- All state changes before external calls
- Use OpenZeppelin's ReentrancyGuard where needed
- No recursive calls allowed

### 3. Integer Overflow Protection

- Solidity 0.8.x built-in overflow checks
- SafeMath not needed
- Explicit checks for critical operations

### 4. Pausable Operations

- Emergency pause mechanism
- Owner can pause/unpause
- Critical functions respect pause state

### 5. Input Validation

- Address zero checks
- Amount validation
- String length limits
- Array bounds checking

## Gas Optimization

### 1. Storage Optimization

- Pack variables in storage slots
- Use appropriate data types
- Minimize storage writes
- Use events for logs

### 2. Function Optimization

- Use `external` instead of `public` when possible
- Cache storage variables in memory
- Batch operations when possible
- Optimize loops

### 3. Compiler Optimization

- Optimizer enabled (200 runs)
- Via IR disabled for compatibility
- Solidity 0.8.24 for latest optimizations

## Upgrade Strategy

### Current Approach: Non-Upgradable

Contracts are deployed as immutable for security and simplicity.

### Future Upgrade Path

If upgradability is needed:

1. **Transparent Proxy Pattern**:
   - Deploy proxy contract
   - Separate logic and storage
   - Owner can upgrade logic

2. **UUPS Pattern**:
   - Upgrade logic in implementation
   - More gas efficient
   - Requires careful implementation

3. **Diamond Pattern**:
   - Modular upgrades
   - Multiple facets
   - Complex but flexible

## Testing Strategy

### Unit Tests

Test each function in isolation:
- Happy path scenarios
- Edge cases
- Error conditions
- Access control
- Event emissions

### Integration Tests

Test contract interactions:
- Treasury → Token minting
- Treasury → Badge minting
- Multi-step workflows
- Permission chains

### Property-Based Tests

Test invariants:
- Total supply consistency
- Balance conservation
- Access control enforcement
- State transition validity

### Gas Tests

Optimize gas usage:
- Benchmark operations
- Compare implementations
- Identify bottlenecks
- Track gas over time

## Deployment Process

### 1. Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Gas optimized
- [ ] Documentation complete

### 2. Deployment Order

1. Deploy HHCWToken
2. Deploy GhostBadge
3. Deploy Treasury
4. Set Treasury in HHCWToken
5. Set Treasury in GhostBadge
6. Authorize API Gateway in Treasury
7. Verify all contracts

### 3. Post-Deployment

- [ ] Verify on block explorer
- [ ] Test all functions
- [ ] Update API configuration
- [ ] Monitor events
- [ ] Set up alerts

## Integration with API Gateway

### API Gateway Responsibilities

1. **User Authentication**: Verify user identity
2. **Action Validation**: Validate user actions
3. **Reward Triggering**: Call Treasury reward functions
4. **Badge Checking**: Check badge eligibility
5. **Event Monitoring**: Listen to contract events

### Integration Flow

```
User Action → API Gateway → Validate → Treasury → Token/Badge
                ↓                          ↓
            Database                   Blockchain
```

### Example Integration

```typescript
// API Gateway service
class BlockchainService {
  async rewardUserForUpload(userAddress: string) {
    // 1. Validate user
    const user = await this.validateUser(userAddress);
    
    // 2. Call Treasury contract
    const tx = await this.treasury.rewardUpload(userAddress);
    
    // 3. Wait for confirmation
    const receipt = await tx.wait();
    
    // 4. Log transaction
    await this.logTransaction(receipt.hash, 'upload_reward');
    
    // 5. Update database
    await this.updateUserBalance(userAddress);
    
    return receipt;
  }
}
```

## Monitoring and Alerts

### Events to Monitor

1. **RewardDistributed**: Track all rewards
2. **BadgeGranted**: Track badge minting
3. **Transfer**: Track token movements
4. **Paused/Unpaused**: Track emergency actions

### Metrics to Track

- Total tokens minted
- Total badges minted
- Rewards per user
- Gas costs per operation
- Transaction success rate

### Alerts to Configure

- Large token mints (> 1000 HHCW)
- Failed transactions
- Unauthorized access attempts
- Contract paused
- Low gas price

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic ERC20 token
- ✅ Basic ERC721 badges
- ✅ Simple reward system

### Phase 2 (Planned)
- [ ] Staking mechanism
- [ ] Governance voting
- [ ] Token vesting
- [ ] Badge marketplace

### Phase 3 (Future)
- [ ] Cross-chain bridge
- [ ] Layer 2 integration
- [ ] Advanced tokenomics
- [ ] DAO governance

## References

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Ethereum Improvement Proposals](https://eips.ethereum.org/)

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
