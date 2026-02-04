import React from 'react';
import { Clock, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface SessionTimeoutProps {
  onDismiss: () => void;
}

export function SessionTimeout({ onDismiss }: SessionTimeoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 text-center max-w-sm"
      >
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-cyan-600" />
        </div>
        <h3 className="text-slate-900 mb-2">Session Expired</h3>
        <p className="text-sm text-slate-600 mb-6">
          For your security, you've been signed out after 15 minutes of inactivity. Please sign in again to continue.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 text-white rounded-lg transition-colors mb-3"
          style={{ backgroundColor: '#009FB8' }}
        >
          Sign In Again
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-3 h-3" />
          <span>Your data remains secure</span>
        </div>
      </motion.div>
    </motion.div>
  );
}