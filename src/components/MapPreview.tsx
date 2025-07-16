import React from 'react';
import MapComponent from './MapComponent';
import { TreasureHunt } from '../types';
import { MapPin, Navigation, Eye } from 'lucide-react';

interface MapPreviewProps {
  hunt: TreasureHunt;
  className?: string;
  showControls?: boolean;
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  hunt, 
  className = '', 
  showControls = false 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Preview Overlay */}
      <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2 text-gray-700">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Aperçu de la carte</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-full rounded-xl overflow-hidden border border-white/10">
        <MapComponent
          hunt={hunt}
          userLocation={null}
          currentClue={null}
          completedClues={[]}
          className="h-full"
          interactive={false}
        />
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {hunt.location.address}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {hunt.clues.length} indices
            </div>
          </div>
          
          {hunt.clues.length > 0 && (
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>📍 Point de départ</span>
              <span>🎯 {hunt.clues.length} indices</span>
              <span>⏱️ {hunt.duration}min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPreview;