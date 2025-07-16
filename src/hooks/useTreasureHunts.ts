import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
      
      const { data, error: fetchError } = await supabase
        .from('treasure_hunts')
        .select(`
          *,
          clues(*),
          rewards(*)
        `)
        .eq('status', 'active')
        .eq('is_public', true);
      
      if (fetchError) {
        console.warn('⚠️ Erreur Supabase, utilisation des données mockées:', fetchError);
        setTreasureHunts(mockTreasureHunts);
        return;
      }

      if (data && Array.isArray(data)) {
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
    } catch (err: any) {
      console.warn('⚠️ Erreur générale, utilisation des données mockées:', err);
      setTreasureHunts(mockTreasureHunts);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreasureHunts();
  }, []);

  const createTreasureHunt = async (huntData: any, userId: string) => {
    try {
      console.log('🔄 Création de la chasse:', huntData.title);
      
      // 1. Créer la chasse principale
      const { data: hunt, error: huntError } = await supabase
        .from('treasure_hunts')
        .insert({
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
          status: 'active',
          is_public: true
        })
        .select()
        .single();

      if (huntError) {
        console.error('❌ Erreur création chasse:', huntError);
        throw huntError;
      }

      console.log('✅ Chasse créée:', hunt.id);

      // 2. Créer les indices si présents
      if (huntData.clues && huntData.clues.length > 0) {
        const cluesData = huntData.clues.map((clue: any, index: number) => ({
          hunt_id: hunt.id,
          order_number: index + 1,
          text: clue.text,
          hint: clue.hint,
          type: clue.type || 'text',
          answer: clue.answer,
          location_lat: clue.location?.lat || huntData.location.lat,
          location_lng: clue.location?.lng || huntData.location.lng,
          points: clue.points || 100,
          radius: clue.radius || 50
        }));

        const { error: cluesError } = await supabase
          .from('clues')
          .insert(cluesData);

        if (cluesError) {
          console.error('❌ Erreur création indices:', cluesError);
          // Ne pas faire échouer toute la création pour les indices
        } else {
          console.log('✅ Indices créés:', cluesData.length);
        }
      }

      // 3. Créer les récompenses si présentes
      if (huntData.rewards && huntData.rewards.length > 0) {
        const rewardsData = huntData.rewards.map((reward: any) => ({
          hunt_id: hunt.id,
          name: reward.name,
          description: reward.description,
          type: reward.type || 'badge',
          value: reward.value || 100,
          icon: reward.icon || '🏆',
          rarity: reward.rarity || 'common'
        }));

        const { error: rewardsError } = await supabase
          .from('rewards')
          .insert(rewardsData);

        if (rewardsError) {
          console.error('❌ Erreur création récompenses:', rewardsError);
          // Ne pas faire échouer toute la création pour les récompenses
        } else {
          console.log('✅ Récompenses créées:', rewardsData.length);
        }
      }

      // 4. Recharger les chasses pour obtenir la liste mise à jour
      await loadTreasureHunts();
      
      return { data: hunt, error: null };
    } catch (error: any) {
      console.error('❌ Erreur création chasse complète:', error);
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