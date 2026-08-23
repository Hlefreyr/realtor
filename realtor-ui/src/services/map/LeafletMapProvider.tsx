import React, { useRef } from 'react';
import { MapProviderProps } from './MapProviderInterface';

export const LeafletMapProvider: React.FC<MapProviderProps> = ({
  center,
  zoom,
  unit = 'kilometers',
  radius = 50,
  isDrawing,
  savedAreas,
  currentPolygon,
  onAddPoint,
  onUndoPoint,
  onFinishDrawing,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const scaleFactor = Math.pow(2, 14 - zoom) * 0.05;

  const getSvgCoords = (pt: { lat: number; lng: number }) => {
    const cx = ((pt.lng - center.lng) / scaleFactor + 0.5) * 100;
    const cy = (0.5 - (pt.lat - center.lat) / scaleFactor) * 100;
    return { cx, cy };
  };

  const handleContainerLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lat = Number((center.lat + (0.5 - y / rect.height) * scaleFactor).toFixed(4));
    const lng = Number((center.lng + (x / rect.width - 0.5) * scaleFactor).toFixed(4));

    onAddPoint({ lat, lng });
  };

  const handleContainerRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    onUndoPoint();
  };

  const handleContainerDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    onFinishDrawing();
  };

  return (
    <div
      ref={mapRef}
      testID="leaflet-map-container"
      onClick={handleContainerLeftClick}
      onContextMenu={handleContainerRightClick}
      onDoubleClick={handleContainerDoubleClick}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDrawing ? 'crosshair' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Render Saved User Polygons */}
        {savedAreas.map((area, idx) => {
          if (!area.polygon || area.polygon.length < 3) return null;
          const pointsSvg = area.polygon
            .map((pt) => {
              const { cx, cy } = getSvgCoords(pt);
              return `${cx}%,${cy}%`;
            })
            .join(' ');

          return (
            <polygon
              key={area.id || idx}
              points={pointsSvg}
              fill="rgba(16, 185, 129, 0.35)"
              stroke="#10b981"
              strokeWidth="2.5"
            />
          );
        })}

        {/* Active Drawing Polyline */}
        {currentPolygon.length > 0 && (
          <polyline
            points={currentPolygon
              .map((pt) => {
                const { cx, cy } = getSvgCoords(pt);
                return `${cx}%,${cy}%`;
              })
              .join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 5"
          />
        )}
      </svg>

      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: '#94a3b8',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid #334155',
          zIndex: 10,
        }}
      >
        📍 Leaflet/OSM Provider | Lat: {center.lat}, Lng: {center.lng} | Scale: {radius} {unit}
      </div>
    </div>
  );
};
