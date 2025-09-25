import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii } from '../../context/ThemeContext';

export interface SearchTabItem {
  key: string;
  label: string;
  count?: number;
}

export interface SpoonSearchTabsProps {
  tabs: SearchTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  testID?: string;
}

export const SpoonSearchTabs: React.FC<SpoonSearchTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  testID = 'search-tabs'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();

  return (
    <View style={{ flexDirection: 'row', marginBottom: spacing.md }} testID={testID}>
      {tabs.map(t => {
        const active = t.key === activeKey;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
              borderRadius: radii.full,
              backgroundColor: active ? colors.primary : colors.surfaceVariant,
              marginRight: spacing.sm,
            }}
            testID={`${testID}-${t.key}`}
          >
            <Text style={{
              ...typography.labelMedium,
              color: active ? colors.white : colors.textPrimary,
              fontWeight: active ? '600' : '500'
            }}>
              {t.label}{typeof t.count === 'number' ? ` (${t.count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SpoonSearchTabs;
