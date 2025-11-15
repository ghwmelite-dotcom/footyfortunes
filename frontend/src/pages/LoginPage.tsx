/**
 * Login Page Component
 * World-class authentication with stunning animations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LogIn, Trophy, Eye, EyeOff, Sparkles, ArrowLeft,
  Mail, Lock, Zap, CheckCircle2, Loader2
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      email: 'demo@footyfortunes.com',
      password: 'Demo123!@#'
    };
    setFormData(demoCredentials);

    // Auto-submit after setting credentials
    clearError();
    const success = await login(demoCredentials);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className={`absolute top-8 left-8 flex items-center gap-2 text-blue-300 hover:text-white transition-all hover:scale-110 z-50 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        style={{ transitionDelay: '100ms' }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Home</span>
      </Link>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Trophy className="w-9 h-9 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-blue-300 text-lg">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Sparkles Decoration */}
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 animate-pulse" />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-xl animate-shake">
              <p className="text-red-200 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          {/* Demo Credentials Badge */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-bold text-blue-300">Quick Demo Access</span>
            </div>
            <button
              onClick={handleDemoLogin}
              className="w-full p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            >
              Use Demo Credentials
            </button>
            <div className="mt-3 space-y-1 text-xs text-blue-300">
              <p>Email: demo@footyfortunes.com</p>
              <p>Password: Demo123!@#</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedField === 'email' || formData.email
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-4 w-5 h-5 transition-all duration-300 ${
                  focusedField === 'email' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-transparent focus:bg-white/15 focus:border-blue-500 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {focusedField === 'email' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer"></div>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedField === 'password' || formData.password
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 transition-all duration-300 ${
                  focusedField === 'password' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-transparent focus:bg-white/15 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {focusedField === 'password' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer"></div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    Sign In
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-transparent via-slate-950 to-transparent text-blue-300">
                New to FootyFortunes?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full py-4 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/30 rounded-2xl font-bold text-center transition-all hover:scale-105 group"
          >
            <span className="flex items-center justify-center gap-2">
              Create Free Account
              <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </Link>

          {/* Benefits */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-blue-300">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>No Credit Card</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
