import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Zap } from 'lucide-react';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      try {
        await login('demo@myschedule.app', 'Password123!');
      } catch {
        await register('Blessy', 'demo@myschedule.app', 'Password123!');
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ambient-bg text-[#26324A] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B7BE8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#8FA8E8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md pastel-card p-6 sm:p-8 bg-[#FFFFFF] border-[#E2DCF7] shadow-popover relative z-10 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8B7BE8] to-[#7A68DE] text-white shadow-button mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#26324A]">
            MySchedule
          </h1>
          <p className="text-xs text-[#718096] font-medium">
            Intelligent Personal Scheduler & Productivity Platform
          </p>
        </div>

        {/* Demo Account Quick Access */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E4F7F0] hover:bg-[#D4F4E8] border border-[#BCECD9] text-[#1E7B58] text-xs font-bold transition-all shadow-xs"
          >
            <Zap className="w-4 h-4 text-[#1E7B58] fill-current" />
            <span>Instant Demo Experience (1-Click)</span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#F0EDF9]" />
          <span className="px-3 text-[10px] text-[#9AA5B8] uppercase font-bold tracking-wider">or email access</span>
          <div className="flex-1 border-t border-[#F0EDF9]" />
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-[#FAF9FD] p-1 border border-[#EAE7F5] mb-5">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isLogin ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]' : 'text-[#718096] hover:text-[#26324A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]' : 'text-[#718096] hover:text-[#26324A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#F7C8C8] text-xs text-[#9E3B3B] font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9AA5B8] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Blessy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] placeholder-[#9AA5B8] text-xs font-medium focus:outline-none focus:border-[#8B7BE8]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9AA5B8] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] placeholder-[#9AA5B8] text-xs font-medium focus:outline-none focus:border-[#8B7BE8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9AA5B8] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] placeholder-[#9AA5B8] text-xs font-medium focus:outline-none focus:border-[#8B7BE8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-primary-pastel flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold shadow-button disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In to Workspace' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
