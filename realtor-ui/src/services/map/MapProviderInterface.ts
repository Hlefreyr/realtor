import React from 'react';

export interface Point {
  lat: number;
  lng: number;
}

export interface SavedArea {
  id: string;
  name: string;
  polygon: Point[];
  createdAt?: string;
}

export interface MapProviderProps {
  center: Point;
  zoom: number;
  unit?: 'kilometers' | 'miles';
  radius?: number;
  isDrawing: boolean;
  savedAreas: SavedArea[];
  currentPolygon: Point[];
  onAddPoint: (pt: Point) => void;
  onUndoPoint: () => void;
  onFinishDrawing: () => void;
}

export interface IMapProvider {
  render(props: MapProviderProps): React.ReactNode;
}
