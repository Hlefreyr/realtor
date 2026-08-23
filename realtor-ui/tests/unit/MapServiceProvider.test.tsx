import React from 'react';
import { render } from '@testing-library/react-native';
import { MapServiceFactory } from '../../src/services/map/MapServiceFactory';

describe('Map Service Provider Pattern Tests', () => {
  beforeEach(() => {
    (global as any).window.google = {
      maps: {
        Map: jest.fn().mockImplementation(() => ({
          setCenter: jest.fn(),
          setZoom: jest.fn(),
          addListener: jest.fn(),
        })),
        Polygon: jest.fn().mockImplementation(() => ({
          setMap: jest.fn(),
        })),
        Polyline: jest.fn().mockImplementation(() => ({
          setMap: jest.fn(),
        })),
        event: {
          removeListener: jest.fn(),
        },
      },
    };
  });

  const defaultProps = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12,
    unit: 'kilometers' as const,
    radius: 50,
    isDrawing: false,
    savedAreas: [],
    currentPolygon: [],
    onAddPoint: jest.fn(),
    onUndoPoint: jest.fn(),
    onFinishDrawing: jest.fn(),
  };

  it('renders GoogleMapProvider when providerType is google', () => {
    const { getByTestId } = render(
      <MapServiceFactory providerType="google" {...defaultProps} />
    );
    expect(getByTestId('google-maps-container')).toBeTruthy();
  });

  it('renders LeafletMapProvider when providerType is leaflet', () => {
    const { getByTestId } = render(
      <MapServiceFactory providerType="leaflet" {...defaultProps} />
    );
    expect(getByTestId('leaflet-map-container')).toBeTruthy();
  });

  it('renders MockMapProvider when providerType is mock', () => {
    const { getByTestId } = render(
      <MapServiceFactory providerType="mock" {...defaultProps} />
    );
    expect(getByTestId('mock-map-container')).toBeTruthy();
  });
});
