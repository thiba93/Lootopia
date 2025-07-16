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
import { TreasureHunt, Notification, Achievement } from './types';
import { useAuth } from './hooks/useAuth';
import { useTreasureHunts } from './hooks/useTreasureHunts';
import { db } from './lib/supabase';

type Page = 'home' | 'dashboard' | 'map' | 'create' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { treasureHunts, loading: huntsLoading, createTreasureHunt } = useTreasureHunts();

  useEffect(() => {
    // Load notifications when user is authenticated
    if (isAuthenticated && user) {
      loadNotifications();
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await db.getUserNotifications(user.id);
      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }
      
      if (data) {
        const formattedNotifications: Notification[] = data.map(notif => ({
          id: notif.id,
          userId: notif.user_id,
          type: notif.type as any,
          title: notif.title,
          message: notif.message,
          isRead: notif.is_read,
          createdAt: notif.created_at,
          data: notif.data,
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    signOut();
    setCurrentPage('home');
    setNotifications([]);
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await db.createNotification({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
      });
      
      if (error) {
        console.error('Error creating notification:', error);
        return;
      }
      
      if (data) {
        const newNotification: Notification = {
          id: data.id,
          userId: data.user_id,
          type: data.type as any,
          title: data.title,
          message: data.message,
          isRead: data.is_read,
          createdAt: data.created_at,
          data: data.data,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await db.markNotificationAsRead(id);
      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = () => {
    // For now, just clear locally. In a real app, you'd want to mark all as read in the database
    setNotifications([]);
  };

  const handleAchievementUnlocked = (achievements: Achievement[]) => {
    if (!user) return;
    
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
  };
  
  const handleCreateHunt = async (newHunt: any) => {
    if (!user) return;
    
    const { data: hunt, error } = await createTreasureHunt(newHunt, user.id);
    
    if (error) {
      console.error('Error creating hunt:', error);
      return;
    }
    
    setCurrentPage('dashboard');
    
    if (user) {
      addNotification({
        userId: user.id,
        type: 'new_hunt',
        title: 'Chasse créée !',
        message: `Votre chasse "${newHunt.title}" a été publiée avec succès`,
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

  // Show loading screen while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

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
        />
      )}
    </div>
  );
}

export default App;