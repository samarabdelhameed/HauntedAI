// Managed by Kiro - HauntedAI Platform
// Blockchain Service for interacting with smart contracts
// Requirements: 9.1, 16.1

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

// ABI for HHCWToken contract
const HHCW_TOKEN_ABI = [
  'function mint(address to, uint256 amount, string calldata reason) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external pure returns (uint8)',
  'event TokensMinted(address indexed to, uint256 amount, string reason)',
];

// ABI for GhostBadge contract
const GHOST_BADGE_ABI = [
  'function mintBadge(address to, string calldata badgeType) external returns (uint256)',
  'function hasBadgeType(address user, string calldata badgeType) external view returns (bool)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  'function getBadgeType(uint256 tokenId) external view returns (string memory)',
  'event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType)',
];

// ABI for Treasury contract
const TREASURY_ABI = [
  'function rewardUpload(address user) external',
  'function rewardView(address user) external',
  'function rewardReferral(address user) external',
  'function grantBadge(address user, string calldata badgeType) external returns (uint256)',
  'function getUserStats(address user) external view returns (uint256 roomCount, uint256 totalEarned)',
  'function isEligibleForBadge(address user, string calldata badgeType) external view returns (bool)',
  'event RewardDistributed(address indexed user, uint256 amount, string reason, uint256 timestamp)',
  'event BadgeGranted(address indexed user, uint256 indexed tokenId, string badgeType, uint256 timestamp)',
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private treasuryContract!: ethers.Contract;
  private tokenContract!: ethers.Contract;
  private badgeContract!: ethers.Contract;

  // Contract addresses from environment
  private readonly TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  private readonly TOKEN_ADDRESS = process.env.HHCW_TOKEN_ADDRESS;
  private readonly BADGE_ADDRESS = process.env.GHOST_BADGE_ADDRESS;
  private readonly RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545';
  private readonly PRIVATE_KEY = process.env.PRIVATE_KEY;

  async onModuleInit() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(this.RPC_URL);
      this.logger.log(`Connected to blockchain at ${this.RPC_URL}`);

      // Initialize wallet (server wallet for gas)
      if (!this.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }
      this.wallet = new ethers.Wallet(this.PRIVATE_KEY, this.provider);
      this.logger.log(`Wallet initialized: ${this.wallet.address}`);

      // Initialize contracts
      if (!this.TREASURY_ADDRESS || !this.TOKEN_ADDRESS || !this.BADGE_ADDRESS) {
        throw new Error('Contract addresses not found in environment variables');
      }

      this.treasuryContract = new ethers.Contract(this.TREASURY_ADDRESS, TREASURY_ABI, this.wallet);
      this.tokenContract = new ethers.Contract(this.TOKEN_ADDRESS, HHCW_TOKEN_ABI, this.wallet);
      this.badgeContract = new ethers.Contract(this.BADGE_ADDRESS, GHOST_BADGE_ABI, this.wallet);

      this.logger.log('Smart contracts initialized successfully');
      this.logger.log(`Treasury: ${this.TREASURY_ADDRESS}`);
      this.logger.log(`Token: ${this.TOKEN_ADDRESS}`);
      this.logger.log(`Badge: ${this.BADGE_ADDRESS}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service', error);
      throw error;
    }
  }

  /**
   * Reward user for uploading content
   * Calls Treasury.rewardUpload which mints 10 HHCW tokens
   * Requirements: 9.1
   */
  async rewardUpload(userAddress: string): Promise<{ txHash: string; amount: string }> {
    try {
      this.logger.log(`Rewarding upload for user: ${userAddress}`);

      const tx = await this.treasuryContract.rewardUpload(userAddress);
      const receipt = await tx.wait();

      this.logger.log(`Upload reward transaction confirmed: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        amount: '10', // 10 HHCW
      };
    } catch (error) {
      this.logger.error(`Failed to reward upload for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Reward user for viewing content
   * Calls Treasury.rewardView which mints 1 HHCW token
   * Requirements: 9.2
   */
  async rewardView(userAddress: string): Promise<{ txHash: string; amount: string }> {
    try {
      this.logger.log(`Rewarding view for user: ${userAddress}`);

      const tx = await this.treasuryContract.rewardView(userAddress);
      const receipt = await tx.wait();

      this.logger.log(`View reward transaction confirmed: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        amount: '1', // 1 HHCW
      };
    } catch (error) {
      this.logger.error(`Failed to reward view for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Reward user for successful referral
   * Calls Treasury.rewardReferral which mints 50 HHCW tokens
   * Requirements: 9.3
   */
  async rewardReferral(userAddress: string): Promise<{ txHash: string; amount: string }> {
    try {
      this.logger.log(`Rewarding referral for user: ${userAddress}`);

      const tx = await this.treasuryContract.rewardReferral(userAddress);
      const receipt = await tx.wait();

      this.logger.log(`Referral reward transaction confirmed: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        amount: '50', // 50 HHCW
      };
    } catch (error) {
      this.logger.error(`Failed to reward referral for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Grant a badge to a user
   * Calls Treasury.grantBadge which mints an NFT badge
   * Requirements: 16.1, 16.2
   */
  async grantBadge(userAddress: string, badgeType: string): Promise<{ txHash: string; tokenId: string }> {
    try {
      this.logger.log(`Granting badge "${badgeType}" to user: ${userAddress}`);

      const tx = await this.treasuryContract.grantBadge(userAddress, badgeType);
      const receipt = await tx.wait();

      // Extract tokenId from BadgeGranted event
      const badgeGrantedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.treasuryContract.interface.parseLog(log);
          return parsed?.name === 'BadgeGranted';
        } catch {
          return false;
        }
      });

      let tokenId = '0';
      if (badgeGrantedEvent) {
        const parsed = this.treasuryContract.interface.parseLog(badgeGrantedEvent);
        tokenId = parsed?.args?.tokenId?.toString() || '0';
      }

      this.logger.log(`Badge granted successfully. TokenId: ${tokenId}, TxHash: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        tokenId,
      };
    } catch (error) {
      this.logger.error(`Failed to grant badge "${badgeType}" to ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Get user's token balance from blockchain
   * Requirements: 9.5
   */
  async getTokenBalance(userAddress: string): Promise<string> {
    try {
      const balance = await this.tokenContract.balanceOf(userAddress);
      const decimals = await this.tokenContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      this.logger.error(`Failed to get token balance for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Get user statistics from Treasury contract
   * Requirements: 16.1
   */
  async getUserStats(userAddress: string): Promise<{ roomCount: number; totalEarned: string }> {
    try {
      const [roomCount, totalEarned] = await this.treasuryContract.getUserStats(userAddress);
      return {
        roomCount: Number(roomCount),
        totalEarned: ethers.formatEther(totalEarned),
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Check if user is eligible for a specific badge
   * Requirements: 16.1, 16.2
   */
  async isEligibleForBadge(userAddress: string, badgeType: string): Promise<boolean> {
    try {
      return await this.treasuryContract.isEligibleForBadge(userAddress, badgeType);
    } catch (error) {
      this.logger.error(`Failed to check badge eligibility for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Check if user already has a specific badge type
   * Requirements: 16.4
   */
  async hasBadgeType(userAddress: string, badgeType: string): Promise<boolean> {
    try {
      return await this.badgeContract.hasBadgeType(userAddress, badgeType);
    } catch (error) {
      this.logger.error(`Failed to check if user has badge type ${badgeType}`, error);
      throw error;
    }
  }

  /**
   * Get all badges owned by a user
   * Requirements: 16.4
   */
  async getUserBadges(userAddress: string): Promise<Array<{ tokenId: string; badgeType: string }>> {
    try {
      const balance = await this.badgeContract.balanceOf(userAddress);
      const badgeCount = Number(balance);

      const badges = [];
      for (let i = 0; i < badgeCount; i++) {
        const tokenId = await this.badgeContract.tokenOfOwnerByIndex(userAddress, i);
        const badgeType = await this.badgeContract.getBadgeType(tokenId);
        badges.push({
          tokenId: tokenId.toString(),
          badgeType,
        });
      }

      return badges;
    } catch (error) {
      this.logger.error(`Failed to get user badges for ${userAddress}`, error);
      throw error;
    }
  }

  /**
   * Get wallet address from DID (helper method)
   * In production, this would query the user database
   */
  async getWalletAddressFromDid(did: string): Promise<string | null> {
    // This is a placeholder - in production, query the database
    // For now, return null to indicate wallet address should be fetched from DB
    return null;
  }
}
