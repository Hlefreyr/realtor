import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { Sidebar } from '../../src/components/Sidebar';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('Sidebar UI Component Tests', () => {
  it('should render Dashboard and Settings items for standard user', () => {
    const { getByTestId, queryByTestId, getByText } = renderWithTamagui(
      <Sidebar
        activeTab="dashboard"
        onSelectTab={jest.fn()}
        userRole="user"
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    );

    expect(getByTestId('sidebar-container')).toBeTruthy();
    expect(getByTestId('sidebar-title')).toBeTruthy();
    expect(getByTestId('sidebar-item-dashboard')).toBeTruthy();
    expect(getByTestId('sidebar-item-settings')).toBeTruthy();
    expect(queryByTestId('sidebar-item-admin')).toBeNull();
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('should hide text labels when sidebar is collapsed', () => {
    const { getByTestId, queryByTestId, queryByText } = renderWithTamagui(
      <Sidebar
        activeTab="dashboard"
        onSelectTab={jest.fn()}
        userRole="admin"
        isCollapsed={true}
        onToggleCollapse={jest.fn()}
      />
    );

    expect(getByTestId('sidebar-container')).toBeTruthy();
    expect(queryByTestId('sidebar-title')).toBeNull();
    expect(queryByText('Dashboard')).toBeNull();
    expect(queryByText('Settings')).toBeNull();
    expect(queryByText('Admin Panel')).toBeNull();
  });

  it('should render Admin Panel item for admin user', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <Sidebar
        activeTab="admin"
        onSelectTab={jest.fn()}
        userRole="admin"
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    );

    expect(getByTestId('sidebar-item-admin')).toBeTruthy();
    expect(getByText('Admin Panel')).toBeTruthy();
  });

  it('should toggle collapse state when toggle button pressed', () => {
    const mockToggle = jest.fn();
    const { getByTestId } = renderWithTamagui(
      <Sidebar
        activeTab="dashboard"
        onSelectTab={jest.fn()}
        userRole="admin"
        isCollapsed={false}
        onToggleCollapse={mockToggle}
      />
    );

    const toggleBtn = getByTestId('sidebar-toggle-button');
    fireEvent.press(toggleBtn);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should trigger onSelectTab when menu item pressed', () => {
    const mockSelectTab = jest.fn();
    const { getByTestId } = renderWithTamagui(
      <Sidebar
        activeTab="dashboard"
        onSelectTab={mockSelectTab}
        userRole="user"
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    );

    const settingsBtn = getByTestId('sidebar-item-settings');
    fireEvent.press(settingsBtn);

    expect(mockSelectTab).toHaveBeenCalledWith('settings');
  });
});
