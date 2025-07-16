import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Target, Compass, Zap } from 'lucide-react';
import { TreasureHunt, Clue } from '../types';
import { calculateDistance, formatDistance } from '../utils/distance';

interface InteractiveMapProps {
  hunt: TreasureHunt;
  userLocation: { lat: number; lng: number } | null;
  currentClue: Clue | null;
  completedClues: string[];
  onClueClick?: (clue: Clue) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hunt,
  userLocation,
  currentClue,
  completedClues,
  onClueClick
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: hunt.location.lat, lng: hunt.location.lng });
  const [zoom, setZoom] = useState(15);

  // Simuler une carte interactive simple
  const mapWidth = 400;
  const mapHeight = 300;
  
  // Convertir les coordonnées géographiques en coordonnées pixel pour l'affichage
  const coordsToPixel = (lat: number, lng: number) => {
    const latRange = 0.01; // ~1km
    const lngRange = 0.01;
    
    const x = ((lng - mapCenter.lng + lngRange/2) / lngRange) * mapWidth;
    const y = ((mapCenter.lat - lat + latRange/2) / latRange) * mapHeight;
    
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  const getClueIcon = (clue: Clue, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <Target className="w-4 h-4 text-green-400" />;
    } else if (isCurrent) {
      return <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />;
    } else {
      return <MapPin className="w-4 h-4 text-purple-400" />;
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const centerOnClue = (clue: Clue) => {
    setMapCenter(clue.location);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Compass className="w-5 h-5 mr-2" />
          Carte interactive
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={centerOnUser}
            disabled={!userLocation}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Centrer sur ma position"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(Math.min(20, zoom + 1))}
              className="px-2 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition-colors"
            >
              +
            </button>
            <span className="text-white/60 text-sm min-w-[2rem] text-center">{zoom}</span>
            <button
              onClick={() => setZoom(Math.max(10, zoom - 1))}
              className="px-2 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition-colors"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Carte simulée */}
      <div 
        className="relative bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl overflow-hidden border border-white/10"
        style={{ width: mapWidth, height: mapHeight }}
      >
        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute bg-white/20" style={{
              left: `${(i * 5)}%`,
              top: 0,
              width: '1px',
              height: '100%'
            }} />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute bg-white/20" style={{
              top: `${(i * 6.67)}%`,
              left: 0,
              height: '1px',
              width: '100%'
            }} />
          ))}
        </div>

        {/* Position utilisateur */}
        {userLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={coordsToPixel(userLocation.lat, userLocation.lng)}
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        )}

        {/* Indices */}
        {hunt.clues.map((clue, index) => {
          const isCompleted = completedClues.includes(clue.id);
          const isCurrent = currentClue?.id === clue.id;
          const position = coordsToPixel(clue.location.lat, clue.location.lng);
          
          return (
            <div
              key={clue.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={position}
            >
              <button
                onClick={() => onClueClick?.(clue)}
                className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                  isCompleted 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : isCurrent 
                      ? 'bg-yellow-500 hover:bg-yellow-600 animate-bounce' 
                      : 'bg-purple-500 hover:bg-purple-600'
                }`}
                title={`Indice ${index + 1}: ${clue.text.substring(0, 50)}...`}
              >
                {getClueIcon(clue, isCompleted, isCurrent)}
              </button>
              
              {/* Rayon de proximité pour l'indice actuel */}
              {isCurrent && (
                <div
                  className="absolute border-2 border-yellow-400/30 rounded-full pointer-events-none"
                  style={{
                    width: `${(clue.radius || 50) / 10}px`,
                    height: `${(clue.radius || 50) / 10}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Point de départ */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={coordsToPixel(hunt.location.lat, hunt.location.lng)}
        >
          <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Informations de distance */}
      {userLocation && currentClue && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Distance jusqu'à l'indice actuel:</span>
            <span className="text-white font-semibold">
              {formatDistance(calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                currentClue.location.lat, 
                currentClue.location.lng
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-white/60">Votre position</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-white/60">Point de départ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-white/60">Indice actuel</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-white/60">Indice complété</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;