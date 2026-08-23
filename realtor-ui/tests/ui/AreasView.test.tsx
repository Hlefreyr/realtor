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
        event: {
          removeListener: jest.fn(),
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
    expect(getByText('Area Selection Mode:')).toBeTruthy();
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

  it('displays Delete Area button when an area is selected and handles deletion', async () => {
    const mockDelete = jest.fn();
    const mockSelectArea = jest.fn();

    const { getByTestId, queryByTestId, getByText } = renderWithTamagui(
      <AreasView
        savedAreas={mockSavedAreas}
        selectedAreaId="area-1"
        onSelectArea={mockSelectArea}
        onDeleteArea={mockDelete}
      />
    );

    expect(getByText('Area: Downtown Commercial')).toBeTruthy();
    expect(queryByTestId('new-area-button')).toBeNull();
    expect(getByTestId('delete-area-button')).toBeTruthy();

    fireEvent.press(getByTestId('delete-area-button'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('area-1');
      expect(mockSelectArea).toHaveBeenCalledWith(null);
    });
  });
});
