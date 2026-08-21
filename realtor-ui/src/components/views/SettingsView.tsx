import React from 'react';
import { YStack, XStack, Text, Button, Input } from 'tamagui';

export const SettingsView: React.FC = () => {
  return (
    <YStack testID="settings-view-container" gap="$5" width="100%">
      <YStack gap="$1">
        <Text fontSize={24} fontWeight="800" color="#0f172a">
          Account Settings
        </Text>
        <Text fontSize={14} color="#64748b">
          Manage your account preferences, notifications, and profile details.
        </Text>
      </YStack>

      <YStack
        backgroundColor="#ffffff"
        borderRadius="$5"
        padding="$5"
        borderColor="#e2e8f0"
        borderWidth={1}
        elevation="$2"
        gap="$4"
        maxWidth={600}
      >
        <Text fontSize={18} fontWeight="700" color="#0f172a">
          Profile Information
        </Text>

        <YStack gap="$1.5">
          <Text fontSize={13} fontWeight="600" color="#334155">
            Display Name
          </Text>
          <Input
            testID="settings-name-input"
            defaultValue="Realtor Agent"
            borderColor="#cbd5e1"
            height={44}
            paddingHorizontal="$3.5"
          />
        </YStack>

        <YStack gap="$1.5">
          <Text fontSize={13} fontWeight="600" color="#334155">
            Contact Email
          </Text>
          <Input
            testID="settings-email-input"
            defaultValue="agent@realtor.com"
            borderColor="#cbd5e1"
            height={44}
            paddingHorizontal="$3.5"
          />
        </YStack>

        <XStack justifyContent="flex-end" marginTop="$2">
          <Button
            testID="save-settings-button"
            backgroundColor="#2563eb"
            hoverStyle={{ backgroundColor: '#1d4ed8' }}
            borderRadius="$4"
            paddingHorizontal="$5"
          >
            <Text color="white" fontWeight="700">
              Save Preferences
            </Text>
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default SettingsView;
