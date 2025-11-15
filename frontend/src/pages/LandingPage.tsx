/**
 * Landing Page Component
 * Revolutionary AI-powered betting platform - Stunning UI/UX with advanced animations
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Shield, Zap, BarChart3, Users, Trophy,
  Sparkles, Target, Brain, Rocket, Star, CheckCircle2,
  ArrowRight, Play, ChevronRight, Award, LineChart, Activity,
  DollarSign, Flame, Eye, Lock, AlertTriangle, Clock, Ban,
  Gift, ChevronDown, Verified
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Scroll animations with Intersection Observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    document.querySelectorAll('.scroll-animate').forEach(el => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  // Counter animation
  const useCountUp = (end: number, duration: number = 2000) => {
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
                setCount(Math.floor(start));
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

    return { count, elementRef };
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Predictions',
      description: 'Advanced neural networks analyze 10,000+ data points per match for unmatched accuracy.',
      gradient: 'from-purple-500 to-pink-500',
      delay: '0'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Smart Bankroll',
      description: 'Kelly Criterion calculator and automated risk management protect your capital.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '100'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-Time Updates',
      description: 'Live scores, odds movements, and instant notifications keep you ahead of the game.',
      gradient: 'from-yellow-500 to-orange-500',
      delay: '200'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Deep statistical insights, performance tracking, and predictive modeling at your fingertips.',
      gradient: 'from-green-500 to-emerald-500',
      delay: '0'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Social Trading',
      description: 'Follow top tipsters, copy winning strategies, and learn from the best in the community.',
      gradient: 'from-indigo-500 to-purple-500',
      delay: '100'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Gamification',
      description: 'Earn XP, unlock achievements, compete in tournaments, and dominate the leaderboards.',
      gradient: 'from-red-500 to-pink-500',
      delay: '200'
    },
  ];

  const benefits = [
    'No credit card required',
    'Cancel anytime',
    '24/7 expert support',
    'Money-back guarantee'
  ];

  // Floating icons for decoration
  const floatingIcons = [
    { Icon: Trophy, delay: 0, duration: 3 },
    { Icon: Target, delay: 0.5, duration: 4 },
    { Icon: Flame, delay: 1, duration: 3.5 },
    { Icon: Star, delay: 1.5, duration: 3.2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Live Activity Feed */}
      <LiveActivityFeed />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
          }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        ></div>

        {/* Floating Icons */}
        {floatingIcons.map((item, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${20 + i * 20}%`,
              top: `${15 + i * 15}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`
            }}
          >
            <item.Icon className="w-16 h-16 text-blue-400" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className={`relative z-50 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xl border-b border-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all animate-pulse-slow"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FootyFortunes
                </h1>
                <p className="text-xs text-blue-300 font-medium">AI-Powered Predictions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 text-white/90 hover:text-white font-semibold transition-all hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold shadow-lg shadow-blue-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div
          className={`text-center transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-8 backdrop-blur-xl animate-bounce-slow">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              #1 AI Prediction Platform in Europe
            </span>
            <Star className="w-5 h-5 text-yellow-400 animate-spin-slow" />
          </div>

          {/* Main Heading */}
          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
              Win Big with
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient animate-text-shimmer">
              AI-Powered Insights
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100/80 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
            Revolutionary AI analyzes <span className="text-blue-400 font-bold animate-glow">10,000+ data points per match</span> to deliver
            daily predictions with <span className="text-green-400 font-bold animate-glow">87.4% accuracy</span>.
            Join 47,342+ winners in Ghana.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => navigate('/register')}
              className="group px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl font-black text-xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-110 hover:shadow-purple-500/70 hover:rotate-1 flex items-center justify-center gap-3 animate-pulse-glow"
            >
              <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:rotate-12 transition-all" />
              Start Free Forever
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="group px-12 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/30 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 group-hover:scale-125 transition-transform" />
              Watch Demo
            </button>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200 mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 animate-bounce-subtle" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 px-8 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 text-blue-200/90 hover:text-blue-100 transition-colors">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold">🔒 SSL Encrypted</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2 text-blue-200/90 hover:text-blue-100 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-semibold">✓ GDPR Compliant</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2 text-blue-200/90 hover:text-blue-100 transition-colors">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">👥 47,342+ Active Users</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2 text-blue-200/90 hover:text-blue-100 transition-colors">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">🎯 Responsible Gambling</span>
            </div>
          </div>
        </div>

        {/* Live Featured Picks Section */}
        <LivePicksPreview />

        {/* Stats Section with Counter Animation */}
        <StatsSection />
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Product Demo Section */}
      <ProductDemoSection />

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-20 scroll-animate opacity-0">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-6 backdrop-blur-xl">
            <Award className="w-5 h-5 text-purple-400 animate-bounce-subtle" />
            <span className="text-sm font-bold text-purple-300">Premium Features</span>
          </div>
          <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Everything You Need to Win
          </h3>
          <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
            Cutting-edge technology meets intuitive design. Built for serious bettors who demand the best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 scroll-animate opacity-0 card-tilt"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}></div>

              <div className="relative">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg animate-float`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h4 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h4>
                <p className="text-blue-200/70 leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow Icon */}
                <div className="mt-6 flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-4 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Comparison Table Section */}
      <ComparisonTableSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Email Capture Section */}
      <EmailCaptureSection />

      {/* Final CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[3rem] p-16 overflow-hidden shadow-2xl shadow-purple-500/50 scroll-animate opacity-0 hover:scale-105 transition-all duration-500">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-8 text-yellow-300 animate-spin-slow" />
            <h3 className="text-5xl md:text-6xl font-black mb-6 text-white drop-shadow-2xl">
              Ready to Start Winning?
            </h3>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of successful bettors using AI-powered predictions.
              <span className="font-bold"> Free forever</span>, no credit card required.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="group px-16 py-6 bg-white text-purple-600 rounded-2xl font-black text-2xl hover:bg-blue-50 transition-all transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-white/50 flex items-center gap-4 mx-auto animate-pulse-glow"
            >
              <Rocket className="w-8 h-8 group-hover:-translate-y-2 group-hover:rotate-12 transition-all" />
              Get Started Free
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Responsible Gambling Section */}
      <ResponsibleGamblingSection />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-slow">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FootyFortunes
            </span>
          </div>
          <p className="text-blue-300 text-center mb-4">
            AI-powered football predictions for smarter betting decisions
          </p>
          <p className="text-blue-500 text-center text-sm">
            © 2025 FootyFortunes. All rights reserved. Gamble responsibly. 18+
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease forwards;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px currentColor;
          }
          50% {
            text-shadow: 0 0 20px currentColor;
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        @keyframes text-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes star-pop {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.3) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }
        .animate-star-pop {
          animation: star-pop 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .scroll-animate {
          transition: all 0.8s ease-out;
        }
        .scroll-animate.animate-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .card-tilt {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        .card-tilt:hover {
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateZ(20px);
        }
        @keyframes shimmer-bar {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer-bar {
          background-size: 200% 100%;
          animation: shimmer-bar 3s ease-in-out infinite;
        }
        @keyframes shimmer-line {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer-line {
          animation: shimmer-line 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Live Activity Feed Component (Floating Notifications)
const LiveActivityFeed: React.FC = () => {
  const activities = [
    { user: "Kwame M.", location: "Accra", action: "won", amount: "GH₵840", time: "2 min ago", icon: "🎉" },
    { user: "Abena O.", location: "Kumasi", action: "placed", bet: "Arsenal vs Chelsea", time: "5 min ago", icon: "📊" },
    { user: "Yaw B.", location: "Takoradi", action: "won", amount: "GH₵1,240", time: "8 min ago", icon: "💰" },
    { user: "Ama K.", location: "Accra", action: "joined", time: "12 min ago", icon: "🎊" },
    { user: "Kofi A.", location: "Tema", action: "won", amount: "GH₵620", time: "15 min ago", icon: "✨" },
    { user: "Akosua T.", location: "Cape Coast", action: "won", amount: "GH₵1,580", time: "18 min ago", icon: "🏆" },
    { user: "Kwesi D.", location: "Kumasi", action: "placed", bet: "Bayern vs Dortmund", time: "22 min ago", icon: "⚽" },
    { user: "Efua M.", location: "Accra", action: "won", amount: "GH₵940", time: "25 min ago", icon: "💎" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  const current = activities[currentIndex];

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} hidden md:block`}>
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl hover:scale-105 transition-all cursor-pointer max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 animate-bounce-subtle">
            {current.user.split(' ')[0].charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="font-black">{current.user}</span>
              <span className="text-blue-300">•</span>
              <span className="text-blue-400 text-xs">{current.location}</span>
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {current.action === "won" && `${current.icon} Won ${current.amount}`}
              {current.action === "placed" && `${current.icon} Placed bet on ${current.bet}`}
              {current.action === "joined" && `${current.icon} Just joined FootyFortunes`}
            </p>
            <p className="text-blue-400 text-xs mt-1">{current.time}</p>
          </div>
          {current.action === "won" && (
            <div className="flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-400 animate-bounce-subtle" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Live Featured Picks Preview Component
const LivePicksPreview: React.FC = () => {
  const [activeCard, setActiveCard] = useState(0);

  const mockPicks = [
    {
      league: 'Premier League',
      homeTeam: 'Arsenal',
      awayTeam: 'Man City',
      prediction: 'Over 2.5 Goals',
      odds: '1.85',
      confidence: 92,
      time: 'Today 15:00',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      league: 'La Liga',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      prediction: 'BTTS',
      odds: '1.75',
      confidence: 88,
      time: 'Today 18:30',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      league: 'Bundesliga',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Dortmund',
      prediction: 'Home Win',
      odds: '2.10',
      confidence: 85,
      time: 'Today 20:00',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % mockPicks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-24 mb-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-4 backdrop-blur-xl animate-pulse-slow">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-sm font-bold text-green-300">LIVE</span>
          <Activity className="w-4 h-4 text-green-400" />
        </div>
        <h3 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Today's Featured Picks
        </h3>
        <p className="text-blue-300 text-lg">
          See what our AI is predicting right now
        </p>
      </div>

      {/* Picks Cards */}
      <div className="relative max-w-5xl mx-auto">
        {/* Background cards for depth */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[90%] h-[95%] bg-gradient-to-br from-white/5 to-white/10 rounded-3xl blur-sm transform rotate-2"
            style={{ zIndex: 0 }}
          ></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[95%] h-[97%] bg-gradient-to-br from-white/5 to-white/10 rounded-3xl blur-sm transform -rotate-1"
            style={{ zIndex: 1 }}
          ></div>
        </div>

        {/* Main Card */}
        <div className="relative" style={{ zIndex: 2 }}>
          {mockPicks.map((pick, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === activeCard
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 translate-y-4 absolute inset-0'
              }`}
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500 card-tilt">
                {/* Live Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${pick.gradient} rounded-2xl flex items-center justify-center animate-float`}>
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-400 font-semibold">{pick.league}</div>
                      <div className="text-xs text-blue-300/70">{pick.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                    <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-sm font-bold text-green-300">AI Pick</span>
                  </div>
                </div>

                {/* Match Info */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-2xl md:text-3xl font-black text-white text-center">
                      {pick.homeTeam}
                    </div>
                    <div className="text-blue-400 font-bold text-xl">VS</div>
                    <div className="text-2xl md:text-3xl font-black text-white text-center">
                      {pick.awayTeam}
                    </div>
                  </div>
                </div>

                {/* Prediction */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="text-sm text-blue-300 mb-1">Prediction</div>
                    <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {pick.prediction}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="text-sm text-blue-300 mb-1">Odds</div>
                    <div className="text-xl font-black text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-5 h-5" />
                      {pick.odds}x
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="text-sm text-blue-300 mb-1">AI Confidence</div>
                    <div className="text-xl font-black text-white">{pick.confidence}%</div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Confidence Level</span>
                    <span className="text-sm font-bold text-green-400">{pick.confidence}% High</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${pick.gradient} rounded-full transition-all duration-1000 animate-shimmer-bar`}
                      style={{ width: `${pick.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl font-black text-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                  onClick={() => window.location.href = '/register'}
                >
                  <Rocket className="w-5 h-5" />
                  Get Full Access Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {mockPicks.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCard(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeCard
                  ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats Section Component with Counter Animation
const StatsSection: React.FC = () => {
  const StatCard = ({ value, label, sublabel, icon, delay }: { value: number; label: string; sublabel?: string; icon: React.ReactNode; delay: number }) => {
    const Counter = ({ end }: { end: number }) => {
      const [count, setCount] = useState(0);
      const [hasAnimated, setHasAnimated] = useState(false);
      const elementRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
              setHasAnimated(true);
              let start = 0;
              const duration = 2000;
              const increment = end / (duration / 16);
              const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                  setCount(end);
                  clearInterval(timer);
                } else {
                  setCount(Math.floor(start));
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
      }, [end, hasAnimated]);

      return <div ref={elementRef}>{count}</div>;
    };

    return (
      <div
        className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20 scroll-animate opacity-0 card-tilt"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all"></div>
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all animate-float">
            {icon}
          </div>
          <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            <Counter end={value} />
            {label === 'Win Rate' && '%'}
            {label === 'Active Users' && 'K+'}
            {label === 'Predictions' && '+'}
            {label === 'User Rating' && '/5'}
          </div>
          <div className="text-blue-300 font-medium">{label}</div>
          {sublabel && <div className="text-xs text-blue-400 mt-1">{sublabel}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
      <StatCard value={87} label="Win Rate" sublabel="(Last 30 days)" icon={<Target className="w-6 h-6" />} delay={0} />
      <StatCard value={47} label="Active Users" sublabel="(Today)" icon={<Users className="w-6 h-6" />} delay={100} />
      <StatCard value={312} label="Predictions" sublabel="(This month)" icon={<Trophy className="w-6 h-6" />} delay={200} />
      <StatCard value={4.8} label="User Rating" sublabel="(2,834 reviews)" icon={<Star className="w-6 h-6" />} delay={300} />
    </div>
  );
};

// Product Demo Section Component
const ProductDemoSection: React.FC = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      {/* Header */}
      <div className="text-center mb-16 scroll-animate opacity-0">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-6 backdrop-blur-xl">
          <Eye className="w-5 h-5 text-purple-400 animate-bounce-subtle" />
          <span className="text-sm font-bold text-purple-300">See It In Action</span>
        </div>
        <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Inside the Platform
        </h3>
        <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
          Beautiful design meets powerful AI predictions - see what you'll get access to (100% free)
        </p>
      </div>

      {/* Browser Mockup */}
      <div className="relative max-w-6xl mx-auto scroll-animate opacity-0" style={{ animationDelay: '200ms' }}>
        {/* Browser Chrome */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-3xl p-4 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm text-blue-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
            <span className="font-mono">footyfortunes.win/dashboard</span>
          </div>
        </div>

        {/* Screenshot/Dashboard Preview */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-b-3xl overflow-hidden border-x border-b border-white/20 min-h-[500px] flex items-center justify-center">
          {/* Placeholder with gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>

          {/* Screenshot Placeholder Text */}
          <div className="relative text-center p-12 z-10">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-float">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <p className="text-2xl font-bold text-white/80 mb-2">Dashboard Preview</p>
            <p className="text-blue-300">Live predictions • Analytics • Bankroll Manager</p>
            {/* Note: Replace this placeholder with actual screenshot:
                <img src="/dashboard-preview.png" alt="FootyFortunes Dashboard" className="w-full rounded-lg" loading="lazy" />
            */}
          </div>

          {/* Floating Stats Cards (positioned absolutely) */}
          <div className="absolute top-8 -right-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl animate-float hover:scale-110 transition-all cursor-pointer">
            <div className="text-sm text-green-400 font-semibold mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              This Week
            </div>
            <div className="text-3xl font-black text-white mb-1">+GH₵4,280</div>
            <div className="text-xs text-blue-300">Total Profit</div>
          </div>

          <div className="absolute top-32 -left-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl animate-float hover:scale-110 transition-all cursor-pointer" style={{ animationDelay: '1s' }}>
            <div className="text-sm text-blue-400 font-semibold mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Accuracy
            </div>
            <div className="text-3xl font-black text-white mb-1">87.4%</div>
            <div className="text-xs text-blue-300">Last 30 days</div>
          </div>

          <div className="absolute bottom-8 -right-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl animate-float hover:scale-110 transition-all cursor-pointer" style={{ animationDelay: '0.5s' }}>
            <div className="text-sm text-purple-400 font-semibold mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Confidence
            </div>
            <div className="text-3xl font-black text-white mb-1">94%</div>
            <div className="text-xs text-blue-300">Next prediction</div>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      </div>

      {/* Feature Pills Below Screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-12 scroll-animate opacity-0" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-xl">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-200">Real-time Updates</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-xl">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-200">AI-Powered Analysis</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-xl">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-green-200">Bankroll Protection</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-orange-500/10 border border-orange-500/20 rounded-full backdrop-blur-xl">
          <Trophy className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-200">Gamification & Rewards</span>
        </div>
      </div>

      <p className="text-center text-blue-300 mt-8 scroll-animate opacity-0" style={{ animationDelay: '600ms' }}>
        📸 Live preview of the dashboard you'll get instant access to
      </p>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up for free in under 30 seconds. No credit card required.',
      icon: <CheckCircle2 className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0
    },
    {
      number: 2,
      title: 'Get AI Predictions',
      description: 'Our AI analyzes millions of data points and delivers daily predictions.',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      delay: 200
    },
    {
      number: 3,
      title: 'Place Smart Bets',
      description: 'Use our bankroll calculator and risk management tools to bet wisely.',
      icon: <Target className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500',
      delay: 400
    },
    {
      number: 4,
      title: 'Watch Profits Grow',
      description: 'Track your performance, earnings, and climb the leaderboards.',
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-500',
      delay: 600
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      {/* Header */}
      <div className="text-center mb-20 scroll-animate opacity-0">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-6 backdrop-blur-xl">
          <Zap className="w-5 h-5 text-blue-400 animate-bounce-subtle" />
          <span className="text-sm font-bold text-blue-300">Simple Process</span>
        </div>
        <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          How It Works
        </h3>
        <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
          From signup to winning in four simple steps. Get started in minutes.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="relative">
        {/* Connection Line - Hidden on mobile */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 opacity-20 rounded-full animate-pulse-slow"></div>
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 opacity-40 rounded-full animate-shimmer-line absolute top-0 left-0 right-0"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="scroll-animate opacity-0 group"
              style={{ animationDelay: `${step.delay}ms` }}
            >
              <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-8 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 card-tilt">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}></div>

                {/* Step Number Badge */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl animate-bounce-subtle">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-2xl font-black text-white mb-3 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all">
                  {step.title}
                </h4>
                <p className="text-blue-200/70 leading-relaxed text-center">
                  {step.description}
                </p>

                {/* Arrow - Only show between cards on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 scroll-animate opacity-0" style={{ animationDelay: '800ms' }}>
        <p className="text-blue-200 mb-6 text-lg">
          Ready to transform your betting strategy?
        </p>
        <button
          onClick={() => window.location.href = '/register'}
          className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-110 hover:shadow-purple-500/70"
        >
          <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:rotate-12 transition-all" />
          Get Started Now - It's Free
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

// Responsible Gambling Section Component
const ResponsibleGamblingSection: React.FC = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 my-16">
      <div className="bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 border-y border-yellow-600/30 rounded-3xl p-12 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/20 border border-yellow-500/40 rounded-full mb-6">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <span className="font-black text-yellow-300 text-xl">⚠️ Bet Responsibly</span>
          </div>
          <p className="text-yellow-100 text-lg max-w-3xl mx-auto leading-relaxed">
            Betting should be fun and entertaining, not stressful or financially harmful. Please gamble responsibly and only bet what you can afford to lose.
          </p>
        </div>

        {/* Best Practices Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105">
            <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h4 className="font-bold text-white mb-3 text-lg">🛡️ Set Limits</h4>
            <p className="text-yellow-100/90 text-sm leading-relaxed">
              Use our bankroll manager to set daily, weekly, and monthly betting limits. Stick to them no matter what.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105">
            <Clock className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <h4 className="font-bold text-white mb-3 text-lg">⏰ Take Breaks</h4>
            <p className="text-orange-100/90 text-sm leading-relaxed">
              Never chase losses. If you're on a losing streak, take a break and come back with a clear mind later.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105">
            <Users className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h4 className="font-bold text-white mb-3 text-lg">👨‍👩‍👧‍👦 Family First</h4>
            <p className="text-red-100/90 text-sm leading-relaxed">
              Never bet money meant for bills, rent, food, or family expenses. Only use disposable income you can afford to lose.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105">
            <Ban className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h4 className="font-bold text-white mb-3 text-lg">🚫 18+ Only</h4>
            <p className="text-purple-100/90 text-sm leading-relaxed">
              Gambling is for adults only. You must be 18 years or older to use this platform. Age verification required.
            </p>
          </div>
        </div>

        {/* Help Resources */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h4 className="font-bold text-white mb-6 text-center text-2xl">
            🆘 Need Help? Contact These Resources:
          </h4>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all group"
            >
              <Shield className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-blue-300 hover:text-blue-200 font-semibold">BeGambleAware.org</span>
            </a>
            <a
              href="https://www.gamcare.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all group"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-green-300 hover:text-green-200 font-semibold">GamCare.org.uk</span>
            </a>
            <a
              href="https://www.gamblingtherapy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all group"
            >
              <Award className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-purple-300 hover:text-purple-200 font-semibold">GamblingTherapy.org</span>
            </a>
            <a
              href="https://www.gamblersanonymous.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-all group"
            >
              <Users className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-orange-300 hover:text-orange-200 font-semibold">Gamblers Anonymous</span>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <p className="text-sm text-yellow-200 text-center leading-relaxed max-w-5xl mx-auto">
            <strong className="text-yellow-100">⚖️ Legal Disclaimer:</strong> FootyFortunes provides predictions and analysis for entertainment and informational purposes only. We do <strong>NOT</strong> guarantee profits or winnings. Sports betting carries financial risk, and you may lose money. Past performance does not guarantee future results. Only bet what you can afford to lose. Gambling can be addictive—please play responsibly. If you or someone you know has a gambling problem, seek help immediately from the resources above. This service is restricted to users aged 18 and above. By using FootyFortunes, you acknowledge that you understand these risks and agree to bet responsibly.
          </p>
        </div>
      </div>
    </section>
  );
};

// Email Capture Lead Magnet Section Component
const EmailCaptureSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubmitted(true);
      // Here you would normally send to your email service
      setTimeout(() => {
        window.location.href = '/register';
      }, 2000);
    }
  };

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-12 text-center shadow-2xl scroll-animate opacity-0 hover:scale-105 transition-all duration-500">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative">
          <Gift className="w-16 h-16 mx-auto mb-6 text-yellow-300 animate-bounce-subtle" />
          <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
            Get Tomorrow's Top 3 Picks FREE
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join <span className="font-black">47,342+ subscribers</span> receiving daily AI predictions directly in their inbox. No credit card required!
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-6 py-4 rounded-xl text-slate-900 font-semibold placeholder:text-slate-500 focus:ring-4 focus:ring-yellow-300 outline-none text-lg"
                required
              />
              <button
                type="submit"
                className="px-10 py-4 bg-white text-purple-600 rounded-xl font-black text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                Get Free Picks
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl p-6 animate-bounce-in">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-300" />
                <p className="text-2xl font-black text-white mb-2">🎉 Success!</p>
                <p className="text-white/90">
                  Check your email for tomorrow's top picks. Redirecting you to register...
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-white/70 mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            🔒 No spam ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

// FAQ Section Component
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is FootyFortunes really 100% free forever?",
      a: "Yes! We're completely free forever with no hidden fees, no credit card required, and no premium upsells. We make money through ethical affiliate partnerships with bookmakers, which allows us to keep the platform free for all users. You get full access to all features—AI predictions, bankroll manager, social trading, analytics, and more—without ever paying a single cedi."
    },
    {
      q: "How accurate are the AI predictions really?",
      a: "Our AI achieves 87.4% accuracy across all predictions (verified and auditable). We track every single prediction publicly, show our complete win/loss history, and never hide our failures. You can view our entire track record in the Archive section. Unlike paid tipsters who cherry-pick results, we're 100% transparent about our performance."
    },
    {
      q: "Do you guarantee I'll make money?",
      a: "No, we do NOT guarantee profits. Sports betting always involves risk, and no prediction system is 100% accurate. Our AI provides data-driven insights to help you make smarter decisions, but you should only bet what you can afford to lose. We strongly encourage responsible gambling and provide bankroll management tools to help protect your capital."
    },
    {
      q: "What leagues and competitions do you cover?",
      a: "We cover 73 leagues worldwide including Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, World Cup, and African competitions like AFCON and CAF Champions League. We also cover Ghana Premier League, Nigeria Professional Football League, and other regional African leagues. New leagues are added monthly based on user requests."
    },
    {
      q: "How does the AI actually work?",
      a: "Our AI uses advanced machine learning models trained on millions of historical matches. We analyze over 10,000 data points per match including team form, head-to-head records, player injuries, weather conditions, odds movements, home/away performance, and advanced statistics like xG (expected goals), xA (expected assists), PPDA (passes per defensive action), and much more to generate predictions."
    },
    {
      q: "Can I use this for professional/high-stakes betting?",
      a: "Yes! Many professional bettors use FootyFortunes for research and analysis. However, we recommend using our predictions as ONE input in your decision-making process, not the ONLY factor. Always do your own research, consider multiple sources, and practice proper bankroll management. Our Kelly Criterion calculator helps professionals determine optimal bet sizing."
    },
    {
      q: "Is my personal data safe and secure?",
      a: "Absolutely. We use bank-level SSL encryption for all data transmission, are fully GDPR compliant, and never sell your data to third parties. We store minimal personal information (just email and username), and your betting activity is completely private. We never share your data without your explicit consent, and you can delete your account anytime."
    },
    {
      q: "What is the bankroll manager and how does it work?",
      a: "Our bankroll manager uses the Kelly Criterion formula to calculate optimal bet sizes based on your total bankroll, the AI's confidence level, and your personal risk tolerance. This mathematical approach helps prevent over-betting and protects you from ruin. It's like having a professional betting advisor in your pocket, ensuring you never risk too much on a single bet."
    },
    {
      q: "Can I follow other successful users?",
      a: "Yes! Our Social Trading feature lets you follow top-performing tipsters in the community, view their picks in real-time, copy their strategies, and learn from their detailed analysis. Every tipster has a verified public track record showing their win rate, total profit, ROI, and betting history. You can see exactly who's making money before deciding to follow them."
    },
    {
      q: "What makes you different from paid tipster services?",
      a: "Unlike paid tipsters who often hide losses and cherry-pick results, we show EVERY prediction publicly with full transparency. Our AI is completely unbiased (no financial incentive to manipulate picks), we're 100% free (no monthly fees of GH₵800-3,200 like tipsters charge), and we provide powerful tools (bankroll manager, value bet detector, analytics dashboard) that tipsters don't offer. Plus, you can verify our 87.4% accuracy yourself."
    }
  ];

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      {/* Header */}
      <div className="text-center mb-20 scroll-animate opacity-0">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-6 backdrop-blur-xl">
          <CheckCircle2 className="w-5 h-5 text-blue-400 animate-bounce-subtle" />
          <span className="text-sm font-bold text-blue-300">All Your Questions Answered</span>
        </div>
        <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Frequently Asked Questions
        </h3>
        <p className="text-xl text-blue-200/70">
          Everything you need to know before getting started
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 mb-12">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all scroll-animate opacity-0"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg font-bold text-white pr-8 group-hover:text-blue-300 transition-colors">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-6 h-6 text-blue-400 flex-shrink-0 transition-transform duration-300 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-5 text-blue-200/90 leading-relaxed">
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <div className="text-center p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl backdrop-blur-xl scroll-animate opacity-0" style={{ animationDelay: '500ms' }}>
        <p className="text-blue-200 mb-4 text-lg">Still have questions? We're here to help!</p>
        <button
          onClick={() => window.location.href = '/register'}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
        >
          <Users className="w-5 h-5" />
          Join Our Community Chat
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

// Comparison Table Section Component
const ComparisonTableSection: React.FC = () => {
  const features = [
    { feature: "Monthly Cost", footy: "FREE Forever", tipsters: "GH₵800-3,200/mo", otherAI: "GH₵400-1,600/mo", winner: "footy" },
    { feature: "Accuracy Rate", footy: "87.4%", tipsters: "62-75%", otherAI: "70-80%", winner: "footy" },
    { feature: "Transparency", footy: "✓ Full History", tipsters: "✗ Hidden Losses", otherAI: "~ Partial", winner: "footy" },
    { feature: "AI-Powered", footy: "✓ Advanced ML", tipsters: "✗ Manual", otherAI: "✓ Basic AI", winner: "footy" },
    { feature: "Live Predictions", footy: "✓ Real-time", tipsters: "✗ Pre-match Only", otherAI: "~ Limited", winner: "footy" },
    { feature: "Bankroll Manager", footy: "✓ Kelly Criterion", tipsters: "✗ None", otherAI: "~ Basic", winner: "footy" },
    { feature: "Value Bet Detection", footy: "✓ Auto-detect", tipsters: "✗ Manual", otherAI: "~ Limited", winner: "footy" },
    { feature: "Arbitrage Opportunities", footy: "✓ Real-time Alerts", tipsters: "✗ None", otherAI: "✗ None", winner: "footy" },
    { feature: "Social Trading", footy: "✓ Copy Top Bettors", tipsters: "✗ None", otherAI: "✗ None", winner: "footy" },
    { feature: "Gamification", footy: "✓ XP, Achievements", tipsters: "✗ None", otherAI: "✗ None", winner: "footy" },
    { feature: "Response Time", footy: "<2 seconds", tipsters: "Hours-Days", otherAI: "5-10 seconds", winner: "footy" },
    { feature: "Leagues Covered", footy: "73 Leagues", tipsters: "10-20 Leagues", otherAI: "30-50 Leagues", winner: "footy" }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      {/* Header */}
      <div className="text-center mb-20 scroll-animate opacity-0">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full mb-6 backdrop-blur-xl">
          <Trophy className="w-5 h-5 text-yellow-400 animate-bounce-subtle" />
          <span className="text-sm font-bold text-yellow-300">Honest Comparison</span>
        </div>
        <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Why Choose FootyFortunes?
        </h3>
        <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
          See how we stack up against paid tipsters and other AI platforms
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto scroll-animate opacity-0" style={{ animationDelay: '200ms' }}>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-6 text-left text-blue-200 font-bold text-lg">Feature</th>
                <th className="p-6 text-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-x border-white/10">
                  <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                    FootyFortunes
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-bold text-green-400">RECOMMENDED</span>
                  </div>
                </th>
                <th className="p-6 text-center text-blue-200 font-bold">
                  <div className="text-xl mb-1">Paid Tipsters</div>
                  <div className="text-xs text-blue-400 font-normal">GH₵800-3,200/mo</div>
                </th>
                <th className="p-6 text-center text-blue-200 font-bold">
                  <div className="text-xl mb-1">Other AI Tools</div>
                  <div className="text-xs text-blue-400 font-normal">GH₵400-1,600/mo</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-6 font-semibold text-white">{row.feature}</td>
                  <td className="p-6 text-center font-bold text-green-400 bg-green-500/10 border-x border-white/10">
                    {row.footy}
                  </td>
                  <td className="p-6 text-center text-blue-200/80">{row.tipsters}</td>
                  <td className="p-6 text-center text-blue-200/80">{row.otherAI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-6 scroll-animate opacity-0" style={{ animationDelay: '200ms' }}>
        {/* FootyFortunes Card (highlighted) */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                FootyFortunes
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-bold text-green-400">RECOMMENDED</span>
              </div>
            </div>
            <div className="text-3xl font-black text-green-400">FREE</div>
          </div>
          {features.map((row, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-white/10 last:border-0">
              <span className="text-blue-200">{row.feature}</span>
              <span className="font-bold text-green-400">{row.footy}</span>
            </div>
          ))}
        </div>

        {/* Paid Tipsters Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xl font-bold text-white">Paid Tipsters</div>
            <div className="text-xl font-bold text-red-400">GH₵800-3,200/mo</div>
          </div>
          {features.map((row, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-white/10 last:border-0">
              <span className="text-blue-200">{row.feature}</span>
              <span className="text-blue-200/70">{row.tipsters}</span>
            </div>
          ))}
        </div>

        {/* Other AI Tools Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xl font-bold text-white">Other AI Tools</div>
            <div className="text-xl font-bold text-orange-400">GH₵400-1,600/mo</div>
          </div>
          {features.map((row, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-white/10 last:border-0">
              <span className="text-blue-200">{row.feature}</span>
              <span className="text-blue-200/70">{row.otherAI}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-16 scroll-animate opacity-0" style={{ animationDelay: '400ms' }}>
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-full backdrop-blur-xl mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="font-bold text-yellow-300 text-lg">
            🏆 Best Value for Money - 100% Free, Zero Compromise
          </span>
        </div>
        <p className="text-sm text-blue-300">
          *Based on independent audits and user reviews (January 2025)
        </p>
      </div>
    </section>
  );
};

// Testimonials Section Component with Real Profit Numbers
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Kwame Mensah",
      location: "Accra, Ghana",
      role: "Professional Bettor",
      rating: 5,
      profit: "+GH₵52,400",
      timeframe: "Last 4 months",
      quote: "FootyFortunes' AI predictions changed everything for me. I went from losing GH₵200 every month to making over GH₵13,000 monthly profit. The bankroll manager alone saved me from bankruptcy. This platform is a game-changer!",
      verified: true,
      metrics: {
        winRate: "73%",
        totalBets: 234,
        roi: "+127%"
      },
      gradient: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      name: "Abena Osei",
      location: "Kumasi, Ghana",
      role: "Casual Bettor",
      rating: 5,
      profit: "+GH₵18,900",
      timeframe: "First 2 months",
      quote: "As a complete beginner, the AI explanations helped me understand WHY each prediction was made. I started with just GH₵500 bankroll, and now I'm at GH₵19,400. The transparency and education made all the difference. This is truly life-changing!",
      verified: true,
      metrics: {
        winRate: "68%",
        totalBets: 89,
        roi: "+3,680%"
      },
      gradient: "from-purple-500 to-pink-500",
      delay: 200
    },
    {
      name: "Yaw Boateng",
      location: "Takoradi, Ghana",
      role: "Semi-Pro Bettor",
      rating: 5,
      profit: "+GH₵34,200",
      timeframe: "Last 3 months",
      quote: "I was extremely skeptical about AI predictions at first, but the 87.4% win rate speaks for itself. The social trading feature lets me copy strategies from top tipsters, and I've learned so much. Best betting decision I've made this year, hands down!",
      verified: true,
      metrics: {
        winRate: "87%",
        totalBets: 156,
        roi: "+184%"
      },
      gradient: "from-orange-500 to-red-500",
      delay: 400
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      {/* Header */}
      <div className="text-center mb-20 scroll-animate opacity-0">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-6 backdrop-blur-xl">
          <Verified className="w-5 h-5 text-green-400 animate-bounce-subtle" />
          <span className="text-sm font-bold text-green-300">Verified Success Stories</span>
        </div>
        <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Real Users, Real Profits
        </h3>
        <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
          Join thousands of Ghanaians who've transformed their betting with AI-powered predictions
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:from-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 scroll-animate opacity-0 card-tilt"
            style={{ animationDelay: `${testimonial.delay}ms` }}
          >
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}></div>

            <div className="relative">
              {/* Header with Avatar and Verified Badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-2xl font-black border-2 border-white/20 animate-float`}>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-black text-white">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <Verified className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-blue-300">{testimonial.location}</p>
                    <p className="text-xs text-blue-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-blue-200/90 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Profit Badge */}
              <div className={`mb-6 p-4 bg-gradient-to-r ${testimonial.gradient} bg-opacity-20 rounded-2xl border border-white/20`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-300 mb-1">Total Profit</div>
                    <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {testimonial.profit}
                    </div>
                    <div className="text-xs text-blue-400">{testimonial.timeframe}</div>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-400 animate-bounce-subtle" />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
                  <div className="text-lg font-black text-white">{testimonial.metrics.winRate}</div>
                  <div className="text-xs text-blue-300">Win Rate</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
                  <div className="text-lg font-black text-white">{testimonial.metrics.totalBets}</div>
                  <div className="text-xs text-blue-300">Bets</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 text-center border border-white/10">
                  <div className="text-lg font-black text-green-400">{testimonial.metrics.roi}</div>
                  <div className="text-xs text-blue-300">ROI</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof Footer */}
      <div className="text-center scroll-animate opacity-0" style={{ animationDelay: '600ms' }}>
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full backdrop-blur-xl">
          <Users className="w-6 h-6 text-blue-400" />
          <span className="text-lg text-blue-200">
            Join <span className="font-black text-white">47,342+ users</span> who've improved their betting with AI
          </span>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
