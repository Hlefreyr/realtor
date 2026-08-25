import React, { useState } from 'react';
import { XStack, YStack, ScrollView } from 'tamagui';
import { Sidebar, TabType } from './Sidebar';
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { AreasView, SavedArea, Point } from './views/AreasView';

interface DashboardLayoutProps {
  userRole: 'admin' | 'user';
}

const DEFAULT_SAVED_AREAS: SavedArea[] = [
  {
    id: 'area-1',
    name: 'Downtown Commercial',
    polygon: [
      { lat: 43.6492, lng: -79.3838 },
      { lat: 43.652, lng: -79.375 },
      { lat: 43.645, lng: -79.372 },
    ],
    properties: [
      {
        zpid: 'prop-101',
        price: 850000,
        currency: 'CAD',
        address: { streetAddress: '290 Bremner Blvd Unit 1402', city: 'Toronto', state: 'ON', zipcode: 'M5V 3L9', country: 'CA' },
        location: { latitude: 43.6492, longitude: -79.3838 },
        bedrooms: 2,
        bathrooms: 2,
        livingArea: 880,
        homeType: 'CONDO',
        homeStatus: 'FOR_SALE',
      },
    ],
    candidateProperties: [
      {
        zpid: 'cand-201',
        price: 1250000,
        currency: 'CAD',
        address: { streetAddress: '88 Harbour St Unit 2204', city: 'Toronto', state: 'ON', zipcode: 'M5J 0B7', country: 'CA' },
        location: { latitude: 43.651, longitude: -79.378 },
        bedrooms: 3,
        bathrooms: 2.5,
        livingArea: 1240,
        homeType: 'CONDO',
        homeStatus: 'FOR_SALE',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'area-2',
    name: 'West End Loft',
    polygon: [
      { lat: 43.642, lng: -79.412 },
      { lat: 43.646, lng: -79.405 },
      { lat: 43.639, lng: -79.401 },
    ],
    properties: [],
    candidateProperties: [],
    createdAt: new Date().toISOString(),
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const [settings, setSettings] = useState<{ unit: 'kilometers' | 'miles'; radius: number }>({
    unit: 'kilometers',
    radius: 50,
  });

  const [savedAreas, setSavedAreas] = useState<SavedArea[]>(DEFAULT_SAVED_AREAS);

  const handleUpdateSettings = (newSettings: { unit: 'kilometers' | 'miles'; radius: number }) => {
    setSettings(newSettings);
  };

  const handleSaveArea = (area: { name: string; polygon: Point[] }) => {
    const newAreaItem: SavedArea = {
      id: `area-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: area.name,
      polygon: area.polygon,
      createdAt: new Date().toISOString(),
    };
    setSavedAreas((prev) => [...prev, newAreaItem]);
  };

  const handleDeleteArea = (id: string) => {
    if (selectedAreaId === id) {
      setSelectedAreaId(null);
    }
    setSavedAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleExecuteSearch = async (areaId: string): Promise<SavedArea | void> => {
    const target = savedAreas.find((a) => a.id === areaId);
    if (!target) return;

    const polyCenter = target.polygon[0] || { lat: 43.6492, lng: -79.3838 };

    const sampleListings = [
      {
        zpid: `prop-dash-${Date.now()}-1`,
        price: 850000,
        currency: 'CAD',
        address: { streetAddress: '290 Bremner Blvd Unit 1402', city: 'Toronto', state: 'ON', zipcode: 'M5V 3L9', country: 'CA' },
        location: { latitude: polyCenter.lat, longitude: polyCenter.lng },
        bedrooms: 2,
        bathrooms: 2,
        livingArea: 880,
        homeType: 'CONDO',
        homeStatus: 'FOR_SALE',
      },
      {
        zpid: `prop-dash-${Date.now()}-2`,
        price: 1250000,
        currency: 'CAD',
        address: { streetAddress: '88 Harbour St Unit 2204', city: 'Toronto', state: 'ON', zipcode: 'M5J 0B7', country: 'CA' },
        location: { latitude: polyCenter.lat + 0.003, longitude: polyCenter.lng + 0.003 },
        bedrooms: 3,
        bathrooms: 2.5,
        livingArea: 1240,
        homeType: 'CONDO',
        homeStatus: 'FOR_SALE',
      },
      {
        zpid: `prop-dash-${Date.now()}-3`,
        price: 699000,
        currency: 'CAD',
        address: { streetAddress: '55 Mercer St Unit 809', city: 'Toronto', state: 'ON', zipcode: 'M5V 0H3', country: 'CA' },
        location: { latitude: polyCenter.lat - 0.003, longitude: polyCenter.lng - 0.003 },
        bedrooms: 1,
        bathrooms: 1,
        livingArea: 590,
        homeType: 'CONDO',
        homeStatus: 'FOR_SALE',
      },
    ];

    const updatedArea: SavedArea = {
      ...target,
      properties: sampleListings,
    };

    setSavedAreas((prev) => prev.map((a) => (a.id === areaId ? updatedArea : a)));
    return updatedArea;
  };

  const handleTransferProperty = async (areaId: string, zpid: string): Promise<SavedArea | void> => {
    const target = savedAreas.find((a) => a.id === areaId);
    if (!target) return;

    const currentProps = target.properties || [];
    const currentCandidates = target.candidateProperties || target.preCandidateProperties || [];
    const targetProp = currentProps.find((p) => p.zpid === zpid);

    if (!targetProp) return;

    const updatedArea: SavedArea = {
      ...target,
      properties: currentProps.filter((p) => p.zpid !== zpid),
      candidateProperties: [...currentCandidates, targetProp],
    };

    setSavedAreas((prev) => prev.map((a) => (a.id === areaId ? updatedArea : a)));
    return updatedArea;
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'areas':
        return (
          <AreasView
            unit={settings.unit}
            radius={settings.radius}
            savedAreas={savedAreas}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
            onSaveArea={handleSaveArea}
            onDeleteArea={handleDeleteArea}
            onExecuteSearch={handleExecuteSearch}
            onTransferProperty={handleTransferProperty}
          />
        );
      case 'settings':
        return (
          <SettingsView
            unit={settings.unit}
            radius={settings.radius}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'admin':
        return userRole === 'admin' ? <AdminView /> : <DashboardView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <XStack testID="dashboard-layout-container" flex={1} width="100%" minHeight="100vh">
      {/* Floating Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'areas') {
            setSelectedAreaId(null);
          }
        }}
        userRole={userRole}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        savedAreas={savedAreas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
      />

      {/* Main Viewport Content Area */}
      <YStack flex={1} backgroundColor="#f8fafc" padding="$5" height="100%">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} style={{ height: '100%' }}>
          {renderActiveView()}
        </ScrollView>
      </YStack>
    </XStack>
  );
};

export default DashboardLayout;
