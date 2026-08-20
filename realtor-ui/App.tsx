import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { TamaguiProvider, Theme, YStack, ScrollView } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { client } from './src/apollo/client';
import tamaguiConfig from './tamagui.config';
import { Header } from './src/components/Header';
import { LandingHero } from './src/components/LandingHero';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Theme name="light">
          <YStack
            testID="app-root"
            flex={1}
            minHeight="100%"
            backgroundColor="#f1f5f9"
          >
            <StatusBar style="dark" />
            <Header />
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 40,
              }}
            >
              <LandingHero />
            </ScrollView>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </ApolloProvider>
  );
}
