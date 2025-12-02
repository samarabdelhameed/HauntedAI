// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HHCWToken
 * @dev ERC20 token for HauntedAI platform rewards
 * @notice Managed by Kiro - HauntedAI Platform
 * 
 * Token Details:
 * - Name: Haunted Halloween Coin Wrapped
 * - Symbol: HHCW
 * - Decimals: 18
 * - Supply: Unlimited (minted by Treasury)
 * 
 * Reward Structure:
 * - Upload content: 10 HHCW
 * - View content: 1 HHCW
 * - Referral: 50 HHCW
 */
contract HHCWToken is ERC20, Ownable {
    address public treasury;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Constructor sets initial owner
     */
    constructor() ERC20("Haunted Halloween Coin Wrapped", "HHCW") Ownable(msg.sender) {
        // Initial supply is 0, tokens are minted by Treasury as rewards
    }

    /**
     * @dev Sets the treasury address that can mint tokens
     * @param _treasury Address of the Treasury contract
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "HHCWToken: treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Modifier to restrict function access to treasury only
     */
    modifier onlyTreasury() {
        require(msg.sender == treasury, "HHCWToken: caller is not the treasury");
        _;
    }

    /**
     * @dev Mints tokens to a user address
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     * @param reason Reason for minting (for event logging)
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyTreasury {
        require(to != address(0), "HHCWToken: mint to zero address");
        require(amount > 0, "HHCWToken: mint amount must be greater than zero");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Burns tokens from caller's balance
     * @param amount Amount of tokens to burn (in wei, 18 decimals)
     */
    function burn(uint256 amount) external {
        require(amount > 0, "HHCWToken: burn amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "HHCWToken: insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
