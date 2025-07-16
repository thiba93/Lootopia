/*
  # Insertion de données d'exemple

  1. Achievements par défaut
  2. Chasses au trésor d'exemple
  3. Indices et récompenses associés

  Note: Les utilisateurs seront créés automatiquement lors de l'inscription
*/

-- Insertion des achievements par défaut
INSERT INTO achievements (id, name, description, icon, points, rarity, condition_type, condition_value) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Premier Trésor', 'Complétez votre première chasse au trésor', '🏆', 100, 'common', 'hunts_completed', '{"count": 1}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Explorateur', 'Participez à 5 chasses au trésor', '🗺️', 200, 'rare', 'hunts_completed', '{"count": 5}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Éclair', 'Complétez une chasse en moins de 5 minutes', '⚡', 200, 'rare', 'time_limit', '{"seconds": 300}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Score Parfait', 'Complétez une chasse sans utiliser d''indices', '🎯', 150, 'rare', 'no_hints', '{}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Maître Chasseur', 'Complétez 20 chasses au trésor', '👑', 500, 'legendary', 'hunts_completed', '{"count": 20}'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Créateur', 'Créez votre première chasse au trésor', '✨', 150, 'rare', 'hunts_created', '{"count": 1}'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Mentor', 'Créez 5 chasses au trésor', '🎓', 300, 'epic', 'hunts_created', '{"count": 5}')
ON CONFLICT (id) DO NOTHING;

-- Insertion de chasses au trésor d'exemple (sera associé au premier utilisateur qui se connecte)
INSERT INTO treasure_hunts (id, title, description, difficulty, category, location_lat, location_lng, location_address, duration, max_participants, image_url, tags, created_by) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'Les Secrets du Louvre',
    'Découvrez les mystères cachés du plus grand musée du monde. Une aventure culturelle unique vous attend !',
    'medium',
    'Culture',
    48.8606,
    2.3376,
    'Musée du Louvre, Paris',
    120,
    100,
    'https://images.pexels.com/photos/2675061/pexels-photo-2675061.jpeg?auto=compress&cs=tinysrgb&w=800',
    '{"culture", "art", "histoire"}',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'Mystères de Montmartre',
    'Explorez les ruelles pittoresques de Montmartre et découvrez ses secrets artistiques.',
    'easy',
    'Histoire',
    48.8867,
    2.3431,
    'Montmartre, Paris',
    90,
    60,
    'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800',
    '{"art", "histoire", "balade"}',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Le Trésor de Notre-Dame',
    'Une chasse au trésor historique autour de la cathédrale Notre-Dame de Paris.',
    'hard',
    'Architecture',
    48.8530,
    2.3499,
    'Cathédrale Notre-Dame, Paris',
    150,
    30,
    'https://images.pexels.com/photos/1125784/pexels-photo-1125784.jpeg?auto=compress&cs=tinysrgb&w=800',
    '{"architecture", "histoire", "défi"}',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Insertion des indices pour "Les Secrets du Louvre"
INSERT INTO clues (hunt_id, order_number, text, type, location_lat, location_lng, points, radius, hint, answer) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 1, 'Trouvez la pyramide de verre qui garde l''entrée du palais des rois.', 'riddle', 48.8606, 2.3376, 100, 50, 'Elle brille sous le soleil et reflète le ciel', 'pyramide'),
  ('550e8400-e29b-41d4-a716-446655440010', 2, 'Dans la galerie des glaces du temps, cherchez le sourire énigmatique.', 'riddle', 48.8608, 2.3378, 150, 30, 'Elle est plus célèbre que toutes les autres', 'mona lisa'),
  ('550e8400-e29b-41d4-a716-446655440010', 3, 'Trouvez la déesse ailée qui a perdu ses bras mais garde sa beauté.', 'riddle', 48.8610, 2.3380, 200, 40, 'Elle vient de l''île grecque de Milos', 'venus de milo');

-- Insertion des indices pour "Mystères de Montmartre"
INSERT INTO clues (hunt_id, order_number, text, type, location_lat, location_lng, points, radius) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 1, 'Montez vers la basilique blanche qui domine la ville.', 'text', 48.8867, 2.3431, 80, 100),
  ('550e8400-e29b-41d4-a716-446655440011', 2, 'Trouvez la place où les artistes peignent les portraits des passants.', 'text', 48.8869, 2.3433, 100, 75);

-- Insertion des indices pour "Le Trésor de Notre-Dame"
INSERT INTO clues (hunt_id, order_number, text, type, location_lat, location_lng, points, radius, hint, answer) VALUES
  ('550e8400-e29b-41d4-a716-446655440012', 1, 'Trouvez les tours jumelles qui ont inspiré Victor Hugo.', 'riddle', 48.8530, 2.3499, 120, 75, 'Elles sonnent les heures depuis des siècles', 'tours'),
  ('550e8400-e29b-41d4-a716-446655440012', 2, 'Cherchez la rosace qui illumine l''intérieur de mille couleurs.', 'riddle', 48.8532, 2.3501, 150, 50, 'Elle raconte des histoires saintes en verre coloré', 'rosace'),
  ('550e8400-e29b-41d4-a716-446655440012', 3, 'Trouvez les gargouilles qui protègent la cathédrale des esprits maléfiques.', 'riddle', 48.8534, 2.3503, 180, 60, 'Elles crachent l''eau de pluie loin des murs', 'gargouilles');

-- Insertion des récompenses pour chaque chasse
INSERT INTO rewards (hunt_id, name, description, type, value, icon, rarity) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Badge Explorateur du Louvre', 'Vous avez exploré les secrets du Louvre', 'badge', 200, '🏛️', 'rare'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Points Culture', 'Récompense culturelle', 'points', 300, '📚', 'common'),
  
  ('550e8400-e29b-41d4-a716-446655440011', 'Badge Artiste', 'Vous avez découvert l''âme artistique de Montmartre', 'badge', 150, '🎨', 'common'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Points Créativité', 'Récompense artistique', 'points', 200, '🖌️', 'common'),
  
  ('550e8400-e29b-41d4-a716-446655440012', 'Badge Gardien de Notre-Dame', 'Vous avez protégé les secrets de Notre-Dame', 'badge', 300, '⛪', 'epic'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Points Architecture', 'Récompense architecturale', 'points', 400, '🏗️', 'rare');