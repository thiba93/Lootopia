import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TreasureHunt, Clue } from '../types';
import { MapPin, Target, CheckCircle, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';

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
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  interactive?: boolean;
}

// Custom icons with better styling
const createCustomIcon = (color: string, icon: string, size: number = 30) => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: ${size * 0.5}px;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${icon}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Map tile providers
const tileProviders = {
  openstreetmap: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
  }
};

// Icons
const userIcon = createCustomIcon('#3B82F6', '📍', 35);
const startIcon = createCustomIcon('#F97316', '🏁', 35);
const currentClueIcon = createCustomIcon('#EAB308', '⚡', 32);
const completedClueIcon = createCustomIcon('#10B981', '✅', 32);
const pendingClueIcon = createCustomIcon('#8B5CF6', '❓', 32);

// Component to handle map centering and events
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ center, zoom, onMapClick }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  useEffect(() => {
    if (onMapClick) {
      const handleClick = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      };
      
      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, onMapClick]);
  
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  hunt,
  userLocation,
  currentClue,
  completedClues,
  onClueClick,
  onMapClick,
  className = '',
  interactive = true
}) => {
  const mapRef = useRef<L.Map>(null);
  const [selectedTileProvider, setSelectedTileProvider] = useState<keyof typeof tileProviders>('openstreetmap');
  const [mapZoom, setMapZoom] = useState(15);
  
  // Determine map center
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [hunt.location.lat, hunt.location.lng];

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
      setMapZoom(16);
    }
  };

  const centerOnClue = (clue: Clue) => {
    if (mapRef.current) {
      mapRef.current.setView([clue.location.lat, clue.location.lng], 17);
      setMapZoom(17);
    }
  };

  const fitAllMarkers = () => {
    if (mapRef.current) {
      const group = new L.FeatureGroup();
      
      // Add all markers to group
      if (userLocation) {
        group.addLayer(L.marker([userLocation.lat, userLocation.lng]));
      }
      group.addLayer(L.marker([hunt.location.lat, hunt.location.lng]));
      hunt.clues.forEach(clue => {
        group.addLayer(L.marker([clue.location.lat, clue.location.lng]));
      });
      
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      const newZoom = Math.min(mapZoom + 1, 18);
      mapRef.current.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      const newZoom = Math.max(mapZoom - 1, 1);
      mapRef.current.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          {/* Tile Provider Selector */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <select
              value={selectedTileProvider}
              onChange={(e) => setSelectedTileProvider(e.target.value as keyof typeof tileProviders)}
              className="bg-transparent p-2 text-sm font-medium text-gray-700 border-none outline-none cursor-pointer"
              title="Changer le type de carte"
            >
              {Object.entries(tileProviders).map(([key, provider]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={zoomIn}
              className="block w-full p-2 hover:bg-gray-100 transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-5 h-5 text-gray-700 mx-auto" />
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={zoomOut}
              className="block w-full p-2 hover:bg-gray-100 transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-5 h-5 text-gray-700 mx-auto" />
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={centerOnUser}
              disabled={!userLocation}
              className="block w-full p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Centrer sur ma position"
            >
              <Navigation className="w-5 h-5 text-blue-600 mx-auto" />
            </button>
            
            {currentClue && (
              <>
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={() => centerOnClue(currentClue)}
                  className="block w-full p-2 hover:bg-gray-100 transition-colors"
                  title="Centrer sur l'indice actuel"
                >
                  <Target className="w-5 h-5 text-yellow-600 mx-auto" />
                </button>
              </>
            )}
            
            <div className="border-t border-gray-200"></div>
            <button
              onClick={fitAllMarkers}
              className="block w-full p-2 hover:bg-gray-100 transition-colors"
              title="Voir tous les points"
            >
              <Layers className="w-5 h-5 text-purple-600 mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full rounded-xl"
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <MapController 
          center={mapCenter} 
          zoom={mapZoom} 
          onMapClick={onMapClick}
        />
        
        {/* Dynamic Tile Layer */}
        <TileLayer
          attribution={tileProviders[selectedTileProvider].attribution}
          url={tileProviders[selectedTileProvider].url}
          maxZoom={18}
        />

        {/* User Location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="font-semibold text-blue-600 mb-2 flex items-center justify-center">
                  <Navigation className="w-4 h-4 mr-1" />
                  Votre position
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
                <div className="text-xs text-gray-500">
                  Position GPS en temps réel
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
            <div className="text-center p-2">
              <div className="font-semibold text-orange-600 mb-2 flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-1" />
                Point de départ
              </div>
              <div className="text-sm text-gray-700 mb-2 font-medium">{hunt.title}</div>
              <div className="text-sm text-gray-600 mb-2">{hunt.location.address}</div>
              <div className="text-xs text-gray-500">
                Durée estimée: {hunt.duration} minutes
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Clues */}
        {hunt.clues.map((clue, index) => {
          const isCompleted = completedClues.includes(clue.id);
          const isCurrent = currentClue?.id === clue.id;
          
          let icon = pendingClueIcon;
          let popupColor = 'text-purple-600';
          let statusText = 'À venir';
          
          if (isCompleted) {
            icon = completedClueIcon;
            popupColor = 'text-green-600';
            statusText = 'Complété';
          } else if (isCurrent) {
            icon = currentClueIcon;
            popupColor = 'text-yellow-600';
            statusText = 'Actuel';
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
                  <div className="text-center max-w-xs p-2">
                    <div className={`font-semibold ${popupColor} mb-2 flex items-center justify-center`}>
                      <Target className="w-4 h-4 mr-1" />
                      Indice {index + 1} - {statusText}
                    </div>
                    <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {clue.text.length > 120 ? `${clue.text.substring(0, 120)}...` : clue.text}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {clue.points} points
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                        {clue.type}
                      </span>
                    </div>
                    {clue.radius && (
                      <div className="text-xs text-gray-400">
                        Zone de validation: {clue.radius}m
                      </div>
                    )}
                    {isCurrent && (
                      <div className="mt-2 text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded">
                        🎯 Indice actuel
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              {/* Proximity circle for current clue */}
              {isCurrent && clue.radius && (
                <Circle
                  center={[clue.location.lat, clue.location.lng]}
                  radius={clue.radius}
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
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Layers className="w-4 h-4 mr-1" />
          Légende
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border border-white shadow-sm"></div>
            <span>Votre position</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border border-white shadow-sm"></div>
            <span>Point de départ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border border-white shadow-sm"></div>
            <span>Indice actuel</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
            <span>Indice complété</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full border border-white shadow-sm"></div>
            <span>Indice à venir</span>
          </div>
        </div>
        
        {/* Distance info */}
        {userLocation && currentClue && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Distance jusqu'à l'indice:</div>
            <div className="text-sm font-semibold text-blue-600">
              {(() => {
                const R = 6371;
                const dLat = (currentClue.location.lat - userLocation.lat) * Math.PI / 180;
                const dLng = (currentClue.location.lng - userLocation.lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(currentClue.location.lat * Math.PI / 180) *
                         Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c * 1000;
                return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Click instruction for interactive mode */}
      {onMapClick && (
        <div className="absolute top-4 left-4 z-[1000] bg-blue-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          📍 Cliquez sur la carte pour définir la position
        </div>
      )}
    </div>
  );
};

export default MapComponent;