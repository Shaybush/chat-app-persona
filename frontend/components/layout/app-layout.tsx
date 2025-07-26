"use client";

import { useState, useEffect, ReactNode } from "react";
import { AlertCircle, CheckCircle, WifiOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { systemAPI } from "@/lib/api";
import { AdvancedLoadingDots } from "@/components/ui/advanced-loading-dots";

type HealthStatus = "unknown" | "healthy" | "error";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  error?: string | null;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function AppLayout({
  children,
  title = "Chat App",
  description = "AI-powered chat application",
  error = null,
  showHeader = true,
  showFooter = true,
}: AppLayoutProps) {
  const [health, setHealth] = useState<HealthStatus>("unknown");
  const [isOnline, setIsOnline] = useState(true);

  // Health monitoring
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await systemAPI.healthCheck();
        if (response.success) {
          setHealth("healthy");
        } else {
          setHealth("error");
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setHealth("error");
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const retryConnection = async () => {
    setHealth("unknown");
    try {
      const response = await systemAPI.healthCheck();
      if (response.success) {
        setHealth("healthy");
      } else {
        setHealth("error");
      }
    } catch (error) {
      setHealth("error");
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        {showHeader && (
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <HealthIndicator health={health} isOnline={isOnline} />
            </div>
          </header>
        )}

        {/* Global Error Alert */}
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Alert */}
        {!isOnline && (
          <Alert className="m-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Some features may not work properly.
            </AlertDescription>
          </Alert>
        )}

        {/* Server Error Alert */}
        {health === "error" && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Unable to connect to server. Please try again.</span>
              <Button variant="outline" size="sm" onClick={retryConnection}>
                <AdvancedLoadingDots
                  variant="pulse"
                  size="small"
                  color="gray"
                />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

        {/* Footer */}
        {showFooter && (
          <footer className="border-t bg-card px-6 py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>© 2024 Chat App. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <span>Status: {health}</span>
                <HealthIndicator health={health} isOnline={isOnline} />
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Toast notifications */}
      <Toaster />
    </ThemeProvider>
  );
}

// Health indicator component
function HealthIndicator({
  health,
  isOnline,
}: {
  health: HealthStatus;
  isOnline: boolean;
}) {
  const getIndicatorProps = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        className: "text-red-500",
        title: "Offline",
      };
    }

    switch (health) {
      case "healthy":
        return {
          icon: CheckCircle,
          className: "text-green-500",
          title: "Connected",
        };
      case "error":
        return {
          icon: AlertCircle,
          className: "text-red-500",
          title: "Connection Error",
        };
      case "unknown":
      default:
        return {
          icon: null,
          className: "",
          title: "Checking connection...",
        };
    }
  };

  const { icon: Icon, className, title } = getIndicatorProps();

  return (
    <div className="flex items-center gap-2">
      <div title={title}>
        {health === "unknown" ? (
          <AdvancedLoadingDots variant="pulse" size="small" color="gray" />
        ) : Icon ? (
          <Icon size={16} className={className} />
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {health === "healthy"
          ? "API"
          : health === "error"
          ? "API Down"
          : "Checking..."}
      </span>
    </div>
  );
}
