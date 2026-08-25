import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { SavedArea } from '../services/map/MapProviderInterface';

export type TabType = 'dashboard' | 'areas' | 'settings' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: 'admin' | 'user';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  savedAreas?: SavedArea[];
  selectedAreaId?: string | null;
  onSelectArea?: (areaId: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  isCollapsed,
  onToggleCollapse,
  savedAreas = [],
  selectedAreaId = null,
  onSelectArea,
}) => {
  const menuItems: { id: TabType; label: string; icon: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'areas', label: 'Areas', icon: '🗺️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'admin', label: 'Admin Panel', icon: '🔒', adminOnly: true },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  const handleMainItemPress = (itemId: TabType) => {
    onSelectTab(itemId);
    if (itemId === 'areas' && onSelectArea) {
      onSelectArea(null);
    }
  };

  const handleSubItemPress = (areaId: string) => {
    onSelectTab('areas');
    if (onSelectArea) {
      onSelectArea(areaId);
    }
  };

  return (
    <YStack
      testID="sidebar-container"
      width={isCollapsed ? 64 : 240}
      backgroundColor="#1e293b"
      paddingVertical="$4"
      paddingHorizontal={isCollapsed ? "$2" : "$3"}
      borderRightWidth={1}
      borderRightColor="#334155"
      elevation="$3"
      height="100%"
      minHeight="100vh"
      animation="quick"
    >
      {/* Sidebar Header & Collapse Toggle */}
      <XStack
        justifyContent={isCollapsed ? 'center' : 'space-between'}
        alignItems="center"
        marginBottom="$5"
        paddingHorizontal={isCollapsed ? 0 : "$2"}
      >
        {!isCollapsed && (
          <Text
            testID="sidebar-title"
            fontSize={12}
            fontWeight="800"
            color="#94a3b8"
            letterSpacing={1.2}
            textTransform="uppercase"
          >
            Navigation
          </Text>
        )}
        <Button
          testID="sidebar-toggle-button"
          accessibilityLabel="Toggle Sidebar"
          size="$2"
          backgroundColor="#334155"
          hoverStyle={{ backgroundColor: '#475569' }}
          borderRadius="$3"
          onPress={onToggleCollapse}
          paddingHorizontal="$2"
        >
          <Text color="#e2e8f0" fontWeight="700" fontSize={14}>
            {isCollapsed ? '➔' : '◀'}
          </Text>
        </Button>
      </XStack>

      {/* Navigation Items List */}
      <YStack gap="$2" width="100%">
        {visibleItems.map((item) => {
          const isMainActive = activeTab === item.id && (item.id !== 'areas' || selectedAreaId === null);

          return (
            <YStack key={item.id} gap="$1" width="100%">
              <Button
                testID={`sidebar-item-${item.id}`}
                onPress={() => handleMainItemPress(item.id)}
                backgroundColor={isMainActive ? '#2563eb' : 'transparent'}
                hoverStyle={{
                  backgroundColor: isMainActive ? '#1d4ed8' : '#334155',
                }}
                justifyContent={isCollapsed ? 'center' : 'flex-start'}
                paddingHorizontal={isCollapsed ? "$2" : "$3.5"}
                height={44}
                borderRadius="$4"
              >
                <XStack alignItems="center" justifyContent="space-between" width="100%">
                  <XStack alignItems="center" gap="$3">
                    <Text fontSize={18}>{item.icon}</Text>
                    {!isCollapsed && (
                      <Text
                        color={isMainActive ? '#ffffff' : '#cbd5e1'}
                        fontWeight={isMainActive ? '700' : '500'}
                        fontSize={14}
                      >
                        {item.label}
                      </Text>
                    )}
                  </XStack>
                  {item.id === 'areas' && !isCollapsed && savedAreas.length > 0 && (
                    <XStack alignItems="center" gap="$1" backgroundColor="#334155" paddingHorizontal="$2" paddingVertical={2} borderRadius="$2">
                      <Text fontSize={11} color="#94a3b8" fontWeight="700">
                        {savedAreas.length}
                      </Text>
                      <Text fontSize={10} color="#94a3b8">
                        ▼
                      </Text>
                    </XStack>
                  )}
                </XStack>
              </Button>

              {/* Sub-items for Areas */}
              {item.id === 'areas' && !isCollapsed && savedAreas.length > 0 && (
                <YStack gap="$1" paddingLeft="$4" width="100%">
                  {savedAreas.map((area) => {
                    const isSubActive = activeTab === 'areas' && selectedAreaId === area.id;
                    return (
                      <Button
                        key={area.id}
                        testID={`sidebar-subitem-${area.id}`}
                        onPress={() => handleSubItemPress(area.id)}
                        backgroundColor={isSubActive ? '#3b82f6' : 'transparent'}
                        hoverStyle={{
                          backgroundColor: isSubActive ? '#2563eb' : '#334155',
                        }}
                        justifyContent="flex-start"
                        paddingHorizontal="$3"
                        height={36}
                        borderRadius="$3"
                      >
                        <XStack alignItems="center" gap="$2">
                          <Text fontSize={12} color={isSubActive ? '#ffffff' : '#94a3b8'}>
                            📍
                          </Text>
                          <Text
                            color={isSubActive ? '#ffffff' : '#cbd5e1'}
                            fontWeight={isSubActive ? '700' : '400'}
                            fontSize={13}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {area.name}
                          </Text>
                        </XStack>
                      </Button>
                    );
                  })}
                </YStack>
              )}
            </YStack>
          );
        })}
      </YStack>
    </YStack>
  );
};

export default Sidebar;

