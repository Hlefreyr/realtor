import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave';

export interface SettingsViewProps {
  unit?: 'kilometers' | 'miles';
  radius?: number;
  onUpdateSettings?: (settings: { unit: 'kilometers' | 'miles'; radius: number }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  unit: initialUnit = 'kilometers',
  radius: initialRadius = 50,
  onUpdateSettings,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'kilometers' | 'miles'>(initialUnit);
  const [selectedRadius, setSelectedRadius] = useState<number>(initialRadius);

  const nameAutosave = useDebouncedAutosave({
    initialValue: 'Realtor Agent',
    onSave: async (val) => {
      console.log('Autosaving name:', val);
    },
  });

  const emailAutosave = useDebouncedAutosave({
    initialValue: 'agent@realtor.com',
    onSave: async (val) => {
      console.log('Autosaving email:', val);
    },
  });

  const radiusAutosave = useDebouncedAutosave({
    initialValue: selectedRadius.toString(),
    onSave: async (val) => {
      const parsed = parseFloat(val) || 50;
      setSelectedRadius(parsed);
      if (onUpdateSettings) {
        onUpdateSettings({ unit: selectedUnit, radius: parsed });
      }
    },
  });

  const handleUnitChange = (newUnit: 'kilometers' | 'miles') => {
    setSelectedUnit(newUnit);
    if (onUpdateSettings) {
      onUpdateSettings({ unit: newUnit, radius: selectedRadius });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'typing':
        return <Text fontSize={11} color="#f59e0b" fontWeight="600">● Typing...</Text>;
      case 'saving':
        return <Text fontSize={11} color="#3b82f6" fontWeight="600">● Autosaving...</Text>;
      case 'saved':
        return <Text fontSize={11} color="#10b981" fontWeight="600">✓ Saved</Text>;
      case 'error':
        return <Text fontSize={11} color="#ef4444" fontWeight="600">⚠ Error saving</Text>;
      default:
        return <Text fontSize={11} color="#94a3b8" fontWeight="600">Auto-saves on edit</Text>;
    }
  };

  return (
    <YStack testID="settings-view-container" gap="$5" width="100%">
      <YStack gap="$1">
        <Text fontSize={24} fontWeight="800" color="#0f172a">
          Account Settings
        </Text>
        <Text fontSize={14} color="#64748b">
          Manage your account preferences, distance units, search radius, and profile details.
        </Text>
      </YStack>

      <XStack gap="$4" flexWrap="wrap" maxWidth={900}>
        {/* Profile Settings Card */}
        <YStack
          flex={1}
          minWidth={320}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$5"
          borderColor="#e2e8f0"
          borderWidth={1}
          elevation="$2"
          gap="$4"
        >
          <Text fontSize={18} fontWeight="700" color="#0f172a">
            Profile Information
          </Text>

          <YStack gap="$1.5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={13} fontWeight="600" color="#334155">
                Display Name
              </Text>
              {getStatusBadge(nameAutosave.status)}
            </XStack>
            <Input
              testID="settings-name-input"
              value={nameAutosave.value}
              onChangeText={nameAutosave.setValue}
              borderColor="#cbd5e1"
              height={44}
              paddingHorizontal="$3.5"
            />
          </YStack>

          <YStack gap="$1.5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={13} fontWeight="600" color="#334155">
                Contact Email
              </Text>
              {getStatusBadge(emailAutosave.status)}
            </XStack>
            <Input
              testID="settings-email-input"
              value={emailAutosave.value}
              onChangeText={emailAutosave.setValue}
              borderColor="#cbd5e1"
              height={44}
              paddingHorizontal="$3.5"
            />
          </YStack>
        </YStack>

        {/* Units Configuration Card */}
        <YStack
          flex={1}
          minWidth={320}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$5"
          borderColor="#e2e8f0"
          borderWidth={1}
          elevation="$2"
          gap="$4"
          testID="settings-units-card"
        >
          <Text fontSize={18} fontWeight="700" color="#0f172a">
            Units & Distance Preferences
          </Text>

          <YStack gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">
              Measurement Unit
            </Text>
            <XStack gap="$2" width="100%">
              <Button
                testID="unit-km-button"
                flex={1}
                height={40}
                backgroundColor={selectedUnit === 'kilometers' ? '#2563eb' : '#f1f5f9'}
                hoverStyle={{ backgroundColor: selectedUnit === 'kilometers' ? '#1d4ed8' : '#e2e8f0' }}
                onPress={() => handleUnitChange('kilometers')}
                borderRadius="$3"
              >
                <Text
                  color={selectedUnit === 'kilometers' ? '#ffffff' : '#334155'}
                  fontWeight="700"
                  fontSize={13}
                >
                  Kilometers (km)
                </Text>
              </Button>

              <Button
                testID="unit-miles-button"
                flex={1}
                height={40}
                backgroundColor={selectedUnit === 'miles' ? '#2563eb' : '#f1f5f9'}
                hoverStyle={{ backgroundColor: selectedUnit === 'miles' ? '#1d4ed8' : '#e2e8f0' }}
                onPress={() => handleUnitChange('miles')}
                borderRadius="$3"
              >
                <Text
                  color={selectedUnit === 'miles' ? '#ffffff' : '#334155'}
                  fontWeight="700"
                  fontSize={13}
                >
                  Miles (mi)
                </Text>
              </Button>
            </XStack>
          </YStack>

          <YStack gap="$1.5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={13} fontWeight="600" color="#334155">
                Default Search Radius ({selectedUnit === 'miles' ? 'miles' : 'km'})
              </Text>
              {getStatusBadge(radiusAutosave.status)}
            </XStack>
            <Input
              testID="settings-radius-input"
              value={radiusAutosave.value}
              onChangeText={radiusAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={44}
              paddingHorizontal="$3.5"
            />
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  );
};

export default SettingsView;
