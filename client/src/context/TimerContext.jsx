import React, { createContext, useContext, useState, useEffect } from 'react';
import { timeLogApi } from '../services/api';
import confetti from 'canvas-confetti';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchActive = async () => {
    try {
      const res = await timeLogApi.getActive();
      if (res.data.success && res.data.activeSession) {
        setActiveSession(res.data.activeSession);
        const startedAt = new Date(res.data.activeSession.startTime).getTime();
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
      } else {
        setActiveSession(null);
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('Failed to fetch active timer:', err);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  // Timer ticker
  useEffect(() => {
    let interval = null;
    if (activeSession) {
      interval = setInterval(() => {
        const startedAt = new Date(activeSession.startTime).getTime();
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const startSession = async (taskId, scheduleEventId = null, notes = '') => {
    const res = await timeLogApi.startTimer({ taskId, scheduleEventId, notes });
    if (res.data.success) {
      setActiveSession(res.data.session);
      setElapsedSeconds(0);
      return res.data.session;
    }
  };

  const stopSession = async (markCompleted = false) => {
    if (!activeSession) return;
    const res = await timeLogApi.stopTimer(activeSession._id, { markCompleted });
    if (res.data.success) {
      if (markCompleted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      setActiveSession(null);
      setElapsedSeconds(0);
      return res.data;
    }
  };

  const formatTime = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider
      value={{
        activeSession,
        elapsedSeconds,
        formattedElapsed: formatTime(elapsedSeconds),
        startSession,
        stopSession,
        fetchActive,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
