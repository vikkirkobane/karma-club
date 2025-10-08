import React, { Suspense, lazy } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserStatsProvider } from '@/contexts/UserStatsContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { OfflineIndicator } from '@/components/OfflineIndicator-simple';
import { Spinner } from '@/components/ui/spinner';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const KarmaClub = lazy(() => import('./pages/KarmaClub'));
const KarmaClubSimple = lazy(() => import('./pages/KarmaClub-Simple'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const LevelProgression = lazy(() => import('./pages/LevelProgression'));
const Community = lazy(() => import('./pages/Community'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lightweight loading fallback for page transitions
const PageLoader = () => (
  <div className="min-h-screen bg-[#121212] flex items-center justify-center">
    <Spinner size="lg" withLogo={true} />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  const { processQueue, queue } = useOfflineQueue();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserStatsProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              {/* Offline Indicator */}
              <OfflineIndicator 
                onRetry={processQueue} 
                showSyncStatus={queue.length > 0}
              />
              
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/karma-club" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <KarmaClubSimple />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/karma-club-full" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <KarmaClub />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/levels" element={
                  <ProtectedRoute>
                    <LevelProgression />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
          </UserStatsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;