/**
 * Settings Page Component - World-Class UI/UX
 * User preferences, account management, and platform settings
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy, LogOut, Target, Activity, BarChart3, Settings, Menu, X, Home,
  Shield, User, Bell, Lock, CreditCard, Palette, Globe, Mail,
  Eye, EyeOff, Save, Check, AlertCircle, Moon, Sun, Monitor,
  Smartphone, Download, Share2, Trash2, Key, Upload, Image
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences' | 'admin'>('profile');
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [faviconPreview, setFaviconPreview] = useState<string>('/favicon.ico');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || 'Test User',
    username: user?.username || 'testuser',
    email: user?.email || 'test@test.com',
    bio: 'Passionate bettor using AI predictions to win consistently.',
    avatar: '👤'
  });

  const [notifications, setNotifications] = useState({
    emailPicks: true,
    emailResults: true,
    emailWeekly: false,
    pushPicks: true,
    pushLive: true,
    pushLeaderboard: false
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    currency: 'GH₵',
    defaultStake: 100,
    oddsFormat: 'decimal'
  });

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

  const handleSave = () => {
    // Mock save functionality
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setFaviconFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = () => {
    if (!faviconFile) {
      alert('Please select a favicon file first');
      return;
    }

    // Mock upload functionality
    console.log('Uploading favicon:', faviconFile.name);

    // In production, this would upload to the server
    // For now, just show success message
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: <Target className="w-5 h-5" />, label: 'Today\'s Picks', path: '/picks', active: false },
    { icon: <Activity className="w-5 h-5" />, label: 'Live Matches', path: '/live', active: false },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Performance', path: '/performance', active: false },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard', active: false },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', active: true },
  ];

  const baseTabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-5 h-5" /> },
  ];

  // Add admin tab only for admin users
  const tabs = user?.role === 'admin'
    ? [...baseTabs, { id: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" /> }]
    : baseTabs;

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
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-1">
                    Settings
                  </h1>
                  <p className="text-blue-300">Manage your account and preferences</p>
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Tabs Sidebar */}
            <div className={`lg:col-span-1 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sticky top-8">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className={`lg:col-span-3 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black mb-6">Profile Information</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl">
                        {profileData.avatar}
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all mb-2">
                          Change Avatar
                        </button>
                        <p className="text-xs text-blue-400">JPG, GIF or PNG. Max size 2MB</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Full Name</label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Username</label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-blue-300 mb-2 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-blue-300 mb-2 font-semibold">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black mb-6">Notification Preferences</h2>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-blue-300 mb-4">Email Notifications</h3>

                      {Object.entries(notifications).filter(([key]) => key.startsWith('email')).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div>
                            <p className="font-semibold text-white mb-1">
                              {key === 'emailPicks' && 'New Daily Picks'}
                              {key === 'emailResults' && 'Match Results'}
                              {key === 'emailWeekly' && 'Weekly Summary'}
                            </p>
                            <p className="text-sm text-blue-400">
                              {key === 'emailPicks' && 'Get notified when new AI picks are available'}
                              {key === 'emailResults' && 'Receive updates on your bet outcomes'}
                              {key === 'emailWeekly' && 'Weekly performance report and insights'}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [key]: !value })}
                            className={`relative w-14 h-8 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-600'}`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`}></div>
                          </button>
                        </div>
                      ))}

                      <h3 className="text-lg font-bold text-blue-300 mb-4 mt-8">Push Notifications</h3>

                      {Object.entries(notifications).filter(([key]) => key.startsWith('push')).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div>
                            <p className="font-semibold text-white mb-1">
                              {key === 'pushPicks' && 'New Picks Available'}
                              {key === 'pushLive' && 'Live Match Updates'}
                              {key === 'pushLeaderboard' && 'Leaderboard Changes'}
                            </p>
                            <p className="text-sm text-blue-400">
                              {key === 'pushPicks' && 'Instant notification for new predictions'}
                              {key === 'pushLive' && 'Real-time updates during live matches'}
                              {key === 'pushLeaderboard' && 'When you move up in rankings'}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [key]: !value })}
                            className={`relative w-14 h-8 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-600'}`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`}></div>
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </button>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black mb-6">Security Settings</h2>

                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <p className="font-bold text-blue-300">DEV MODE Active</p>
                      </div>
                      <p className="text-sm text-blue-200">Authentication is currently bypassed for testing. Security features are simulated.</p>
                    </div>

                    <h3 className="text-lg font-bold mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={security.currentPassword}
                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all pr-12"
                          />
                          <button
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={security.newPassword}
                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all pr-12"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Confirm New Password</label>
                        <input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold mb-4 mt-8">Two-Factor Authentication</h3>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div>
                        <p className="font-semibold text-white mb-1">Enable 2FA</p>
                        <p className="text-sm text-blue-400">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                        className={`relative w-14 h-8 rounded-full transition-all ${security.twoFactor ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${security.twoFactor ? 'translate-x-6' : ''}`}></div>
                      </button>
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      Update Security
                    </button>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black mb-6">Platform Preferences</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Theme</label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="dark" className="bg-slate-900">Dark</option>
                          <option value="light" className="bg-slate-900">Light</option>
                          <option value="auto" className="bg-slate-900">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="en" className="bg-slate-900">English</option>
                          <option value="es" className="bg-slate-900">Español</option>
                          <option value="fr" className="bg-slate-900">Français</option>
                          <option value="de" className="bg-slate-900">Deutsch</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="UTC" className="bg-slate-900">UTC</option>
                          <option value="GMT" className="bg-slate-900">GMT</option>
                          <option value="EST" className="bg-slate-900">EST</option>
                          <option value="PST" className="bg-slate-900">PST</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Currency</label>
                        <select
                          value={preferences.currency}
                          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="GH₵" className="bg-slate-900">GH₵ (Ghana Cedis)</option>
                          <option value="GBP" className="bg-slate-900">GBP (£)</option>
                          <option value="USD" className="bg-slate-900">USD ($)</option>
                          <option value="EUR" className="bg-slate-900">EUR (€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Default Stake</label>
                        <input
                          type="number"
                          value={preferences.defaultStake}
                          onChange={(e) => setPreferences({ ...preferences, defaultStake: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-blue-300 mb-2 font-semibold">Odds Format</label>
                        <select
                          value={preferences.oddsFormat}
                          onChange={(e) => setPreferences({ ...preferences, oddsFormat: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="decimal" className="bg-slate-900">Decimal</option>
                          <option value="fractional" className="bg-slate-900">Fractional</option>
                          <option value="american" className="bg-slate-900">American</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </button>
                  </div>
                )}

                {/* Admin Tab */}
                {activeTab === 'admin' && user?.role === 'admin' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black mb-6">Admin Settings</h2>

                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-orange-400" />
                        <p className="font-bold text-orange-300">Administrator Access</p>
                      </div>
                      <p className="text-sm text-orange-200">You have full access to site-wide settings and configurations.</p>
                    </div>

                    {/* Favicon Upload Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold mb-4">Site Favicon</h3>

                      <div className="flex items-start gap-6">
                        {/* Favicon Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-2xl flex items-center justify-center p-4">
                            {faviconPreview ? (
                              <img
                                src={faviconPreview}
                                alt="Favicon Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Image className="w-16 h-16 text-blue-400" />
                            )}
                          </div>
                          <p className="text-xs text-blue-400 text-center mt-2">Current Favicon</p>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-sm text-blue-300 mb-2 font-semibold">Upload New Favicon</label>
                            <p className="text-xs text-blue-400 mb-3">
                              Recommended: 32x32 or 64x64 pixels. PNG, ICO, or SVG format. Max 2MB.
                            </p>

                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/20 hover:border-blue-500 rounded-xl text-white outline-none transition-all flex items-center gap-3">
                                  <Upload className="w-5 h-5 text-blue-400" />
                                  <span className="text-sm">
                                    {faviconFile ? faviconFile.name : 'Choose favicon file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFaviconChange}
                                  className="hidden"
                                />
                              </label>

                              <button
                                onClick={handleFaviconUpload}
                                disabled={!faviconFile}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                                  faviconFile
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-105'
                                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <Upload className="w-5 h-5" />
                                Upload
                              </button>
                            </div>
                          </div>

                          {/* File Info */}
                          {faviconFile && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                              <div className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-green-400" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-white">File selected</p>
                                  <p className="text-xs text-blue-300">
                                    {faviconFile.name} ({(faviconFile.size / 1024).toFixed(2)} KB)
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Instructions */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-blue-300 mb-2 font-semibold">Tips for best results:</p>
                            <ul className="text-xs text-blue-400 space-y-1 list-disc list-inside">
                              <li>Use a simple, recognizable icon design</li>
                              <li>Ensure good contrast for visibility</li>
                              <li>Test on both light and dark backgrounds</li>
                              <li>Square format works best (1:1 aspect ratio)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-blue-400">
                        Changes to the favicon will be reflected site-wide after upload.
                      </p>
                    </div>
                  </div>
                )}

                {/* Save Success Message */}
                {saved && (
                  <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
                    <Check className="w-6 h-6" />
                    <span className="font-bold">Settings saved successfully!</span>
                  </div>
                )}
              </div>
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
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
