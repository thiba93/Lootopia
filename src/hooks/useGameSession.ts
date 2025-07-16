import { useState, useEffect, useCallback } from 'react';
import { GameSession, TreasureHunt, User, Clue } from '../types';
import { db } from '../lib/supabase';

export const useGameSession = (hunt: TreasureHunt, user: User) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize or load existing session
  useEffect(() => {
    const loadOrCreateSession = async () => {
      try {
        setLoading(true);
        
        // Try to get existing active session
        const { data: existingSession, error } = await db.getGameSession(user.id, hunt.id);
        
        if (existingSession && !error) {
          // Load existing session
          const sessionData: GameSession = {
            id: existingSession.id,
            huntId: existingSession.hunt_id,
            userId: existingSession.user_id,
            startedAt: existingSession.started_at,
            completedAt: existingSession.completed_at,
            currentClueIndex: existingSession.current_clue_index,
            score: existingSession.score,
            status: existingSession.status,
            completedClues: existingSession.completed_clues,
            timeSpent: existingSession.time_spent,
            hintsUsed: existingSession.hints_used,
          };
          
          setSession(sessionData);
          setCurrentClue(hunt.clues[sessionData.currentClueIndex] || null);
          setTimeElapsed(sessionData.timeSpent);
        } else {
          // Create new session
          const newSessionData = {
            hunt_id: hunt.id,
            user_id: user.id,
            current_clue_index: 0,
            score: 0,
            status: 'active' as const,
            completed_clues: [],
            time_spent: 0,
            hints_used: 0,
          };
          
          const { data: createdSession, error: createError } = await db.createGameSession(newSessionData);
          
          if (createError) {
            console.error('Error creating game session:', createError);
            return;
          }
          
          if (createdSession) {
            const sessionData: GameSession = {
              id: createdSession.id,
              huntId: createdSession.hunt_id,
              userId: createdSession.user_id,
              startedAt: createdSession.started_at,
              completedAt: createdSession.completed_at,
              currentClueIndex: createdSession.current_clue_index,
              score: createdSession.score,
              status: createdSession.status,
              completedClues: createdSession.completed_clues,
              timeSpent: createdSession.time_spent,
              hintsUsed: createdSession.hints_used,
            };
            
            setSession(sessionData);
            setCurrentClue(hunt.clues[0] || null);
            setTimeElapsed(0);
          }
        }
      } catch (error) {
        console.error('Error loading/creating game session:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hunt.id && user.id) {
      loadOrCreateSession();
    }
  }, [hunt.id, user.id, hunt.clues]);

  // Timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  // Update session in database periodically
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const updateInterval = setInterval(async () => {
      try {
        await db.updateGameSession(session.id, {
          time_spent: timeElapsed,
          current_clue_index: session.currentClueIndex,
          score: session.score,
          completed_clues: session.completedClues,
          hints_used: session.hintsUsed,
        });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [session, timeElapsed]);
  const completeClue = useCallback((clueId: string, points: number) => {
    if (!currentClue || !session) return;

    const updatedSession: GameSession = {
      ...session,
      completedClues: [...session.completedClues, clueId],
      score: session.score + points,
      currentClueIndex: session.currentClueIndex + 1,
      timeSpent: timeElapsed,
    };

    // Check if hunt is completed
    if (updatedSession.currentClueIndex >= hunt.clues.length) {
      updatedSession.status = 'completed';
      updatedSession.completedAt = new Date().toISOString();
    }

    setSession(updatedSession);
    setCurrentClue(hunt.clues[updatedSession.currentClueIndex] || null);
    
    // Update in database
    db.updateGameSession(session.id, {
      completed_clues: updatedSession.completedClues,
      score: updatedSession.score,
      current_clue_index: updatedSession.currentClueIndex,
      status: updatedSession.status,
      completed_at: updatedSession.completedAt,
      time_spent: timeElapsed,
    }).catch(error => {
      console.error('Error updating session after clue completion:', error);
    });
  }, [session, hunt.clues, timeElapsed]);

  const useHint = useCallback(() => {
    if (!session) return;

    const updatedSession: GameSession = {
      ...session,
      hintsUsed: session.hintsUsed + 1,
      score: Math.max(0, session.score - 10), // Penalty for using hint
      timeSpent: timeElapsed,
    };

    setSession(updatedSession);
    
    // Update in database
    db.updateGameSession(session.id, {
      hints_used: updatedSession.hintsUsed,
      score: updatedSession.score,
      time_spent: timeElapsed,
    }).catch(error => {
      console.error('Error updating session after hint use:', error);
    });
  }, [session, timeElapsed]);

  const abandonSession = useCallback(() => {
    if (!session) return;

    const updatedSession: GameSession = {
      ...session,
      status: 'abandoned' as const,
      timeSpent: timeElapsed,
    };

    setSession(updatedSession);
    
    // Update in database
    db.updateGameSession(session.id, {
      status: 'abandoned',
      time_spent: timeElapsed,
    }).catch(error => {
      console.error('Error updating session after abandon:', error);
    });
  }, [session, timeElapsed]);

  return {
    session,
    currentClue,
    timeElapsed,
    loading,
    completeClue,
    useHint,
    abandonSession,
  };
};