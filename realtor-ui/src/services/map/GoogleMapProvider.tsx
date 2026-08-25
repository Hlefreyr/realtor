import React, { useEffect, useRef, useState } from 'react';
import { MapProviderProps, PropertyListing } from './MapProviderInterface';

export const GoogleMapProvider: React.FC<MapProviderProps> = ({
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
  const googleMapRef = useRef<any>(null);
  const savedPolygonsRef = useRef<any[]>([]);
  const activePolylineRef = useRef<any>(null);
  const propertyMarkersRef = useRef<any[]>([]);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // Dynamic Google Maps JS API Loader
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).google?.maps) {
      setIsApiLoaded(true);
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const scriptId = 'google-maps-js-script';

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing,places`;
      script.async = true;
      script.onload = () => setIsApiLoaded(true);
      script.onerror = () => setIsApiLoaded(false);
      document.head.appendChild(script);
    } else {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => setIsApiLoaded(true));
      }
    }
  }, []);

  // Initialize Native google.maps.Map
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || !(window as any).google?.maps) return;

    if (!googleMapRef.current) {
      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        disableDoubleClickZoom: true,
      });

      googleMapRef.current = mapInstance;
    } else {
      googleMapRef.current.setCenter(center);
      googleMapRef.current.setZoom(zoom);
    }
  }, [isApiLoaded, center.lat, center.lng, zoom]);

  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // Bind Google Maps Event Listeners
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !(window as any).google?.maps) return;

    const clickListener = map.addListener('click', (e: any) => {
      if (!isDrawingRef.current) return;
      const lat = Number(e.latLng.lat().toFixed(4));
      const lng = Number(e.latLng.lng().toFixed(4));
      onAddPoint({ lat, lng });
    });

    const rightClickListener = map.addListener('rightclick', () => {
      if (!isDrawingRef.current) return;
      onUndoPoint();
    });

    const dblClickListener = map.addListener('dblclick', () => {
      if (!isDrawingRef.current) return;
      onFinishDrawing();
    });

    return () => {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(clickListener);
        (window as any).google.maps.event.removeListener(rightClickListener);
        (window as any).google.maps.event.removeListener(dblClickListener);
      }
    };
  }, [isApiLoaded, onAddPoint, onUndoPoint, onFinishDrawing]);

  // Render Saved Polygons and Property Markers
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !(window as any).google?.maps) return;

    savedPolygonsRef.current.forEach((poly) => poly.setMap(null));
    savedPolygonsRef.current = [];

    propertyMarkersRef.current.forEach((m) => m.setMap(null));
    propertyMarkersRef.current = [];

    savedAreas.forEach((area) => {
      // Polygons
      if (area.polygon && area.polygon.length >= 3) {
        const poly = new (window as any).google.maps.Polygon({
          paths: area.polygon,
          strokeColor: '#10b981',
          strokeOpacity: 0.9,
          strokeWeight: 2.5,
          fillColor: '#10b981',
          fillOpacity: 0.25,
          map: map,
        });
        savedPolygonsRef.current.push(poly);
      }

      const HOUSE_SVG_PATH = 'M -2 8 L -2 2 L 2 2 L 2 8 L 7 8 L 7 0 L 10 0 L 0 -9 L -10 0 L -7 0 L -7 8 Z';

      // Search Listings (Grey House Markers)
      (area.properties || []).forEach((prop) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: prop.location.latitude, lng: prop.location.longitude },
          map: map,
          title: `$${prop.price.toLocaleString()} - ${prop.address.streetAddress}`,
          icon: {
            path: HOUSE_SVG_PATH,
            scale: 1.2,
            fillColor: '#64748b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
          },
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
              <div style="font-weight: bold; color: #10b981; font-size: 14px;">$${prop.price.toLocaleString()} ${prop.currency || 'CAD'}</div>
              <div style="font-size: 12px; color: #475569;">${prop.bedrooms || '-'} bds | ${prop.bathrooms || '-'} ba | ${prop.livingArea || '-'} sqft</div>
              <div style="font-size: 11px; color: #64748b;">${prop.address.streetAddress}</div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onPropertyMarkerClick) {
            onPropertyMarkerClick(prop, area.id);
          }
        });

        propertyMarkersRef.current.push(marker);
      });

      // Candidate Properties (Yellow-Gold House Markers)
      const candList = area.candidateProperties || area.preCandidateProperties || [];
      candList.forEach((prop) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: prop.location.latitude, lng: prop.location.longitude },
          map: map,
          title: `CANDIDATE: $${prop.price.toLocaleString()} - ${prop.address.streetAddress}`,
          icon: {
            path: HOUSE_SVG_PATH,
            scale: 1.2,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
          },
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
              <div style="font-weight: bold; color: #f59e0b; font-size: 13px;">🏠 CANDIDATE PROPERTY</div>
              <div style="font-weight: bold; color: #10b981; font-size: 14px;">$${prop.price.toLocaleString()} ${prop.currency || 'CAD'}</div>
              <div style="font-size: 12px; color: #475569;">${prop.bedrooms || '-'} bds | ${prop.bathrooms || '-'} ba | ${prop.livingArea || '-'} sqft</div>
              <div style="font-size: 11px; color: #64748b;">${prop.address.streetAddress}</div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        propertyMarkersRef.current.push(marker);
      });
    });
  }, [savedAreas, isApiLoaded, onPropertyMarkerClick]);

  const activeMarkersRef = useRef<any[]>([]);

  // Render Active Polyline and Vertex Markers
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !(window as any).google?.maps) return;

    if (activePolylineRef.current) {
      activePolylineRef.current.setMap(null);
      activePolylineRef.current = null;
    }

    activeMarkersRef.current.forEach((m) => m.setMap(null));
    activeMarkersRef.current = [];

    if (currentPolygon.length > 0) {
      activePolylineRef.current = new (window as any).google.maps.Polyline({
        path: currentPolygon,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        map: map,
      });

      currentPolygon.forEach((pt) => {
        const marker = new (window as any).google.maps.Marker({
          position: pt,
          map: map,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        activeMarkersRef.current.push(marker);
      });
    }
  }, [currentPolygon, isApiLoaded]);

  // Fallback Container Mouse Handlers for Web Canvas when API is not available
  const handleContainerLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isApiLoaded && googleMapRef.current) return;
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
    if (isApiLoaded && googleMapRef.current) return;
    if (!isDrawing) return;
    onUndoPoint();
  };

  const handleContainerDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isApiLoaded && googleMapRef.current) return;
    if (!isDrawing) return;
    onFinishDrawing();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDrawing ? 'crosshair' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
        backgroundColor: '#e5e3df',
      }}
    >
      <div
        ref={mapRef}
        testID="google-maps-container"
        onClick={handleContainerLeftClick}
        onContextMenu={handleContainerRightClick}
        onDoubleClick={handleContainerDoubleClick}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
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
          pointerEvents: 'none',
        }}
      >
        📍 Google Maps Provider | Lat: {center.lat}, Lng: {center.lng} | Scale: {radius} {unit}
      </div>
    </div>
  );
};
