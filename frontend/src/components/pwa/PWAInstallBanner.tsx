'use client';

import { X, Download, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

/**
 * PWA Install Banner
 * Shows when app is installable and not yet installed
 */
export function PWAInstallBanner() {
  const { t } = useTranslation();
  const { isInstallable, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      setDismissed(true);
    }
  };

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm
                 bg-[var(--card-bg)] border border-[var(--border-color)] 
                 rounded-lg shadow-lg p-4 z-50"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
          <Download className="h-6 w-6 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-[var(--text-primary)]">
            {t('pwa.installTitle', 'Install TaskFlow')}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('pwa.installDescription', 'Install the app for a better experience with offline access')}
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              {t('pwa.install', 'Install')}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              {t('common.later', 'Later')}
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          aria-label={t('common.close', 'Close')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Offline Indicator
 * Shows when the app is offline
 */
export function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 
                 py-2 px-4 text-center text-sm font-medium z-50"
      role="alert"
    >
      <WifiOff className="h-4 w-4 inline-block mr-2" />
      {t('pwa.offline', "You're offline. Some features may be limited.")}
    </div>
  );
}

export default PWAInstallBanner;
