import React, { useState } from 'react';
import { Trophy, Star, Map, Plus, Clock, Users, Filter, Search } from 'lucide-react';
import { User, TreasureHunt } from '../types';
import TreasureHuntCard from './TreasureHuntCard';

interface DashboardProps {
  user: User;
  treasureHunts: TreasureHunt[];
  onJoinHunt: (huntId: string) => void;
  onCreateHunt: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, treasureHunts, onJoinHunt, onCreateHunt }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHunts = treasureHunts.filter(hunt => {
    const matchesFilter = selectedFilter === 'all' || hunt.difficulty === selectedFilter;
    const matchesSearch = hunt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hunt.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { value: 'all', label: 'Toutes' },
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Bienvenue, {user.username} !
                </h1>
                <p className="text-sm sm:text-base text-white/70">
                  Prêt pour votre prochaine aventure ? Découvrez de nouveaux trésors ou créez votre propre chasse !
                </p>
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6 mt-4 md:mt-0">
                <div className="text-center">
                  <div className="flex items-center justify-center text-yellow-400 mb-1">
                    <Star className="w-5 h-5 mr-1" />
                    <span className="text-xl sm:text-2xl font-bold">{user.points}</span>
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm">Points</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-purple-400 mb-1">
                    <Trophy className="w-5 h-5 mr-1" />
                    <span className="text-xl sm:text-2xl font-bold">{user.level}</span>
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm">Niveau</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <button
            onClick={onCreateHunt}
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Créer une chasse</h3>
                <p className="text-sm sm:text-base text-white/80">Partagez votre créativité avec la communauté</p>
              </div>
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </button>
          
          <button 
            onClick={() => alert('Fonctionnalité de carte globale à venir !')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Explorer la carte</h3>
                <p className="text-sm sm:text-base text-white/80">Découvrez les trésors près de vous</p>
              </div>
              <Map className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </button>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Vos achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-white text-xs sm:text-sm mb-1">{achievement.name}</h3>
                <p className="text-white/60 text-xs">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Chasses disponibles</h2>
          </div>
            
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 sm:flex-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
              
            <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-white/60" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {filters.map(filter => (
                    <option key={filter.value} value={filter.value} className="bg-gray-800">
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </div>

        {/* Treasure Hunts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredHunts.map((hunt) => (
            <TreasureHuntCard
              key={hunt.id}
              hunt={hunt}
              onJoin={() => onJoinHunt(hunt.id)}
            />
          ))}
        </div>

        {filteredHunts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 text-base sm:text-lg">
              Aucune chasse au trésor trouvée pour vos critères.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;