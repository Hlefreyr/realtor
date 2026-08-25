import React, { useRef, useState } from 'react';
import { MapProviderProps, PropertyListing } from './MapProviderInterface';

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
  onPropertyMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    property: PropertyListing;
    areaId: string;
    isPreCandidate: boolean;
    cx: number;
    cy: number;
  } | null>(null);

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
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth="2.5"
            />
          );
        })}

        {/* Active Drawing Polyline & Vertex Markers */}
        {currentPolygon.length > 0 && (
          <g>
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
            {currentPolygon.map((pt, idx) => {
              const { cx, cy } = getSvgCoords(pt);
              return (
                <circle
                  key={idx}
                  cx={`${cx}%`}
                  cy={`${cy}%`}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        )}

        {/* Property Markers (Grey = Candidate, Yellow-Gold = Pre-Candidate) */}
        {savedAreas.map((area) => (
          <g key={`markers-${area.id}`}>
            {/* Standard Candidate Properties (Grey Markers) */}
            {(area.properties || []).map((prop) => {
              const { cx, cy } = getSvgCoords({
                lat: prop.location.latitude,
                lng: prop.location.longitude,
              });
              return (
                <svg
                  key={`prop-${prop.zpid}`}
                  x={`calc(${cx}% - 12px)`}
                  y={`calc(${cy}% - 12px)`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ cursor: 'pointer', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPropertyMarkerClick) {
                      onPropertyMarkerClick(prop, area.id);
                    }
                    setActiveTooltip({ property: prop, areaId: area.id, isPreCandidate: false, cx, cy });
                  }}
                >
                  <path
                    d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                    fill="#64748b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            })}

            {/* Candidate/Pre-Candidate Properties (Yellow-Gold House Markers) */}
            {(area.candidateProperties || area.preCandidateProperties || []).map((prop) => {
              const { cx, cy } = getSvgCoords({
                lat: prop.location.latitude,
                lng: prop.location.longitude,
              });
              return (
                <svg
                  key={`preprop-${prop.zpid}`}
                  x={`calc(${cx}% - 12px)`}
                  y={`calc(${cy}% - 12px)`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ cursor: 'pointer', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip({ property: prop, areaId: area.id, isPreCandidate: true, cx, cy });
                  }}
                >
                  <path
                    d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Property Marker Tooltip */}
      {activeTooltip && (
        <div
          testID="property-marker-tooltip"
          style={{
            position: 'absolute',
            left: `${activeTooltip.cx}%`,
            top: `${activeTooltip.cy}%`,
            transform: 'translate(-50%, -115%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 100,
            minWidth: 200,
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: activeTooltip.isPreCandidate ? '#fbbf24' : '#94a3b8' }}>
              {activeTooltip.isPreCandidate ? '🏠 Candidate Property' : '🏠 Search Listing'}
            </span>
            <button
              onClick={() => setActiveTooltip(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>
            ${activeTooltip.property.price.toLocaleString()} {activeTooltip.property.currency || 'CAD'}
          </div>
          <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
            {activeTooltip.property.bedrooms || '-'} bds | {activeTooltip.property.bathrooms || '-'} ba | {activeTooltip.property.livingArea || '-'} sqft
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {activeTooltip.property.address.streetAddress}, {activeTooltip.property.address.city}
          </div>

          {!activeTooltip.isPreCandidate && onPropertyMarkerClick && (
            <button
              testID="transfer-pre-candidate-tooltip-button"
              onClick={() => {
                onPropertyMarkerClick(activeTooltip.property, activeTooltip.areaId);
                setActiveTooltip(null);
              }}
              style={{
                marginTop: 8,
                width: '100%',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              🏠 Move to Candidate Properties
            </button>
          )}
        </div>
      )}

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
