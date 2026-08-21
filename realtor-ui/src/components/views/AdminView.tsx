import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';

export const AdminView: React.FC = () => {
  return (
    <YStack testID="admin-view-container" gap="$5" width="100%">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$1">
          <Text fontSize={24} fontWeight="800" color="#0f172a">
            System Administration
          </Text>
          <Text fontSize={14} color="#64748b">
            Exclusive admin control panel for user management and system configuration.
          </Text>
        </YStack>

        <YStack
          backgroundColor="#dbeafe"
          borderColor="#93c5fd"
          borderWidth={1}
          paddingHorizontal="$3"
          paddingVertical="$1.5"
          borderRadius="$4"
        >
          <Text fontSize={12} fontWeight="800" color="#1e40af">
            ROLE: ADMIN
          </Text>
        </YStack>
      </XStack>

      <YStack
        backgroundColor="#ffffff"
        borderRadius="$5"
        padding="$5"
        borderColor="#e2e8f0"
        borderWidth={1}
        elevation="$2"
        gap="$4"
      >
        <Text fontSize={18} fontWeight="700" color="#0f172a">
          Registered Accounts Directory
        </Text>

        <YStack gap="$2.5">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$3.5"
            backgroundColor="#f8fafc"
            borderRadius="$4"
            borderColor="#e2e8f0"
            borderWidth={1}
          >
            <YStack gap="$0.5">
              <Text fontWeight="700" color="#0f172a">
                admin@realtor.com
              </Text>
              <Text fontSize={12} color="#64748b">
                Role: Administrator • Created: Pre-seeded
              </Text>
            </YStack>
            <Text fontSize={12} fontWeight="700" color="#15803d">
              ACTIVE
            </Text>
          </XStack>

          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$3.5"
            backgroundColor="#f8fafc"
            borderRadius="$4"
            borderColor="#e2e8f0"
            borderWidth={1}
          >
            <YStack gap="$0.5">
              <Text fontWeight="700" color="#0f172a">
                user@realtor.com
              </Text>
              <Text fontSize={12} color="#64748b">
                Role: Standard User • Created: Pre-seeded
              </Text>
            </YStack>
            <Text fontSize={12} fontWeight="700" color="#15803d">
              ACTIVE
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default AdminView;
