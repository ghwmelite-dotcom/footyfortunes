/**
 * Leaderboard Page Component - World-Class UI/UX
 * Global rankings with user profiles and competitive stats
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { leaderboardApi } from '../services/api';
import {
  Trophy, LogOut, Target, Activity, BarChart3, Settings, Menu, X, Home,
  Shield, Award, Star, Crown, Medal, TrendingUp, DollarSign, Percent,
  Users, Flame, Zap, Eye, ChevronRight, Filter, Search, AlertTriangle
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  totalProfit: number;
  winRate: number;
  roi: number;
  totalBets: number;
  currentStreak: number;
  badge: string;
  isCurrentUser?: boolean;
}

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [category, setCategory] = useState<'profit' | 'winrate' | 'roi'>('profit');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const periodMap = { week: 'weekly', month: 'monthly', all: 'all_time' } as const;
        const response = await leaderboardApi.getLeaderboard(periodMap[timeframe], 100);

        if (response.success && response.leaderboard) {
          // Transform API data to match component interface
          const transformedData: LeaderboardEntry[] = response.leaderboard.map((entry: any, index: number) => ({
            rank: entry.rank || index + 1,
            userId: entry.user_id?.toString() || entry.userId?.toString(),
            username: entry.username || 'Anonymous',
            avatar: entry.avatar || '👤',
            totalProfit: entry.total_profit || entry.totalProfit || 0,
            winRate: entry.win_rate || entry.winRate || 0,
            roi: entry.roi || 0,
            totalBets: entry.total_picks || entry.totalBets || 0,
            currentStreak: entry.win_streak || entry.currentStreak || 0,
            badge: entry.badge || getBadgeFromProfit(entry.total_profit || 0),
            isCurrentUser: user && (entry.user_id === parseInt(user.id) || entry.userId === user.id)
          }));

          setLeaderboard(transformedData);
        } else {
          setError('Failed to load leaderboard data');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, user]);

  // Helper function to assign badge based on profit
  const getBadgeFromProfit = (profit: number): string => {
    if (profit >= 10000) return 'legendary';
    if (profit >= 5000) return 'master';
    if (profit >= 2000) return 'expert';
    if (profit >= 1000) return 'pro';
    if (profit >= 500) return 'advanced';
    return 'beginner';
  };

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: <Target className="w-5 h-5" />, label: 'Today\'s Picks', path: '/picks', active: false },
    { icon: <Activity className="w-5 h-5" />, label: 'Live Matches', path: '/live', active: false },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Performance', path: '/performance', active: false },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard', active: true },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', active: false },
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'master': return 'from-purple-500 to-pink-500';
      case 'expert': return 'from-blue-500 to-cyan-500';
      case 'pro': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)` }}
        ></div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="h-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border-r border-white/20 shadow-2xl">
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
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-lg animate-pulse"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent mb-1">
                    Global Leaderboard
                  </h1>
                  <p className="text-blue-300">Compete with the best bettors worldwide</p>
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
          {/* Filters */}
          <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex gap-3">
              {(['week', 'month', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {(['profit', 'winrate', 'roi'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                    category === cat
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {cat === 'winrate' ? 'Win Rate' : cat === 'roi' ? 'ROI' : 'Profit'}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300 text-lg">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <p className="text-red-300 text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && leaderboard.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <Users className="w-20 h-20 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-black text-white mb-2">No Rankings Yet</h3>
              <p className="text-blue-300 mb-6">Be the first to place picks and climb the leaderboard!</p>
              <button
                onClick={() => navigate('/picks')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all"
              >
                View Predictions
              </button>
            </div>
          )}

          {/* Top 3 Podium */}
          {!loading && !error && leaderboard.length >= 3 && (
            <div className={`grid md:grid-cols-3 gap-6 mb-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {leaderboard.slice(0, 3).map((entry, index) => {
              const heights = ['md:translate-y-0', 'md:translate-y-8', 'md:translate-y-4'];
              const gradients = [
                'from-yellow-500 to-orange-500',
                'from-gray-400 to-gray-500',
                'from-orange-600 to-red-600'
              ];

              return (
                <div key={entry.userId} className={`${heights[index]} transform transition-all`}>
                  <div className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-8 hover:scale-105 transition-all group`}>
                    {/* Rank Badge */}
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br ${gradients[index]} rounded-full flex items-center justify-center border-4 border-slate-950 shadow-2xl`}>
                      <span className="text-2xl font-black text-white">{entry.rank}</span>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center mt-8 mb-4">
                      <div className={`w-24 h-24 bg-gradient-to-br ${gradients[index]} rounded-full flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform`}>
                        {entry.avatar}
                      </div>
                    </div>

                    {/* Username & Badge */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-black text-white mb-2">{entry.username}</h3>
                      <span className={`inline-block px-4 py-1 bg-gradient-to-r ${getBadgeColor(entry.badge)} rounded-full text-xs font-bold text-white uppercase`}>
                        {entry.badge}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm text-blue-300">Total Profit</span>
                        <span className="font-black text-green-400">GH₵{entry.totalProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm text-blue-300">Win Rate</span>
                        <span className="font-black text-purple-400">{entry.winRate}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm text-blue-300">Streak</span>
                        <span className="font-black text-orange-400 flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {entry.currentStreak}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Rest of Rankings */}
          {!loading && !error && leaderboard.length > 0 && (
            <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-2xl font-black mb-6">All Rankings</h2>

              <div className="space-y-3">
                {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-102 ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-lg font-black text-blue-300">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getBadgeColor(entry.badge)} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{entry.username}</h3>
                      <p className="text-xs text-blue-400 capitalize">{entry.badge}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-blue-300 mb-1">Profit</p>
                      <p className="font-bold text-green-400">GH₵{entry.totalProfit.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-300 mb-1">Win Rate</p>
                      <p className="font-bold text-purple-400">{entry.winRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-300 mb-1">ROI</p>
                      <p className="font-bold text-yellow-400">{entry.roi}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-300 mb-1">Streak</p>
                      <p className="font-bold text-orange-400 flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {entry.currentStreak}
                      </p>
                    </div>
                  </div>

                  {/* View Profile */}
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex-shrink-0">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </main>

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
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;
