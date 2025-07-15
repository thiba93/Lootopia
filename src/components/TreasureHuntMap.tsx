import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Compass, Trophy, Clock, Target, CheckCircle } from 'lucide-react';
import { TreasureHunt, User, Clue } from '../types';

interface TreasureHuntMapProps {
  hunt: TreasureHunt;
  user: User;
  onBack: () => void;
}

const TreasureHuntMap: React.FC<TreasureHuntMapProps> = ({ hunt, user, onBack }) => {
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentClue = hunt.clues[currentClueIndex];
  const progress = (completedClues.size / hunt.clues.length) * 100;

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to hunt location
          setUserLocation(hunt.location);
        }
      );
    }

    // Timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hunt.location]);

  const handleClueComplete = (clueId: string) => {
    if (!completedClues.has(clueId)) {
      const newCompletedClues = new Set(completedClues);
      newCompletedClues.add(clueId);
      setCompletedClues(newCompletedClues);
      
      const clue = hunt.clues.find(c => c.id === clueId);
      if (clue) {
        setScore(prev => prev + clue.points);
      }
      
      if (currentClueIndex < hunt.clues.length - 1) {
        setCurrentClueIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  };

  const getDistanceToClue = () => {
    if (!userLocation || !currentClue) return null;
    return calculateDistance(
      userLocation.lat, userLocation.lng,
      currentClue.location.lat, currentClue.location.lng
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Félicitations !</h1>
              <p className="text-xl text-white/70 mb-8">
                Vous avez terminé la chasse "{hunt.title}" !
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{score}</div>
                  <div className="text-white/60">Points gagnés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{formatTime(timeElapsed)}</div>
                  <div className="text-white/60">Temps total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{hunt.clues.length}</div>
                  <div className="text-white/60">Indices résolus</div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Récompenses obtenues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hunt.rewards.map((reward) => (
                  <div key={reward.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{reward.icon}</div>
                      <div>
                        <div className="font-semibold text-white">{reward.name}</div>
                        <div className="text-white/60 text-sm">{reward.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Trophy className="w-5 h-5" />
              <span>{score} points</span>
            </div>
          </div>
        </div>

        {/* Hunt Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{hunt.title}</h1>
            <div className="flex items-center space-x-2 text-white/60">
              <MapPin className="w-4 h-4" />
              <span>{hunt.location.address}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-white/60 mb-2">
              <span>Progression</span>
              <span>{completedClues.size} / {hunt.clues.length} indices</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Compass className="w-5 h-5 mr-2" />
              Carte
            </h2>
            
            <div className="bg-white/10 rounded-xl h-64 flex items-center justify-center mb-4">
              <div className="text-center text-white/60">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Carte interactive</p>
                <p className="text-sm">Géolocalisation en cours...</p>
              </div>
            </div>
            
            {userLocation && currentClue && (
              <div className="text-center">
                <div className="text-white/60 mb-2">Distance jusqu'à l'indice</div>
                <div className="text-2xl font-bold text-white">
                  {getDistanceToClue() ? `${Math.round(getDistanceToClue()!)}m` : 'Calcul...'}
                </div>
              </div>
            )}
          </div>

          {/* Current Clue */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Indice actuel ({currentClueIndex + 1}/{hunt.clues.length})
            </h2>
            
            {currentClue && (
              <div>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-white text-lg">{currentClue.text}</p>
                  {currentClue.hint && (
                    <p className="text-white/60 text-sm mt-2">
                      💡 Indice: {currentClue.hint}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-white/60">
                    <Trophy className="w-4 h-4" />
                    <span>{currentClue.points} points</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/60">
                    <span className="capitalize">{currentClue.type}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleClueComplete(currentClue.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Marquer comme trouvé</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Completed Clues */}
        {completedClues.size > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Indices complétés</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hunt.clues.filter(clue => completedClues.has(clue.id)).map((clue, index) => (
                <div key={clue.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{clue.text}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm">+{clue.points}</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreasureHuntMap;