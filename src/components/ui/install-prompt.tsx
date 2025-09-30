import { useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';

export function InstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('pwa-prompt-dismissed') === 'true';
  });

  if (!isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 shadow-lg z-50 border-primary animate-in slide-in-from-bottom-5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Install Flight Sync
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add to your home screen for quick access and offline support
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                Maybe Later
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// PWA Status Indicator (optional, for debugging)
export function PWAStatusIndicator() {
  const { isInstalled, isStandalone } = usePWA();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 text-xs bg-black text-white px-2 py-1 rounded opacity-50">
      PWA: {isInstalled ? '✅ Installed' : '⏳ Not Installed'}
      {isStandalone && ' | 📱 Standalone'}
    </div>
  );
}