/**
 * TypeScript Type Definitions
 * Central location for all type definitions
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number | string; // Accept both for compatibility
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'tipster';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  currency?: string;
}

export interface UserStats {
  totalXp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalProfit: number;
  roi: number;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// MATCH & PREDICTION TYPES
// ============================================================================

export interface Match {
  id: number;
  externalId?: number;
  leagueId: number;
  homeTeamId: number;
  awayTeamId: number;
  venueId?: number;
  kickOffTime: string;
  status: 'upcoming' | 'live' | 'finished' | 'postponed' | 'cancelled';
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  // Expanded match details
  homeTeam?: Team;
  awayTeam?: Team;
  league?: League;
  venue?: Venue;
}

export interface Team {
  id: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
  country?: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logoUrl?: string;
  season?: string;
}

export interface Venue {
  id: number;
  name: string;
  city?: string;
  country?: string;
  capacity?: number;
}

export interface Prediction {
  id: number;
  userId: number;
  matchId: number;
  predictionTypeId: number;
  predictionValue: string;
  confidence?: number;
  stake?: number;
  odds?: number;
  potentialReturn?: number;
  result?: 'won' | 'lost' | 'void' | 'pending';
  isPublic: boolean;
  createdAt: string;
}

export interface AIPrediction {
  id: number;
  matchId: number;
  modelId: number;
  predictionTypeId: number;
  predictionValue: string;
  confidence: number;
  probability?: number;
  reasoning?: string;
  createdAt: string;
}

// ============================================================================
// PICK TYPES (Legacy - for backward compatibility)
// ============================================================================

export interface Pick {
  id: string;
  date: string;
  combinedOdds: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
  matches: PickMatch[];
}

export interface PickMatch {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickOffTime: string;
  selectionType: string;
  odds: number;
  confidence: number;
  reasoning?: string;
  result?: 'won' | 'lost' | 'pending';
  finalScore?: string;
}

export interface PickStats {
  totalPicks: number;
  won: number;
  lost: number;
  winRate: number;
  totalROI: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// Backend returns data at root level alongside success
export type ApiResponse<T = any> = {
  success: boolean;
  error?: string;
  message?: string;
  validationErrors?: ValidationError[];
} & Partial<T>;

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type ViewType = 'landing' | 'auth' | 'dashboard' | 'admin';
export type AuthMode = 'login' | 'register';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: any;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface PlatformSettings {
  siteName: string;
  targetOddsMin: number;
  targetOddsMax: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}
