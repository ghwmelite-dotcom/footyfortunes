/**
 * Live Matches Page Component - World-Class UI/UX
 * Real-time match tracking with live scores and betting status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { matchesApi } from '../services/api';
import {
  Trophy, LogOut, Target, Activity, BarChart3, Settings, Menu, X, Home,
  Shield, Radio, PlayCircle, CheckCircle2, AlertCircle, Clock, MapPin,
  TrendingUp, TrendingDown, Zap, Award, DollarSign, Users, Eye, Heart,
  Share2, RefreshCw, Filter, Flame, Star, Brain
} from 'lucide-react';

const LiveMatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'finished'>('all');

  // Load live predictions with match data
  const loadLivePredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await matchesApi.getTodaysPredictions();

      if (response.success && response.message?.predictions) {
        setPredictions(response.message.predictions);
      } else {
        setError(response.error || 'Failed to load predictions');
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadLivePredictions();

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Auto-refresh every 10 seconds for live matches (premium real-time updates)
    const refreshInterval = setInterval(() => {
      loadLivePredictions();
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: <Target className="w-5 h-5" />, label: 'Today\'s Picks', path: '/picks', active: false },
    { icon: <Activity className="w-5 h-5" />, label: 'Live Matches', path: '/live', active: true },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Performance', path: '/performance', active: false },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard', active: false },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', active: false },
  ];

  const filteredMatches = predictions.filter(pred => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'live') return pred.is_live;
    if (filterStatus === 'finished') return pred.is_finished;
    return true;
  });

  const stats = {
    totalLive: predictions.filter(p => p.is_live).length,
    finished: predictions.filter(p => p.is_finished).length,
    highConfidence: predictions.filter(p => p.confidence >= 70).length,
    totalPredictions: predictions.length,
  };

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
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg animate-pulse"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Radio className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                      Live Matches
                    </h1>
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                      <span className="text-xs font-bold text-red-300">LIVE</span>
                    </div>
                  </div>
                  <p className="text-blue-300">Real-time match tracking and bet monitoring</p>
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
          {/* Stats Overview */}
          <div className={`grid md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">Live Now</p>
                  <p className="text-3xl font-black text-white">{stats.totalLive}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">Finished</p>
                  <p className="text-3xl font-black text-green-400">{stats.finished}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">High Confidence</p>
                  <p className="text-3xl font-black text-white">{stats.highConfidence}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">Total Predictions</p>
                  <p className="text-3xl font-black text-yellow-400">{stats.totalPredictions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`flex flex-wrap gap-3 mb-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { value: 'all', label: 'All Matches', icon: <Activity className="w-4 h-4" /> },
              { value: 'live', label: 'Live Only', icon: <Radio className="w-4 h-4" /> },
              { value: 'finished', label: 'Finished', icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                  filterStatus === tab.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={loadLivePredictions}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-300">Loading live matches...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={loadLivePredictions}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <Radio className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <p className="text-blue-300 mb-2 text-lg font-semibold">No matches found</p>
              <p className="text-sm text-blue-400">Try changing your filter or check back later!</p>
            </div>
          )}

          {/* Matches Grid */}
          {!isLoading && !error && filteredMatches.length > 0 && (
            <div className={`grid lg:grid-cols-2 gap-6 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {filteredMatches.map((prediction, index) => (
                <div
                  key={prediction.id}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:scale-102 hover:shadow-2xl transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <img src={prediction.league_logo} alt="" className="w-5 h-5" />
                      <span className="text-sm font-bold text-blue-300">{prediction.league_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {prediction.is_live && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full animate-pulse">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                          <span className="text-xs font-bold text-red-300">LIVE {prediction.elapsed_time ? `${prediction.elapsed_time}'` : ''}</span>
                        </div>
                      )}
                      {prediction.is_finished && (
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-300">{prediction.status}</span>
                      )}
                      {!prediction.is_live && !prediction.is_finished && (
                        <span className="text-xs text-blue-400">{prediction.match_time}</span>
                      )}
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="bg-gradient-to-r from-slate-900/50 to-slate-950/50 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <img src={prediction.home_team_logo} alt="" className="w-8 h-8" />
                          <p className="text-base font-bold text-white">{prediction.home_team_name}</p>
                        </div>
                        {(prediction.is_live || prediction.is_finished) && prediction.home_score !== null && (
                          <p className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {prediction.home_score}
                          </p>
                        )}
                      </div>
                      <div className="px-4">
                        <p className="text-3xl font-black text-blue-400">{(prediction.is_live || prediction.is_finished) ? '-' : 'vs'}</p>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-3">
                          <p className="text-base font-bold text-white">{prediction.away_team_name}</p>
                          <img src={prediction.away_team_logo} alt="" className="w-8 h-8" />
                        </div>
                        {(prediction.is_live || prediction.is_finished) && prediction.away_score !== null && (
                          <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {prediction.away_score}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-blue-300 mb-2">AI Prediction</p>
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-yellow-400" />
                        <p className="font-bold text-white capitalize">{prediction.predicted_winner}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-blue-300 mb-2">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-green-400">{prediction.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Best Bet */}
                  {prediction.best_bet && prediction.best_bet !== 'No recommendation' && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <p className="text-xs font-bold text-yellow-300 uppercase">Best Bet</p>
                      </div>
                      <p className="text-sm font-bold text-white">{prediction.best_bet}</p>
                    </div>
                  )}

                  {/* Probabilities */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                      <p className="text-green-300 mb-1">Home</p>
                      <p className="font-bold text-white">{prediction.home_win_probability}%</p>
                    </div>
                    <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                      <p className="text-yellow-300 mb-1">Draw</p>
                      <p className="font-bold text-white">{prediction.draw_probability}%</p>
                    </div>
                    <div className="text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                      <p className="text-red-300 mb-1">Away</p>
                      <p className="font-bold text-white">{prediction.away_win_probability}%</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-blue-300">
                    <span className="px-2 py-1 bg-white/5 rounded-lg">O/U 2.5: {prediction.over_under_25}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-lg">BTTS: {prediction.btts}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-lg">Risk: {prediction.risk_level}</span>
                    {prediction.is_value_bet === 1 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg font-bold text-yellow-300">
                        VALUE BET
                      </span>
                    )}
                  </div>

                  {/* Result Badge for Finished Matches */}
                  {prediction.is_finished && prediction.prediction_result && (
                    <div className={`mt-4 p-3 rounded-xl flex items-center justify-center gap-2 ${
                      prediction.prediction_result === 'correct'
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                        : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30'
                    }`}>
                      {prediction.prediction_result === 'correct' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="font-bold text-green-300">Prediction Correct!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="font-bold text-red-300">Prediction Incorrect</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
        .delay-500 {
          animation-delay: 500ms;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default LiveMatchesPage;
