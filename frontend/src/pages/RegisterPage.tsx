/**
 * Register Page Component
 * World-class registration with stunning animations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  UserPlus, Trophy, Eye, EyeOff, Sparkles, ArrowLeft,
  Mail, Lock, User, CheckCircle2, Loader2, Shield, Zap, AlertCircle
} from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const success = await register(registerData);

    if (success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'from-red-500 to-red-600';
    if (passwordStrength <= 3) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
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
            Join FootyFortunes
          </h1>
          <p className="text-blue-300 text-lg">Create your free account</p>
        </div>

        {/* Register Card */}
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Sparkles Decoration */}
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 animate-pulse" />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-xl animate-shake">
              <p className="text-red-200 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          {/* Benefits Badge */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-300">Free Forever - No Credit Card</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-green-300">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>98.7% Accuracy</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="relative">
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'email' || formData.email
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Email Address *
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
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'password' || formData.password
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Password *
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
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border-2 rounded-2xl text-white placeholder-transparent focus:bg-white/15 outline-none transition-all ${
                    formErrors.password ? 'border-red-500' : 'border-white/20 focus:border-blue-500'
                  }`}
                  placeholder="Min 8 chars"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formErrors.password}</span>
                </div>
              )}
              {/* Password Strength Indicator */}
              {formData.password && !formErrors.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-300">Password Strength</span>
                    <span className={`text-xs font-bold bg-gradient-to-r ${getPasswordStrengthColor()} bg-clip-text text-transparent`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-500 rounded-full`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {focusedField === 'password' && !formErrors.password && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer"></div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'confirmPassword' || formData.confirmPassword
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 transition-all duration-300 ${
                  focusedField === 'confirmPassword' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border-2 rounded-2xl text-white placeholder-transparent focus:bg-white/15 outline-none transition-all ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-white/20 focus:border-blue-500'
                  }`}
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formErrors.confirmPassword}</span>
                </div>
              )}
              {focusedField === 'confirmPassword' && !formErrors.confirmPassword && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer"></div>
              )}
            </div>

            {/* Username Field (Optional) */}
            <div className="relative">
              <label
                htmlFor="username"
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                  focusedField === 'username' || formData.username
                    ? '-top-2.5 text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold px-2'
                    : 'top-4 text-blue-300'
                }`}
              >
                Username (Optional)
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-4 w-5 h-5 transition-all duration-300 ${
                  focusedField === 'username' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-transparent focus:bg-white/15 focus:border-blue-500 outline-none transition-all"
                  placeholder="betmaster"
                />
              </div>
              {focusedField === 'username' && (
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Create Free Account
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full py-4 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/30 rounded-2xl font-bold text-center transition-all hover:scale-105 group"
          >
            <span className="flex items-center justify-center gap-2">
              Sign In Instead
              <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </Link>

          {/* Trust Indicators */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-center">
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-blue-300">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-blue-300">No CC Required</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-blue-300">Instant Access</span>
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

export default RegisterPage;
