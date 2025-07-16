import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, MapPin, Save } from 'lucide-react';
import { TreasureHunt, Clue, Reward } from '../types';
import MapComponent from './MapComponent';

interface CreateHuntProps {
  onCreateHunt: (hunt: Omit<TreasureHunt, 'id' | 'createdAt'>) => void;
  onBack: () => void;
}

const CreateHunt: React.FC<CreateHuntProps> = ({ onCreateHunt, onBack }) => {
  const [huntData, setHuntData] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as const,
    category: '',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: ''
    },
    duration: 60,
    maxParticipants: 50
  });

  const [clues, setClues] = useState<Omit<Clue, 'id'>[]>([]);
  const [rewards, setRewards] = useState<Omit<Reward, 'id'>[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedClueIndex, setSelectedClueIndex] = useState<number | null>(null);

  const addClue = () => {
    setClues([...clues, {
      order: clues.length + 1,
      text: '',
      type: 'text',
      location: { lat: 48.8566, lng: 2.3522 },
      points: 100
    }]);
  };

  const updateClue = (index: number, field: keyof Clue, value: any) => {
    const updatedClues = [...clues];
    updatedClues[index] = { ...updatedClues[index], [field]: value };
    setClues(updatedClues);
  };

  const removeClue = (index: number) => {
    setClues(clues.filter((_, i) => i !== index));
  };

  const addReward = () => {
    setRewards([...rewards, {
      name: '',
      description: '',
      type: 'badge',
      value: 100,
      icon: '🏆'
    }]);
  };

  const updateReward = (index: number, field: keyof Reward, value: any) => {
    const updatedRewards = [...rewards];
    updatedRewards[index] = { ...updatedRewards[index], [field]: value };
    setRewards(updatedRewards);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!huntData.title || !huntData.description || !huntData.category || !huntData.location.address) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (clues.length === 0) {
      alert('Veuillez ajouter au moins un indice');
      return;
    }
    
    const hunt: Omit<TreasureHunt, 'id' | 'createdAt'> = {
      ...huntData,
      clues: clues.map((clue, index) => ({
        ...clue,
        id: `clue-${index + 1}`,
        order: index + 1,
        radius: clue.radius || 50
      })),
      rewards: rewards.map((reward, index) => ({
        ...reward,
        id: `reward-${index + 1}`,
        rarity: reward.rarity || 'common'
      })),
      participants: 0,
      createdBy: 'user',
      status: 'active',
      rating: 0,
      reviews: [],
      isPublic: true
    };

    console.log('🔄 Soumission chasse:', hunt);
    onCreateHunt(hunt);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (selectedClueIndex !== null) {
      updateClue(selectedClueIndex, 'location', { lat, lng });
      setShowMap(false);
      setSelectedClueIndex(null);
    } else {
      // Update hunt location
      setHuntData({
        ...huntData,
        location: { ...huntData.location, lat, lng }
      });
      setShowMap(false);
    }
  };

  const openMapForLocation = () => {
    setSelectedClueIndex(null);
    setShowMap(true);
  };

  const openMapForClue = (index: number) => {
    setSelectedClueIndex(index);
    setShowMap(true);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Créer une chasse au trésor</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Informations générales</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/70 mb-2">Titre</label>
                <input
                  type="text"
                  value={huntData.title}
                  onChange={(e) => setHuntData({...huntData, title: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Les Secrets du Louvre"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white/70 mb-2">Catégorie</label>
                <input
                  type="text"
                  value={huntData.category}
                  onChange={(e) => setHuntData({...huntData, category: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Culture, Histoire, Art"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-white/70 mb-2">Description</label>
              <textarea
                value={huntData.description}
                onChange={(e) => setHuntData({...huntData, description: e.target.value})}
                rows={4}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Décrivez votre chasse au trésor..."
                required
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-white/70 mb-2">Difficulté</label>
                <select
                  value={huntData.difficulty}
                  onChange={(e) => setHuntData({...huntData, difficulty: e.target.value as any})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy" className="bg-gray-800">Facile</option>
                  <option value="medium" className="bg-gray-800">Moyen</option>
                  <option value="hard" className="bg-gray-800">Difficile</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white/70 mb-2">Durée (minutes)</label>
                <input
                  type="number"
                  value={huntData.duration}
                  onChange={(e) => setHuntData({...huntData, duration: parseInt(e.target.value)})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="30"
                  max="480"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white/70 mb-2">Participants max</label>
                <input
                  type="number"
                  value={huntData.maxParticipants}
                  onChange={(e) => setHuntData({...huntData, maxParticipants: parseInt(e.target.value)})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="1000"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-white/70 mb-2">Localisation</label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-white/60" />
                <input
                  type="text"
                  value={huntData.location.address}
                  onChange={(e) => setHuntData({...huntData, location: {...huntData.location, address: e.target.value}})}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Adresse de départ"
                  required
                />
                <button
                  type="button"
                  onClick={openMapForLocation}
                  className="bg-blue-500/20 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="Choisir sur la carte"
                >
                  🗺️
                </button>
              </div>
              {huntData.location.lat !== 48.8566 && huntData.location.lng !== 2.3522 && (
                <div className="mt-2 text-sm text-green-400">
                  📍 Position: {huntData.location.lat.toFixed(6)}, {huntData.location.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Clues Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Indices</h2>
              <button
                type="button"
                onClick={addClue}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un indice</span>
              </button>
            </div>
            
            {clues.map((clue, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Indice {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeClue(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-2">Texte de l'indice</label>
                    <textarea
                      value={clue.text}
                      onChange={(e) => updateClue(index, 'text', e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Décrivez l'indice..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 mb-2">Position</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={`${clue.location?.lat?.toFixed(6) || huntData.location.lat.toFixed(6)}, ${clue.location?.lng?.toFixed(6) || huntData.location.lng.toFixed(6)}`}
                          readOnly
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => openMapForClue(index)}
                          className="bg-blue-500/20 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Choisir sur la carte"
                        >
                          🗺️
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">Type</label>
                      <select
                        value={clue.type}
                        onChange={(e) => updateClue(index, 'type', e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="text" className="bg-gray-800">Texte</option>
                        <option value="riddle" className="bg-gray-800">Énigme</option>
                        <option value="image" className="bg-gray-800">Image</option>
                        <option value="qr" className="bg-gray-800">QR Code</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 mb-2">Points</label>
                      <input
                        type="number"
                        value={clue.points}
                        onChange={(e) => updateClue(index, 'points', parseInt(e.target.value))}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="10"
                        max="500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {clues.length === 0 && (
              <div className="text-center py-8 text-white/60">
                Aucun indice ajouté. Cliquez sur "Ajouter un indice" pour commencer.
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Récompenses</h2>
              <button
                type="button"
                onClick={addReward}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une récompense</span>
              </button>
            </div>
            
            {rewards.map((reward, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Récompense {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeReward(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-2">Nom</label>
                    <input
                      type="text"
                      value={reward.name}
                      onChange={(e) => updateReward(index, 'name', e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nom de la récompense"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 mb-2">Icône</label>
                    <input
                      type="text"
                      value={reward.icon}
                      onChange={(e) => updateReward(index, 'icon', e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="🏆"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-white/70 mb-2">Description</label>
                  <textarea
                    value={reward.description}
                    onChange={(e) => updateReward(index, 'description', e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Description de la récompense..."
                    rows={2}
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-white/70 mb-2">Type</label>
                    <select
                      value={reward.type}
                      onChange={(e) => updateReward(index, 'type', e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="badge" className="bg-gray-800">Badge</option>
                      <option value="points" className="bg-gray-800">Points</option>
                      <option value="item" className="bg-gray-800">Objet</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 mb-2">Valeur</label>
                    <input
                      type="number"
                      value={reward.value}
                      onChange={(e) => updateReward(index, 'value', parseInt(e.target.value))}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {rewards.length === 0 && (
              <div className="text-center py-8 text-white/60">
                Aucune récompense ajoutée. Cliquez sur "Ajouter une récompense" pour commencer.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!huntData.title || !huntData.description || clues.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              <Save className="w-5 h-5" />
              <span>Créer la chasse au trésor</span>
            </button>
          </div>
        </form>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-6xl h-[85vh] border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {selectedClueIndex !== null 
                    ? `Choisir la position de l'indice ${selectedClueIndex + 1}`
                    : 'Choisir la position de départ'
                  }
                </h3>
                <button
                  onClick={() => {
                    setShowMap(false);
                    setSelectedClueIndex(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="h-[calc(100%-4rem)]">
                <MapComponent
                  hunt={{
                    ...huntData,
                    id: 'temp',
                    clues: clues.map((clue, i) => ({
                      ...clue,
                      id: `temp-${i}`,
                      order: i + 1,
                      location: clue.location || huntData.location,
                      radius: clue.radius || 50
                    })),
                    rewards: [],
                    participants: 0,
                    createdBy: 'temp',
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    rating: 0,
                    reviews: [],
                    isPublic: true
                  }}
                  userLocation={null}
                  currentClue={null}
                  completedClues={[]}
                  className="h-full"
                  onMapClick={handleMapClick}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm">
                  Cliquez sur la carte pour définir la position
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateHunt;