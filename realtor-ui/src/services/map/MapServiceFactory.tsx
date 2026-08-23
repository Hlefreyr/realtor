import React from 'react';
import { MapProviderProps } from './MapProviderInterface';
import { GoogleMapProvider } from './GoogleMapProvider';
import { LeafletMapProvider } from './LeafletMapProvider';
import { MockMapProvider } from './MockMapProvider';

export type MapProviderType = 'google' | 'leaflet' | 'mock';

export interface MapServiceFactoryProps extends MapProviderProps {
  providerType?: MapProviderType;
}

export const MapServiceFactory: React.FC<MapServiceFactoryProps> = ({
  providerType = (process.env.EXPO_PUBLIC_MAP_PROVIDER as MapProviderType) || 'google',
  ...props
}) => {
  switch (providerType) {
    case 'leaflet':
      return <LeafletMapProvider {...props} />;
    case 'mock':
      return <MockMapProvider {...props} />;
    case 'google':
    default:
      return <GoogleMapProvider {...props} />;
  }
};
