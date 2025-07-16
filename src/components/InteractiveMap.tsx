import React from 'react';
import MapComponent from './MapComponent';
import { TreasureHunt, Clue } from '../types';

interface InteractiveMapProps {
  hunt: TreasureHunt;
  userLocation: { lat: number; lng: number } | null;
  currentClue: Clue | null;
  completedClues: string[];
  onClueClick?: (clue: Clue) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          🗺️ Carte interactive
        </h3>
        <div className="text-sm text-white/60">
          OpenStreetMap
        </div>
      </div>
      
      <div className="h-96 rounded-xl overflow-hidden">
        <MapComponent
          {...props}
          className="h-full"
        />
      </div>
      
      {/* Distance info */}
      {props.userLocation && props.currentClue && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Distance jusqu'à l'indice actuel:</span>
            <span className="text-white font-semibold">
              {(() => {
                const distance = calculateDistance(
                  props.userLocation!.lat,
                  props.userLocation!.lng,
                  props.currentClue!.location.lat,
                  props.currentClue!.location.lng
                );
                return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for distance calculation
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Convert to meters
};

export default InteractiveMap;