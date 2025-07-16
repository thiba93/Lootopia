import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, MapPin, Play, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { User, TreasureHunt, GameSession } from '../types';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface MyHuntsProps {
  user: User;
  onBack: () => void;
  onJoinHunt: (huntId: string) => void;
}

const MyHunts: React.FC<MyHuntsProps> = ({ user, onBack, onJoinHunt }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'created'>('active');
  const [activeHunts, setActiveHunts] = useState<(TreasureHunt & { session: GameSession })[]>([]);
  const [completedHunts, setCompletedHunts] = useState<(TreasureHunt & { session: GameSession })[]>([]);
  const [createdHunts, setCreatedHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyHunts();
  }, [user.id]);

  const loadMyHunts = async () => {
    setLoading(true);
    try {
      // Charger les sessions de l'utilisateur
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          treasure_hunts (
            *,
            clues(*),
            rewards(*)
          )
        `)
        .eq('user_id', user.id);

      if (sessionsError) {
        console.error('Erreur chargement sessions:', sessionsError);
        return;
      }

      // Séparer les chasses actives et complétées
      const active: (TreasureHunt & { session: GameSession })[] = [];
      const completed: (TreasureHunt & { session: GameSession })[] = [];

      sessions?.forEach((session: any) => {
        if (!session.treasure_hunts) return;

        const hunt: TreasureHunt = {
          id: session.treasure_hunts.id,
          title: session.treasure_hunts.title,
          description: session.treasure_hunts.description,
          difficulty: session.treasure_hunts.difficulty,
          category: session.treasure_hunts.category,
          location: {
            lat: Number(session.treasure_hunts.location_lat),
            lng: Number(session.treasure_hunts.location_lng),
            address: session.treasure_hunts.location_address,
          },
          clues: session.treasure_hunts.clues?.map((clue: any) => ({
            id: clue.id,
            order: clue.order_number,
            text: clue.text,
            hint: clue.hint,
            type: clue.type,
            answer: clue.answer,
            location: {
              lat: Number(clue.location_lat),
              lng: Number(clue.location_lng),
            },
            points: clue.points,
            radius: clue.radius,
          })) || [],
          rewards: session.treasure_hunts.rewards?.map((reward: any) => ({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            type: reward.type,
            value: reward.value,
            icon: reward.icon,
            rarity: reward.rarity,
          })) || [],
          participants: session.treasure_hunts.participants_count || 0,
          maxParticipants: session.treasure_hunts.max_participants || 50,
          duration: session.treasure_hunts.duration || 60,
          createdBy: session.treasure_hunts.created_by,
          createdAt: session.treasure_hunts.created_at,
          status: session.treasure_hunts.status,
          image: session.treasure_hunts.image_url,
          rating: Number(session.treasure_hunts.rating) || 0,
          reviews: [],
          tags: session.treasure_hunts.tags || [],
          isPublic: session.treasure_hunts.is_public,
        };

        const gameSession: GameSession = {
          id: session.id,
          huntId: session.hunt_id,
          userId: session.user_id,
          startedAt: session.started_at,
          completedAt: session.completed_at,
          currentClueIndex: session.current_clue_index,
          score: session.score,
          status: session.status,
          completedClues: session.completed_clues || [],
          timeSpent: session.time_spent,
          hintsUsed: session.hints_used,
        };

        const huntWithSession = { ...hunt, session: gameSession };

        if (session.status === 'active') {
          active.push(huntWithSession);
        } else if (session.status === 'completed') {
          completed.push(huntWithSession);
        }
      });

      setActiveHunts(active);
      setCompletedHunts(completed);

      // Charger les chasses créées (si organisateur)
      // Charger les chasses créées pour tous les utilisateurs
      try {
        const { data: created, error: createdError } = await supabase
          .from('treasure_hunts')
          .select(`
            *,
            clues(*),
            rewards(*)
          `)
          .eq('created_by', user.id);

        if (!createdError && created) {
          const formattedCreated: TreasureHunt[] = created.map((hunt: any) => ({
            id: hunt.id,
            title: hunt.title,
            description: hunt.description,
            difficulty: hunt.difficulty,
            category: hunt.category,
            location: {
              lat: Number(hunt.location_lat),
              lng: Number(hunt.location_lng),
              address: hunt.location_address,
            },
            clues: hunt.clues?.map((clue: any) => ({
              id: clue.id,
              order: clue.order_number,
              text: clue.text,
              hint: clue.hint,
              type: clue.type,
              answer: clue.answer,
              location: {
                lat: Number(clue.location_lat),
                lng: Number(clue.location_lng),
              },
              points: clue.points,
              radius: clue.radius,
            })) || [],
            rewards: hunt.rewards?.map((reward: any) => ({
              id: reward.id,
              name: reward.name,
              description: reward.description,
              type: reward.type,
              value: reward.value,
              icon: reward.icon,
              rarity: reward.rarity,
            })) || [],
            participants: hunt.participants_count || 0,
            maxParticipants: hunt.max_participants || 50,
            duration: hunt.duration || 60,
            createdBy: hunt.created_by,
            createdAt: hunt.created_at,
            status: hunt.status,
            image: hunt.image_url,
            rating: Number(hunt.rating) || 0,
            reviews: [],
            tags: hunt.tags || [],
            isPublic: hunt.is_public,
          }));

          setCreatedHunts(formattedCreated);
        }
      } catch (error) {
        console.warn('Erreur chargement chasses créées:', error);
        // Mode démo - afficher les chasses créées localement
        const localCreatedHunts = treasureHunts.filter(hunt => hunt.createdBy === user.id);
        setCreatedHunts(localCreatedHunts);
      }
    } catch (error) {
      console.error('Erreur chargement mes chasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/20';
      case 'abandoned': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      case 'abandoned': return 'Abandonnée';
      default: return status;
    }
  };

  const tabs = [
    { id: 'active', label: 'En cours', count: activeHunts.length },
    { id: 'completed', label: 'Terminées', count: completedHunts.length },
    { id: 'created', label: 'Mes créations', count: createdHunts.length }
  ];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Mes chasses au trésor</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement de vos chasses..." />
        ) : (
          <div className="space-y-6">
            {/* Chasses actives */}
            {activeTab === 'active' && (
              <div>
                {activeHunts.length === 0 ? (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <div className="text-white/60 text-lg mb-2">Aucune chasse en cours</div>
                    <div className="text-white/40 text-sm">
                      Rejoignez une chasse pour commencer l'aventure !
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {activeHunts.map((hunt) => (
                      <div key={hunt.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{hunt.title}</h3>
                            <p className="text-white/70 text-sm line-clamp-2">{hunt.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hunt.session.status)}`}>
                            {getStatusLabel(hunt.session.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">{hunt.session.currentClueIndex + 1}/{hunt.clues.length}</div>
                            <div className="text-white/60 text-xs">Indices</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">{hunt.session.score}</div>
                            <div className="text-white/60 text-xs">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{formatTime(hunt.session.timeSpent)}</div>
                            <div className="text-white/60 text-xs">Temps</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{hunt.location.address}</span>
                          </div>
                          <button
                            onClick={() => onJoinHunt(hunt.id)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            Continuer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chasses terminées */}
            {activeTab === 'completed' && (
              <div>
                {completedHunts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <div className="text-white/60 text-lg mb-2">Aucune chasse terminée</div>
                    <div className="text-white/40 text-sm">
                      Complétez des chasses pour voir vos succès ici !
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {completedHunts.map((hunt) => (
                      <div key={hunt.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{hunt.title}</h3>
                            <div className="flex items-center space-x-2 text-white/60 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>Terminée le {new Date(hunt.session.completedAt!).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{hunt.clues.length}</div>
                            <div className="text-white/60 text-xs">Indices résolus</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">{hunt.session.score}</div>
                            <div className="text-white/60 text-xs">Points gagnés</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">{formatTime(hunt.session.timeSpent)}</div>
                            <div className="text-white/60 text-xs">Temps total</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{hunt.location.address}</span>
                          </div>
                          <div className="text-white/40 text-sm">
                            {hunt.session.hintsUsed} indice(s) utilisé(s)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chasses créées (organisateur) */}
            {activeTab === 'created' && (
              <div>
                {createdHunts.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <div className="text-white/60 text-lg mb-2">Aucune chasse créée</div>
                    <div className="text-white/40 text-sm">
                      Créez votre première chasse pour partager votre créativité !
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {createdHunts.map((hunt) => (
                      <div key={hunt.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{hunt.title}</h3>
                            <p className="text-white/70 text-sm line-clamp-2">{hunt.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            hunt.status === 'active' ? 'text-green-400 bg-green-400/20' : 'text-gray-400 bg-gray-400/20'
                          }`}>
                            {hunt.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">{hunt.participants}</div>
                            <div className="text-white/60 text-xs">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">{hunt.clues.length}</div>
                            <div className="text-white/60 text-xs">Indices</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">{hunt.rating.toFixed(1)}</div>
                            <div className="text-white/60 text-xs">Note</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Créée le {new Date(hunt.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="text-white/40 text-sm">
                            {hunt.difficulty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHunts;