import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as { standalone?: boolean }).standalone ||
                           document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    // Check if app is already installed via localStorage
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    setIsInstalled(wasInstalled || isStandaloneMode);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      console.log('[PWA] Install prompt available');

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
  };
}