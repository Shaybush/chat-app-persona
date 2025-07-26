"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BaseComponentProps } from "@/types";

interface AppLayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  loading?: boolean;
  error?: string | null;
}

interface HeaderProps {
  title: string;
  description?: string;
}

function Header({ title, description }: HeaderProps) {
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Add optional header actions here */}
        <div className="flex items-center gap-2">
          {/* Health indicator */}
          <HealthIndicator />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} Persona Chat. Built with Next.js,
        TypeScript, and Tailwind CSS.
      </p>
    </footer>
  );
}

function HealthIndicator() {
  const [health, setHealth] = useState<"unknown" | "healthy" | "error">(
    "unknown"
  );

  useEffect(() => {
    // Check API health on component mount
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setHealth("healthy");
        } else {
          setHealth("error");
        }
      } catch {
        setHealth("error");
      }
    };

    checkHealth();
  }, []);

  const getIndicatorProps = () => {
    switch (health) {
      case "healthy":
        return {
          icon: CheckCircle,
          className: "text-green-500",
          title: "API is healthy",
        };
      case "error":
        return {
          icon: AlertCircle,
          className: "text-red-500",
          title: "API has issues",
        };
      default:
        return {
          icon: Loader2,
          className: "text-muted-foreground animate-spin",
          title: "Checking API health...",
        };
    }
  };

  const { icon: Icon, className, title } = getIndicatorProps();

  return (
    <div className="flex items-center gap-2">
      <div title={title}>
        <Icon size={16} className={className} />
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

interface LoadingOverlayProps {
  message?: string;
}

function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Something went wrong</p>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred. Please refresh the page to try
                  again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-primary hover:underline"
                >
                  Refresh page
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AppLayout({
  children,
  title = "Persona Chat",
  description,
  showHeader = true,
  showFooter = false,
  loading = false,
  error = null,
  className = "",
}: AppLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        <div
          className={`min-h-screen flex flex-col bg-background ${className}`}
        >
          {showHeader && <Header title={title} description={description} />}

          <main className="flex-1 relative">
            {loading && <LoadingOverlay />}

            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {children}
          </main>

          {showFooter && <Footer />}

          {/* Global toast notifications */}
          <Toaster position="top-right" />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
