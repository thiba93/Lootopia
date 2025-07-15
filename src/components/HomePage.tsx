import React from 'react';
import { Compass, Map, Trophy, Users, Star, ArrowRight, Play } from 'lucide-react';
import { TreasureHunt } from '../types';
import TreasureHuntCard from './TreasureHuntCard';

interface HomePageProps {
  treasureHunts: TreasureHunt[];
  onJoinHunt: (huntId: string) => void;
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ treasureHunts, onJoinHunt, onGetStarted }) => {
  const stats = [
    { icon: Map, label: 'Chasses actives', value: '156', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Explorateurs', value: '2.3k', color: 'from-purple-500 to-pink-500' },
    { icon: Trophy, label: 'Trésors trouvés', value: '847', color: 'from-yellow-500 to-orange-500' },
    { icon: Star, label: 'Points distribués', value: '45k', color: 'from-green-500 to-emerald-500' }
  ];

  const features = [
    {
      icon: Map,
      title: 'Géolocalisation immersive',
      description: 'Utilisez votre position pour découvrir des trésors cachés autour de vous'
    },
    {
      icon: Users,
      title: 'Communauté active',
      description: 'Rejoignez des milliers d\'explorateurs et créez vos propres aventures'
    },
    {
      icon: Trophy,
      title: 'Récompenses exclusives',
      description: 'Gagnez des points, des badges et débloquez des achievements uniques'
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Compass className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Plateforme de chasses au trésor</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
              Découvrez <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Lootopia</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Embarquez pour des aventures épiques, résolvez des énigmes captivantes et découvrez des trésors cachés dans le monde réel. L'aventure commence maintenant !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Commencer l'aventure</span>
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Map className="w-5 h-5" />
                <span>Explorer la carte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-4 sm:left-10 animate-bounce">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-20 right-4 sm:right-10 animate-pulse">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-30"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Une expérience unique</h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
              Découvrez les fonctionnalités qui rendent Lootopia si spéciale
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hunts Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Chasses au trésor populaires</h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
              Découvrez les aventures les plus excitantes créées par notre communauté
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {treasureHunts.slice(0, 3).map((hunt) => (
              <TreasureHuntCard
                key={hunt.id}
                hunt={hunt}
                onJoin={() => onJoinHunt(hunt.id)}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center space-x-2"
            >
              <span>Voir toutes les chasses</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-white/70 mb-8 text-base sm:text-lg">
              Rejoignez des milliers d'explorateurs et découvrez des trésors extraordinaires près de chez vous.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Compass className="w-5 h-5" />
              <span>Commencer maintenant</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;