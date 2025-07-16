import React, { useState } from 'react';
import { Trophy, Star, Map, Plus, Clock, Users, Filter, Search, TrendingUp, Award, Calendar } from 'lucide-react';
import { User, TreasureHunt } from '../types';
import TreasureHuntCard from './TreasureHuntCard';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  user: User;
  treasureHunts: TreasureHunt[];
  loading?: boolean;
  onJoinHunt: (huntId: string) => void;
  onCreateHunt: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, treasureHunts, loading = false, onJoinHunt, onCreateHunt, onNavigate }) => {
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
    { value: 'easy', label: 'Facile', color: 'text-green-400' },
    { value: 'medium', label: 'Moyen', color: 'text-yellow-400' },
    { value: 'hard', label: 'Difficile', color: 'text-red-400' }
  ];

  const userStats = [
    { icon: Star, label: 'Points', value: user.points, color: 'from-yellow-500 to-orange-500' },
    { icon: Trophy, label: 'Niveau', value: user.level, color: 'from-purple-500 to-pink-500' },
    { icon: Award, label: 'Achievements', value: user.achievements.length, color: 'from-blue-500 to-cyan-500' },
    { icon: TrendingUp, label: 'Progression', value: `${Math.min(100, (user.points % 1000) / 10)}%`, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Bienvenue, {user.username} !
                </h1>
                <p className="text-sm sm:text-base text-white/70 max-w-md">
                  Prêt pour votre prochaine aventure ? Découvrez de nouveaux trésors ou créez votre propre chasse !
                </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {userStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <button
            onClick={() => onNavigate('my-hunts')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Mes chasses</h3>
                <p className="text-sm sm:text-base text-white/80">Suivez vos participations et créations</p>
              </div>
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </button>
          
          {user.role === 'organizer' ? (
            <button
              onClick={onCreateHunt}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Créer une chasse</h3>
                  <p className="text-sm sm:text-base text-white/80">Partagez votre créativité avec la communauté</p>
                </div>
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </button>
          ) : (
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left opacity-60 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Créer une chasse</h3>
                  <p className="text-sm sm:text-base text-white/80">Réservé aux organisateurs</p>
                </div>
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Vos achievements</h2>
            <span className="text-white/60 text-sm">{user.achievements.length} débloqués</span>
          </div>
          
          {user.achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.achievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-3xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{achievement.name}</h3>
                  <p className="text-white/60 text-xs mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-xs">+{achievement.points} pts</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
              <Award className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Aucun achievement débloqué pour le moment</p>
              <p className="text-white/40 text-sm mt-2">Participez à des chasses pour en débloquer !</p>
            </div>
          )}
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
                    <option key={filter.value} value={filter.value} className="bg-gray-800 text-white">
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </div>

        {/* Treasure Hunts Grid */}
        {loading ? (
          <LoadingSpinner message="Chargement des chasses au trésor..." />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredHunts.map((hunt) => (
                <TreasureHuntCard
                  key={hunt.id}
                  hunt={hunt}
                  onJoin={() => onJoinHunt(hunt.id)}
                />
              ))}
            </div>

            {filteredHunts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Map className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <div className="text-white/60 text-base sm:text-lg mb-2">
                  Aucune chasse au trésor trouvée
                </div>
                <div className="text-white/40 text-sm">
                  Essayez de modifier vos critères de recherche
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;