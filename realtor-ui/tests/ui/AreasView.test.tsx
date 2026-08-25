import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { AreasView, getUniqueAreaName } from '../../src/components/views/AreasView';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('AreasView UI Component Tests', () => {
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
        Marker: jest.fn().mockImplementation(() => ({
          setMap: jest.fn(),
          addListener: jest.fn(),
        })),
        InfoWindow: jest.fn().mockImplementation(() => ({
          open: jest.fn(),
        })),
        event: {
          removeListener: jest.fn(),
        },
        SymbolPath: {
          CIRCLE: 0,
          BACKWARD_CLOSED_ARROW: 1,
        },
      },
    };
  });

  const mockSavedAreas = [
    {
      id: 'area-1',
      name: 'Downtown Commercial',
      polygon: [
        { lat: 37.77, lng: -122.41 },
        { lat: 37.78, lng: -122.42 },
        { lat: 37.79, lng: -122.4 },
      ],
      properties: [
        {
          zpid: 'prop-101',
          price: 850000,
          currency: 'CAD',
          address: { streetAddress: '100 Main St', city: 'Toronto', state: 'ON', zipcode: 'M5V 2T6' },
          location: { latitude: 37.77, longitude: -122.41 },
          bedrooms: 2,
          bathrooms: 2,
          livingArea: 850,
          homeType: 'CONDO',
        },
      ],
      preCandidateProperties: [
        {
          zpid: 'prop-102',
          price: 1200000,
          currency: 'CAD',
          address: { streetAddress: '200 King St', city: 'Toronto', state: 'ON', zipcode: 'M5V 3B2' },
          location: { latitude: 37.78, longitude: -122.42 },
          bedrooms: 3,
          bathrooms: 3,
          livingArea: 1200,
          homeType: 'SINGLE_FAMILY',
        },
      ],
    },
  ];

  it('renders property search areas title, Google Maps container, and no side panel', () => {
    const { getByTestId, getByText, queryByTestId } = renderWithTamagui(
      <AreasView radius={50} unit="kilometers" savedAreas={mockSavedAreas} />
    );

    expect(getByText('Property Search Areas')).toBeTruthy();
    expect(getByTestId('google-maps-container')).toBeTruthy();
    expect(getByTestId('new-area-button')).toBeTruthy();
    expect(queryByTestId('saved-areas-panel')).toBeNull();
  });

  it('toggles to drawing mode and updates button label to Finish', () => {
    const { getByTestId, getByText } = renderWithTamagui(<AreasView radius={50} />);

    const newAreaButton = getByTestId('new-area-button');
    fireEvent.press(newAreaButton);

    expect(getByTestId('finish-area-button')).toBeTruthy();
    expect(getByTestId('drawing-mode-banner')).toBeTruthy();
    expect(getByText(/Area Selection Mode:/)).toBeTruthy();
  });

  it('correctly calculates unique area names with getUniqueAreaName helper', () => {
    const existing = [
      { id: '1', name: 'Untitled', polygon: [] },
      { id: '2', name: 'Untitled 1', polygon: [] },
      { id: '3', name: 'West End', polygon: [] },
    ];

    expect(getUniqueAreaName('Downtown', existing)).toBe('Downtown');
    expect(getUniqueAreaName('Untitled', existing)).toBe('Untitled 2');
    expect(getUniqueAreaName('West End', existing)).toBe('West End 1');
  });

  it('displays Delete Area button and Search Listings button when an area is selected', async () => {
    const mockDelete = jest.fn();
    const mockSelectArea = jest.fn();
    const mockExecuteSearch = jest.fn();

    const { getByTestId, queryByTestId, getByText } = renderWithTamagui(
      <AreasView
        savedAreas={mockSavedAreas}
        selectedAreaId="area-1"
        onSelectArea={mockSelectArea}
        onDeleteArea={mockDelete}
        onExecuteSearch={mockExecuteSearch}
      />
    );

    expect(getByText('Area: Downtown Commercial')).toBeTruthy();
    expect(queryByTestId('new-area-button')).toBeNull();
    expect(getByTestId('delete-area-button')).toBeTruthy();
    expect(getByTestId('execute-search-button')).toBeTruthy();
    expect(getByTestId('area-details-panel')).toBeTruthy();

    fireEvent.press(getByTestId('execute-search-button'));
    expect(mockExecuteSearch).toHaveBeenCalledWith('area-1');
  });

  it('handles property transfer to pre-candidates when transfer button is pressed', async () => {
    const mockTransfer = jest.fn();

    const { getByTestId } = renderWithTamagui(
      <AreasView
        savedAreas={mockSavedAreas}
        selectedAreaId="area-1"
        onTransferProperty={mockTransfer}
      />
    );

    const transferBtn = getByTestId('transfer-button-prop-101');
    expect(transferBtn).toBeTruthy();
    fireEvent.press(transferBtn);

    expect(mockTransfer).toHaveBeenCalledWith('area-1', 'prop-101');
  });
});
