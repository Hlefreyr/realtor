import React, { useRef } from 'react';
import { MapProviderProps } from './MapProviderInterface';

export const MockMapProvider: React.FC<MapProviderProps> = ({
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

  const handleContainerLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleFactor = Math.pow(2, 14 - zoom) * 0.05;
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
      testID="mock-map-container"
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
        backgroundColor: '#0f172a',
      }}
    >
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
        📍 Mock Grid Provider | Lat: {center.lat}, Lng: {center.lng} | Scale: {radius} {unit}
      </div>
    </div>
  );
};
