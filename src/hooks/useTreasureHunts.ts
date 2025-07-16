import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { TreasureHunt } from '../types';
import { mockTreasureHunts } from '../data/mockData';

export const useTreasureHunts = () => {
  const [treasureHunts, setTreasureHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTreasureHunts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des chasses au trésor...');
      
      // Essayer de charger depuis Supabase avec un timeout raisonnable
      const loadPromise = db.getTreasureHunts();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout chargement chasses')), 5000)
      );
      
      try {
        const { data, error: fetchError } = await Promise.race([
          loadPromise,
          timeoutPromise
        ]) as any;
        
        if (fetchError) {
          console.warn('⚠️ Erreur Supabase, utilisation des données mockées:', fetchError);
          setTreasureHunts(mockTreasureHunts);
          setError(null);
          return;
        }

        if (data && Array.isArray(data) && data.length > 0) {
          console.log('✅ Chasses chargées depuis Supabase:', data.length);
          
          const formattedHunts: TreasureHunt[] = data.map(hunt => ({
            id: hunt.id,
            title: hunt.title,
            description: hunt.description,
            difficulty: hunt.difficulty,
            category: hunt.category,
            location: {
              lat: Number(hunt.location_lat) || 48.8566,
              lng: Number(hunt.location_lng) || 2.3522,
              address: hunt.location_address || 'Paris, France',
            },
            clues: hunt.clues?.map(clue => ({
              id: clue.id,
              order: clue.order_number,
              text: clue.text,
              hint: clue.hint,
              type: clue.type,
              answer: clue.answer,
              location: {
                lat: Number(clue.location_lat) || 48.8566,
                lng: Number(clue.location_lng) || 2.3522,
              },
              points: clue.points || 100,
              radius: clue.radius || 50,
            })) || [],
            rewards: hunt.rewards?.map(reward => ({
              id: reward.id,
              name: reward.name,
              description: reward.description,
              type: reward.type,
              value: reward.value || 100,
              icon: reward.icon || '🏆',
              rarity: reward.rarity,
            })) || [],
            participants: hunt.participants_count || 0,
            maxParticipants: hunt.max_participants || 50,
            duration: hunt.duration || 60,
            createdBy: hunt.created_by || 'system',
            createdAt: hunt.created_at,
            status: hunt.status,
            image: hunt.image_url,
            rating: Number(hunt.rating) || 0,
            reviews: [],
            tags: hunt.tags || [],
            isPublic: hunt.is_public !== false,
          }));

          setTreasureHunts(formattedHunts);
        } else {
          console.log('ℹ️ Aucune donnée Supabase, utilisation des données mockées');
          setTreasureHunts(mockTreasureHunts);
        }
      } catch (timeoutError) {
        console.warn('⚠️ Timeout Supabase, utilisation des données mockées');
        setTreasureHunts(mockTreasureHunts);
        setError(null);
      }
    } catch (err: any) {
      console.warn('⚠️ Erreur générale, utilisation des données mockées:', err);
      setTreasureHunts(mockTreasureHunts);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger immédiatement sans délai
    loadTreasureHunts();
  }, []);

  const createTreasureHunt = async (huntData: any, userId: string) => {
    try {
      // Créer la chasse
      const { data: hunt, error: huntError } = await db.createTreasureHunt({
        title: huntData.title,
        description: huntData.description,
        difficulty: huntData.difficulty,
        category: huntData.category,
        location_lat: huntData.location.lat,
        location_lng: huntData.location.lng,
        location_address: huntData.location.address,
        duration: huntData.duration,
        max_participants: huntData.maxParticipants,
        created_by: userId,
        image_url: huntData.image,
        tags: huntData.tags || [],
      });

      if (huntError) {
        throw huntError;
      }

      // Recharger les chasses pour obtenir la liste mise à jour
      await loadTreasureHunts();
      
      return { data: hunt, error: null };
    } catch (error: any) {
      console.error('Error creating treasure hunt:', error);
      return { data: null, error };
    }
  };

  return {
    treasureHunts,
    loading,
    error,
    loadTreasureHunts,
    createTreasureHunt,
  };
};