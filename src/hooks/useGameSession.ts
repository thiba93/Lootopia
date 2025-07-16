import { useState, useEffect, useCallback } from 'react';
import { GameSession, TreasureHunt, User, Clue } from '../types';
import { supabase } from '../lib/supabase';

export const useGameSession = (hunt: TreasureHunt, user: User) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize or load existing session
  useEffect(() => {
    let mounted = true;
    
    const loadOrCreateSession = async () => {
      if (!hunt?.id || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Chargement session pour:', hunt.title);
        
        // Try to get existing active session
        const { data: existingSession, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('hunt_id', hunt.id)
          .eq('status', 'active')
          .single();
        
        if (!mounted) return;

        if (existingSession && !error) {
          console.log('✅ Session existante trouvée');
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
            completedClues: existingSession.completed_clues || [],
            timeSpent: existingSession.time_spent,
            hintsUsed: existingSession.hints_used,
          };
          
          setSession(sessionData);
          setCurrentClue(hunt.clues[sessionData.currentClueIndex] || null);
          setTimeElapsed(sessionData.timeSpent);
        } else {
          console.log('🆕 Création nouvelle session');
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
          
          const { data: createdSession, error: createError } = await supabase
            .from('game_sessions')
            .insert(newSessionData)
            .select()
            .single();
          
          if (!mounted) return;
          
          if (createError) {
            console.error('❌ Erreur création session:', createError);
            setLoading(false);
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
              completedClues: createdSession.completed_clues || [],
              timeSpent: createdSession.time_spent,
              hintsUsed: createdSession.hints_used,
            };
            
            setSession(sessionData);
            setCurrentClue(hunt.clues[0] || null);
            setTimeElapsed(0);
            console.log('✅ Session créée:', sessionData.id);
          }
        }
      } catch (error) {
        console.error('❌ Erreur session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrCreateSession();
    
    return () => {
      mounted = false;
    };
  }, [hunt?.id, user?.id]);

  // Timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  // Update session in database periodically
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const updateInterval = setInterval(async () => {
      try {
        await supabase
          .from('game_sessions')
          .update({
            time_spent: timeElapsed,
            current_clue_index: session.currentClueIndex,
            score: session.score,
            completed_clues: session.completedClues,
            hints_used: session.hintsUsed,
          })
          .eq('id', session.id);
      } catch (error) {
        console.error('❌ Erreur mise à jour session:', error);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [session, timeElapsed]);

  const completeClue = useCallback(async (clueId: string, points: number) => {
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
    try {
      await supabase
        .from('game_sessions')
        .update({
          completed_clues: updatedSession.completedClues,
          score: updatedSession.score,
          current_clue_index: updatedSession.currentClueIndex,
          status: updatedSession.status,
          completed_at: updatedSession.completedAt,
          time_spent: timeElapsed,
        })
        .eq('id', session.id);
      
      console.log('✅ Indice complété:', clueId);
    } catch (error) {
      console.error('❌ Erreur mise à jour après indice:', error);
    }
  }, [session, hunt.clues, timeElapsed, currentClue]);

  const useHint = useCallback(async () => {
    if (!session) return;

    const updatedSession: GameSession = {
      ...session,
      hintsUsed: session.hintsUsed + 1,
      score: Math.max(0, session.score - 10), // Penalty for using hint
      timeSpent: timeElapsed,
    };

    setSession(updatedSession);
    
    // Update in database
    try {
      await supabase
        .from('game_sessions')
        .update({
          hints_used: updatedSession.hintsUsed,
          score: updatedSession.score,
          time_spent: timeElapsed,
        })
        .eq('id', session.id);
      
      console.log('✅ Indice utilisé');
    } catch (error) {
      console.error('❌ Erreur utilisation indice:', error);
    }
  }, [session, timeElapsed]);

  const abandonSession = useCallback(async () => {
    if (!session) return;

    const updatedSession: GameSession = {
      ...session,
      status: 'abandoned' as const,
      timeSpent: timeElapsed,
    };

    setSession(updatedSession);
    
    // Update in database
    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'abandoned',
          time_spent: timeElapsed,
        })
        .eq('id', session.id);
      
      console.log('✅ Session abandonnée');
    } catch (error) {
      console.error('❌ Erreur abandon session:', error);
    }
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