import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { DashboardLayout } from '../../src/components/DashboardLayout';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('DashboardLayout UI Component Tests', () => {
  it('should render DashboardView by default', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <DashboardLayout userRole="user" />
    );

    expect(getByTestId('dashboard-layout-container')).toBeTruthy();
    expect(getByTestId('dashboard-view-container')).toBeTruthy();
    expect(getByText('Platform Overview')).toBeTruthy();
  });

  it('should switch to SettingsView when Settings menu item is clicked', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <DashboardLayout userRole="user" />
    );

    fireEvent.press(getByTestId('sidebar-item-settings'));

    expect(getByTestId('settings-view-container')).toBeTruthy();
    expect(getByText('Account Settings')).toBeTruthy();
  });

  it('should switch to AdminView when Admin Panel menu item is clicked for admin user', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <DashboardLayout userRole="admin" />
    );

    fireEvent.press(getByTestId('sidebar-item-admin'));

    expect(getByTestId('admin-view-container')).toBeTruthy();
    expect(getByText('System Administration')).toBeTruthy();
  });

  it('should fallback to DashboardView for user role when admin tab selected', () => {
    const { getByTestId } = renderWithTamagui(
      <DashboardLayout userRole="user" />
    );

    // Switch to settings first
    fireEvent.press(getByTestId('sidebar-item-settings'));
    expect(getByTestId('settings-view-container')).toBeTruthy();

    // Switch back to dashboard
    fireEvent.press(getByTestId('sidebar-item-dashboard'));
    expect(getByTestId('dashboard-view-container')).toBeTruthy();
  });

  it('should toggle sidebar collapse state', () => {
    const { getByTestId } = renderWithTamagui(
      <DashboardLayout userRole="user" />
    );

    const toggleBtn = getByTestId('sidebar-toggle-button');
    fireEvent.press(toggleBtn);
  });
});
