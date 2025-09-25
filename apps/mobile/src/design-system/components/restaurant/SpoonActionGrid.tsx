import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography } from '../../context/ThemeContext';

export interface ActionItem {
  key: string;
  label: string;
  icon: string;
  onPress?: () => void;
}

export interface SpoonActionGridProps {
  actions: ActionItem[];
  columns?: number;
  testID?: string;
}

export const SpoonActionGrid: React.FC<SpoonActionGridProps> = ({ actions, columns = 4, testID='action-grid' }) => {
  const spacing = useSpacing();
  const colors = useColors();
  const typography = useTypography();
  const itemWidth = `${100 / columns}%`;
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-around', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg }} testID={testID}>
      {actions.map(a => (
        <TouchableOpacity key={a.key} onPress={a.onPress} style={{ alignItems:'center' }} activeOpacity={0.7} testID={`action-${a.key}`}>
          <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>{a.icon}</Text>
          <Text style={{ ...typography.labelSmall, color: colors.textPrimary, fontWeight:'600' }}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SpoonActionGrid;
