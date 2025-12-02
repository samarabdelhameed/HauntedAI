// API Client for HauntedAI Backend
// Managed by Kiro

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('jwt_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Request failed',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(walletAddress: string, signature: string, message: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  }

  // Room endpoints
  async createRoom(inputText: string) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
    });
  }

  async getRoom(roomId: string) {
    return this.request(`/rooms/${roomId}`, {
      method: 'GET',
    });
  }

  async startRoom(roomId: string) {
    return this.request(`/rooms/${roomId}/start`, {
      method: 'POST',
    });
  }

  async listRooms() {
    return this.request('/rooms', {
      method: 'GET',
    });
  }

  // Asset endpoints
  async listAssets(filters?: { agentType?: string }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request(`/assets?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getAsset(assetId: string) {
    return this.request(`/assets/${assetId}`, {
      method: 'GET',
    });
  }

  // Explore endpoint (public)
  async exploreContent(page: number = 1, limit: number = 12) {
    return this.request(`/assets/explore?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Token endpoints
  async getBalance(did: string) {
    return this.request(`/tokens/balance/${did}`, {
      method: 'GET',
    });
  }

  async getTransactions(did: string) {
    return this.request(`/tokens/transactions/${did}`, {
      method: 'GET',
    });
  }

  // SSE connection for live logs
  createSSEConnection(roomId: string, onMessage: (log: any) => void, onError?: (error: Event) => void) {
    const url = `${this.baseUrl}/rooms/${roomId}/logs`;
    console.log('Creating SSE connection to:', url);
    
    const eventSource = new EventSource(url, { withCredentials: false });

    eventSource.addEventListener('log', (event) => {
      try {
        const log = JSON.parse(event.data);
        onMessage(log);
      } catch (error) {
        console.error('Failed to parse log:', error);
      }
    });

    eventSource.addEventListener('connected', (event) => {
      console.log('SSE connected:', event.data);
    });

    eventSource.addEventListener('heartbeat', () => {
      // Keep connection alive
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      if (onError) onError(error);
    };

    return eventSource;
  }
}

export const apiClient = new ApiClient(API_URL);
