/**
 * Centralized API Service
 * Handles all HTTP requests to the backend
 */

import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Pick,
  PickStats,
  TokenPair
} from '../types';

// API Configuration
// Production URL - hardcoded for reliability
const API_BASE_URL = 'https://footyfortunes-api.ghwmelite.workers.dev';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

class TokenManager {
  private static ACCESS_TOKEN_KEY = 'ff_access_token';
  private static REFRESH_TOKEN_KEY = 'ff_refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request with automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    // Add authorization header if token exists
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - Token expired, try refresh
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return await retryResponse.json();
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(!!token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.accessToken) {
        TokenManager.setTokens(data.accessToken, refreshToken);
        this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
        this.refreshSubscribers = [];
        this.isRefreshing = false;
        return true;
      }

      // Refresh failed - clear tokens and force re-login
      TokenManager.clearTokens();
      this.isRefreshing = false;
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      TokenManager.clearTokens();
      this.isRefreshing = false;
      return false;
    }
  }

  // ============================================================================
  // HTTP METHODS
  // ============================================================================

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    if (response.success && response.accessToken && response.refreshToken) {
      TokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    return response;
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.success && response.accessToken && response.refreshToken) {
      TokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    return response;
  },

  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = TokenManager.getRefreshToken();
    const response = await apiClient.post<void>('/api/auth/logout', { refreshToken });
    TokenManager.clearTokens();
    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>('/api/auth/me');
  },

  async refreshToken(): Promise<ApiResponse<TokenPair>> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    return apiClient.post<TokenPair>('/api/auth/refresh', { refreshToken });
  },
};

// ============================================================================
// PICKS API
// ============================================================================

export const picksApi = {
  async getTodaysPicks(): Promise<ApiResponse<{ picks: Pick | null }>> {
    return apiClient.get<{ picks: Pick | null }>('/api/picks/today');
  },

  async getArchive(limit = 50, offset = 0): Promise<ApiResponse<{ picks: Pick[]; stats: PickStats }>> {
    return apiClient.get<{ picks: Pick[]; stats: PickStats }>(
      `/api/picks/archive?limit=${limit}&offset=${offset}`
    );
  },
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/admin/stats');
  },

  async getAllPicks(): Promise<ApiResponse<{ picks: Pick[] }>> {
    return apiClient.get<{ picks: Pick[] }>('/api/admin/picks');
  },

  async getAllUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return apiClient.get<{ users: User[] }>('/api/admin/users');
  },

  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/admin/settings');
  },

  async updateSettings(settings: any): Promise<ApiResponse<void>> {
    return apiClient.put('/api/admin/settings', settings);
  },

  async generatePicks(params?: { leagueIds?: number[]; limit?: number }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/admin/generate-predictions', params || {});
  },

  async deletePredictions(): Promise<ApiResponse<any>> {
    return apiClient.delete('/api/admin/delete-predictions');
  },
};

// ============================================================================
// MATCHES API (Real Data from API-Football)
// ============================================================================

export const matchesApi = {
  async getTodaysMatches(): Promise<ApiResponse<{ matches: any[]; count: number }>> {
    return apiClient.get<{ matches: any[]; count: number }>('/api/matches/today');
  },

  async getLiveMatches(): Promise<ApiResponse<{ matches: any[]; count: number }>> {
    return apiClient.get<{ matches: any[]; count: number }>('/api/matches/live');
  },

  async getUpcomingMatches(): Promise<ApiResponse<{ matches: any[]; count: number }>> {
    return apiClient.get<{ matches: any[]; count: number }>('/api/matches/upcoming');
  },

  async getMatchById(matchId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/matches/${matchId}`);
  },

  async getTodaysPredictions(): Promise<ApiResponse<{ predictions: any[]; count: number }>> {
    return apiClient.get<{ predictions: any[]; count: number }>('/api/predictions/today');
  },

  async getValueBets(): Promise<ApiResponse<{ valueBets: any[]; count: number }>> {
    return apiClient.get<{ valueBets: any[]; count: number }>('/api/value-bets');
  },

  async getLeagues(): Promise<ApiResponse<{ leagues: any[]; count: number }>> {
    return apiClient.get<{ leagues: any[]; count: number }>('/api/leagues');
  },
};

// ============================================================================
// USER PICKS API (Phase 2)
// ============================================================================

export const userPicksApi = {
  // Place a pick on a prediction
  async placePick(predictionId: number, stakeAmount: number, notes?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/user/picks', { 
      prediction_id: predictionId, 
      stake_amount: stakeAmount,
      notes 
    });
  },

  // Get user's picks with optional filters
  async getUserPicks(status: 'all' | 'pending' | 'won' | 'lost' = 'all', limit = 50, offset = 0): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/user/picks?status=${status}&limit=${limit}&offset=${offset}`);
  },

  // Get user's betting statistics
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/stats');
  },

  // Get user's achievements
  async getUserAchievements(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/achievements');
  },

  // Get bankroll history
  async getBankrollHistory(limit = 50, offset = 0): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/user/bankroll/history?limit=${limit}&offset=${offset}`);
  },
};

// ============================================================================
// USER PROFILE & SETTINGS API
// ============================================================================

export const userApi = {
  // Update user profile
  async updateProfile(data: { username?: string; email?: string; avatar?: string; bio?: string }): Promise<ApiResponse<any>> {
    return apiClient.put('/api/user/profile', data);
  },

  // Get user settings
  async getSettings(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/settings');
  },

  // Update user settings
  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    return apiClient.put('/api/user/settings', settings);
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiClient.put('/api/user/password', { currentPassword, newPassword });
  },
};

// ============================================================================
// LEADERBOARD API (Phase 2)
// ============================================================================

export const leaderboardApi = {
  // Get leaderboard for a specific period
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time', limit = 100): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/leaderboard?period=${period}&limit=${limit}`);
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export { TokenManager };
export default apiClient;
