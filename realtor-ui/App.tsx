import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { TamaguiProvider, Theme, YStack, ScrollView } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { client } from './src/apollo/client';
import tamaguiConfig from './tamagui.config';
import { Header } from './src/components/Header';
import { LandingHero } from './src/components/LandingHero';
import { LoginModal, UserAuthData } from './src/components/LoginModal';
import { DashboardLayout } from './src/components/DashboardLayout';
import { getSession, saveSession, clearSession } from './src/utils/session';

export default function App() {
  const [user, setUser] = useState<UserAuthData | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const activeSessionUser = getSession();
    if (activeSessionUser) {
      setUser(activeSessionUser);
    }
  }, []);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const activeSessionUser = getSession();
      if (!activeSessionUser && user !== null) {
        setUser(null);
      }
    };

    const intervalId = setInterval(checkSessionExpiration, 15000);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('focus', checkSessionExpiration);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('focus', checkSessionExpiration);
      }
    };
  }, [user]);

  const handleLoginSuccess = (authData: UserAuthData, staySignedIn = false) => {
    saveSession(authData, staySignedIn);
    setUser(authData);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

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
            <Header
              user={user}
              onLoginPress={() => setIsLoginOpen(true)}
              onLogoutPress={handleLogout}
            />
            {user ? (
              <DashboardLayout userRole={user.role} />
            ) : (
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
            )}

            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onSuccess={handleLoginSuccess}
            />
          </YStack>
        </Theme>
      </TamaguiProvider>
    </ApolloProvider>
  );
}
