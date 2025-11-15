/**
 * Achievements Modal Component
 * Displays user achievements with progress tracking and unlock animations
 */

import React, { useEffect, useState } from 'react';
import { userPicksApi } from '../services/api';
import {
  X, Trophy, Target, Flame, Star, Award, Crown, Medal,
  TrendingUp, Zap, Shield, CheckCircle2, Lock, Sparkles
} from 'lucide-react';

interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  required: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  coinReward: number;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [stats, setStats] = useState({
    totalUnlocked: 0,
    totalAchievements: 0,
    totalXP: 0,
    totalCoins: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchAchievements();
    }
  }, [isOpen]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await userPicksApi.getUserAchievements();

      if (response.success && response.achievements) {
        const achievementData = response.achievements.map((ach: any) => ({
          id: ach.id,
          type: ach.achievement_type || ach.type,
          title: ach.title,
          description: ach.description,
          icon: getAchievementIcon(ach.achievement_type || ach.type),
          rarity: ach.rarity || getRarityFromType(ach.achievement_type || ach.type),
          progress: ach.progress || 0,
          required: ach.target || 1,
          unlocked: ach.unlocked || false,
          unlockedAt: ach.unlocked_at || ach.unlockedAt,
          xpReward: ach.xp_reward || 50,
          coinReward: ach.coin_reward || 100
        }));

        setAchievements(achievementData);

        const unlocked = achievementData.filter((a: Achievement) => a.unlocked);
        setStats({
          totalUnlocked: unlocked.length,
          totalAchievements: achievementData.length,
          totalXP: unlocked.reduce((sum: number, a: Achievement) => sum + a.xpReward, 0),
          totalCoins: unlocked.reduce((sum: number, a: Achievement) => sum + a.coinReward, 0)
        });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    const icons: Record<string, string> = {
      first_win: '🎯',
      win_streak_5: '🔥',
      win_streak_10: '🌟',
      total_wins_10: '🏆',
      total_wins_50: '👑',
      total_wins_100: '💎',
      profit_1000: '💰',
      profit_5000: '💸',
      profit_10000: '🤑',
      high_accuracy: '🎖️',
      perfect_week: '⭐',
      early_adopter: '🚀',
      social_butterfly: '👥',
      master_bettor: '🧠'
    };
    return icons[type] || '🏅';
  };

  const getRarityFromType = (type: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (type.includes('100') || type.includes('10000') || type === 'master_bettor') return 'legendary';
    if (type.includes('50') || type.includes('5000') || type === 'perfect_week') return 'epic';
    if (type.includes('10') || type.includes('1000') || type === 'win_streak_10') return 'rare';
    return 'common';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const filteredAchievements = achievements.filter(ach => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                Achievements
              </h2>
              <p className="text-blue-300">Track your betting milestones and earn rewards</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-300 mb-1">Unlocked</p>
              <p className="text-3xl font-black text-green-400">{stats.totalUnlocked}/{stats.totalAchievements}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-300 mb-1">Completion</p>
              <p className="text-3xl font-black text-purple-400">
                {stats.totalAchievements > 0 ? Math.round((stats.totalUnlocked / stats.totalAchievements) * 100) : 0}%
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-300 mb-1">Total XP</p>
              <p className="text-3xl font-black text-yellow-400">{stats.totalXP}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-300 mb-1">Total Coins</p>
              <p className="text-3xl font-black text-orange-400">{stats.totalCoins}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mt-6">
            {['all', 'unlocked', 'locked'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-300px)] p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300 text-lg">Loading achievements...</p>
            </div>
          )}

          {!loading && filteredAchievements.length === 0 && (
            <div className="text-center py-20">
              <Lock className="w-20 h-20 mx-auto mb-4 text-blue-400" />
              <p className="text-2xl font-bold text-white mb-2">No Achievements Yet</p>
              <p className="text-blue-300">Start betting to unlock achievements!</p>
            </div>
          )}

          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 rounded-3xl p-6 transition-all hover:scale-105 ${
                    achievement.unlocked
                      ? `border-${getRarityColor(achievement.rarity)} shadow-lg shadow-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : 'blue'}-500/20`
                      : 'border-white/10 opacity-60 grayscale'
                  }`}
                >
                  {/* Rarity Glow */}
                  {achievement.unlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-5 rounded-3xl`}></div>
                  )}

                  {/* Lock Overlay for Locked Achievements */}
                  {!achievement.unlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Sparkle Effect for Unlocked */}
                  {achievement.unlocked && (
                    <div className="absolute top-4 right-4">
                      <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  )}

                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-2xl flex items-center justify-center text-4xl shadow-xl ${
                      achievement.unlocked ? 'animate-bounce-subtle' : ''
                    }`}>
                      {achievement.icon}
                    </div>

                    {/* Rarity Badge */}
                    <div className={`inline-block px-3 py-1 mb-3 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full text-xs font-bold text-white uppercase`}>
                      {achievement.rarity}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-black text-white mb-2">{achievement.title}</h3>
                    <p className="text-sm text-blue-200 mb-4 leading-relaxed">{achievement.description}</p>

                    {/* Progress Bar */}
                    {!achievement.unlocked && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-300">Progress</span>
                          <span className="text-xs font-bold text-white">
                            {achievement.progress}/{achievement.required}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-500`}
                            style={{ width: `${Math.min((achievement.progress / achievement.required) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Unlocked Date */}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="flex items-center gap-2 mb-4 text-xs text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">+{achievement.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">+{achievement.coinReward} Coins</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          .delay-1000 {
            animation-delay: 1000ms;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AchievementsModal;
