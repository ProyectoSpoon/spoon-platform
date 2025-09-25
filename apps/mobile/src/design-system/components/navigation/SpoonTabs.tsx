import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Animated, TouchableOpacity, Text, View } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';

/**
 * Datos para una tab
 */
export interface SpoonTabItem {
  key: string;
  title: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

/**
 * Props para el componente SpoonTabs
 */
export interface SpoonTabsProps {
  tabs: SpoonTabItem[];
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'segmented';
  size?: 'small' | 'medium' | 'large';
  scrollable?: boolean;
  showBadges?: boolean;
  showIcons?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

/**
 * Tabs personalizadas del design system Spoon
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { key: 'home', title: 'Inicio', icon: '🏠', content: <HomeContent /> },
 *   { key: 'search', title: 'Buscar', icon: '🔍', content: <SearchContent /> },
 *   { key: 'profile', title: 'Perfil', icon: '👤', badge: 2, content: <ProfileContent /> },
 * ];
 * 
 * <SpoonTabs
 *   tabs={tabs}
 *   activeTab="home"
 *   onTabChange={setActiveTab}
 *   variant="pills"
 *   showIcons
 *   showBadges
 * />
 * ```
 */
export const SpoonTabs: React.FC<SpoonTabsProps> & {
  pills: React.FC<SpoonTabsProps>;
  underline: React.FC<SpoonTabsProps>;
  segmented: React.FC<SpoonTabsProps>;
} = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'medium',
  scrollable = false,
  showBadges = true,
  showIcons = true,
  animated = true,
  style,
  tabStyle,
  activeTabStyle,
  contentStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0]?.key || '');
  const [tabWidths, setTabWidths] = useState<{ [key: string]: number }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab, currentTab]);

  useEffect(() => {
    if (animated && variant === 'underline') {
      const currentIndex = tabs.findIndex(tab => tab.key === currentTab);
      Animated.spring(indicatorAnimation, {
        toValue: currentIndex,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [currentTab, tabs, animated, variant, indicatorAnimation]);

  const handleTabPress = (tabKey: string) => {
    if (tabs.find(tab => tab.key === tabKey)?.disabled) return;
    
    setCurrentTab(tabKey);
    onTabChange?.(tabKey);
  };

  const getCurrentContent = () => {
    return tabs.find(tab => tab.key === currentTab)?.content;
  };

  // Estilos base
  const containerStyle: ViewStyle = {
    ...style,
  };

  const tabBarStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: getTabBarBackground(),
    ...getTabBarVariantStyle(),
  };

  const tabItemStyle: ViewStyle = {
    ...getTabItemBaseStyle(),
    ...tabStyle,
  };

  const activeTabItemStyle: ViewStyle = {
    ...getActiveTabStyle(),
    ...activeTabStyle,
  };

  const tabTextStyle: TextStyle = {
    ...getTabTextStyle(),
  };

  const activeTabTextStyle: TextStyle = {
    ...getActiveTabTextStyle(),
  };

  const badgeStyle: ViewStyle = {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  };

  const badgeTextStyle: TextStyle = {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  };

  const contentContainerStyle: ViewStyle = {
    flex: 1,
    ...contentStyle,
  };

  function getTabBarBackground(): string {
    switch (variant) {
      case 'pills':
      case 'segmented':
        return colors.surfaceVariant;
      default:
        return colors.surface;
    }
  }

  function getTabBarVariantStyle(): ViewStyle {
    const baseStyle: ViewStyle = {
      paddingHorizontal: spacing.md,
    };

    switch (variant) {
      case 'pills':
        return {
          ...baseStyle,
          paddingVertical: spacing.xs,
          gap: spacing.xs,
        };
      case 'segmented':
        return {
          ...baseStyle,
          padding: spacing.xs,
          borderRadius: 8,
          margin: spacing.md,
        };
      case 'underline':
        return {
          ...baseStyle,
          borderBottomWidth: 1,
          borderBottomColor: colors.outline,
        };
      default:
        return baseStyle;
    }
  }

  function getTabItemBaseStyle(): ViewStyle {
    const baseStyle: ViewStyle = {
      paddingVertical: getTabPadding(),
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    switch (variant) {
      case 'pills':
        return {
          ...baseStyle,
          borderRadius: 20,
          minWidth: 80,
        };
      case 'segmented':
        return {
          ...baseStyle,
          flex: 1,
          borderRadius: 6,
        };
      default:
        return {
          ...baseStyle,
          flex: scrollable ? undefined : 1,
        };
    }
  }

  function getActiveTabStyle(): ViewStyle {
    switch (variant) {
      case 'pills':
        return {
          backgroundColor: colors.primary,
        };
      case 'segmented':
        return {
          backgroundColor: colors.surface,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
      case 'underline':
        return {
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.surfaceVariant,
        };
    }
  }

  function getTabPadding(): number {
    switch (size) {
      case 'small':
        return spacing.xs;
      case 'large':
        return spacing.md;
      default:
        return spacing.sm;
    }
  }

  function getTabTextStyle(): TextStyle {
    const baseStyle = {
      textAlign: 'center' as const,
      color: colors.textSecondary,
    };

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          ...typography.labelSmall,
        };
      case 'large':
        return {
          ...baseStyle,
          ...typography.labelLarge,
        };
      default:
        return {
          ...baseStyle,
          ...typography.labelMedium,
        };
    }
  }

  function getActiveTabTextStyle(): TextStyle {
    const color = variant === 'pills' ? colors.white : colors.primary;
    return {
      ...getTabTextStyle(),
      color,
      fontWeight: '600',
    };
  }

  const renderTab = (tab: SpoonTabItem, index: number) => {
    const isActive = tab.key === currentTab;
    const isDisabled = tab.disabled;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          tabItemStyle,
          isActive && activeTabItemStyle,
          isDisabled && { opacity: 0.5 },
        ]}
        onPress={() => handleTabPress(tab.key)}
        disabled={isDisabled}
        testID={`${testID}-tab-${tab.key}`}
      >
        {/* Icon */}
        {showIcons && tab.icon && (
          <Text style={{ fontSize: 20, marginBottom: 2 }}>
            {tab.icon}
          </Text>
        )}

        {/* Title */}
        <Text
          style={isActive ? activeTabTextStyle : tabTextStyle}
          numberOfLines={1}
        >
          {tab.title}
        </Text>

        {/* Badge */}
        {showBadges && tab.badge && (
          <View style={badgeStyle}>
            <Text style={badgeTextStyle}>
              {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTabBar = () => {
    if (scrollable) {
      return (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tabBarStyle}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      );
    }

    return (
      <View style={tabBarStyle}>
        {tabs.map(renderTab)}
      </View>
    );
  };

  const renderUnderlineIndicator = () => {
    if (variant !== 'underline' || !animated) return null;

    const tabWidth = 100 / tabs.length;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          backgroundColor: colors.primary,
          width: `${tabWidth}%`,
          transform: [
            {
              translateX: indicatorAnimation.interpolate({
                inputRange: tabs.map((_, index) => index),
                outputRange: tabs.map((_, index) => index * (100 / tabs.length)),
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      />
    );
  };

  return (
    <View style={containerStyle} testID={testID}>
      {/* Tab Bar */}
      <View style={{ position: 'relative' }}>
        {renderTabBar()}
        {renderUnderlineIndicator()}
      </View>

      {/* Content */}
      {getCurrentContent() && (
        <View style={contentContainerStyle}>
          {getCurrentContent()}
        </View>
      )}
    </View>
  );
};

// Constructores estáticos (Flutter-style)
SpoonTabs.pills = (props) => (
  <SpoonTabs {...props} variant="pills" />
);

SpoonTabs.underline = (props) => (
  <SpoonTabs {...props} variant="underline" />
);

SpoonTabs.segmented = (props) => (
  <SpoonTabs {...props} variant="segmented" />
);

export default SpoonTabs;
