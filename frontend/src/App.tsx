import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { initTelegramApp } from '@/lib/telegram';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Mining = lazy(() => import('@/pages/Mining'));
const Upgrades = lazy(() => import('@/pages/Upgrades'));
const Referrals = lazy(() => import('@/pages/Referrals'));
const DailyRewards = lazy(() => import('@/pages/DailyRewards'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 2,
    },
  },
});

function AppContent() {
  const { login, isLoggingIn, isLoading, isAuthenticated, loginError } = useAuth();

  useEffect(() => {
    initTelegramApp();
    login().catch(console.error);
  }, [login]);

  if (isLoggingIn || isLoading) {
    return <LoadingScreen message="Connecting to TRON Miner..." />;
  }

  if (loginError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6 text-center">
        <p className="text-tron-red text-lg font-bold mb-2">Connection Failed</p>
        <p className="text-text-secondary text-sm">
          {(loginError as Error).message || 'Unable to authenticate. Please try again.'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mining" element={<Mining />} />
          <Route path="upgrades" element={<Upgrades />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="daily" element={<DailyRewards />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
