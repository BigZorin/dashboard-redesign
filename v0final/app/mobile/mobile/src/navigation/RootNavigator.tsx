import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { userKeys } from '../hooks/useUser';
import { workoutKeys } from '../hooks/useWorkouts';
import { checkInKeys } from '../hooks/useCheckIn';
import { dailyCheckInKeys } from '../hooks/useDailyCheckIn';
import { habitKeys } from '../hooks/useHabits';
import { fetchHabits } from '../lib/habitApi';
import { fetchIntakeForm } from '../lib/intakeApi';
import { fetchWorkouts } from '../lib/api';
import { registerForPushNotifications, removePushToken } from '../lib/pushNotifications';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import IntakeFormScreen from '../screens/Onboarding/IntakeFormScreen';
import PendingApprovalScreen from '../screens/Onboarding/PendingApprovalScreen';

type ClientStatus = 'pending' | 'approved' | 'rejected' | null;

export default function RootNavigator() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [intakeCompleted, setIntakeCompleted] = useState<boolean | null>(null);
  const [clientStatus, setClientStatus] = useState<ClientStatus>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch client_status from profiles
  const fetchClientStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('client_status, rejection_reason')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        // Column might not exist yet — fallback to approved
        setClientStatus('approved');
        return;
      }

      const status = (data.client_status || 'approved') as ClientStatus;
      setClientStatus(status);
      setRejectionReason(data.rejection_reason || null);
    } catch {
      // Fallback: don't block existing users
      setClientStatus('approved');
    }
  }, []);

  // Start/stop polling based on status
  useEffect(() => {
    if (clientStatus && clientStatus !== 'approved' && session) {
      // Poll every 10 seconds
      pollIntervalRef.current = setInterval(fetchClientStatus, 10000);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [clientStatus, session, fetchClientStatus]);

  // Prefetch key data when user authenticates
  const prefetchData = () => {
    // These run in parallel, non-blocking
    queryClient.prefetchQuery({
      queryKey: userKeys.profile(),
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const [profileResult, roleResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('users').select('role').eq('id', user.id).single(),
        ]);
        return {
          id: user.id,
          email: user.email || '',
          profile: profileResult.data,
          role: roleResult.data?.role || 'CLIENT',
        };
      },
    });
    queryClient.prefetchQuery({
      queryKey: workoutKeys.list('all'),
      queryFn: () => fetchWorkouts('all'),
    });
    queryClient.prefetchQuery({
      queryKey: checkInKeys.current(),
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        const { data } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_number', weekNumber)
          .eq('year', now.getFullYear())
          .maybeSingle();
        return data;
      },
    });
    queryClient.prefetchQuery({
      queryKey: dailyCheckInKeys.today(),
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const { data, error } = await supabase
          .from('daily_check_ins')
          .select('*')
          .eq('user_id', user.id)
          .eq('check_in_date', today)
          .maybeSingle();
        if (error) return null;
        return data;
      },
    });
    queryClient.prefetchQuery({
      queryKey: habitKeys.list(),
      queryFn: fetchHabits,
    });
    // Check intake form completion, then client status
    fetchIntakeForm()
      .then((form) => {
        const completed = form?.completedAt != null;
        setIntakeCompleted(completed);
        if (completed) {
          fetchClientStatus();
        }
      })
      .catch((err) => {
        const msg = String(err?.message || err || '');
        if (msg.includes('does not exist') || msg.includes('relation')) {
          // Table doesn't exist yet — skip intake gate (backwards compat)
          setIntakeCompleted(true);
          fetchClientStatus();
        } else {
          // RLS or other error — require intake to be safe
          setIntakeCompleted(false);
        }
      });

    // Register push notification token
    registerForPushNotifications().catch((err) => {
      console.log('Push token registration skipped:', err);
    });
  };

  useEffect(() => {
    // Check huidige sessie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) prefetchData();
    });

    // Luister naar auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          prefetchData();
        } else {
          // Remove push token and clear cached data on logout
          removePushToken().catch(() => {});
          queryClient.clear();
          setIntakeCompleted(null);
          setClientStatus(null);
          setRejectionReason(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Authenticated but intake not yet completed
  if (session && intakeCompleted === false) {
    return (
      <SafeAreaProvider>
        <IntakeFormScreen
          onComplete={() => {
            setIntakeCompleted(true);
            fetchClientStatus();
          }}
        />
      </SafeAreaProvider>
    );
  }

  // Authenticated + intake done, but pending/rejected
  if (session && intakeCompleted && clientStatus && clientStatus !== 'approved') {
    return (
      <SafeAreaProvider>
        <PendingApprovalScreen
          status={clientStatus as 'pending' | 'rejected'}
          rejectionReason={rejectionReason}
          onLogout={handleLogout}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
