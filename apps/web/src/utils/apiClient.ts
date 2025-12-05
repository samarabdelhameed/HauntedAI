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
    const isConnectionError = (error: any): boolean => {
      const message = error?.message || String(error);
      return (
        message.includes('Failed to fetch') ||
        message.includes('ERR_CONNECTION_REFUSED') ||
        message.includes('NetworkError') ||
        message.includes('Network request failed') ||
        message.includes('Load failed')
      );
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // Handle JWT expiration (401 Unauthorized)
      if (response.status === 401) {
        // Clear expired token
        this.clearToken();

        // Trigger re-authentication by redirecting to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }

        return {
          error: 'Authentication expired. Please sign in again.',
          status: 401,
        };
      }

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
      // Silently handle connection errors - they're expected when API is offline
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Silently handle connection errors - they're expected when API is offline
      // Global error handler in main.tsx will suppress console errors
      
      return {
        error: errorMessage,
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(walletAddress: string, signature: string, message: string) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  }

  // Room endpoints
  async createRoom(inputText: string) {
    return this.request('/api/v1/rooms', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
    });
  }

  async getRoom(roomId: string) {
    return this.request(`/api/v1/rooms/${roomId}`, {
      method: 'GET',
    });
  }

  async startRoom(roomId: string) {
    return this.request(`/api/v1/rooms/${roomId}/start`, {
      method: 'POST',
    });
  }

  async listRooms() {
    return this.request('/api/v1/rooms', {
      method: 'GET',
    });
  }

  // Asset endpoints
  async listAssets(filters?: { agentType?: string }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request(`/api/v1/assets?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getAsset(assetId: string) {
    return this.request(`/api/v1/assets/${assetId}`, {
      method: 'GET',
    });
  }

  // Explore endpoint (public)
  async exploreContent(page: number = 1, limit: number = 12) {
    return this.request(`/api/v1/assets/explore?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Token endpoints
  async getBalance(did: string) {
    return this.request(`/api/v1/users/${did}/balance`, {
      method: 'GET',
    });
  }

  async getTransactions(did: string) {
    return this.request(`/api/v1/tokens/transactions/${did}`, {
      method: 'GET',
    });
  }

  // SSE connection for live logs
  createSSEConnection(roomId: string, onMessage: (log: any) => void, onError?: (error: Event) => void) {
    // Include token as query parameter since EventSource doesn't support headers
    const token = this.token || localStorage.getItem('jwt_token');
    const url = `${this.baseUrl}/api/v1/rooms/${roomId}/logs${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating SSE connection to:', url);
    }
    
    const eventSource = new EventSource(url, { withCredentials: false });

    eventSource.addEventListener('log', (event) => {
      try {
        const log = JSON.parse(event.data);
        onMessage(log);
      } catch (error) {
        // Only log parsing errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to parse log:', error);
        }
      }
    });

    eventSource.addEventListener('connected', (event) => {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('SSE connected:', event.data);
      }
    });

    eventSource.addEventListener('heartbeat', () => {
      // Keep connection alive
    });

    eventSource.onerror = (error) => {
      // Don't log connection errors - they're expected when API is offline
      // Only call onError callback for handling
      if (onError) onError(error);
    };

    return eventSource;
  }
}

export const apiClient = new ApiClient(API_URL);
