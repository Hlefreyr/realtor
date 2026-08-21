import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { Header } from '../../src/components/Header';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('Header UI Component Tests', () => {
  it('should render brand logo, title, and Login button when logged out', () => {
    const { getByTestId, getByText } = renderWithTamagui(<Header user={null} />);

    expect(getByTestId('header-container')).toBeTruthy();
    expect(getByText('Realtor')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
  });

  it('should render user email badge and Log Out button when logged in', () => {
    const mockUser = { email: 'admin@realtor.com', role: 'admin' as const };
    const { getByTestId, getByText } = renderWithTamagui(<Header user={mockUser} />);

    expect(getByTestId('user-email-badge')).toBeTruthy();
    expect(getByText('admin@realtor.com')).toBeTruthy();
    expect(getByText('ADMIN')).toBeTruthy();
    expect(getByTestId('logout-button')).toBeTruthy();
  });

  it('should invoke onLoginPress callback when Log In is pressed', () => {
    const mockOnLogin = jest.fn();
    const { getByTestId } = renderWithTamagui(
      <Header user={null} onLoginPress={mockOnLogin} />
    );

    const button = getByTestId('login-button');
    fireEvent.press(button);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('should invoke onLogoutPress callback when Log Out is pressed', () => {
    const mockOnLogout = jest.fn();
    const mockUser = { email: 'user@realtor.com', role: 'user' as const };
    const { getByTestId } = renderWithTamagui(
      <Header user={mockUser} onLogoutPress={mockOnLogout} />
    );

    const button = getByTestId('logout-button');
    fireEvent.press(button);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
