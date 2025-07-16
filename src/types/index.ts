export interface User {
  id: string;
  username: string;
  email: string;
  role: 'player' | 'organizer';
  points: number;
  level: number;
  achievements: Achievement[];
  createdAt: string;
  avatar?: string;
  completedHunts: string[];
  createdHunts: string[];
  activeHunts: string[]; // Chasses en cours
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TreasureHunt {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  clues: Clue[];
  rewards: Reward[];
  participants: number;
  maxParticipants: number;
  duration: number; // in minutes
  createdBy: string;
  createdAt: string;
  status: 'active' | 'completed' | 'draft';
  image?: string;
  rating: number;
  reviews: Review[];
  tags: string[];
  isPublic: boolean;
}

export interface Clue {
  id: string;
  order: number;
  text: string;
  hint?: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'text' | 'image' | 'qr' | 'riddle' | 'photo';
  answer?: string;
  points: number;
  radius: number; // meters for location validation
  isCompleted?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'badge' | 'item';
  value: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameSession {
  id: string;
  huntId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  currentClueIndex: number;
  score: number;
  status: 'active' | 'completed' | 'abandoned';
  completedClues: string[];
  timeSpent: number;
  hintsUsed: number;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'hunt_completed' | 'new_hunt' | 'level_up';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}