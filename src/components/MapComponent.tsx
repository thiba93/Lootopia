import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TreasureHunt, Clue } from '../types';
import { MapPin, Target, CheckCircle, Navigation } from 'lucide-react';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  hunt: TreasureHunt;
  userLocation: { lat: number; lng: number } | null;
  currentClue: Clue | null;
  completedClues: string[];
  onClueClick?: (clue: Clue) => void;
  className?: string;
}

// Custom icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 14px;
      ">
        ${icon}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const userIcon = createCustomIcon('#3B82F6', '📍');
const startIcon = createCustomIcon('#F97316', '🏁');
const currentClueIcon = createCustomIcon('#EAB308', '⚡');
const completedClueIcon = createCustomIcon('#10B981', '✅');
const pendingClueIcon = createCustomIcon('#8B5CF6', '❓');

// Component to handle map centering
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  hunt,
  userLocation,
  currentClue,
  completedClues,
  onClueClick,
  className = ''
}) => {
  const mapRef = useRef<L.Map>(null);
  
  // Determine map center
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [hunt.location.lat, hunt.location.lng];

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
    }
  };

  const centerOnClue = (clue: Clue) => {
    if (mapRef.current) {
      mapRef.current.setView([clue.location.lat, clue.location.lng], 17);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={centerOnUser}
          disabled={!userLocation}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Centrer sur ma position"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
        
        {currentClue && (
          <button
            onClick={() => centerOnClue(currentClue)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
            title="Centrer sur l'indice actuel"
          >
            <Target className="w-5 h-5 text-yellow-600" />
          </button>
        )}
      </div>

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={15}
        className="w-full h-full rounded-xl"
        zoomControl={true}
      >
        <MapController center={mapCenter} zoom={15} />
        
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600 mb-1">Votre position</div>
                <div className="text-sm text-gray-600">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hunt Start Location */}
        <Marker
          position={[hunt.location.lat, hunt.location.lng]}
          icon={startIcon}
        >
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-orange-600 mb-1">Point de départ</div>
              <div className="text-sm text-gray-600">{hunt.location.address}</div>
              <div className="text-xs text-gray-500 mt-1">{hunt.title}</div>
            </div>
          </Popup>
        </Marker>

        {/* Clues */}
        {hunt.clues.map((clue, index) => {
          const isCompleted = completedClues.includes(clue.id);
          const isCurrent = currentClue?.id === clue.id;
          
          let icon = pendingClueIcon;
          let popupColor = 'text-purple-600';
          
          if (isCompleted) {
            icon = completedClueIcon;
            popupColor = 'text-green-600';
          } else if (isCurrent) {
            icon = currentClueIcon;
            popupColor = 'text-yellow-600';
          }

          return (
            <React.Fragment key={clue.id}>
              <Marker
                position={[clue.location.lat, clue.location.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onClueClick?.(clue)
                }}
              >
                <Popup>
                  <div className="text-center max-w-xs">
                    <div className={`font-semibold ${popupColor} mb-2`}>
                      Indice {index + 1}
                      {isCompleted && ' ✅'}
                      {isCurrent && ' ⚡'}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {clue.text.length > 100 ? `${clue.text.substring(0, 100)}...` : clue.text}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{clue.points} points</span>
                      <span className="capitalize">{clue.type}</span>
                    </div>
                    {isCurrent && (
                      <div className="mt-2 text-xs text-yellow-600 font-medium">
                        Indice actuel
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              {/* Proximity circle for current clue */}
              {isCurrent && (
                <Circle
                  center={[clue.location.lat, clue.location.lng]}
                  radius={clue.radius || 50}
                  pathOptions={{
                    color: '#EAB308',
                    fillColor: '#EAB308',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold text-gray-700 mb-2">Légende</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Votre position</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Point de départ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Indice actuel</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Indice complété</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Indice à venir</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;