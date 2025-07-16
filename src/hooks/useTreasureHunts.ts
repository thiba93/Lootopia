import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { TreasureHunt } from '../types';

export const useTreasureHunts = () => {
  const [treasureHunts, setTreasureHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTreasureHunts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await db.getTreasureHunts();
      
      if (fetchError) {
        console.error('Error fetching treasure hunts:', fetchError);
        setError(fetchError.message || 'Failed to load treasure hunts');
        setTreasureHunts([]);
        return;
      }

      if (data) {
        const formattedHunts: TreasureHunt[] = data.map(hunt => ({
          id: hunt.id,
          title: hunt.title,
          description: hunt.description,
          difficulty: hunt.difficulty,
          category: hunt.category,
          location: {
            lat: Number(hunt.location_lat) || 0,
            lng: Number(hunt.location_lng) || 0,
            address: hunt.location_address,
          },
          clues: hunt.clues?.map(clue => ({
            id: clue.id,
            order: clue.order_number,
            text: clue.text,
            hint: clue.hint,
            type: clue.type,
            answer: clue.answer,
            location: {
              lat: Number(clue.location_lat) || 0,
              lng: Number(clue.location_lng) || 0,
            },
            points: clue.points,
            radius: clue.radius,
          })) || [],
          rewards: hunt.rewards?.map(reward => ({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            type: reward.type,
            value: reward.value,
            icon: reward.icon,
            rarity: reward.rarity,
          })) || [],
          participants: hunt.participants_count,
          maxParticipants: hunt.max_participants,
          duration: hunt.duration,
          createdBy: hunt.created_by || 'system',
          createdAt: hunt.created_at,
          status: hunt.status,
          image: hunt.image_url,
          rating: Number(hunt.rating) || 0,
          reviews: [], // Reviews will be implemented later
          tags: hunt.tags || [],
          isPublic: hunt.is_public,
        }));

        setTreasureHunts(formattedHunts);
      } else {
        setTreasureHunts([]);
      }
    } catch (err: any) {
      console.error('Error loading treasure hunts:', err);
      setError(err.message || 'Failed to load treasure hunts');
      setTreasureHunts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to prevent immediate loading issues
    const timer = setTimeout(() => {
      loadTreasureHunts();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const createTreasureHunt = async (huntData: any, userId: string) => {
    try {
      // Create the hunt
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

      // Reload hunts to get the updated list
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