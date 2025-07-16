import React from 'react';
import MapComponent from './MapComponent';
import { TreasureHunt, Clue } from '../types';
import { MapPin, Navigation, Target } from 'lucide-react';

interface InteractiveMapProps {
  hunt: TreasureHunt;
  userLocation: { lat: number; lng: number } | null;
  currentClue: Clue | null;
  completedClues: string[];
  onClueClick?: (clue: Clue) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  const { hunt, userLocation, currentClue, completedClues } = props;

  // Calculate progress
  const progress = hunt.clues.length > 0 ? (completedClues.length / hunt.clues.length) * 100 : 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-400" />
          Carte interactive
        </h3>
        <div className="flex items-center space-x-2 text-sm text-white/60">
          <span>OpenStreetMap</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-white/70 mb-2">
          <span>Progression</span>
          <span>{completedClues.length} / {hunt.clues.length} indices</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="h-96 rounded-xl overflow-hidden border border-white/10">
        <MapComponent
          {...props}
          className="h-full"
          interactive={true}
        />
      </div>
      
      {/* Map Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="text-white/70 text-sm">Position</span>
          </div>
          <div className="text-white font-medium text-sm">
            {userLocation ? 'GPS actif' : 'GPS désactivé'}
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-white/70 text-sm">Indice actuel</span>
          </div>
          <div className="text-white font-medium text-sm">
            {currentClue ? `#${hunt.clues.findIndex(c => c.id === currentClue.id) + 1}` : 'Terminé'}
          </div>
        </div>
      </div>
      
      {/* Distance info */}
      {userLocation && currentClue && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm">Distance jusqu'à l'indice actuel:</span>
            </div>
            <span className="text-white font-semibold">
              {(() => {
                const R = 6371; // Earth's radius in km
                const dLat = (currentClue.location.lat - userLocation.lat) * Math.PI / 180;
                const dLng = (currentClue.location.lng - userLocation.lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(currentClue.location.lat * Math.PI / 180) *
                         Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c * 1000; // Convert to meters
                
                if (distance < 1000) {
                  return `${Math.round(distance)}m`;
                } else {
                  return `${(distance / 1000).toFixed(1)}km`;
                }
              })()}
            </span>
          </div>
          
          {/* Proximity indicator */}
          {currentClue.radius && (
            <div className="mt-2 text-xs text-white/60">
              {(() => {
                const R = 6371;
                const dLat = (currentClue.location.lat - userLocation.lat) * Math.PI / 180;
                const dLng = (currentClue.location.lng - userLocation.lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(currentClue.location.lat * Math.PI / 180) *
                         Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c * 1000;
                
                if (distance <= currentClue.radius) {
                  return '🎯 Vous êtes dans la zone de validation !';
                } else {
                  return `📍 Rapprochez-vous de ${Math.round(distance - currentClue.radius)}m pour valider`;
                }
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;