import React, { useState } from 'react';
import { Shield, Camera, Bell, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: () => void;
}

const screens = [
  {
    icon: Shield,
    title: 'Welcome to Luxury Insurables',
    description: 'A secure, private space to catalog your valuable assets and view coverage details.',
    note: 'Your data is encrypted and never shared without your permission.',
  },
  {
    icon: Camera,
    title: 'Document Your Assets',
    description: 'Add photos and details for vehicles, jewelry, art, collectibles, and more.',
    note: 'Important: Adding an item here does not automatically provide insurance coverage.',
    isWarning: true,
  },
  {
    icon: Bell,
    title: 'Stay Informed',
    description: 'View insurance details for each asset, including coverage limits and policy status.',
    note: 'Your NFP account manager will be notified when you add or update assets.',
  },
  {
    icon: CheckCircle,
    title: "You're All Set",
    description: 'Start by adding your first asset to begin building your catalog.',
    note: 'You can update or remove assets anytime.',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const current = screens[currentStep];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-12">
      {/* Progress indicators */}
      <div className="flex gap-2 mb-12">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded-full transition-colors ${
              index <= currentStep ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 mb-6">
            <Icon className="w-10 h-10 text-cyan-500" />
          </div>

          <h2 className="text-white text-2xl mb-4">{current.title}</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">{current.description}</p>

          <div
            className={`p-4 rounded-lg ${
              current.isWarning
                ? 'bg-cyan-500/10 border border-cyan-500/30'
                : 'bg-slate-800/50 border border-slate-700'
            }`}
          >
            <p
              className={`text-sm ${
                current.isWarning ? 'text-cyan-200' : 'text-slate-400'
              }`}
            >
              {current.note}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 space-y-3">
        <button
          onClick={handleNext}
          className="w-full py-3 text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#009FB8' }}
        >
          {currentStep < screens.length - 1 ? 'Continue' : 'Get Started'}
        </button>

        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full py-3 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}