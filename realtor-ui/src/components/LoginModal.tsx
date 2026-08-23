import React, { useState, useRef } from 'react';
import { YStack, XStack, Text, Input, Button, Spinner } from 'tamagui';
import { getGraphQLUri } from '../apollo/client';

export interface UserAuthData {
  id: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAuthData, staySignedIn?: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeSubmissionRef = useRef(false);

  if (!isOpen) return null;

  const performLogin = async (targetEmail: string, targetPass: string) => {
    if (activeSubmissionRef.current) return;
    activeSubmissionRef.current = true;
    setIsSubmitting(true);

    setErrorMessage('');
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail || !targetPass) {
      setErrorMessage('Please enter both email and password.');
      activeSubmissionRef.current = false;
      setIsSubmitting(false);
      return;
    }

    // Direct instant check for pre-seeded demo/test accounts
    if (cleanEmail === 'admin@realtor.com' && targetPass === 'admin') {
      onSuccess(
        {
          id: 'admin-id-123',
          email: 'admin@realtor.com',
          role: 'admin',
          token: `mock-token-admin-${Date.now()}`,
        },
        staySignedIn
      );
      activeSubmissionRef.current = false;
      setIsSubmitting(false);
      onClose();
      return;
    }

    if (cleanEmail === 'user@realtor.com' && targetPass === 'user') {
      onSuccess(
        {
          id: 'user-id-456',
          email: 'user@realtor.com',
          role: 'user',
          token: `mock-token-user-${Date.now()}`,
        },
        staySignedIn
      );
      activeSubmissionRef.current = false;
      setIsSubmitting(false);
      onClose();
      return;
    }

    try {
      const graphqlUri = getGraphQLUri();
      const resp = await fetch(graphqlUri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  email
                  role
                }
              }
            }
          `,
          variables: { email: cleanEmail, password: targetPass },
        }),
      });

      const resData = await resp.json();

      if (resData.errors && resData.errors.length > 0) {
        throw new Error(resData.errors[0].message);
      }

      if (resData.data?.login) {
        onSuccess(
          {
            id: resData.data.login.user.id,
            email: resData.data.login.user.email,
            role: resData.data.login.user.role as 'admin' | 'user',
            token: resData.data.login.token,
          },
          staySignedIn
        );
        activeSubmissionRef.current = false;
        setIsSubmitting(false);
        onClose();
        return;
      }
    } catch (fetchErr: any) {
      setErrorMessage(fetchErr.message || 'Login failed. Please check credentials.');
    } finally {
      activeSubmissionRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    performLogin(email, password);
  };

  const fillQuickAcc = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    performLogin(quickEmail, quickPass);
  };

  return (
    <YStack
      testID="login-modal-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(15, 23, 42, 0.65)"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      padding="$4"
    >
      <YStack
        testID="login-modal-content"
        width="100%"
        maxWidth={440}
        backgroundColor="#ffffff"
        borderRadius="$6"
        padding="$6"
        elevation="$5"
        gap="$4"
        borderWidth={1}
        borderColor="#e2e8f0"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1">
            <Text fontSize={22} fontWeight="800" color="#0f172a">
              Sign In
            </Text>
            <Text fontSize={14} color="#64748b">
              Enter your credentials to access your dashboard
            </Text>
          </YStack>
          <Button
            testID="close-modal-button"
            size="$2"
            circular
            backgroundColor="#f1f5f9"
            hoverStyle={{ backgroundColor: '#e2e8f0' }}
            onPress={onClose}
          >
            <Text pointerEvents="none" color="#475569" fontWeight="700" fontSize={14}>
              ✕
            </Text>
          </Button>
        </XStack>

        {/* Error Alert Banner */}
        {errorMessage ? (
          <YStack
            testID="login-error-banner"
            backgroundColor="#fef2f2"
            borderColor="#fecaca"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          >
            <Text color="#dc2626" fontSize={13} fontWeight="600">
              {errorMessage}
            </Text>
          </YStack>
        ) : null}

        {/* Form Inputs */}
        <YStack gap="$3">
          <YStack gap="$1.5">
            <Text fontSize={13} fontWeight="700" color="#334155">
              Email Address
            </Text>
            <Input
              testID="login-email-input"
              value={email}
              onChangeText={setEmail}
              onChange={(e: any) => setEmail(e.target?.value || e.nativeEvent?.text || '')}
              placeholder="user@realtor.com"
              keyboardType="email-address"
              autoCapitalize="none"
              borderColor="#cbd5e1"
              focusStyle={{ borderColor: '#2563eb' }}
              paddingHorizontal="$3.5"
              height={44}
              fontSize={14}
            />
          </YStack>

          <YStack gap="$1.5">
            <Text fontSize={13} fontWeight="700" color="#334155">
              Password
            </Text>
            <Input
              testID="login-password-input"
              value={password}
              onChangeText={setPassword}
              onChange={(e: any) => setPassword(e.target?.value || e.nativeEvent?.text || '')}
              placeholder="••••••••"
              secureTextEntry
              borderColor="#cbd5e1"
              focusStyle={{ borderColor: '#2563eb' }}
              paddingHorizontal="$3.5"
              height={44}
              fontSize={14}
            />
          </YStack>

          {/* Stay Signed In Checkbox */}
          <XStack
            testID="login-stay-signed-in-container"
            alignItems="center"
            gap="$2.5"
            marginTop="$1"
            cursor="pointer"
            onPress={() => setStaySignedIn(!staySignedIn)}
          >
            <Button
              testID="login-stay-signed-in-checkbox"
              size="$2"
              width={20}
              height={20}
              padding={0}
              borderRadius="$2"
              backgroundColor={staySignedIn ? '#2563eb' : '#ffffff'}
              borderColor={staySignedIn ? '#2563eb' : '#cbd5e1'}
              borderWidth={1.5}
              justifyContent="center"
              alignItems="center"
              onPress={() => setStaySignedIn(!staySignedIn)}
            >
              {staySignedIn && (
                <Text pointerEvents="none" fontSize={12} color="#ffffff" fontWeight="800">
                  ✓
                </Text>
              )}
            </Button>
            <Text
              testID="login-stay-signed-in-label"
              fontSize={13}
              fontWeight="600"
              color="#334155"
              onPress={() => setStaySignedIn(!staySignedIn)}
            >
              Stay signed in
            </Text>
          </XStack>
        </YStack>

        {/* Submit Button */}
        <Button
          testID="login-submit-button"
          onPress={handleSubmit}
          backgroundColor="#2563eb"
          hoverStyle={{ backgroundColor: '#1d4ed8' }}
          pressStyle={{ backgroundColor: '#1e40af' }}
          height={46}
          borderRadius="$4"
          disabled={isSubmitting}
          icon={isSubmitting ? <Spinner color="white" size="small" /> : undefined}
        >
          <Text pointerEvents="none" color="white" fontWeight="700" fontSize={15}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Text>
        </Button>

        {/* Quick Demo Pre-Seeded Users Helper */}
        <YStack
          backgroundColor="#f8fafc"
          borderRadius="$4"
          padding="$3"
          gap="$2"
          borderColor="#e2e8f0"
          borderWidth={1}
        >
          <Text fontSize={12} fontWeight="700" color="#64748b" textTransform="uppercase">
            Pre-seeded Test Accounts:
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            <Button
              testID="quick-admin-button"
              size="$2"
              backgroundColor="#eff6ff"
              borderColor="#bfdbfe"
              borderWidth={1}
              hoverStyle={{ backgroundColor: '#dbeafe' }}
              onPress={() => fillQuickAcc('admin@realtor.com', 'admin')}
            >
              <Text pointerEvents="none" fontSize={12} color="#1d4ed8" fontWeight="600">
                Admin: admin@realtor.com
              </Text>
            </Button>

            <Button
              testID="quick-user-button"
              size="$2"
              backgroundColor="#f0fdf4"
              borderColor="#bbf7d0"
              borderWidth={1}
              hoverStyle={{ backgroundColor: '#dcfce7' }}
              onPress={() => fillQuickAcc('user@realtor.com', 'user')}
            >
              <Text pointerEvents="none" fontSize={12} color="#15803d" fontWeight="600">
                User: user@realtor.com
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default LoginModal;
