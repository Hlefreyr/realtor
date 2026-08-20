import React, { useState } from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';

interface HeaderProps {
  onLoginPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginPress }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginClick = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      setIsLoggedIn(!isLoggedIn);
    }
  };

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

      {/* Top-Right Corner Actions: Login Button */}
      <XStack alignItems="center" gap="$3">
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
          onPress={handleLoginClick}
        >
          <Text
            color="white"
            fontWeight="700"
            fontSize={15}
            letterSpacing={0.2}
          >
            {isLoggedIn ? 'Account' : 'Log In'}
          </Text>
        </Button>
      </XStack>
    </XStack>
  );
};

export default Header;
