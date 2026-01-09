'use client';

import { useState } from 'react';
import {
  Settings,
  Palette,
  Bell,
  User,
  Shield,
  Keyboard,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AccentColorPicker } from '@/components/ui/accent-color-picker';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SettingsSection = 'appearance' | 'notifications' | 'account' | 'privacy' | 'shortcuts' | 'help';

const SECTIONS = [
  { id: 'appearance' as const, label: 'Appearance', icon: Palette, description: 'Theme, colors, and display' },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Email, push, and in-app' },
  { id: 'account' as const, label: 'Account', icon: User, description: 'Profile and preferences' },
  { id: 'privacy' as const, label: 'Privacy & Security', icon: Shield, description: 'Data and access control' },
  { id: 'shortcuts' as const, label: 'Keyboard Shortcuts', icon: Keyboard, description: 'Quick actions' },
  { id: 'help' as const, label: 'Help & Support', icon: HelpCircle, description: 'Documentation and contact' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  style={
                    isActive ? { color: 'var(--accent-color)', backgroundColor: 'var(--accent-color-light, rgba(59, 130, 246, 0.1))' } : undefined
                  }
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 transition-transform', isActive && 'rotate-90')} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="theme-card rounded-lg p-6">
            {activeSection === 'appearance' && <AppearanceSettings />}
            {activeSection === 'notifications' && <NotificationSettings />}
            {activeSection === 'account' && <AccountSettings />}
            {activeSection === 'privacy' && <PrivacySettings />}
            {activeSection === 'shortcuts' && <KeyboardShortcuts />}
            {activeSection === 'help' && <HelpSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Appearance</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Customize how TaskFlow looks and feels
        </p>
      </div>

      {/* Theme */}
      <section className="space-y-4">
        <h3 className="font-medium">Theme</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium">Color Mode</div>
            <div className="text-sm text-gray-500">
              Choose between light, dark, or system theme
            </div>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Accent Color */}
      <section className="space-y-4">
        <h3 className="font-medium">Accent Color</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mb-4">
            <div className="font-medium">Primary Color</div>
            <div className="text-sm text-gray-500">
              Choose your preferred accent color
            </div>
          </div>
          <AccentColorPicker />
        </div>
      </section>

      {/* Preview */}
      <section className="space-y-4">
        <h3 className="font-medium">Preview</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: 'var(--accent-color)' }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg font-medium border-2" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
              Secondary Button
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: 'var(--accent-color)' }} />
            <span style={{ color: 'var(--accent-color)' }}>Accent colored text</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account and profile information
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-medium">Profile</h3>
        <p className="text-sm text-gray-500">
          Update your profile settings from the{' '}
          <a href="/dashboard/profile" className="text-accent underline" style={{ color: 'var(--accent-color)' }}>
            profile page
          </a>
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-medium">Language & Region</h3>
        <p className="text-sm text-gray-500">Coming soon...</p>
      </section>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Privacy & Security</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Control your data and account security
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-medium">Data Privacy</h3>
        <p className="text-sm text-gray-500">
          Your data is stored securely and never shared with third parties.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-500">Coming soon...</p>
      </section>

      <section className="space-y-4">
        <h3 className="font-medium text-red-500">Danger Zone</h3>
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
          Delete Account
        </button>
      </section>
    </div>
  );
}

function KeyboardShortcuts() {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['⌘', 'N'], description: 'Create new task' },
    { keys: ['⌘', '/'], description: 'Toggle sidebar' },
    { keys: ['⌘', '.'], description: 'Toggle dark mode' },
    { keys: ['Esc'], description: 'Close modal/dialog' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'T'], description: 'Go to Tasks' },
    { keys: ['G', 'S'], description: 'Go to Settings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Keyboard Shortcuts</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Quick actions to boost your productivity
        </p>
      </div>

      <div className="space-y-2">
        {shortcuts.map((shortcut, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <span className="text-sm">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, i) => (
                <kbd
                  key={i}
                  className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Help & Support</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Get help and learn more about TaskFlow
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <a
          href="#"
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <h3 className="font-medium">Documentation</h3>
          <p className="text-sm text-gray-500 mt-1">
            Learn how to use all features
          </p>
        </a>
        <a
          href="#"
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <h3 className="font-medium">Contact Support</h3>
          <p className="text-sm text-gray-500 mt-1">
            Get help from our team
          </p>
        </a>
        <a
          href="#"
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <h3 className="font-medium">Report a Bug</h3>
          <p className="text-sm text-gray-500 mt-1">
            Help us improve TaskFlow
          </p>
        </a>
        <a
          href="#"
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <h3 className="font-medium">Request a Feature</h3>
          <p className="text-sm text-gray-500 mt-1">
            Suggest new features
          </p>
        </a>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">About</h3>
        <p className="text-sm text-gray-500">
          TaskFlow v1.0.0
          <br />
          Built with ❤️ using Next.js and NestJS
        </p>
      </section>
    </div>
  );
}
