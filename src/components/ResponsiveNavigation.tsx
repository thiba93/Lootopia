import React, { useState } from 'react';
import { Menu, X, Home, Trophy, Map, Plus, User, Bell } from 'lucide-react';

interface ResponsiveNavigationProps {
  currentPage: string;
  isAuthenticated: boolean;
  user: any;
  selectedHunt: any;
  onNavigate: (page: string) => void;
  onShowAuth: () => void;
  onLogout: () => void;
  notificationCount: number;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  currentPage,
  isAuthenticated,
  user,
  selectedHunt,
  onNavigate,
  onShowAuth,
  onLogout,
  notificationCount
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Accueil', icon: Home, show: true },
    { id: 'dashboard', label: 'Tableau de bord', icon: Trophy, show: isAuthenticated },
    { id: 'map', label: 'Carte', icon: Map, show: isAuthenticated, disabled: !selectedHunt },
    { id: 'create', label: 'Créer', icon: Plus, show: isAuthenticated },
  ];

  const handleNavigation = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {navigationItems.map((item) => {
          if (!item.show) return null;
          
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && handleNavigation(item.id)}
              disabled={item.disabled}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === item.id 
                  ? 'bg-white/20 text-white' 
                  : item.disabled
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-64 h-full bg-gray-900/98 backdrop-blur-md shadow-xl border-l border-gray-700/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {isAuthenticated && user && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-gray-300 text-sm">{user.points} points</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  if (!item.show) return null;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && handleNavigation(item.id)}
                      disabled={item.disabled}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left ${
                        currentPage === item.id 
                          ? 'bg-purple-600/50 text-white border border-purple-500/30' 
                          : item.disabled
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-200 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => handleNavigation('profile')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left ${
                        currentPage === 'profile' 
                          ? 'bg-purple-600/50 text-white border border-purple-500/30' 
                          : 'text-gray-200 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Profil</span>
                    </button>

                    <div className="border-t border-gray-700/50 my-4"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-200 hover:text-white hover:bg-red-600/20 transition-all text-left"
                    >
                      <span>Déconnexion</span>
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      onShowAuth();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Connexion
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveNavigation;