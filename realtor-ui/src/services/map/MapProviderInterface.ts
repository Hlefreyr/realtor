import React from 'react';

export interface Point {
  lat: number;
  lng: number;
}

export interface PropertyListing {
  zpid: string;
  property_id?: string;
  price: number;
  currency?: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  homeType?: string;
  homeStatus?: string;
  imgSrc?: string;
  detailUrl?: string;
  daysOnZillow?: number;
  zestimate?: number;
  rentZestimate?: number;
}

export interface SavedArea {
  id: string;
  name: string;
  polygon: Point[];
  properties?: PropertyListing[];
  candidateProperties?: PropertyListing[];
  preCandidateProperties?: PropertyListing[];
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
  selectedArea?: SavedArea | null;
  onPropertyMarkerClick?: (property: PropertyListing, areaId: string) => void;
}

export interface IMapProvider {
  render(props: MapProviderProps): React.ReactNode;
}
