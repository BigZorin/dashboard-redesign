import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

// Create a QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,       // 30s before data is considered stale
      gcTime: 5 * 60 * 1000,      // 5 min garbage collection
      refetchOnReconnect: true,
    },
  },
});

// Refetch queries when app comes to foreground (React Native equivalent of window focus)
function useAppStateRefetch() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });
    return () => subscription.remove();
  }, []);
}

function AppInner() {
  useAppStateRefetch();
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
