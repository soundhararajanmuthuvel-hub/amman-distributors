import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker safely
    if ("serviceWorker" in navigator && process.env["NODE_ENV"] === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("PWA ServiceWorker registered with scope:", registration.scope);
          },
          (err) => {
            console.warn("PWA ServiceWorker registration failed:", err);
          }
        );
      });
    }

    // 2. Check if already running in standalone mode (installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 3. Listen for browser install availability event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!deferredPrompt || isDismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 lg:bottom-6 lg:right-6 lg:left-auto">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Download className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Install Amman Distributors</p>
            <p className="text-xs text-muted-foreground">Add to home screen for fast access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
