import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FamilyAuthProvider } from "@/contexts/FamilyAuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InstallPrompt } from "@/components/ui/install-prompt";
import NotFound from "./pages/NotFound";

// Lazy load main pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Print = lazy(() => import("./pages/Print"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retries to prevent multiple error states
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: false,
      throwOnError: false, // Prevent errors from throwing to error boundary
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      throwOnError: false, // Handle errors gracefully
    },
  },
});

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <FamilyAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/print"
                  element={
                    <ProtectedRoute>
                      <Print />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </FamilyAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
