import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Compass, Trophy, Clock, Target, CheckCircle, Eye, Lightbulb, Camera, Navigation } from 'lucide-react';
import { TreasureHunt, User } from '../types';
import { useGameSession } from '../hooks/useGameSession';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance, isWithinRadius, formatDistance } from '../utils/distance';
import { checkAchievements } from '../utils/achievements';

interface ImprovedTreasureHuntMapProps {
  hunt: TreasureHunt;
  user: User;
  onBack: () => void;
  onAchievementUnlocked: (achievements: any[]) => void;
}

const ImprovedTreasureHuntMap: React.FC<ImprovedTreasureHuntMapProps> = ({ 
  hunt, 
  user, 
  onBack,
  onAchievementUnlocked 
}) => {
  const { session, currentClue, timeElapsed, completeClue, useHint, abandonSession } = useGameSession(hunt, user);
  const { latitude, longitude, error: locationError } = useGeolocation();
  const [showHint, setShowHint] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [answer, setAnswer] = useState('');

  const progress = session ? (session.completedClues.length / hunt.clues.length) * 100 : 0;

  const getDistanceToClue = () => {
    if (!latitude || !longitude || !currentClue) return null;
    return calculateDistance(latitude, longitude, currentClue.location.lat, currentClue.location.lng);
  };

  const isNearClue = () => {
    if (!latitude || !longitude || !currentClue) return false;
    return isWithinRadius(
      latitude,
      longitude,
      currentClue.location.lat,
      currentClue.location.lng,
      currentClue.radius || 50
    );
  };

  const handleClueComplete = () => {
    if (!currentClue || !session) return;

    // Check if user is near the location (for location-based clues)
    if (currentClue.type !== 'riddle' && !isNearClue()) {
      alert('Vous devez être plus proche de l\'emplacement pour valider cet indice !');
      return;
    }

    // Check answer for riddles
    if (currentClue.type === 'riddle' && currentClue.answer) {
      if (answer.toLowerCase().trim() !== currentClue.answer.toLowerCase().trim()) {
        alert('Réponse incorrecte. Essayez encore !');
        return;
      }
    }

    completeClue(currentClue.id, currentClue.points);
    setAnswer('');
    setShowHint(false);

    // Check for achievements
    const newAchievements = checkAchievements(user, session, 'clue_completed');
    if (newAchievements.length > 0) {
      onAchievementUnlocked(newAchievements);
    }

    // Check if hunt is completed
    if (session.currentClueIndex + 1 >= hunt.clues.length) {
      const completedAchievements = checkAchievements(user, session, 'hunt_completed');
      if (completedAchievements.length > 0) {
        onAchievementUnlocked(completedAchievements);
      }
    }
  };

  const handleUseHint = () => {
    useHint();
    setShowHint(true);
    
    const hintAchievements = checkAchievements(user, session!, 'hint_used');
    if (hintAchievements.length > 0) {
      onAchievementUnlocked(hintAchievements);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getClueTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-5 h-5" />;
      case 'riddle': return <Target className="w-5 h-5" />;
      case 'qr': return <Eye className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  if (session?.status === 'completed') {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Félicitations !</h1>
              <p className="text-xl text-white/70 mb-8">
                Vous avez terminé la chasse "{hunt.title}" !
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{session.score}</div>
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
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{session.hintsUsed}</div>
                  <div className="text-white/60">Indices utilisés</div>
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
                        <div className="text-yellow-400 text-sm">+{reward.value} points</div>
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement de la session...</p>
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
              <span>{session.score} points</span>
            </div>
            <button
              onClick={abandonSession}
              className="text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              Abandonner
            </button>
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
              <span>{session.completedClues.length} / {hunt.clues.length} indices</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Location & Distance */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2" />
              Localisation
            </h2>
            
            {locationError ? (
              <div className="text-center text-red-400 py-8">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">Erreur de géolocalisation</p>
                <p className="text-sm">{locationError}</p>
              </div>
            ) : !latitude || !longitude ? (
              <div className="text-center text-white/60 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                <p>Localisation en cours...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white/10 rounded-xl h-48 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                  <div className="relative z-10 text-center">
                    <Compass className="w-16 h-16 mx-auto mb-4 text-white/60" />
                    <p className="text-white/80">Carte interactive</p>
                  </div>
                </div>
                
                {currentClue && (
                  <div className="space-y-3">
                    <div className="text-white/60 mb-2">Distance jusqu'à l'indice</div>
                    <div className="text-2xl font-bold text-white">
                      {getDistanceToClue() ? formatDistance(getDistanceToClue()!) : 'Calcul...'}
                    </div>
                    
                    {isNearClue() && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Vous êtes à proximité !</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Clue */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              {currentClue && getClueTypeIcon(currentClue.type)}
              <span className="ml-2">Indice actuel ({session.currentClueIndex + 1}/{hunt.clues.length})</span>
            </h2>
            
            {currentClue ? (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-white text-lg mb-3">{currentClue.text}</p>
                  
                  {showHint && currentClue.hint && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-200 text-sm">{currentClue.hint}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-white/60">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{currentClue.points} points</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span className="capitalize">{currentClue.type}</span>
                    </div>
                  </div>
                  
                  {!showHint && currentClue.hint && (
                    <button
                      onClick={handleUseHint}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm flex items-center space-x-1"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Indice (-10 pts)</span>
                    </button>
                  )}
                </div>

                {/* Answer input for riddles */}
                {currentClue.type === 'riddle' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Votre réponse..."
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
                
                <button
                  onClick={handleClueComplete}
                  disabled={currentClue.type === 'riddle' && !answer.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {currentClue.type === 'riddle' ? 'Valider la réponse' : 'Marquer comme trouvé'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tous les indices ont été complétés !</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Clues */}
        {session.completedClues.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Indices complétés</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hunt.clues.filter(clue => session.completedClues.includes(clue.id)).map((clue) => (
                <div key={clue.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-green-400 mt-1">
                        {getClueTypeIcon(clue.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{clue.text}</p>
                        <p className="text-white/60 text-sm">Ordre: {clue.order}</p>
                      </div>
                    </div>
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

export default ImprovedTreasureHuntMap;