import React, { useState } from 'react';
import { MapPin, Search, Navigation, Check } from 'lucide-react';
import MapComponent from './MapComponent';
import { TreasureHunt } from '../types';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number; address?: string };
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onClose: () => void;
  title?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation = { lat: 48.8566, lng: 2.3522 },
  onLocationSelect,
  onClose,
  title = "Choisir une position"
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState(initialLocation.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Mock hunt for map display
  const mockHunt: TreasureHunt = {
    id: 'temp',
    title: 'Position Selection',
    description: '',
    difficulty: 'medium',
    category: '',
    location: selectedLocation,
    clues: [],
    rewards: [],
    participants: 0,
    maxParticipants: 50,
    duration: 60,
    createdBy: 'temp',
    createdAt: new Date().toISOString(),
    status: 'active',
    rating: 0,
    reviews: [],
    tags: [],
    isPublic: true
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // Reverse geocoding simulation
    setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsGeocoding(true);
    try {
      // Using Nominatim API for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        setSelectedLocation(newLocation);
        setAddress(result.display_name || searchQuery);
      } else {
        alert('Adresse non trouvée. Essayez une autre recherche.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(newLocation);
          setAddress(`Position actuelle: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Impossible d\'obtenir votre position. Vérifiez les permissions de géolocalisation.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  const handleConfirm = () => {
    onLocationSelect({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-6xl h-[90vh] border border-white/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-blue-400" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une adresse..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isGeocoding || !searchQuery.trim()}
              className="bg-blue-500/20 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeocoding ? '...' : 'Rechercher'}
            </button>
            <button
              onClick={handleCurrentLocation}
              className="bg-green-500/20 text-green-400 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors"
              title="Ma position actuelle"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 p-6">
          <MapComponent
            hunt={mockHunt}
            userLocation={null}
            currentClue={null}
            completedClues={[]}
            onMapClick={handleMapClick}
            className="h-full"
            interactive={true}
          />
        </div>

        {/* Selected Location Info */}
        <div className="p-6 border-t border-white/10">
          <div className="mb-4">
            <label className="block text-white/70 mb-2">Position sélectionnée:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse ou description..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Confirmer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;