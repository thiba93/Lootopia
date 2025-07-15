import { Achievement, User, GameSession } from '../types';

export const checkAchievements = (
  user: User,
  session: GameSession,
  action: 'hunt_completed' | 'clue_completed' | 'hint_used'
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const userAchievementIds = user.achievements.map(a => a.id);

  // First Hunt Achievement
  if (action === 'hunt_completed' && user.completedHunts.length === 0 && !userAchievementIds.includes('first_hunt')) {
    newAchievements.push({
      id: 'first_hunt',
      name: 'Premier Trésor',
      description: 'Complétez votre première chasse au trésor',
      icon: '🏆',
      unlockedAt: new Date().toISOString(),
      points: 100,
      rarity: 'common'
    });
  }

  // Speed Demon Achievement
  if (action === 'hunt_completed' && session.timeSpent < 300 && !userAchievementIds.includes('speed_demon')) {
    newAchievements.push({
      id: 'speed_demon',
      name: 'Éclair',
      description: 'Complétez une chasse en moins de 5 minutes',
      icon: '⚡',
      unlockedAt: new Date().toISOString(),
      points: 200,
      rarity: 'rare'
    });
  }

  // Perfect Score Achievement
  if (action === 'hunt_completed' && session.hintsUsed === 0 && !userAchievementIds.includes('perfect_score')) {
    newAchievements.push({
      id: 'perfect_score',
      name: 'Score Parfait',
      description: 'Complétez une chasse sans utiliser d\'indices',
      icon: '🎯',
      unlockedAt: new Date().toISOString(),
      points: 150,
      rarity: 'rare'
    });
  }

  // Explorer Achievement
  if (action === 'hunt_completed' && user.completedHunts.length + 1 === 5 && !userAchievementIds.includes('explorer')) {
    newAchievements.push({
      id: 'explorer',
      name: 'Explorateur',
      description: 'Complétez 5 chasses au trésor',
      icon: '🗺️',
      unlockedAt: new Date().toISOString(),
      points: 300,
      rarity: 'epic'
    });
  }

  // Master Hunter Achievement
  if (action === 'hunt_completed' && user.completedHunts.length + 1 === 20 && !userAchievementIds.includes('master_hunter')) {
    newAchievements.push({
      id: 'master_hunter',
      name: 'Maître Chasseur',
      description: 'Complétez 20 chasses au trésor',
      icon: '👑',
      unlockedAt: new Date().toISOString(),
      points: 500,
      rarity: 'legendary'
    });
  }

  return newAchievements;
};

export const calculateLevel = (points: number): number => {
  return Math.floor(points / 1000) + 1;
};

export const getPointsForNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 1000 - currentPoints;
};