import React from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';

export interface HeaderUserProps {
  email: string;
  role: 'admin' | 'user';
}

interface HeaderProps {
  user?: HeaderUserProps | null;
  onLoginPress?: () => void;
  onLogoutPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLoginPress,
  onLogoutPress,
}) => {
  return (
    <XStack
      testID="header-container"
      tag="header"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$5"
      paddingVertical="$3.5"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      elevation="$2"
      width="100%"
      zIndex={100}
    >
      {/* Brand logo & wordmark */}
      <XStack alignItems="center" gap="$2.5">
        <YStack
          width={36}
          height={36}
          borderRadius="$4"
          backgroundColor="#2563eb"
          alignItems="center"
          justifyContent="center"
          elevation="$1"
        >
          <Text color="white" fontSize={18} fontWeight="800">
            R
          </Text>
        </YStack>
        <Text
          testID="header-logo"
          fontSize={22}
          fontWeight="800"
          letterSpacing={-0.5}
          color="#1e293b"
        >
          Realtor
        </Text>
      </XStack>

      {/* User Actions Corner */}
      <XStack alignItems="center" gap="$3">
        {user ? (
          <XStack alignItems="center" gap="$3">
            <YStack alignItems="flex-end">
              <Text testID="user-email-badge" fontSize={13} fontWeight="700" color="#0f172a">
                {user.email}
              </Text>
              <Text fontSize={11} fontWeight="600" color={user.role === 'admin' ? '#2563eb' : '#64748b'}>
                {user.role.toUpperCase()}
              </Text>
            </YStack>
            <Button
              testID="logout-button"
              accessibilityLabel="Log Out"
              size="$3"
              backgroundColor="#f1f5f9"
              hoverStyle={{ backgroundColor: '#e2e8f0' }}
              borderRadius="$5"
              onPress={onLogoutPress}
            >
              <Text color="#475569" fontWeight="700" fontSize={13}>
                Log Out
              </Text>
            </Button>
          </XStack>
        ) : (
          <Button
            testID="login-button"
            accessibilityLabel="Log In"
            size="$4"
            theme="active"
            backgroundColor="#2563eb"
            hoverStyle={{ backgroundColor: '#1d4ed8', scale: 1.02 }}
            pressStyle={{ backgroundColor: '#1e40af', scale: 0.98 }}
            borderRadius="$6"
            paddingHorizontal="$5"
            elevation="$2"
            onPress={onLoginPress}
          >
            <Text
              color="white"
              fontWeight="700"
              fontSize={15}
              letterSpacing={0.2}
            >
              Log In
            </Text>
          </Button>
        )}
      </XStack>
    </XStack>
  );
};

export default Header;
