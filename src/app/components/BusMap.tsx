import { useEffect, useRef, useState } from 'react';
import { Layers, Map as MapIcon } from 'lucide-react';

interface BusPosition {
  lat: number;
  lng: number;
  routeNumber: string;
  heading: number;
}

interface BusMapProps {
  buses: BusPosition[];
  userPosition: { lat: number; lng: number };
  isWalking: boolean;
  walkingDestination?: { lat: number; lng: number };
}

type MapView = 'roadmap' | 'satellite';
type MapLayer = 'traffic' | 'transit' | 'terrain';

export function BusMap({ buses, userPosition, isWalking, walkingDestination }: BusMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(15);
  const [mapView, setMapView] = useState<MapView>('roadmap');
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(new Set(['transit']));
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const toggleLayer = (layer: MapLayer) => {
    setActiveLayers(prev => {
      const newLayers = new Set(prev);
      if (newLayers.has(layer)) {
        newLayers.delete(layer);
      } else {
        newLayers.add(layer);
      }
      return newLayers;
    });
  };

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number) => {
    const centerLat = 37.8719; // UC Berkeley
    const centerLng = -122.2585;

    const scale = Math.pow(2, zoom) * 1000;
    const x = ((lng - centerLng) * scale) + 400 + mapOffset.x;
    const y = ((centerLat - lat) * scale) + 300 + mapOffset.y;

    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map background based on view type
    if (mapView === 'roadmap') {
      // Roadmap view - light background
      ctx.fillStyle = '#faf8f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simplified street grid
      ctx.strokeStyle = '#e3ddd5';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw terrain layer if active
      if (activeLayers.has('terrain')) {
        // Add subtle terrain indicators
        ctx.fillStyle = 'rgba(168, 197, 184, 0.08)';
        ctx.fillRect(50, 50, 200, 150);
        ctx.fillRect(500, 300, 150, 200);
      }

      // Draw main roads
      ctx.strokeStyle = '#d4cec4';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Horizontal roads
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 3);
      ctx.lineTo(canvas.width, canvas.height / 3);
      ctx.stroke();

      // Vertical roads
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width / 3, 0);
      ctx.lineTo(canvas.width / 3, canvas.height);
      ctx.stroke();

      // Draw road labels
      ctx.fillStyle = '#8b8680';
      ctx.font = '12px sans-serif';
      ctx.fillText('Bancroft Way', 20, canvas.height / 2 - 8);
      ctx.fillText('Telegraph Ave', canvas.width / 2 + 8, 20);

    } else {
      // Satellite view - darker background with texture
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4a5568');
      gradient.addColorStop(1, '#2d3748');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add satellite texture (simplified)
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 30 + 10;
        ctx.fillRect(x, y, size, size);
      }

      // Draw roads in satellite view
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
    }

    // Draw traffic layer if active
    if (activeLayers.has('traffic')) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.3, canvas.height * 0.3);
      ctx.lineTo(canvas.width * 0.7, canvas.height * 0.3);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.4, canvas.height * 0.5);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.2, canvas.height * 0.7);
      ctx.lineTo(canvas.width * 0.6, canvas.height * 0.7);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw transit layer if active (bus routes)
    if (activeLayers.has('transit')) {
      ctx.strokeStyle = '#b8c5d6';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.globalAlpha = 0.5;

      buses.forEach((bus, index) => {
        const busPos = latLngToCanvas(bus.lat, bus.lng);
        const nextPos = {
          x: busPos.x + Math.cos(bus.heading * Math.PI / 180) * 100,
          y: busPos.y + Math.sin(bus.heading * Math.PI / 180) * 100
        };

        ctx.beginPath();
        ctx.moveTo(busPos.x - 50, busPos.y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.stroke();
      });

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Draw walking path if walking
    if (isWalking && walkingDestination) {
      const userPos = latLngToCanvas(userPosition.lat, userPosition.lng);
      const destPos = latLngToCanvas(walkingDestination.lat, walkingDestination.lng);

      ctx.strokeStyle = '#d4a5a5';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(userPos.x, userPos.y);
      ctx.lineTo(destPos.x, destPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw distance label
      const midX = (userPos.x + destPos.x) / 2;
      const midY = (userPos.y + destPos.y) / 2;
      ctx.fillStyle = '#d4a5a5';
      ctx.fillRect(midX - 25, midY - 12, 50, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2 min', midX, midY);
    }

    // Draw user position
    const userPos = latLngToCanvas(userPosition.lat, userPosition.lng);
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(isWalking ? '🚶' : '📍', userPos.x, userPos.y);

    // Draw walking destination
    if (walkingDestination) {
      const destPos = latLngToCanvas(walkingDestination.lat, walkingDestination.lng);
      ctx.fillText('🚏', destPos.x, destPos.y);
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw buses
    buses.forEach((bus) => {
      const busPos = latLngToCanvas(bus.lat, bus.lng);

      // Draw bus emoji with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.font = '32px Arial';
      ctx.fillText('🚌', busPos.x, busPos.y);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw route number badge
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(busPos.x - 18, busPos.y + 18, 36, 20);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bus.routeNumber, busPos.x, busPos.y + 28);
    });

  }, [buses, userPosition, isWalking, walkingDestination, mapOffset, zoom, mapView, activeLayers]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#e3ddd5] shadow-lg">
      {/* Placeholder for Google Maps integration */}
      <div className="absolute inset-0 bg-[#f0f5f8] border-2 border-dashed border-[#d4cec4] flex items-center justify-center z-0 p-4 text-center">
        <div>
          <MapIcon className="w-12 h-12 text-[#b8c5d6] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#6a6a6a]">Google Maps API Integration</p>
          <p className="text-xs text-[#8b8680] mt-1">Your Google Maps component will be inserted here</p>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto relative z-10 opacity-50"
      />

      {/* Google Maps Style Controls (Top Left) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* View Type Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowViewMenu(!showViewMenu)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all px-4 py-2 text-sm font-medium text-[#4a4a4a] border border-[#e3ddd5]"
          >
            {mapView === 'roadmap' ? 'Map' : 'Satellite'}
          </button>

          {showViewMenu && (
            <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-[#e3ddd5] overflow-hidden min-w-[140px] z-10">
              <button
                onClick={() => {
                  setMapView('roadmap');
                  setShowViewMenu(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf8f6] transition-colors ${
                  mapView === 'roadmap' ? 'bg-[#f5f1ec] text-[#d4a5a5] font-medium' : 'text-[#6a6a6a]'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => {
                  setMapView('satellite');
                  setShowViewMenu(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf8f6] transition-colors ${
                  mapView === 'satellite' ? 'bg-[#f5f1ec] text-[#d4a5a5] font-medium' : 'text-[#6a6a6a]'
                }`}
              >
                Satellite
              </button>
            </div>
          )}
        </div>

        {/* Layers Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all px-4 py-2 flex items-center gap-2 text-sm font-medium text-[#4a4a4a] border border-[#e3ddd5]"
          >
            <Layers className="w-4 h-4" />
            Layers
          </button>

          {showLayersMenu && (
            <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-[#e3ddd5] py-2 min-w-[200px] z-10">
              <div className="px-4 py-2 text-xs font-semibold text-[#8b8680] uppercase tracking-wide">Map Details</div>
              <div className="border-t border-[#e3ddd5] mt-1"></div>

              <button
                onClick={() => toggleLayer('traffic')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf8f6] flex items-center justify-between transition-colors"
              >
                <span className="text-[#6a6a6a]">Traffic</span>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  activeLayers.has('traffic')
                    ? 'bg-[#d4a5a5] border-[#d4a5a5]'
                    : 'border-[#d4cec4]'
                }`}>
                  {activeLayers.has('traffic') && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  )}
                </div>
              </button>

              <button
                onClick={() => toggleLayer('transit')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf8f6] flex items-center justify-between transition-colors"
              >
                <span className="text-[#6a6a6a]">Transit</span>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  activeLayers.has('transit')
                    ? 'bg-[#d4a5a5] border-[#d4a5a5]'
                    : 'border-[#d4cec4]'
                }`}>
                  {activeLayers.has('transit') && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  )}
                </div>
              </button>

              <button
                onClick={() => toggleLayer('terrain')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf8f6] flex items-center justify-between transition-colors"
              >
                <span className="text-[#6a6a6a]">Terrain</span>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  activeLayers.has('terrain')
                    ? 'bg-[#d4a5a5] border-[#d4a5a5]'
                    : 'border-[#d4cec4]'
                }`}>
                  {activeLayers.has('terrain') && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls (Right side) - Google Maps style */}
      <div className="absolute bottom-32 right-4 flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-[#e3ddd5]">
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 18))}
          className="w-10 h-10 hover:bg-[#faf8f6] transition-colors flex items-center justify-center font-semibold text-[#6a6a6a] text-xl border-b border-[#e3ddd5]"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 12))}
          className="w-10 h-10 hover:bg-[#faf8f6] transition-colors flex items-center justify-center font-semibold text-[#6a6a6a] text-xl"
        >
          −
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span>🚌</span>
          <span className="text-[#6a6a6a]">Live Bus</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span>{isWalking ? '🚶' : '📍'}</span>
          <span className="text-[#6a6a6a]">You</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🚏</span>
          <span className="text-[#6a6a6a]">Bus Stop</span>
        </div>
        {activeLayers.has('traffic') && (
          <div className="mt-2 pt-2 border-t border-[#e3ddd5]">
            <div className="text-xs font-semibold text-[#8b8680] mb-1">Traffic</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-1 bg-green-500 rounded"></span>
              <span className="w-4 h-1 bg-yellow-500 rounded"></span>
              <span className="w-4 h-1 bg-red-500 rounded"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
