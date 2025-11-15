/**
 * Daily Picks Page Component - World-Class UI/UX
 * Comprehensive picks display with advanced filtering and beautiful animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { picksApi, matchesApi, userPicksApi } from '../services/api';
import type { Pick } from '../types';
import {
  Trophy, LogOut, Target, Activity, BarChart3, Settings, Menu, X, Home,
  Filter, Search, Calendar, ChevronDown, Star, Sparkles, Brain, TrendingUp,
  Clock, MapPin, AlertCircle, RefreshCw, Shield, Eye, Heart, Share2,
  CheckCircle2, Info, Zap, Award, ArrowUpDown, SlidersHorizontal
} from 'lucide-react';

interface FilterState {
  date: 'today' | 'tomorrow' | 'week' | 'all';
  league: string;
  minConfidence: number;
  minOdds: number;
  maxOdds: number;
  sortBy: 'confidence' | 'odds' | 'time' | 'league';
  sortOrder: 'asc' | 'desc';
}

const PicksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [betAmount, setBetAmount] = useState('10');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [filters, setFilters] = useState<FilterState>({
    date: 'today',
    league: 'all',
    minConfidence: 0,
    minOdds: 1,
    maxOdds: 10,
    sortBy: 'confidence',
    sortOrder: 'desc'
  });

  useEffect(() => {
    setMounted(true);
    loadPicks();

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [predictions, filters, searchTerm]);

  const loadPicks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch real AI predictions from API-Football
      const response = await matchesApi.getTodaysPredictions();

      if (response.success && response.message?.predictions) {
        setPredictions(response.message.predictions);
      } else {
        setPredictions([]);
        setError('No predictions available for today');
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
      setError('Failed to load predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...predictions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pred =>
        pred.home_team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pred.away_team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pred.league_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // League filter
    if (filters.league !== 'all') {
      filtered = filtered.filter(pred => pred.league_name === filters.league);
    }

    // Confidence filter
    filtered = filtered.filter(pred => pred.confidence >= filters.minConfidence);

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'time':
          aValue = a.match_time;
          bValue = b.match_time;
          break;
        case 'league':
          aValue = a.league_name;
          bValue = b.league_name;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPredictions(filtered);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePlaceBet = async () => {
    if (!selectedPrediction) return;

    setIsPlacingBet(true);
    setBetError(null);

    try {
      const amount = parseFloat(betAmount);
      if (isNaN(amount) || amount <= 0) {
        setBetError('Please enter a valid bet amount');
        return;
      }

      const response = await userPicksApi.placePick(selectedPrediction.id, amount);

      if (response.success) {
        setBetSuccess(true);
        setTimeout(() => {
          setShowBetModal(false);
          setSelectedPrediction(null);
          setBetSuccess(false);
          setBetAmount('10');
        }, 2000);
      } else {
        setBetError(response.error || 'Failed to place bet');
      }
    } catch (err) {
      setBetError('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const leagues = ['all', ...new Set(predictions.map(p => p.league_name))];

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: <Target className="w-5 h-5" />, label: 'Today\'s Picks', path: '/picks', active: true },
    { icon: <Activity className="w-5 h-5" />, label: 'Live Matches', path: '/live', active: false },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Performance', path: '/performance', active: false },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard', active: false },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)` }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        ></div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="h-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border-r border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h1 className="text-lg font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">FootyFortunes</h1>
                  <p className="text-xs text-blue-300">AI Predictions</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50'
                    : 'hover:bg-white/10'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="font-semibold">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Admin Link */}
          {user?.role === 'admin' && (
            <div className="px-4 mt-4">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl transition-all shadow-lg"
              >
                <Shield className="w-5 h-5" />
                {sidebarOpen && <span className="font-semibold">Admin Panel</span>}
              </button>
            </div>
          )}

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className={`relative z-10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border-b border-white/20 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-1">
                    Today's AI Picks
                  </h1>
                  <p className="text-blue-300">Advanced predictions powered by machine learning</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search & Filter Bar */}
          <div className={`mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by team or league..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:bg-white/15 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                    showFilters
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </button>

                {/* Refresh Button */}
                <button
                  onClick={loadPicks}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-white/20 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* League Filter */}
                  <div>
                    <label className="block text-sm text-blue-300 mb-2 font-semibold">League</label>
                    <select
                      value={filters.league}
                      onChange={(e) => setFilters({ ...filters, league: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                    >
                      {leagues.map(league => (
                        <option key={league} value={league} className="bg-slate-900">{league === 'all' ? 'All Leagues' : league}</option>
                      ))}
                    </select>
                  </div>

                  {/* Min Confidence */}
                  <div>
                    <label className="block text-sm text-blue-300 mb-2 font-semibold">
                      Min Confidence: {filters.minConfidence}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minConfidence}
                      onChange={(e) => setFilters({ ...filters, minConfidence: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm text-blue-300 mb-2 font-semibold">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="confidence" className="bg-slate-900">Confidence</option>
                      <option value="odds" className="bg-slate-900">Odds</option>
                      <option value="time" className="bg-slate-900">Time</option>
                      <option value="league" className="bg-slate-900">League</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm text-blue-300 mb-2 font-semibold">Order</label>
                    <button
                      onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all"
                    >
                      <ArrowUpDown className="w-5 h-5" />
                      {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-blue-300">
                Showing <span className="font-bold text-white">{filteredPredictions.length}</span> of <span className="font-bold text-white">{predictions.length}</span> predictions
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Predictions Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-300 text-lg">Loading predictions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-300 mb-4 text-lg">{error}</p>
              <button
                onClick={loadPicks}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-20">
              <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-300 mb-2 text-lg font-semibold">No predictions match your filters</p>
              <p className="text-sm text-blue-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className={`grid md:grid-cols-2 gap-6 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {filteredPredictions.map((prediction, index) => (
                <div
                  key={prediction.id}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-102 hover:shadow-2xl hover:shadow-blue-500/20 transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-blue-300">AI PREDICTION</span>
                    </div>
                    {prediction.is_value_bet === 1 && (
                      <div className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                        <span className="text-xs font-bold text-yellow-300">VALUE BET</span>
                      </div>
                    )}
                  </div>

                  {/* Match Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <img src={prediction.league_logo} alt="" className="w-4 h-4" />
                      <span className="text-xs font-bold text-blue-300">{prediction.league_name}</span>
                      <Clock className="w-4 h-4 text-blue-400 ml-auto" />
                      <span className="text-xs text-blue-300">{prediction.match_time}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <img src={prediction.home_team_logo} alt="" className="w-8 h-8" />
                        <span className="text-lg font-bold">{prediction.home_team_name}</span>
                      </div>
                      <span className="text-blue-400 font-bold">vs</span>
                      <div className="flex items-center gap-2">
                        <img src={prediction.away_team_logo} alt="" className="w-8 h-8" />
                        <span className="text-lg font-bold">{prediction.away_team_name}</span>
                      </div>
                    </div>

                    {/* Prediction Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-300 capitalize">{prediction.predicted_winner}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-blue-300 mb-1">Confidence</p>
                      <p className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {prediction.confidence}%
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-blue-300 mb-1">Risk</p>
                      <p className="text-sm font-bold text-white capitalize">{prediction.risk_level}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-blue-300 mb-1">Score</p>
                      <p className="text-sm font-black text-white">
                        {prediction.predicted_home_goals} - {prediction.predicted_away_goals}
                      </p>
                    </div>
                  </div>

                  {/* Best Bet Preview */}
                  {prediction.best_bet && prediction.best_bet !== 'No recommendation' && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-300">{prediction.best_bet}</span>
                      </div>
                    </div>
                  )}

                  {/* Confidence Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 border border-blue-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group">
                    <Eye className="w-5 h-5" />
                    View Full Analysis
                    <Sparkles className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                  </button>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedPrediction && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPrediction(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Prediction Details
              </h2>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Match Info */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <img src={selectedPrediction.league_logo} alt="" className="w-6 h-6" />
                <span className="text-sm font-bold text-blue-300">{selectedPrediction.league_name}</span>
                <Clock className="w-5 h-5 text-blue-400 ml-auto" />
                <span className="text-sm text-blue-300">{selectedPrediction.match_time}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <img src={selectedPrediction.home_team_logo} alt="" className="w-12 h-12" />
                  <span className="text-2xl font-black">{selectedPrediction.home_team_name}</span>
                </div>
                <span className="text-xl text-blue-400 font-bold">vs</span>
                <div className="flex items-center gap-2">
                  <img src={selectedPrediction.away_team_logo} alt="" className="w-12 h-12" />
                  <span className="text-2xl font-black">{selectedPrediction.away_team_name}</span>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-300 mb-2">Prediction</p>
                  <p className="font-bold text-lg capitalize">{selectedPrediction.predicted_winner}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-300 mb-2">Confidence</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {selectedPrediction.confidence}%
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-300 mb-2">Risk Level</p>
                  <p className="font-bold text-lg capitalize">{selectedPrediction.risk_level}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-300 mb-2">Score</p>
                  <p className="text-xl font-black">
                    {selectedPrediction.predicted_home_goals} - {selectedPrediction.predicted_away_goals}
                  </p>
                </div>
              </div>

              {/* Probabilities */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-300 mb-1">Home Win</p>
                  <p className="text-lg font-black text-white">{selectedPrediction.home_win_probability}%</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-yellow-300 mb-1">Draw</p>
                  <p className="text-lg font-black text-white">{selectedPrediction.draw_probability}%</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-300 mb-1">Away Win</p>
                  <p className="text-lg font-black text-white">{selectedPrediction.away_win_probability}%</p>
                </div>
              </div>
            </div>

            {/* Best Bet Recommendation */}
            {selectedPrediction.best_bet && selectedPrediction.best_bet !== 'No recommendation' && (
              <div className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-yellow-300">Best Bet Recommendation</h3>
                </div>
                <p className="text-2xl font-black text-white">{selectedPrediction.best_bet}</p>
              </div>
            )}

            {/* AI Analysis */}
            {selectedPrediction.analysis && (
              <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-300">AI Analysis</h3>
                </div>
                <p className="text-blue-100 leading-relaxed text-base">{selectedPrediction.analysis}</p>
              </div>
            )}

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-blue-300 mb-2">Over/Under 2.5 Goals</p>
                <p className="text-lg font-bold">{selectedPrediction.over_under_25} ({selectedPrediction.over_25_probability}%)</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-blue-300 mb-2">Both Teams To Score</p>
                <p className="text-lg font-bold">{selectedPrediction.btts} ({selectedPrediction.btts_probability}%)</p>
              </div>
            </div>

            {selectedPrediction.is_value_bet === 1 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl text-center">
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="font-black text-yellow-300 text-lg">VALUE BET DETECTED</p>
                <p className="text-sm text-yellow-200 mt-1">This prediction has been identified as a high-value betting opportunity</p>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowBetModal(true);
                  setBetError(null);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Place Bet
              </button>
              <button className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Save Prediction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bet Placement Modal */}
      {showBetModal && selectedPrediction && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={() => !betSuccess && setShowBetModal(false)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-blue-500/30 rounded-3xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {betSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-3xl font-black text-green-400 mb-2">Bet Placed!</h3>
                <p className="text-blue-200">Your pick has been recorded successfully</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Place Your Bet
                  </h3>
                  <button
                    onClick={() => setShowBetModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Match Info */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={selectedPrediction.home_team_logo} alt="" className="w-8 h-8" />
                    <span className="text-lg font-bold">{selectedPrediction.home_team_name}</span>
                    <span className="text-blue-400 font-bold mx-2">vs</span>
                    <img src={selectedPrediction.away_team_logo} alt="" className="w-8 h-8" />
                    <span className="text-lg font-bold">{selectedPrediction.away_team_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Prediction: <span className="font-bold text-white capitalize">{selectedPrediction.predicted_winner}</span></span>
                    <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-bold">{selectedPrediction.confidence}%</span>
                  </div>
                </div>

                {/* Stake Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm text-blue-300 mb-2 font-semibold">Stake Amount (GH₵)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold outline-none focus:border-blue-500 transition-all"
                    placeholder="10"
                  />
                  <div className="flex gap-2 mt-3">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount.toString())}
                        className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-lg text-sm font-semibold transition-all"
                      >
                        GH₵{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potential Return */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-xs text-yellow-300 mb-1">Estimated Return</p>
                  <p className="text-2xl font-black text-yellow-400">
                    GH₵{(parseFloat(betAmount || '0') * (selectedPrediction.confidence >= 80 ? 1.5 : selectedPrediction.confidence >= 70 ? 1.8 : 2.2)).toFixed(2)}
                  </p>
                  <p className="text-xs text-yellow-200 mt-1">Based on confidence multiplier</p>
                </div>

                {/* Error Message */}
                {betError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-sm">{betError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBetModal(false)}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || !betAmount || parseFloat(betAmount) <= 0}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPlacingBet ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirm Bet
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }

        /* Custom slider styling */
        input[type="range"].slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        input[type="range"].slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default PicksPage;
