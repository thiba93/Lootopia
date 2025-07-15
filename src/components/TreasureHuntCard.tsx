import React from 'react';
import { MapPin, Clock, Users, Star, Trophy } from 'lucide-react';
import { TreasureHunt } from '../types';

interface TreasureHuntCardProps {
  hunt: TreasureHunt;
  onJoin: () => void;
}

const TreasureHuntCard: React.FC<TreasureHuntCardProps> = ({ hunt, onJoin }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return difficulty;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all group">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={hunt.image || `https://images.pexels.com/photos/2675061/pexels-photo-2675061.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={hunt.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className={`bg-gradient-to-r ${getDifficultyColor(hunt.difficulty)} text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
            {getDifficultyLabel(hunt.difficulty)}
          </span>
        </div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <span className="bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {hunt.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-1">{hunt.title}</h3>
        <p className="text-white/70 mb-4 text-xs sm:text-sm line-clamp-2">{hunt.description}</p>
        
        <div className="flex items-center text-white/60 mb-4 text-xs sm:text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{hunt.location.address}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-white/60">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{hunt.duration}min</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{hunt.participants}/{hunt.maxParticipants}</span>
            </div>
            <div className="hidden sm:flex items-center">
              <Trophy className="w-4 h-4 mr-1" />
              <span>{hunt.rewards.reduce((acc, reward) => acc + reward.value, 0)} pts</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onJoin}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          Rejoindre l'aventure
        </button>
      </div>
    </div>
  );
};

export default TreasureHuntCard;