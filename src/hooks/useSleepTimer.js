import { useState, useCallback, useRef, useEffect } from 'react';

export function useSleepTimer(onTimerEnd) {
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);
  const onEndRef = useRef(null);

  useEffect(() => {
    onEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSleepMinutes(0);
    setRemaining(0);
  }, []);

  const start = useCallback((minutes) => {
    stop();
    setSleepMinutes(minutes);
    setRemaining(minutes * 60);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          stop();
          onEndRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const toggle = useCallback((minutes) => {
    if (sleepMinutes === minutes) {
      stop();
    } else {
      start(minutes);
    }
  }, [sleepMinutes, start, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const label = remaining > 0
    ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
    : '';

  return { sleepMinutes, remaining, label, start, stop, toggle };
}
