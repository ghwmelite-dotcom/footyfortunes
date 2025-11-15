/**
 * Admin Page Component
 * Admin panel (simplified placeholder for now)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import { Trophy, Users, TrendingUp, Settings, ArrowLeft } from 'lucide-react';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);
  const [matchLimit, setMatchLimit] = useState<number>(10);

  useEffect(() => {
    loadStats();
    loadLeagues();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeagues = async () => {
    try {
      const response = await fetch('https://footyfortunes-api.ghwmelite.workers.dev/api/leagues');
      const data = await response.json();
      if (data.success) {
        setLeagues(data.message.leagues);
      }
    } catch (err) {
      console.error('Failed to load leagues:', err);
    }
  };

  const handleGeneratePicks = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.generatePicks({
        leagueIds: selectedLeagues.length > 0 ? selectedLeagues : undefined,
        limit: matchLimit
      });
      if (response.success) {
        alert(`Picks generated successfully! Generated ${response.message?.generated || 0} predictions.`);
        setShowGenerateModal(false);
        loadStats(); // Reload stats to show updated count
      } else {
        alert('Failed to generate picks: ' + response.error);
      }
    } catch (err) {
      alert('Failed to generate picks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePicks = async () => {
    if (!confirm('Are you sure you want to delete ALL predictions? This cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await adminApi.deletePredictions();
      if (response.success) {
        alert(`All predictions deleted! Deleted ${response.message?.deleted || 0} predictions.`);
        loadStats(); // Reload stats to show updated count
      } else {
        alert('Failed to delete predictions: ' + response.error);
      }
    } catch (err) {
      alert('Failed to delete predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLeague = (leagueId: number) => {
    setSelectedLeagues(prev =>
      prev.includes(leagueId)
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin permissions</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Platform Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stats...</p>
          </div>
        ) : stats ? (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Picks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPicks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.winRate || 0}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowGenerateModal(true)}
                  disabled={isLoading}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left disabled:opacity-50"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">Generate AI Picks</h3>
                  <p className="text-sm text-gray-600">Create today's predictions using AI</p>
                </button>
                <button
                  onClick={handleDeletePicks}
                  disabled={isLoading}
                  className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition text-left disabled:opacity-50"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">Delete All Predictions</h3>
                  <p className="text-sm text-gray-600">Remove all generated predictions</p>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load stats</p>
          </div>
        )}
      </main>

      {/* Generate Predictions Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Generate AI Predictions</h2>
              <p className="text-sm text-gray-600 mt-1">Configure prediction generation settings</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Number of Matches
                </label>
                <input
                  type="number"
                  value={matchLimit}
                  onChange={(e) => setMatchLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter number of matches (1-100)"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of matches to generate predictions for</p>
              </div>

              {/* League Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Leagues (optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">Leave empty to generate for all leagues</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {leagues.map((league) => (
                    <label
                      key={league.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeagues.includes(league.id)}
                        onChange={() => toggleLeague(league.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {league.logo && (
                          <img src={league.logo} alt="" className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-900 truncate">{league.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedLeagues.length > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-blue-600 font-medium">
                      {selectedLeagues.length} league{selectedLeagues.length !== 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setSelectedLeagues([])}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePicks}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition font-medium disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Predictions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
