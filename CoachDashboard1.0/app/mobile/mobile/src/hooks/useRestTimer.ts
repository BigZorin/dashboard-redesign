import { useState, useRef, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export function useRestTimer() {
  const [state, setState] = useState<TimerState>('idle');
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setState('running');

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setState('finished');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (state === 'running') {
      clearTimer();
      setState('paused');
    }
  }, [state, clearTimer]);

  const resume = useCallback(() => {
    if (state === 'paused' && remaining > 0) {
      setState('running');
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setState('finished');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [state, remaining, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState('idle');
    setTotalSeconds(0);
    setRemaining(0);
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    setState('finished');
    setRemaining(0);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  return {
    state,
    remaining,
    totalSeconds,
    progress,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
