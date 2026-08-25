import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { SettingsView } from '../../src/components/views/SettingsView';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('SettingsView UI Component Tests', () => {
  it('renders settings view container, profile info, units, and search criteria cards', () => {
    const { getByTestId, getByText } = renderWithTamagui(<SettingsView />);

    expect(getByTestId('settings-view-container')).toBeTruthy();
    expect(getByText('Account Settings')).toBeTruthy();
    expect(getByTestId('settings-units-card')).toBeTruthy();
    expect(getByTestId('settings-search-criteria-card')).toBeTruthy();
  });

  it('handles unit change toggle between km and miles', () => {
    const mockUpdateSettings = jest.fn();

    const { getByTestId } = renderWithTamagui(
      <SettingsView unit="kilometers" radius={50} onUpdateSettings={mockUpdateSettings} />
    );

    const milesBtn = getByTestId('unit-miles-button');
    fireEvent.press(milesBtn);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ unit: 'miles', radius: 50 });
  });

  it('renders search criteria form fields for status type, min price, max price, beds, baths', () => {
    const mockUpdateCriteria = jest.fn();

    const { getByTestId } = renderWithTamagui(
      <SettingsView
        searchCriteria={{ priceMin: 400000, priceMax: 1200000, bedsMin: 2, bedsMax: 4 }}
        onUpdateSearchCriteria={mockUpdateCriteria}
      />
    );

    expect(getByTestId('status-forsale-button')).toBeTruthy();
    expect(getByTestId('status-forrent-button')).toBeTruthy();
    expect(getByTestId('settings-price-min-input')).toBeTruthy();
    expect(getByTestId('settings-price-max-input')).toBeTruthy();

    fireEvent.press(getByTestId('status-forrent-button'));
    expect(mockUpdateCriteria).toHaveBeenCalledWith({ statusType: 'ForRent' });
  });
});
