import React from 'react';
import { ArrowLeft, Star, Trophy, Calendar, Award, MapPin, Clock } from 'lucide-react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack }) => {
  const stats = [
    { icon: Star, label: 'Points totaux', value: user.points, color: 'from-yellow-500 to-orange-500' },
    { icon: Trophy, label: 'Niveau', value: user.level, color: 'from-purple-500 to-pink-500' },
    { icon: Award, label: 'Achievements', value: user.achievements.length, color: 'from-blue-500 to-cyan-500' },
    { icon: Calendar, label: 'Chasses créées', value: '0', color: 'from-green-500 to-emerald-500' }
  ];

  const recentActivity = [
    { type: 'completed', title: 'Les Secrets du Louvre', points: 250, date: '2024-01-15' },
    { type: 'achievement', title: 'Achievement débloqué: Explorateur', points: 100, date: '2024-01-14' },
    { type: 'created', title: 'Chasse créée: Mystères de Montmartre', points: 0, date: '2024-01-12' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return '🏆';
      case 'achievement': return '🎖️';
      case 'created': return '✨';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
              <p className="text-white/70 mb-4">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold"> 350 points</span>
                </div>
                <div className="flex items-center space-x-1 text-purple-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Niveau {user.level}</span>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'organizer' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  <span>{user.role === 'organizer' ? '👑 Organisateur' : '🎮 Joueur'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">350</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Mes Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{achievement.name}</h4>
                    <p className="text-white/60 text-sm">{achievement.description}</p>
                    <div className="flex items-center space-x-1 text-white/40 text-xs mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.title}</div>
                  <div className="text-white/60 text-sm flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {activity.points > 0 && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="w-3 h-3" />
                        <span>+{activity.points}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;