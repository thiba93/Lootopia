import React, { useState, useEffect } from 'react';
import { Compass, Star, Bell } from 'lucide-react';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import ImprovedTreasureHuntMap from './components/ImprovedTreasureHuntMap';
import CreateHunt from './components/CreateHunt';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import NotificationSystem from './components/NotificationSystem';
import ResponsiveNavigation from './components/ResponsiveNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { TreasureHunt, Notification, Achievement } from './types';
import { useAuth } from './hooks/useAuth';
import { useTreasureHunts } from './hooks/useTreasureHunts';
import { useToast } from './hooks/useToast';
import { db } from './lib/supabase';

type Page = 'home' | 'dashboard' | 'map' | 'create' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { treasureHunts, loading: huntsLoading, createTreasureHunt } = useTreasureHunts();
  const { toasts, success, error, info } = useToast();

  // Add timeout for loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn('Auth loading timeout - there might be a connection issue');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading]);

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
    
    info('Création en cours', 'Votre chasse au trésor est en cours de création...');
    
    const { data: hunt, error } = await createTreasureHunt(newHunt, user.id);
    
    if (error) {
      console.error('Error creating hunt:', error);
      error('Erreur', 'Impossible de créer la chasse au trésor. Veuillez réessayer.');
      return;
    }
    
    setCurrentPage('dashboard');
    success('Chasse créée !', `Votre chasse "${newHunt.title}" a été publiée avec succès`);
    
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
    if (hunt && isAuthenticated && hunt.participants < hunt.maxParticipants) {
      setSelectedHunt(hunt);
      setCurrentPage('map');
      info('Chasse rejointe', `Vous participez maintenant à "${hunt.title}"`);
    } else if (hunt && hunt.participants >= hunt.maxParticipants) {
      error('Chasse complète', 'Cette chasse au trésor a atteint sa capacité maximale');
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
            loading={huntsLoading}
            onJoinHunt={handleJoinHunt}
            onGetStarted={handleGetStarted}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={user!}
            treasureHunts={treasureHunts}
            loading={huntsLoading}
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" message="Initialisation de Lootopia..." />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
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
                    <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-sm">{user?.points || 0}</span>
                    </div>
                    <div className="relative">
                      <NotificationSystem
                        notifications={notifications.filter(n => n.userId === user?.id)}
                        onMarkAsRead={markNotificationAsRead}
                        onClearAll={clearAllNotifications}
                      />
                      {unreadNotificationCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentPage('profile')}
                      className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:scale-110 transition-transform"
                    >
                      {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-white/70 hover:text-white transition-colors text-sm hover:bg-white/10 px-3 py-1 rounded-lg"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-sm sm:text-base transform hover:scale-105"
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

        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ErrorBoundary>
  );
}

export default App;