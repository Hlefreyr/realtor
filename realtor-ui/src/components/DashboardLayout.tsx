import React, { useState } from 'react';
import { XStack, YStack, ScrollView } from 'tamagui';
import { Sidebar, TabType } from './Sidebar';
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';

interface DashboardLayoutProps {
  userRole: 'admin' | 'user';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsView />;
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
