/**
 * Performance Page Component - World-Class UI/UX
 * Comprehensive betting analytics with charts and detailed statistics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy, LogOut, Target, Activity, BarChart3, Settings, Menu, X, Home,
  Shield, TrendingUp, TrendingDown, DollarSign, Percent, Calendar,
  Award, CheckCircle2, XCircle, Clock, ArrowUp, ArrowDown, Filter,
  Download, Share2, Eye, Zap, Star, Flame
} from 'lucide-react';

interface BettingRecord {
  id: string;
  date: string;
  match: string;
  league: string;
  prediction: string;
  odds: number;
  stake: number;
  result: 'win' | 'loss' | 'pending';
  profit: number;
  confidence: number;
}

const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wins' | 'losses'>('all');

  // Mock performance data
  const stats = {
    totalBets: 124,
    wins: 94,
    losses: 25,
    pending: 5,
    winRate: 78.9,
    totalStaked: 12400,
    totalProfit: 3847.50,
    roi: 31.0,
    avgOdds: 2.15,
    avgStake: 100,
    bestStreak: 12,
    currentStreak: 7,
    profitThisWeek: 342.50,
    profitThisMonth: 1285.75,
  };

  const bettingHistory: BettingRecord[] = [
    { id: '1', date: '2025-11-05', match: 'Arsenal vs Chelsea', league: 'Premier League', prediction: 'Over 2.5', odds: 1.85, stake: 100, result: 'win', profit: 85, confidence: 92 },
    { id: '2', date: '2025-11-05', match: 'Barcelona vs Real Madrid', league: 'La Liga', prediction: 'BTTS', odds: 1.75, stake: 150, result: 'win', profit: 112.5, confidence: 88 },
    { id: '3', date: '2025-11-04', match: 'Bayern vs Dortmund', league: 'Bundesliga', prediction: 'Home Win', odds: 2.10, stake: 200, result: 'win', profit: 220, confidence: 85 },
    { id: '4', date: '2025-11-04', match: 'PSG vs Lyon', league: 'Ligue 1', prediction: 'Over 3.5', odds: 2.40, stake: 50, result: 'loss', profit: -50, confidence: 78 },
    { id: '5', date: '2025-11-03', match: 'Liverpool vs Spurs', league: 'Premier League', prediction: 'BTTS & Over 2.5', odds: 2.05, stake: 120, result: 'win', profit: 126, confidence: 90 },
    { id: '6', date: '2025-11-03', match: 'Inter vs Juventus', league: 'Serie A', prediction: 'Under 2.5', odds: 1.95, stake: 100, result: 'win', profit: 95, confidence: 82 },
    { id: '7', date: '2025-11-02', match: 'Man City vs Man Utd', league: 'Premier League', prediction: 'Home Win', odds: 1.65, stake: 200, result: 'win', profit: 130, confidence: 95 },
    { id: '8', date: '2025-11-02', match: 'Atletico vs Sevilla', league: 'La Liga', prediction: 'Draw', odds: 3.20, stake: 75, result: 'loss', profit: -75, confidence: 70 },
  ];

  const monthlyData = [
    { month: 'Jun', profit: 1245, bets: 42 },
    { month: 'Jul', profit: 1876, bets: 48 },
    { month: 'Aug', profit: 2134, bets: 52 },
    { month: 'Sep', profit: 1689, bets: 45 },
    { month: 'Oct', profit: 2456, bets: 58 },
    { month: 'Nov', profit: 1286, bets: 28 },
  ];

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
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Performance', path: '/performance', active: true },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard', active: false },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', active: false },
  ];

  const maxProfit = Math.max(...monthlyData.map(d => d.profit));

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
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent mb-1">
                    Performance Analytics
                  </h1>
                  <p className="text-blue-300">Track your betting history and statistics</p>
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
          {/* Stats Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+12%</span>
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-1">Win Rate</p>
              <p className="text-3xl font-black text-green-400">{stats.winRate}%</p>
              <p className="text-xs text-blue-400 mt-2">{stats.wins} wins / {stats.losses} losses</p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+GH₵342</span>
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-1">Total Profit</p>
              <p className="text-3xl font-black text-yellow-400">GH₵{stats.totalProfit.toFixed(2)}</p>
              <p className="text-xs text-blue-400 mt-2">From GH₵{stats.totalStaked} staked</p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-bold">+8%</span>
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-1">ROI</p>
              <p className="text-3xl font-black text-purple-400">{stats.roi}%</p>
              <p className="text-xs text-blue-400 mt-2">Avg odds: {stats.avgOdds}x</p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-orange-400">
                  <span className="font-bold">🔥 Hot</span>
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-1">Current Streak</p>
              <p className="text-3xl font-black text-blue-400">{stats.currentStreak} wins</p>
              <p className="text-xs text-blue-400 mt-2">Best: {stats.bestStreak} wins</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Monthly Profit Chart */}
            <div className={`lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Monthly Profit Trend</h2>
                <div className="flex gap-2">
                  {(['week', 'month', 'year', 'all'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        timeRange === range
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-xl hover:scale-105 transition-all cursor-pointer relative group"
                      style={{ height: `${(data.profit / maxProfit) * 100}%` }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap">
                        GH₵{data.profit}
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 font-semibold">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-2xl font-black mb-6">Breakdown</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Wins</span>
                    <span className="font-bold text-green-400">{stats.wins}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${(stats.wins / stats.totalBets) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Losses</span>
                    <span className="font-bold text-red-400">{stats.losses}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      style={{ width: `${(stats.losses / stats.totalBets) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Pending</span>
                    <span className="font-bold text-blue-400">{stats.pending}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${(stats.pending / stats.totalBets) * 100}%` }}></div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-blue-300">Total Bets</span>
                    <span className="text-2xl font-black">{stats.totalBets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300">Avg Stake</span>
                    <span className="text-lg font-bold text-yellow-400">GH₵{stats.avgStake}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting History */}
          <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 transition-all duration-1000 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Betting History</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-4 text-sm text-blue-300 font-semibold">Date</th>
                    <th className="text-left py-4 px-4 text-sm text-blue-300 font-semibold">Match</th>
                    <th className="text-left py-4 px-4 text-sm text-blue-300 font-semibold">Prediction</th>
                    <th className="text-center py-4 px-4 text-sm text-blue-300 font-semibold">Odds</th>
                    <th className="text-center py-4 px-4 text-sm text-blue-300 font-semibold">Stake</th>
                    <th className="text-center py-4 px-4 text-sm text-blue-300 font-semibold">Result</th>
                    <th className="text-right py-4 px-4 text-sm text-blue-300 font-semibold">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {bettingHistory.map((bet) => (
                    <tr key={bet.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="py-4 px-4 text-sm text-blue-100">{bet.date}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-white">{bet.match}</p>
                          <p className="text-xs text-blue-400">{bet.league}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300">
                          {bet.prediction}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-yellow-400">{bet.odds}x</td>
                      <td className="py-4 px-4 text-center text-white">GH₵{bet.stake}</td>
                      <td className="py-4 px-4 text-center">
                        {bet.result === 'win' && (
                          <span className="flex items-center justify-center gap-1 text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-semibold">Win</span>
                          </span>
                        )}
                        {bet.result === 'loss' && (
                          <span className="flex items-center justify-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="font-semibold">Loss</span>
                          </span>
                        )}
                        {bet.result === 'pending' && (
                          <span className="flex items-center justify-center gap-1 text-blue-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">Pending</span>
                          </span>
                        )}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${bet.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bet.profit > 0 ? '+' : ''}GH₵{bet.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
      `}</style>
    </div>
  );
};

export default PerformancePage;
