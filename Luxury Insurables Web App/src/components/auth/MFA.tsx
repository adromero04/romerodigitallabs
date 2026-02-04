import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Smartphone, Shield, RefreshCw } from 'lucide-react';
import logoImage from 'figma:asset/51f21a09e93d6ea7b75bcf72b75a682d747abab7.png';

interface MFAProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function MFA({ onSuccess, onBack }: MFAProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [method, setMethod] = useState<'sms' | 'app'>('sms');
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      setTimeout(() => onSuccess(), 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => setIsResending(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
            <Shield className="w-8 h-8 text-cyan-500" />
          </div>
          <h2 className="text-white text-xl mb-2">Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm">
            {method === 'sms' 
              ? 'Enter the 6-digit code sent to your mobile device'
              : 'Enter the code from your authenticator app'
            }
          </p>
        </div>

        {/* Code input */}
        <div className="flex gap-2 mb-8 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Method switcher */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMethod('sms')}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
              method === 'sms'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Smartphone className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs">SMS Code</div>
          </button>
          <button
            onClick={() => setMethod('app')}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
              method === 'app'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Shield className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs">Auth App</div>
          </button>
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={isResending}
          className="flex items-center justify-center gap-2 text-sm text-cyan-500 hover:text-cyan-400 disabled:text-slate-600"
        >
          <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Sending...' : 'Resend code'}
        </button>
      </div>

      {/* Security note */}
      <div className="mt-8 space-y-4">
        <div className="text-center text-xs text-slate-500">
          For your security, you'll be asked to verify your identity each time you sign in
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