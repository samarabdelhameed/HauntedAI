// Web3 Wallet Integration for HauntedAI
// Managed by Kiro

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  address: string;
  chainId: string;
}

class Web3Manager {
  async isMetaMaskInstalled(): Promise<boolean> {
    return typeof window.ethereum !== 'undefined';
  }

  async connectWallet(): Promise<WalletConnection | null> {
    if (!await this.isMetaMaskInstalled()) {
      alert('Please install MetaMask to connect your wallet!');
      return null;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      return {
        address,
        chainId,
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async signMessage(address: string, message: string): Promise<string | null> {
    if (!await this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!await this.isMetaMaskInstalled()) {
      return '0';
    }

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert from wei to ether
      const balanceInEther = parseInt(balance, 16) / 1e18;
      return balanceInEther.toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

export const web3Manager = new Web3Manager();
