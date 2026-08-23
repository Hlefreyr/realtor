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

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [settings, setSettings] = useState<{ unit: 'kilometers' | 'miles'; radius: number }>({
    unit: 'kilometers',
    radius: 50,
  });

  const [savedAreas, setSavedAreas] = useState<SavedArea[]>([]);

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
    setSavedAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'areas':
        return (
          <AreasView
            unit={settings.unit}
            radius={settings.radius}
            savedAreas={savedAreas}
            onSaveArea={handleSaveArea}
            onDeleteArea={handleDeleteArea}
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
        onSelectTab={setActiveTab}
        userRole={userRole}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Viewport Content Area */}
      <YStack flex={1} backgroundColor="#f8fafc" padding="$5">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          {renderActiveView()}
        </ScrollView>
      </YStack>
    </XStack>
  );
};

export default DashboardLayout;
