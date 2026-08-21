import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';

export type TabType = 'dashboard' | 'settings' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: 'admin' | 'user';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: { id: TabType; label: string; icon: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'admin', label: 'Admin Panel', icon: '🔒', adminOnly: true },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

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
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              testID={`sidebar-item-${item.id}`}
              onPress={() => onSelectTab(item.id)}
              backgroundColor={isActive ? '#2563eb' : 'transparent'}
              hoverStyle={{
                backgroundColor: isActive ? '#1d4ed8' : '#334155',
              }}
              justifyContent={isCollapsed ? 'center' : 'flex-start'}
              paddingHorizontal={isCollapsed ? "$2" : "$3.5"}
              height={44}
              borderRadius="$4"
            >
              <XStack alignItems="center" gap="$3">
                <Text fontSize={18}>{item.icon}</Text>
                {!isCollapsed && (
                  <Text
                    color={isActive ? '#ffffff' : '#cbd5e1'}
                    fontWeight={isActive ? '700' : '500'}
                    fontSize={14}
                  >
                    {item.label}
                  </Text>
                )}
              </XStack>
            </Button>
          );
        })}
      </YStack>
    </YStack>
  );
};

export default Sidebar;
