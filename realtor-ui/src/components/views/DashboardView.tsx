import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';

export const DashboardView: React.FC = () => {
  return (
    <YStack testID="dashboard-view-container" gap="$5" width="100%">
      <YStack gap="$1">
        <Text fontSize={24} fontWeight="800" color="#0f172a">
          Platform Overview
        </Text>
        <Text fontSize={14} color="#64748b">
          Welcome back! Here is a summary of your active real estate listings and activity.
        </Text>
      </YStack>

      {/* Metrics Cards Grid */}
      <XStack gap="$4" flexWrap="wrap" width="100%">
        <YStack
          flex={1}
          minWidth={200}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$4"
          elevation="$2"
          borderColor="#e2e8f0"
          borderWidth={1}
          gap="$1.5"
        >
          <Text fontSize={13} color="#64748b" fontWeight="600">
            Total Listings
          </Text>
          <Text fontSize={28} fontWeight="800" color="#2563eb">
            142
          </Text>
          <Text fontSize={12} color="#16a34a" fontWeight="600">
            ▲ +12% from last month
          </Text>
        </YStack>

        <YStack
          flex={1}
          minWidth={200}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$4"
          elevation="$2"
          borderColor="#e2e8f0"
          borderWidth={1}
          gap="$1.5"
        >
          <Text fontSize={13} color="#64748b" fontWeight="600">
            Active Inquiries
          </Text>
          <Text fontSize={28} fontWeight="800" color="#0891b2">
            38
          </Text>
          <Text fontSize={12} color="#16a34a" fontWeight="600">
            ▲ 5 new today
          </Text>
        </YStack>

        <YStack
          flex={1}
          minWidth={200}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$4"
          elevation="$2"
          borderColor="#e2e8f0"
          borderWidth={1}
          gap="$1.5"
        >
          <Text fontSize={13} color="#64748b" fontWeight="600">
            Properties Sold
          </Text>
          <Text fontSize={28} fontWeight="800" color="#16a34a">
            29
          </Text>
          <Text fontSize={12} color="#64748b" fontWeight="500">
            Target: 35 this quarter
          </Text>
        </YStack>
      </XStack>

      {/* Featured Properties Table / Card */}
      <YStack
        backgroundColor="#ffffff"
        borderRadius="$5"
        padding="$5"
        borderColor="#e2e8f0"
        borderWidth={1}
        elevation="$2"
        gap="$3"
      >
        <Text fontSize={18} fontWeight="700" color="#0f172a">
          Recent Property Portfolio
        </Text>
        <YStack gap="$2.5">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$3"
            backgroundColor="#f8fafc"
            borderRadius="$4"
          >
            <YStack gap="$0.5">
              <Text fontWeight="700" color="#1e293b">
                742 Evergreen Terrace
              </Text>
              <Text fontSize={12} color="#64748b">
                4 Beds • 3 Baths • 2,400 sqft
              </Text>
            </YStack>
            <Text fontWeight="800" color="#2563eb">
              $750,000
            </Text>
          </XStack>

          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$3"
            backgroundColor="#f8fafc"
            borderRadius="$4"
          >
            <YStack gap="$0.5">
              <Text fontWeight="700" color="#1e293b">
                100 Ocean Drive, Penthouse 4B
              </Text>
              <Text fontSize={12} color="#64748b">
                3 Beds • 3.5 Baths • 3,100 sqft
              </Text>
            </YStack>
            <Text fontWeight="800" color="#2563eb">
              $2,450,000
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default DashboardView;
