import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import logoImage from 'figma:asset/51f21a09e93d6ea7b75bcf72b75a682d747abab7.png';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-12">
      {/* Logo area */}
      <div className="flex-shrink-0 text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
          <Shield className="w-8 h-8 text-cyan-500" />
        </div>
        <h1 className="text-white text-2xl mb-2">Luxury Insurables</h1>
        <p className="text-slate-400 text-sm">Secure asset management</p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#009FB8' }}
          >
            Continue
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-cyan-500 hover:text-cyan-400">
              Forgot password?
            </a>
          </div>
        </form>
      </div>

      {/* Trust indicators */}
      <div className="flex-shrink-0 mt-12 space-y-4">
        <div className="flex items-start gap-3 text-sm text-slate-400 justify-center text-center">
          <p>
            Your data is encrypted end-to-end and stored securely. We never share your information without your explicit consent.
          </p>
        </div>
        <div className="text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
        
        {/* Logo */}
        <div className="flex justify-center pt-2">
          <img 
            src={logoImage} 
            alt="Luxury Insurables" 
            className="w-[100px] h-auto opacity-60"
          />
        </div>
      </div>
    </div>
  );
}