import React, { useState, useEffect } from 'react';
import { Compass, Star } from 'lucide-react';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import ImprovedTreasureHuntMap from './components/ImprovedTreasureHuntMap';
import CreateHunt from './components/CreateHunt';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import NotificationSystem from './components/NotificationSystem';
import ResponsiveNavigation from './components/ResponsiveNavigation';
import { TreasureHunt, User, Notification, Achievement } from './types';
import { mockTreasureHunts, mockUser } from './data/mockData';
import { calculateLevel } from './utils/achievements';

type Page = 'home' | 'dashboard' | 'map' | 'create' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [treasureHunts, setTreasureHunts] = useState<TreasureHunt[]>(mockTreasureHunts);
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('lootopia_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.username) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Load notifications
          const savedNotifications = localStorage.getItem('lootopia_notifications');
          if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
          }
        } else {
          // Invalid user data, clean up
          localStorage.removeItem('lootopia_user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Invalid JSON, clean up
        localStorage.removeItem('lootopia_user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock login logic
    const userData = { ...mockUser, email };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('lootopia_user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lootopia_user');
    setCurrentPage('home');
    setNotifications([]);
    localStorage.removeItem('lootopia_notifications');
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('lootopia_notifications', JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('lootopia_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('lootopia_notifications');
  };

  const handleAchievementUnlocked = (achievements: Achievement[]) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      achievements: [...user.achievements, ...achievements],
      points: user.points + achievements.reduce((sum, a) => sum + a.points, 0),
    };
    
    updatedUser.level = calculateLevel(updatedUser.points);
    
    setUser(updatedUser);
    localStorage.setItem('lootopia_user', JSON.stringify(updatedUser));
    
    // Add notifications for achievements
    achievements.forEach(achievement => {
      addNotification({
        userId: user.id,
        type: 'achievement',
        title: 'Nouvel Achievement !',
        message: `Vous avez débloqué "${achievement.name}" (+${achievement.points} points)`,
        isRead: false,
      });
    });
    
    // Check for level up
    if (updatedUser.level > user.level) {
      addNotification({
        userId: user.id,
        type: 'level_up',
        title: 'Niveau supérieur !',
        message: `Félicitations ! Vous êtes maintenant niveau ${updatedUser.level}`,
        isRead: false,
      });
    }
  };
  const handleCreateHunt = (newHunt: Omit<TreasureHunt, 'id' | 'createdAt'>) => {
    const hunt: TreasureHunt = {
      ...newHunt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTreasureHunts([...treasureHunts, hunt]);
    setCurrentPage('dashboard');
    
    if (user) {
      addNotification({
        userId: user.id,
        type: 'new_hunt',
        title: 'Chasse créée !',
        message: `Votre chasse "${hunt.title}" a été publiée avec succès`,
        isRead: false,
      });
    }
  };

  const handleJoinHunt = (huntId: string) => {
    const hunt = treasureHunts.find(h => h.id === huntId);
    if (hunt && isAuthenticated) {
      setSelectedHunt(hunt);
      setCurrentPage('map');
    } else if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            treasureHunts={treasureHunts}
            onJoinHunt={handleJoinHunt}
            onGetStarted={handleGetStarted}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={user!}
            treasureHunts={treasureHunts}
            onJoinHunt={handleJoinHunt}
            onCreateHunt={() => setCurrentPage('create')}
          />
        );
      case 'map':
        if (!selectedHunt || !user) {
          setCurrentPage('dashboard');
          return null;
        }
        return (
          <ImprovedTreasureHuntMap 
            hunt={selectedHunt}
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onAchievementUnlocked={handleAchievementUnlocked}
          />
        );
      case 'create':
        return (
          <CreateHunt 
            onCreateHunt={handleCreateHunt}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user!}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead && n.userId === user?.id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Lootopia</span>
            </div>

            <ResponsiveNavigation
              currentPage={currentPage}
              isAuthenticated={isAuthenticated}
              user={user}
              selectedHunt={selectedHunt}
              onNavigate={setCurrentPage}
              onShowAuth={() => setShowAuthModal(true)}
              onLogout={handleLogout}
              notificationCount={unreadNotificationCount}
            />

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{user?.points || 0}</span>
                  </div>
                  <NotificationSystem
                    notifications={notifications.filter(n => n.userId === user?.id)}
                    onMarkAsRead={markNotificationAsRead}
                    onClearAll={clearAllNotifications}
                  />
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-sm sm:text-base"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;