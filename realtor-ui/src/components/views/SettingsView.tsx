import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave';

export interface SearchCriteriaInput {
  statusType?: string;
  homeTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bedsMax?: number;
  bathsMin?: number;
  bathsMax?: number;
  sqftMin?: number;
  sqftMax?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  daysOnMarket?: number;
}

export interface SettingsViewProps {
  unit?: 'kilometers' | 'miles';
  radius?: number;
  searchCriteria?: SearchCriteriaInput;
  onUpdateSettings?: (settings: { unit: 'kilometers' | 'miles'; radius: number }) => void;
  onUpdateSearchCriteria?: (criteria: SearchCriteriaInput) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  unit: initialUnit = 'kilometers',
  radius: initialRadius = 50,
  searchCriteria = {},
  onUpdateSettings,
  onUpdateSearchCriteria,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'kilometers' | 'miles'>(initialUnit);
  const [selectedRadius, setSelectedRadius] = useState<number>(initialRadius);
  const [statusType, setStatusType] = useState<string>(searchCriteria.statusType || 'ForSale');

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

  // Search Criteria Autosave Input Fields
  const priceMinAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.priceMin ?? 0),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 0;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ priceMin: parsed });
      }
    },
  });

  const priceMaxAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.priceMax ?? 2000000),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 2000000;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ priceMax: parsed });
      }
    },
  });

  const bedsMinAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.bedsMin ?? 1),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 1;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ bedsMin: parsed });
      }
    },
  });

  const bedsMaxAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.bedsMax ?? 10),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 10;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ bedsMax: parsed });
      }
    },
  });

  const bathsMinAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.bathsMin ?? 1),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 1;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ bathsMin: parsed });
      }
    },
  });

  const bathsMaxAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.bathsMax ?? 10),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 10;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ bathsMax: parsed });
      }
    },
  });

  const daysOnMarketAutosave = useDebouncedAutosave({
    initialValue: String(searchCriteria.daysOnMarket ?? 90),
    onSave: async (val) => {
      const parsed = parseInt(val, 10) || 90;
      if (onUpdateSearchCriteria) {
        onUpdateSearchCriteria({ daysOnMarket: parsed });
      }
    },
  });

  const handleUnitChange = (newUnit: 'kilometers' | 'miles') => {
    setSelectedUnit(newUnit);
    if (onUpdateSettings) {
      onUpdateSettings({ unit: newUnit, radius: selectedRadius });
    }
  };

  const handleStatusTypeChange = (newStatus: string) => {
    setStatusType(newStatus);
    if (onUpdateSearchCriteria) {
      onUpdateSearchCriteria({ statusType: newStatus });
    }
  };

  return (
    <YStack testID="settings-view-container" gap="$5" width="100%">
      <YStack gap="$1">
        <Text fontSize={24} fontWeight="800" color="#0f172a">
          Account Settings
        </Text>
        <Text fontSize={14} color="#64748b">
          Manage your account preferences, distance units, search criteria, and profile details.
        </Text>
      </YStack>

      <XStack gap="$4" flexWrap="wrap" maxWidth={1100}>
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
            <Text fontSize={13} fontWeight="600" color="#334155">
              Full Name
            </Text>
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
            <Text fontSize={13} fontWeight="600" color="#334155">
              Contact Email
            </Text>
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
            Distance Units & Radius
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
                backgroundColor={selectedUnit === 'kilometers' ? '#059669' : '#f1f5f9'}
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
                backgroundColor={selectedUnit === 'miles' ? '#059669' : '#f1f5f9'}
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
            <Text fontSize={13} fontWeight="600" color="#334155">
              Default Search Radius ({selectedUnit === 'miles' ? 'miles' : 'km'})
            </Text>
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

      {/* Property Search Criteria Card */}
      <YStack
        backgroundColor="#ffffff"
        borderRadius="$5"
        padding="$5"
        borderColor="#e2e8f0"
        borderWidth={1}
        elevation="$2"
        gap="$4"
        maxWidth={1100}
        testID="settings-search-criteria-card"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1">
            <Text fontSize={18} fontWeight="700" color="#0f172a">
              Real Estate API Search Criteria
            </Text>
            <Text fontSize={13} color="#64748b">
              Configure parameters for RapidAPI polygon searches. Changes auto-save on edit.
            </Text>
          </YStack>
          <Text fontSize={12} color="#10b981" fontWeight="700">
            ⚡ 1 Call/Month Budget Safety Enabled
          </Text>
        </XStack>

        <XStack gap="$4" flexWrap="wrap">
          {/* Status Type Selection */}
          <YStack flex={1} minWidth={220} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">
              Property Status
            </Text>
            <XStack gap="$2">
              <Button
                testID="status-forsale-button"
                flex={1}
                height={38}
                backgroundColor={statusType === 'ForSale' ? '#059669' : '#f1f5f9'}
                onPress={() => handleStatusTypeChange('ForSale')}
                borderRadius="$3"
              >
                <Text color={statusType === 'ForSale' ? '#ffffff' : '#334155'} fontWeight="700" fontSize={12}>
                  For Sale
                </Text>
              </Button>
              <Button
                testID="status-forrent-button"
                flex={1}
                height={38}
                backgroundColor={statusType === 'ForRent' ? '#059669' : '#f1f5f9'}
                onPress={() => handleStatusTypeChange('ForRent')}
                borderRadius="$3"
              >
                <Text color={statusType === 'ForRent' ? '#ffffff' : '#334155'} fontWeight="700" fontSize={12}>
                  For Rent
                </Text>
              </Button>
            </XStack>
          </YStack>

          {/* Price Min & Max */}
          <YStack flex={1} minWidth={220} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Min Price ($)</Text>
            <Input
              testID="settings-price-min-input"
              value={priceMinAutosave.value}
              onChangeText={priceMinAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>

          <YStack flex={1} minWidth={220} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Max Price ($)</Text>
            <Input
              testID="settings-price-max-input"
              value={priceMaxAutosave.value}
              onChangeText={priceMaxAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>
        </XStack>

        <XStack gap="$4" flexWrap="wrap">
          {/* Beds Range */}
          <YStack flex={1} minWidth={160} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Min Beds</Text>
            <Input
              testID="settings-beds-min-input"
              value={bedsMinAutosave.value}
              onChangeText={bedsMinAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>

          <YStack flex={1} minWidth={160} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Max Beds</Text>
            <Input
              testID="settings-beds-max-input"
              value={bedsMaxAutosave.value}
              onChangeText={bedsMaxAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>

          {/* Baths Range */}
          <YStack flex={1} minWidth={160} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Min Baths</Text>
            <Input
              testID="settings-baths-min-input"
              value={bathsMinAutosave.value}
              onChangeText={bathsMinAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>

          <YStack flex={1} minWidth={160} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Max Baths</Text>
            <Input
              testID="settings-baths-max-input"
              value={bathsMaxAutosave.value}
              onChangeText={bathsMaxAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>

          {/* Max Days on Market */}
          <YStack flex={1} minWidth={160} gap="$1.5">
            <Text fontSize={13} fontWeight="600" color="#334155">Max Days Listed</Text>
            <Input
              testID="settings-days-market-input"
              value={daysOnMarketAutosave.value}
              onChangeText={daysOnMarketAutosave.setValue}
              keyboardType="numeric"
              borderColor="#cbd5e1"
              height={38}
            />
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default SettingsView;
