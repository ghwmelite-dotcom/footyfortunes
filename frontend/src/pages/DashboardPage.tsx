/**
 * Dashboard Page Component - World-Class UI/UX
 * Main user dashboard with stunning animations and comprehensive features
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { picksApi, matchesApi, userPicksApi, leaderboardApi } from '../services/api';
import AchievementsModal from '../components/AchievementsModal';
import type { Pick } from '../types';
import {
  Trophy, LogOut, TrendingUp, Calendar, Target, Zap, Activity,
  BarChart3, Users, Clock, ArrowRight, Flame, Star, Award,
  Eye, Brain, Settings, Menu, X, Home, ChevronRight, DollarSign,
  TrendingDown, Percent, CheckCircle2, AlertCircle, Sparkles,
  LineChart, Shield
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [todaysPick, setTodaysPick] = useState<Pick | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);

  // Counter animation hook
  const useCountUp = (end: number, duration: number = 2000, decimals: number = 0) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(start);
              }
            }, 16);
          }
        },
        { threshold: 0.5 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return { count: decimals > 0 ? count.toFixed(decimals) : Math.floor(count), elementRef };
  };

  useEffect(() => {
    setMounted(true);
    loadTodaysPicks();

    // Auto-refresh predictions every 30 seconds if there are live matches
    const refreshInterval = setInterval(() => {
      const hasLiveMatches = predictions.some(p => p.is_live);
      if (hasLiveMatches) {
        loadTodaysPicks();
      }
    }, 30000); // 30 seconds

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(refreshInterval);
    };
  }, [predictions]);

  const loadTodaysPicks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch real AI predictions, user stats, and leaderboard in parallel
      const [predictionsResponse, statsResponse, leaderboardResponse] = await Promise.all([
        matchesApi.getTodaysPredictions(),
        userPicksApi.getUserStats().catch(() => ({ success: false, error: 'Stats unavailable' })),
        leaderboardApi.getLeaderboard('all_time', 10).catch(() => ({ success: false, error: 'Leaderboard unavailable' }))
      ]);

      // Handle predictions
      if (predictionsResponse.success && predictionsResponse.message?.predictions) {
        setPredictions(predictionsResponse.message.predictions);
        setError(null);
      } else if (predictionsResponse.success && (!predictionsResponse.message?.predictions || predictionsResponse.message.predictions.length === 0)) {
        setPredictions([]);
        setError('No predictions available for today. Check back later!');
      } else {
        setError(predictionsResponse.error || 'Failed to load predictions');
      }

      // Handle user stats
      if (statsResponse.success && statsResponse.stats) {
        setUserStats(statsResponse.stats);
      }

      // Handle leaderboard
      if (leaderboardResponse.success && leaderboardResponse.leaderboard) {
        setLeaderboardData(leaderboardResponse.leaderboard);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Use real user stats or fallback to defaults
  const stats = {
    winRate: userStats?.win_rate || 0,
    totalPicks: userStats?.total_picks || 0,
    roi: userStats?.roi_percentage || 0,
    profit: userStats?.net_profit || 0,
    streak: userStats?.current_win_streak || 0,
    accuracy: userStats?.accuracy_rate || 0,
    currentBankroll: userStats?.current_bankroll || 1000
  };

  const winRateCounter = useCountUp(stats.winRate, 2000, 1);
  const totalPicksCounter = useCountUp(stats.totalPicks, 2000);
  const roiCounter = useCountUp(stats.roi, 2000, 1);
  const profitCounter = useCountUp(Math.abs(stats.profit), 2000, 2);

  // Get recent predictions for activity feed
  const recentActivity = predictions.slice(0, 5).map((pred, index) => ({
    id: pred.id,
    type: pred.confidence >= 70 ? 'high-confidence' : 'prediction',
    match: `${pred.home_team_name} vs ${pred.away_team_name}`,
    confidence: pred.confidence,
    prediction: pred.predicted_winner,
    time: pred.match_time,
    leagueLogo: pred.league_logo
  }));

  // Use real leaderboard data
  const leaderboard = leaderboardData.length > 0 ? leaderboardData.slice(0, 4).map((entry: any) => ({
    rank: entry.rank,
    name: entry.username || entry.full_name || entry.email?.split('@')[0] || 'Anonymous',
    profit: entry.net_profit || 0,
    roi: entry.roi_percentage || 0,
    avatar: entry.rank === 1 ? '🏆' : entry.rank === 2 ? '⭐' : entry.rank === 3 ? '🔥' : '👤',
    isCurrentUser: entry.id === user?.id
  })) : [
    { rank: 1, name: 'Be the first!', profit: 0, roi: 0, avatar: '🏆', isCurrentUser: false },
  ];

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: <Target className="w-5 h-5" />, label: 'Today\'s Picks', path: '/picks', active: false },
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
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-1">
                  Welcome Back, {user?.email?.split('@')[0]}!
                </h1>
                <p className="text-blue-300">Ready to make some winning predictions today?</p>
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
          {/* Stats Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Win Rate */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transition-all">
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div ref={winRateCounter.elementRef}>
                <p className="text-blue-300 text-sm font-medium mb-2">Win Rate</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {winRateCounter.count}%
                </p>
                <div className="mt-3 flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+5.2% this week</span>
                </div>
              </div>
            </div>

            {/* Total Picks */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div ref={totalPicksCounter.elementRef}>
                <p className="text-blue-300 text-sm font-medium mb-2">Total Picks</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {totalPicksCounter.count}
                </p>
                <div className="mt-3 flex items-center gap-1 text-blue-400 text-sm">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold">{stats.streak} win streak</span>
                </div>
              </div>
            </div>

            {/* ROI */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div ref={roiCounter.elementRef}>
                <p className="text-blue-300 text-sm font-medium mb-2">ROI</p>
                <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {roiCounter.count}%
                </p>
                <div className="mt-3 flex items-center gap-1 text-purple-400 text-sm">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">Accuracy: {stats.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all">
              <div className={`absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform ${
                stats.profit >= 0 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'
              }`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div ref={profitCounter.elementRef}>
                <p className="text-blue-300 text-sm font-medium mb-2">Total Profit/Loss</p>
                <p className={`text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
                  stats.profit >= 0 ? 'from-yellow-400 to-orange-400' : 'from-red-400 to-pink-400'
                }`}>
                  {stats.profit >= 0 ? '+' : '-'}GH₵{profitCounter.count}
                </p>
                <div className="mt-3 flex items-center gap-1 text-blue-300 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">Bankroll: GH₵{stats.currentBankroll.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Today's Picks */}
            <div className={`lg:col-span-2 space-y-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Today's AI Picks */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Today's AI Picks
                      </h2>
                      <p className="text-blue-300 text-sm">Generated by advanced machine learning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full backdrop-blur-xl animate-pulse">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <span className="text-sm font-bold text-green-300">LIVE</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-300">Loading today's picks...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-300 mb-4">{error}</p>
                    <button
                      onClick={loadTodaysPicks}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                ) : predictions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-300 mb-2 text-lg font-semibold">No predictions available for today</p>
                    <p className="text-sm text-blue-400 mb-4">New AI predictions will be generated at 9 AM UTC!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-xs text-blue-300 mb-1">Total Predictions</p>
                        <p className="text-2xl font-black text-white">{predictions.length}</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
                        <p className="text-xs text-green-300 mb-1">Avg Confidence</p>
                        <p className="text-2xl font-black text-white">
                          {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)}%
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-xs text-purple-300 mb-1">Value Bets</p>
                        <p className="text-2xl font-black text-white">
                          {predictions.filter(p => p.is_value_bet).length}
                        </p>
                      </div>
                    </div>

                    {/* Predictions (show first 5) */}
                    {predictions.slice(0, 5).map((prediction, index) => (
                      <div
                        key={prediction.id}
                        className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-4 sm:p-6 hover:scale-102 hover:shadow-2xl transition-all"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Match Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <img src={prediction.league_logo} alt="" className="w-5 h-5" />
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300">
                                {prediction.league_name}
                              </span>
                              {prediction.is_live ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500/30 to-orange-500/30 border border-red-500/50 rounded-full text-xs font-bold text-red-300 animate-pulse">
                                  <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                                  LIVE {prediction.elapsed_time ? `${prediction.elapsed_time}'` : ''}
                                </span>
                              ) : prediction.is_finished ? (
                                <span className="px-3 py-1 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-full text-xs font-bold text-gray-300">
                                  {prediction.status}
                                </span>
                              ) : (
                                <span className="text-xs text-blue-400">{prediction.match_time}</span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 flex-1">
                                <img src={prediction.home_team_logo} alt="" className="w-8 h-8 flex-shrink-0" />
                                <p className="text-base sm:text-lg font-bold truncate">{prediction.home_team_name}</p>
                                {(prediction.is_live || prediction.is_finished) && prediction.home_score !== null && (
                                  <span className="ml-auto text-2xl font-black text-white">{prediction.home_score}</span>
                                )}
                              </div>
                              {!(prediction.is_live || prediction.is_finished) && (
                                <>
                                  <span className="text-blue-400 font-bold hidden sm:inline">vs</span>
                                  <span className="text-blue-400 font-bold sm:hidden">vs</span>
                                </>
                              )}
                              {(prediction.is_live || prediction.is_finished) && (
                                <span className="text-blue-400 font-bold self-center">-</span>
                              )}
                              <div className="flex items-center gap-2 flex-1">
                                {(prediction.is_live || prediction.is_finished) && prediction.away_score !== null && (
                                  <span className="text-2xl font-black text-white mr-auto">{prediction.away_score}</span>
                                )}
                                <img src={prediction.away_team_logo} alt="" className="w-8 h-8 flex-shrink-0" />
                                <p className="text-base sm:text-lg font-bold truncate">{prediction.away_team_name}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Prediction */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                            <p className="text-xs text-blue-300 mb-1">Prediction</p>
                            <p className="font-bold text-sm sm:text-base text-white capitalize">{prediction.predicted_winner}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                            <p className="text-xs text-blue-300 mb-2">Confidence</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                  style={{ width: `${prediction.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-black text-green-400">{prediction.confidence}%</span>
                            </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                            <p className="text-xs text-blue-300 mb-1">Risk</p>
                            <p className="font-bold text-sm sm:text-base text-white capitalize">{prediction.risk_level}</p>
                          </div>
                        </div>

                        {/* Probabilities */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                            <p className="text-green-300 mb-1">Home</p>
                            <p className="font-bold text-white text-xs sm:text-sm">{prediction.home_win_probability}%</p>
                          </div>
                          <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                            <p className="text-yellow-300 mb-1">Draw</p>
                            <p className="font-bold text-white text-xs sm:text-sm">{prediction.draw_probability}%</p>
                          </div>
                          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                            <p className="text-red-300 mb-1">Away</p>
                            <p className="font-bold text-white text-xs sm:text-sm">{prediction.away_win_probability}%</p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 flex items-center gap-4 text-xs text-blue-300">
                          <span>O/U 2.5: {prediction.over_under_25}</span>
                          <span>BTTS: {prediction.btts}</span>
                          {prediction.is_value_bet === 1 && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full font-bold text-yellow-300">
                              VALUE BET
                            </span>
                          )}
                        </div>

                        {/* Best Bet Recommendation */}
                        {prediction.best_bet && prediction.best_bet !== 'No recommendation' && (
                          <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              <p className="text-xs font-bold text-yellow-300 uppercase">Best Bet</p>
                            </div>
                            <p className="text-sm font-bold text-white">{prediction.best_bet}</p>
                          </div>
                        )}

                        {/* AI Analysis */}
                        {prediction.analysis && (
                          <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 text-blue-400" />
                              <p className="text-xs font-bold text-blue-300 uppercase">AI Analysis</p>
                            </div>
                            <p className="text-sm text-blue-100 leading-relaxed">{prediction.analysis}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* View All Button */}
                    {predictions.length > 5 && (
                      <Link
                        to="/picks"
                        className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-center hover:scale-105 transition-all shadow-lg"
                      >
                        View All {predictions.length} Predictions →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Activity & Leaderboard */}
            <div className={`space-y-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Recent Activity */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black">Recent Predictions</h3>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-blue-300">No recent predictions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'high-confidence'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {activity.type === 'high-confidence' ? <Star className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <img src={activity.leagueLogo} alt="" className="w-3 h-3 flex-shrink-0" />
                              <p className="text-sm font-semibold text-white truncate">{activity.match}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-300">{activity.time}</span>
                              <span className="text-blue-400">•</span>
                              <span className="text-green-400 capitalize">{activity.prediction}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="font-bold text-xs text-green-400">{activity.confidence}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard Preview */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black">Leaderboard</h3>
                  </div>
                  <Link
                    to="/leaderboard"
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        entry.isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          entry.rank === 1
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                            : entry.rank === 2
                            ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                            : entry.rank === 3
                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white'
                            : 'bg-white/10 text-blue-300'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{entry.name}</p>
                          <p className="text-xs text-blue-300">ROI: {entry.roi}%</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-green-400">GH₵{entry.profit.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-black mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/picks"
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:scale-105 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">View All Picks</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/live"
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:scale-105 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">Live Matches</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/performance"
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:scale-105 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <LineChart className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold">My Performance</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Achievements Button */}
      <button
        onClick={() => setAchievementsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-2xl font-bold text-white shadow-2xl shadow-yellow-500/50 transition-all hover:scale-110 animate-bounce-slow"
      >
        <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:block">Achievements</span>
        <Sparkles className="w-5 h-5 animate-pulse" />
      </button>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
      />

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
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
