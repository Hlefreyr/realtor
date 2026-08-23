import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { AreasView } from '../../src/components/views/AreasView';

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

  it('renders property search areas title and Google Maps container', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <AreasView radius={50} unit="kilometers" savedAreas={mockSavedAreas} />
    );

    expect(getByText('Property Search Areas')).toBeTruthy();
    expect(getByTestId('google-maps-container')).toBeTruthy();
    expect(getByTestId('new-area-button')).toBeTruthy();
  });

  it('toggles to drawing mode and updates button label to Finish', () => {
    const { getByTestId, getByText } = renderWithTamagui(<AreasView radius={50} />);

    const newAreaButton = getByTestId('new-area-button');
    fireEvent.press(newAreaButton);

    expect(getByTestId('finish-area-button')).toBeTruthy();
    expect(getByTestId('drawing-mode-banner')).toBeTruthy();
    expect(getByText('Area Selection Mode:')).toBeTruthy();
    expect(getByTestId('area-name-input')).toBeTruthy();
  });

  it('calls onDeleteArea when delete button pressed for saved area', async () => {
    const mockDelete = jest.fn();
    const { getByTestId } = renderWithTamagui(
      <AreasView savedAreas={mockSavedAreas} onDeleteArea={mockDelete} />
    );

    const deleteBtn = getByTestId('delete-area-area-1');
    fireEvent.press(deleteBtn);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('area-1');
    });
  });
});
