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
  it('should render brand logo, title, and Login button', () => {
    const { getByTestId, getByText } = renderWithTamagui(<Header />);

    expect(getByTestId('header-container')).toBeTruthy();
    expect(getByText('Realtor')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
  });

  it('should toggle login status when Login button is pressed without custom handler', () => {
    const { getByTestId, getByText } = renderWithTamagui(<Header />);

    const button = getByTestId('login-button');
    expect(getByText('Log In')).toBeTruthy();

    fireEvent.press(button);
    expect(getByText('Account')).toBeTruthy();

    fireEvent.press(button);
    expect(getByText('Log In')).toBeTruthy();
  });

  it('should invoke onLoginPress callback when provided', () => {
    const mockOnLogin = jest.fn();
    const { getByTestId } = renderWithTamagui(<Header onLoginPress={mockOnLogin} />);

    const button = getByTestId('login-button');
    fireEvent.press(button);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });
});
