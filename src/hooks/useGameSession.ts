import { useState, useEffect, useCallback } from 'react';
import { GameSession, TreasureHunt, User, Clue } from '../types';

export const useGameSession = (hunt: TreasureHunt, user: User) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize or load existing session
  useEffect(() => {
    const savedSession = localStorage.getItem(`game_session_${hunt.id}_${user.id}`);
    
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
      setCurrentClue(hunt.clues[parsedSession.currentClueIndex] || null);
      setTimeElapsed(parsedSession.timeSpent || 0);
    } else {
      const newSession: GameSession = {
        id: `${hunt.id}_${user.id}_${Date.now()}`,
        huntId: hunt.id,
        userId: user.id,
        startedAt: new Date().toISOString(),
        currentClueIndex: 0,
        score: 0,
        status: 'active',
        completedClues: [],
        timeSpent: 0,
        hintsUsed: 0,
      };
      
      setSession(newSession);
      setCurrentClue(hunt.clues[0] || null);
      localStorage.setItem(`game_session_${hunt.id}_${user.id}`, JSON.stringify(newSession));
    }
  }, [hunt.id, user.id, hunt.clues]);

  // Timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        if (session) {
          const updatedSession = { ...session, timeSpent: newTime };
          setSession(updatedSession);
          localStorage.setItem(`game_session_${hunt.id}_${user.id}`, JSON.stringify(updatedSession));
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, hunt.id, user.id]);

  const completeClue = useCallback((clueId: string, points: number) => {
    if (!session) return;

    const updatedSession = {
      ...session,
      completedClues: [...session.completedClues, clueId],
      score: session.score + points,
      currentClueIndex: session.currentClueIndex + 1,
    };

    // Check if hunt is completed
    if (updatedSession.currentClueIndex >= hunt.clues.length) {
      updatedSession.status = 'completed';
      updatedSession.completedAt = new Date().toISOString();
    }

    setSession(updatedSession);
    setCurrentClue(hunt.clues[updatedSession.currentClueIndex] || null);
    localStorage.setItem(`game_session_${hunt.id}_${user.id}`, JSON.stringify(updatedSession));
  }, [session, hunt.clues, hunt.id, user.id]);

  const useHint = useCallback(() => {
    if (!session) return;

    const updatedSession = {
      ...session,
      hintsUsed: session.hintsUsed + 1,
      score: Math.max(0, session.score - 10), // Penalty for using hint
    };

    setSession(updatedSession);
    localStorage.setItem(`game_session_${hunt.id}_${user.id}`, JSON.stringify(updatedSession));
  }, [session, hunt.id, user.id]);

  const abandonSession = useCallback(() => {
    if (!session) return;

    const updatedSession = {
      ...session,
      status: 'abandoned' as const,
    };

    setSession(updatedSession);
    localStorage.setItem(`game_session_${hunt.id}_${user.id}`, JSON.stringify(updatedSession));
  }, [session, hunt.id, user.id]);

  return {
    session,
    currentClue,
    timeElapsed,
    completeClue,
    useHint,
    abandonSession,
  };
};