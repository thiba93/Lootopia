import { TreasureHunt, User, Achievement } from '../types';

export const mockUser: User = {
  id: '1',
  username: 'TreasureHunter',
  email: 'hunter@example.com',
  points: 1250,
  level: 5,
  achievements: [
    {
      id: '1',
      name: 'Premier Trésor',
      description: 'Complétez votre première chasse au trésor',
      icon: '🏆',
      unlockedAt: '2024-01-15T10:00:00Z',
      points: 100,
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Explorateur',
      description: 'Participez à 5 chasses au trésor',
      icon: '🗺️',
      unlockedAt: '2024-01-20T14:30:00Z',
      points: 200,
      rarity: 'rare'
    }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  completedHunts: ['1', '2'],
  createdHunts: ['3']
};

export const mockTreasureHunts: TreasureHunt[] = [
  {
    id: '1',
    title: 'Les Secrets du Louvre',
    description: 'Découvrez les mystères cachés du plus grand musée du monde. Une aventure culturelle unique vous attend !',
    difficulty: 'medium',
    category: 'Culture',
    location: {
      lat: 48.8606,
      lng: 2.3376,
      address: 'Musée du Louvre, Paris'
    },
    clues: [
      {
        id: '1',
        order: 1,
        text: 'Trouvez la pyramide de verre qui garde l\'entrée du palais des rois.',
        type: 'riddle',
        location: { lat: 48.8606, lng: 2.3376 },
        points: 100,
        radius: 50
      },
      {
        id: '2',
        order: 2,
        text: 'Dans la galerie des glaces du temps, cherchez le sourire énigmatique.',
        type: 'riddle',
        location: { lat: 48.8608, lng: 2.3378 },
        points: 150,
        radius: 30,
        answer: 'mona lisa'
      }
    ],
    rewards: [
      {
        id: '1',
        name: 'Badge Explorateur du Louvre',
        description: 'Vous avez exploré les secrets du Louvre',
        type: 'badge',
        value: 200,
        icon: '🏛️',
        rarity: 'rare'
      }
    ],
    participants: 45,
    maxParticipants: 100,
    duration: 120,
    createdBy: 'admin',
    createdAt: '2024-01-10T09:00:00Z',
    status: 'active',
    image: 'https://images.pexels.com/photos/2675061/pexels-photo-2675061.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    reviews: [],
    tags: ['culture', 'art', 'histoire'],
    isPublic: true
  },
  {
    id: '2',
    title: 'Mystères de Montmartre',
    description: 'Explorez les ruelles pittoresques de Montmartre et découvrez ses secrets artistiques.',
    difficulty: 'easy',
    category: 'Histoire',
    location: {
      lat: 48.8867,
      lng: 2.3431,
      address: 'Montmartre, Paris'
    },
    clues: [
      {
        id: '3',
        order: 1,
        text: 'Montez vers la basilique blanche qui domine la ville.',
        type: 'text',
        location: { lat: 48.8867, lng: 2.3431 },
        points: 80,
        radius: 100
      }
    ],
    rewards: [
      {
        id: '2',
        name: 'Badge Artiste',
        description: 'Vous avez découvert l\'âme artistique de Montmartre',
        type: 'badge',
        value: 150,
        icon: '🎨',
        rarity: 'common'
      }
    ],
    participants: 28,
    maxParticipants: 60,
    duration: 90,
    createdBy: 'admin',
    createdAt: '2024-01-12T14:00:00Z',
    status: 'active',
    image: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.2,
    reviews: [],
    tags: ['art', 'histoire', 'balade'],
    isPublic: true
  },
  {
    id: '3',
    title: 'Le Trésor de Notre-Dame',
    description: 'Une chasse au trésor historique autour de la cathédrale Notre-Dame de Paris.',
    difficulty: 'hard',
    category: 'Architecture',
    location: {
      lat: 48.8530,
      lng: 2.3499,
      address: 'Cathédrale Notre-Dame, Paris'
    },
    clues: [
      {
        id: '4',
        order: 1,
        text: 'Trouvez les tours jumelles qui ont inspiré Victor Hugo.',
        type: 'riddle',
        location: { lat: 48.8530, lng: 2.3499 },
        points: 120,
        radius: 75
      }
    ],
    rewards: [
      {
        id: '3',
        name: 'Badge Gardien de Notre-Dame',
        description: 'Vous avez protégé les secrets de Notre-Dame',
        type: 'badge',
        value: 300,
        icon: '⛪',
        rarity: 'epic'
      }
    ],
    participants: 15,
    maxParticipants: 30,
    duration: 150,
    createdBy: 'admin',
    createdAt: '2024-01-08T11:00:00Z',
    status: 'active',
    image: 'https://images.pexels.com/photos/1125784/pexels-photo-1125784.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    reviews: [],
    tags: ['architecture', 'histoire', 'défi'],
    isPublic: true
  }
];