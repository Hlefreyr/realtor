import React, { useState } from 'react';
import { Image, Platform } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { YStack, XStack, Text, Button, Card, Spinner, Input } from 'tamagui';

export const GET_HELLO = gql`
  query GetHello {
    hello
  }
`;

export interface HelloData {
  hello: string;
}

export interface LandingHeroProps {
  onSearch?: (query: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, error, refetch } = useQuery<HelloData>(GET_HELLO, {
    fetchPolicy: 'cache-and-network',
  });

  const isWeb = Platform.OS === 'web';
  const heroFontSize = isWeb ? 68 : 46;
  const subtitleFontSize = isWeb ? 20 : 16;
  const imageSize = isWeb ? 340 : 280;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <YStack
      testID="landing-hero-container"
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="$4"
      paddingVertical="$6"
      gap="$5"
      maxWidth={1200}
      width="100%"
      marginHorizontal="auto"
    >
      {/* Brand Hero Title */}
      <YStack alignItems="center" gap="$2">
        <Text
          testID="hero-title"
          fontSize={heroFontSize}
          fontWeight="900"
          letterSpacing={-1.5}
          color="#1e3a8a"
          textAlign="center"
          style={{
            textShadowColor: 'rgba(37, 99, 235, 0.15)',
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 12,
          }}
        >
          Realtor
        </Text>
        <Text
          testID="hero-subtitle"
          fontSize={subtitleFontSize}
          color="#475569"
          fontWeight="500"
          textAlign="center"
          maxWidth={600}
        >
          Discover your dream home with the friendliest, most delightful real estate platform.
        </Text>
      </YStack>

      {/* Happy North American House Cartoon Art */}
      <Card
        testID="house-art-card"
        elevation="$4"
        borderRadius="$8"
        backgroundColor="white"
        padding="$3"
        borderWidth={1}
        borderColor="#e2e8f0"
        alignItems="center"
        justifyContent="center"
        hoverStyle={{ scale: 1.02 }}
      >
        <Image
          testID="house-art-image"
          accessibilityLabel="Happy North American House"
          source={require('../../assets/happy_house.png')}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: 20,
          }}
          resizeMode="contain"
        />
      </Card>

      {/* Quick Search Bar */}
      <XStack
        testID="search-bar-container"
        width="100%"
        maxWidth={580}
        backgroundColor="white"
        borderRadius="$10"
        padding="$2"
        elevation="$3"
        borderWidth={1}
        borderColor="#cbd5e1"
        alignItems="center"
        gap="$2"
      >
        <Input
          testID="search-input"
          flex={1}
          borderWidth={0}
          backgroundColor="transparent"
          placeholder="Search by city, neighborhood, or address..."
          placeholderTextColor="#94a3b8"
          fontSize={15}
          paddingLeft="$3"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button
          testID="search-button"
          backgroundColor="#2563eb"
          hoverStyle={{ backgroundColor: '#1d4ed8' }}
          pressStyle={{ backgroundColor: '#1e40af' }}
          borderRadius="$8"
          paddingHorizontal="$5"
          height={42}
          onPress={handleSearch}
        >
          <Text color="white" fontWeight="700">
            Search
          </Text>
        </Button>
      </XStack>

      {/* GraphQL Live Backend Status Badge */}
      <Card
        testID="graphql-status-card"
        backgroundColor="#f8fafc"
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderRadius="$6"
        borderWidth={1}
        borderColor="#e2e8f0"
        alignItems="center"
        maxWidth={580}
        width="100%"
      >
        <XStack alignItems="center" gap="$2.5">
          <YStack
            testID="status-indicator"
            width={10}
            height={10}
            borderRadius={5}
            backgroundColor={loading ? '#eab308' : error ? '#ef4444' : '#22c55e'}
          />
          <Text fontSize={13} color="#64748b" fontWeight="600">
            Backend API:
          </Text>
          {loading && (
            <XStack testID="graphql-loading" alignItems="center" gap="$2">
              <Spinner size="small" color="#2563eb" />
              <Text fontSize={13} color="#64748b">
                Connecting to GraphQL...
              </Text>
            </XStack>
          )}
          {error && (
            <XStack testID="graphql-error" alignItems="center" gap="$2">
              <Text fontSize={13} color="#ef4444">
                Offline ({error.message})
              </Text>
              <Button
                testID="graphql-retry-button"
                size="$2"
                onPress={() => refetch()}
                paddingHorizontal="$2"
              >
                <Text fontSize={11}>Retry</Text>
              </Button>
            </XStack>
          )}
          {data?.hello && (
            <Text testID="graphql-success" fontSize={13} color="#15803d" fontWeight="500">
              {data.hello}
            </Text>
          )}
        </XStack>
      </Card>
    </YStack>
  );
};

export default LandingHero;
