import React, { useState } from 'react';
import { Users, Settings, ArrowRight } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'player' | 'organizer') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<'player' | 'organizer' | null>(null);

  const roles = [
    {
      id: 'player' as const,
      title: 'Joueur',
      description: 'Participez aux chasses au trésor créées par la communauté',
      icon: Users,
      features: [
        'Accès à toutes les chasses publiques',
        'Suivi de vos participations',
        'Système de points et achievements',
        'Géolocalisation et navigation'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'organizer' as const,
      title: 'Organisateur',
      description: 'Créez et gérez vos propres chasses au trésor',
      icon: Settings,
      features: [
        'Création de chasses personnalisées',
        'Placement d\'indices et énigmes',
        'Gestion des participants',
        'Statistiques détaillées'
      ],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-4xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Choisissez votre rôle</h2>
          <p className="text-white/70 text-lg">
            Sélectionnez le type de compte qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                selectedRole === role.id
                  ? 'border-white/40 bg-white/20 shadow-xl'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mr-4`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{role.title}</h3>
                  <p className="text-white/60 text-sm">{role.description}</p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-white/70 text-sm">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none flex items-center space-x-2 mx-auto"
          >
            <span>Continuer</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-white/40 text-sm mt-4">
            Vous pourrez changer de rôle plus tard dans vos paramètres
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;