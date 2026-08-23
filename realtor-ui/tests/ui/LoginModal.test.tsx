import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { LoginModal } from '../../src/components/LoginModal';

const renderWithTamagui = (ui: React.ReactElement) => {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {ui}
    </TamaguiProvider>
  );
};

describe('LoginModal UI Component Tests', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should not render anything when isOpen is false', () => {
    const { queryByTestId } = renderWithTamagui(
      <LoginModal isOpen={false} onClose={jest.fn()} onSuccess={jest.fn()} />
    );
    expect(queryByTestId('login-modal-overlay')).toBeNull();
  });

  it('should render modal form and Stay signed in checkbox when isOpen is true', () => {
    const { getByTestId, getAllByText, getByText } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />
    );

    expect(getByTestId('login-modal-overlay')).toBeTruthy();
    expect(getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(getByTestId('login-email-input')).toBeTruthy();
    expect(getByTestId('login-password-input')).toBeTruthy();
    expect(getByTestId('login-stay-signed-in-checkbox')).toBeTruthy();
    expect(getByText('Stay signed in')).toBeTruthy();
    expect(getByTestId('login-submit-button')).toBeTruthy();
  });

  it('should call onClose when close button pressed', () => {
    const mockClose = jest.fn();
    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={mockClose} onSuccess={jest.fn()} />
    );

    fireEvent.press(getByTestId('close-modal-button'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle Stay signed in checkbox when clicked', () => {
    const mockSuccess = jest.fn();
    const { getByTestId, getByText } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={mockSuccess} />
    );

    const checkbox = getByTestId('login-stay-signed-in-checkbox');
    const label = getByText('Stay signed in');

    fireEvent.press(checkbox);
    fireEvent.press(label);

    const quickUser = getByTestId('quick-user-button');
    fireEvent.press(quickUser);

    expect(mockSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@realtor.com' }),
      false
    );
  });

  it('should populate quick demo admin and user credentials when quick buttons pressed', () => {
    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />
    );

    const quickAdmin = getByTestId('quick-admin-button');
    fireEvent.press(quickAdmin);

    const emailInput = getByTestId('login-email-input');
    const passwordInput = getByTestId('login-password-input');

    expect(emailInput.props.value).toBe('admin@realtor.com');
    expect(passwordInput.props.value).toBe('admin');

    const quickUser = getByTestId('quick-user-button');
    fireEvent.press(quickUser);
    expect(emailInput.props.value).toBe('user@realtor.com');
    expect(passwordInput.props.value).toBe('user');
  });

  it('should trigger web onChange handler with e.target and e.nativeEvent fallbacks', () => {
    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />
    );

    const emailInput = getByTestId('login-email-input');
    const passwordInput = getByTestId('login-password-input');

    fireEvent(emailInput, 'onChange', { target: { value: 'target@realtor.com' } });
    fireEvent(passwordInput, 'onChange', { nativeEvent: { text: 'nativepass' } });

    expect(emailInput.props.value).toBe('target@realtor.com');
    expect(passwordInput.props.value).toBe('nativepass');
  });

  it('should show error message if submitted with empty password or empty email', () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />
    );

    fireEvent.changeText(getByTestId('login-email-input'), 'user@realtor.com');
    fireEvent.press(getByTestId('login-submit-button'));

    expect(getByTestId('login-error-banner')).toBeTruthy();
    expect(getByText('Please enter both email and password.')).toBeTruthy();
  });

  it('should execute login fetch and trigger onSuccess with staySignedIn flag', async () => {
    const mockSuccess = jest.fn();
    const mockClose = jest.fn();

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          login: {
            token: 'mock-token-custom',
            user: { id: 'custom-1', email: 'custom@realtor.com', role: 'user' },
          },
        },
      }),
    } as any);

    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />
    );

    fireEvent.press(getByTestId('login-stay-signed-in-checkbox'));
    fireEvent.changeText(getByTestId('login-email-input'), 'custom@realtor.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'custompass');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith(
        {
          id: 'custom-1',
          email: 'custom@realtor.com',
          role: 'user',
          token: 'mock-token-custom',
        },
        true
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('should fallback to user pre-seeded credentials when fetch network error occurs', async () => {
    const mockSuccess = jest.fn();
    const mockClose = jest.fn();

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />
    );

    fireEvent.changeText(getByTestId('login-email-input'), 'user@realtor.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'user');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-id-456',
          email: 'user@realtor.com',
          role: 'user',
        }),
        false
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('should fallback to admin pre-seeded credentials when fetch network error occurs', async () => {
    const mockSuccess = jest.fn();
    const mockClose = jest.fn();

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { getByTestId } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={mockClose} onSuccess={mockSuccess} />
    );

    fireEvent.changeText(getByTestId('login-email-input'), 'admin@realtor.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'admin');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'admin-id-123',
          email: 'admin@realtor.com',
          role: 'admin',
        }),
        false
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('should display GraphQL error when login fails for custom account', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        errors: [{ message: 'Invalid email or password' }],
      }),
    } as any);

    const { getByTestId, getByText } = renderWithTamagui(
      <LoginModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />
    );

    fireEvent.changeText(getByTestId('login-email-input'), 'wrong@realtor.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'wrong');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(getByTestId('login-error-banner')).toBeTruthy();
      expect(getByText('Invalid email or password')).toBeTruthy();
    });
  });
});
