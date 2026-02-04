import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Lock, 
  Smartphone, 
  Bell, 
  FileText, 
  LogOut,
  Eye,
  Clock
} from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export function Settings({ onBack, onLogout }: SettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingsSections = [
    {
      title: 'Security',
      icon: Shield,
      items: [
        {
          icon: Lock,
          label: 'Change Password',
          description: 'Update your account password',
          action: 'navigate',
        },
        {
          icon: Smartphone,
          label: 'Two-Factor Authentication',
          description: 'Manage MFA settings',
          action: 'navigate',
          badge: 'Active',
          badgeColor: 'bg-emerald-100 text-emerald-700',
        },
        {
          icon: Clock,
          label: 'Session Timeout',
          description: 'Auto-logout after 15 minutes',
          action: 'navigate',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          icon: Bell,
          label: 'Email Notifications',
          description: 'Updates about your assets',
          action: 'toggle',
          enabled: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
      ],
    },
    {
      title: 'Privacy & Legal',
      icon: FileText,
      items: [
        {
          icon: Eye,
          label: 'Privacy Policy',
          description: 'How we protect your data',
          action: 'navigate',
        },
        {
          icon: FileText,
          label: 'Terms of Service',
          description: 'Service agreement',
          action: 'navigate',
        },
        {
          icon: Shield,
          label: 'Data Protection',
          description: 'Your data rights & security',
          action: 'navigate',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          <h1 className="text-slate-900 mt-4">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Account info */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white">
              JD
            </div>
            <div>
              <h3 className="text-slate-900">John Doe</h3>
              <p className="text-sm text-slate-600">john.doe@example.com</p>
            </div>
          </div>
        </div>

        {/* Settings sections */}
        {settingsSections.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          return (
            <div key={sectionIndex}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <SectionIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm text-slate-600 uppercase tracking-wide">
                  {section.title}
                </h2>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-200">
                {section.items.map((item, itemIndex) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={itemIndex} className="p-4">
                      {item.action === 'toggle' ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <ItemIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={item.onToggle}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              item.enabled ? 'bg-cyan-600' : 'bg-neutral-300'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                item.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <button className="w-full flex items-center justify-between text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <ItemIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-900">{item.label}</p>
                                {item.badge && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${item.badgeColor}`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Privacy notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <h3 className="text-sm text-blue-900">Your Privacy Matters</h3>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Luxury Insurables uses bank-level encryption to protect your data. We never share your information without explicit consent. Your asset details are private and accessible only to you and your designated NFP account manager.
          </p>
        </div>

        {/* Important notice about PII */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
            <h3 className="text-sm text-cyan-900">Data Use Policy</h3>
          </div>
          <p className="text-xs text-cyan-800 leading-relaxed">
            This platform is designed for insurance servicing and asset cataloging. Please avoid uploading sensitive personal information (SSN, financial account numbers, etc.) that is not directly related to insuring these assets.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-white border border-neutral-200 rounded-lg p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        {/* App version */}
        <div className="text-center text-xs text-slate-500">
          Version 1.0.0 • Luxury Insurables by NFP
        </div>
      </div>
    </div>
  );
}