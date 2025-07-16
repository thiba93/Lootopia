import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TreasureHunt } from '../types';
import { mockTreasureHunts } from '../data/mockData';

export const useTreasureHunts = () => {
  const [treasureHunts, setTreasureHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTreasureHunts = async () => {
    // Éviter les chargements multiples
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des chasses...');
      
      // Vérifier si Supabase est configuré
      const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';
      
      if (hasSupabaseConfig) {
        try {
          // Timeout strict pour Supabase
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout Supabase')), 5000)
          );
          
          const fetchPromise = supabase
            .from('treasure_hunts')
            .select(`
              *,
              clues(*),
              rewards(*)
            `)
            .eq('status', 'active')
            .eq('is_public', true)
            .limit(20); // Limiter pour éviter les gros chargements
          
          const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (!fetchError && data && data.length > 0) {
            console.log('✅ Chasses chargées depuis Supabase:', data.length);
            
            const formattedHunts: TreasureHunt[] = data.map((hunt: any) => ({
              id: hunt.id,
              title: hunt.title || 'Chasse sans titre',
              description: hunt.description || 'Description non disponible',
              difficulty: hunt.difficulty || 'medium',
              category: hunt.category || 'Général',
              location: {
                lat: Number(hunt.location_lat) || 48.8566,
                lng: Number(hunt.location_lng) || 2.3522,
                address: hunt.location_address || 'Paris, France',
              },
              clues: hunt.clues?.map((clue: any) => ({
                id: clue.id,
                order: clue.order_number || 1,
                text: clue.text || 'Indice non disponible',
                hint: clue.hint,
                type: clue.type || 'text',
                answer: clue.answer,
                location: {
                  lat: Number(clue.location_lat) || 48.8566,
                  lng: Number(clue.location_lng) || 2.3522,
                },
                points: clue.points || 100,
                radius: clue.radius || 50,
              })) || [],
              rewards: hunt.rewards?.map((reward: any) => ({
                id: reward.id,
                name: reward.name || 'Récompense',
                description: reward.description || 'Description non disponible',
                type: reward.type || 'badge',
                value: reward.value || 100,
                icon: reward.icon || '🏆',
                rarity: reward.rarity || 'common',
              })) || [],
              participants: hunt.participants_count || 0,
              maxParticipants: hunt.max_participants || 50,
              duration: hunt.duration || 60,
              createdBy: hunt.created_by || 'system',
              createdAt: hunt.created_at || new Date().toISOString(),
              status: hunt.status || 'active',
              image: hunt.image_url,
              rating: Number(hunt.rating) || 0,
              reviews: [],
              tags: hunt.tags || [],
              isPublic: hunt.is_public !== false,
            }));

            setTreasureHunts(formattedHunts);
            setLoading(false);
            return;
          } else {
            console.log('ℹ️ Aucune chasse trouvée dans Supabase');
          }
        } catch (supabaseError) {
          console.warn('⚠️ Erreur Supabase:', supabaseError);
        }
      } else {
        console.log('ℹ️ Supabase non configuré');
      }
      
      // Fallback vers les données mockées (toujours disponible)
      console.log('📦 Utilisation des données mockées');
      setTreasureHunts(mockTreasureHunts);
      
    } catch (err: any) {
      console.warn('⚠️ Erreur générale, utilisation des données mockées:', err.message);
      setTreasureHunts(mockTreasureHunts);
      setError(null); // Pas d'erreur en mode démo
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial avec retry
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const loadWithRetry = async () => {
      if (!mounted) return;
      
      try {
        await loadTreasureHunts();
      } catch (error) {
        console.warn(`⚠️ Tentative ${retryCount + 1}/${maxRetries} échouée:`, error);
        
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          setTimeout(() => {
            if (mounted) loadWithRetry();
          }, 1000 * retryCount); // Délai progressif
        } else {
          // Fallback final vers les données mockées
          console.log('📦 Fallback final vers données mockées');
          if (mounted) {
            setTreasureHunts(mockTreasureHunts);
            setLoading(false);
          }
        }
      }
    };

    loadWithRetry();

    return () => {
      mounted = false;
    };
  }, []);

  const createTreasureHunt = async (huntData: any, userId: string) => {
    setLoading(true);
    try {
      console.log('🔄 Création de la chasse:', huntData.title);
      
      // Vérifier si Supabase est configuré
      const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';
      
      if (!hasSupabaseConfig) {
        // Mode démo - créer une chasse locale
        const demoHunt: TreasureHunt = {
          id: `demo-${Date.now()}`,
          title: huntData.title,
          description: huntData.description,
          difficulty: huntData.difficulty || 'medium',
          category: huntData.category,
          location: huntData.location,
          clues: huntData.clues?.map((clue: any, index: number) => ({
            ...clue,
            id: `demo-clue-${index}`,
            order: index + 1,
            location: clue.location || huntData.location,
            points: clue.points || 100,
            radius: clue.radius || 50,
          })) || [],
          rewards: huntData.rewards?.map((reward: any, index: number) => ({
            ...reward,
            id: `demo-reward-${index}`,
            rarity: reward.rarity || 'common',
          })) || [],
          participants: 0,
          maxParticipants: huntData.maxParticipants || 50,
          duration: huntData.duration || 60,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          status: 'active',
          image: huntData.image,
          rating: 0,
          reviews: [],
          tags: huntData.tags || [],
          isPublic: true,
        };
        
        // Ajouter à la liste locale
        setTreasureHunts(prev => [demoHunt, ...prev]);
        
        console.log('✅ Chasse démo créée:', demoHunt.title);
        return { data: demoHunt, error: null };
      }
      
      // Timeout pour la création
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout création')), 15000)
      );
      
      const createPromise = async () => {
        // 1. Créer la chasse principale
        const { data: hunt, error: huntError } = await supabase
          .from('treasure_hunts')
          .insert({
            title: huntData.title,
            description: huntData.description,
            difficulty: huntData.difficulty || 'medium',
            category: huntData.category,
            location_lat: huntData.location.lat,
            location_lng: huntData.location.lng,
            location_address: huntData.location.address,
            duration: huntData.duration || 60,
            max_participants: huntData.maxParticipants || 50,
            created_by: userId,
            image_url: huntData.image,
            tags: huntData.tags || [],
            status: 'active',
            is_public: true
          })
          .select()
          .single();

        if (huntError) throw huntError;

        // 2. Créer les indices (non-bloquant)
        if (huntData.clues && huntData.clues.length > 0) {
          try {
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

            await supabase.from('clues').insert(cluesData);
          } catch (cluesError) {
            console.warn('⚠️ Erreur indices (non-bloquant):', cluesError);
          }
        }

        // 3. Créer les récompenses (non-bloquant)
        if (huntData.rewards && huntData.rewards.length > 0) {
          try {
            const rewardsData = huntData.rewards.map((reward: any) => ({
              hunt_id: hunt.id,
              name: reward.name,
              description: reward.description,
              type: reward.type || 'badge',
              value: reward.value || 100,
              icon: reward.icon || '🏆',
              rarity: reward.rarity || 'common'
            }));

            await supabase.from('rewards').insert(rewardsData);
          } catch (rewardsError) {
            console.warn('⚠️ Erreur récompenses (non-bloquant):', rewardsError);
          }
        }

        return hunt;
      };
      
      const hunt = await Promise.race([createPromise(), timeoutPromise]);
      
      console.log('✅ Chasse créée:', hunt);
      
      // Recharger les chasses (non-bloquant)
      setTimeout(() => loadTreasureHunts(), 1000);
      
      return { data: hunt, error: null };
    } catch (error: any) {
      console.warn('⚠️ Erreur création chasse, mode démo:', error);
      
      // Fallback mode démo
      const demoHunt: TreasureHunt = {
        id: `demo-${Date.now()}`,
        title: huntData.title,
        description: huntData.description,
        difficulty: huntData.difficulty || 'medium',
        category: huntData.category,
        location: huntData.location,
        clues: huntData.clues || [],
        rewards: huntData.rewards || [],
        participants: 0,
        maxParticipants: huntData.maxParticipants || 50,
        duration: huntData.duration || 60,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        status: 'active',
        image: huntData.image,
        rating: 0,
        reviews: [],
        tags: huntData.tags || [],
        isPublic: true,
      };
      
      setTreasureHunts(prev => [demoHunt, ...prev]);
      
      return { data: demoHunt, error: null };
    } finally {
      setLoading(false);
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