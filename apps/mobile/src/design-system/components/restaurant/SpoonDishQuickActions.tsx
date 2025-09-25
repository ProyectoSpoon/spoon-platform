import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useRadii, useTypography, useShadows } from '../../context/ThemeContext';

export interface DishQuickAction {
  key: string;
  icon: string;
  label: string;
  value?: string;
  subtitle?: string;
  color?: string; // background tint
  onPress?: () => void;
}

export interface SpoonDishQuickActionsProps {
  actions: DishQuickAction[];
  testID?: string;
}

export const SpoonDishQuickActions: React.FC<SpoonDishQuickActionsProps> = ({ actions, testID='dish-quick-actions' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const typography = useTypography();
  const shadows = useShadows();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, flexDirection:'row', justifyContent:'space-around', marginBottom: spacing.lg, ...shadows.sm }} testID={testID}>
      {actions.map(a => (
        <TouchableOpacity key={a.key} onPress={a.onPress} style={{ alignItems:'center' }} activeOpacity={0.7} testID={`dish-action-${a.key}`}>
          <View style={{ width:40, height:40, borderRadius: radii.sm, justifyContent:'center', alignItems:'center', marginBottom: spacing.sm, backgroundColor: a.color || colors.background }}>
            <Text style={{ fontSize:20 }}>{a.icon}</Text>
          </View>
          <Text style={{ ...typography.labelSmall, color: colors.textSecondary, marginBottom:4 }}>{a.label}</Text>
          {a.value && <Text style={{ ...typography.labelMedium, fontWeight:'700', color: colors.textPrimary, marginBottom:2 }}>{a.value}</Text>}
          {a.subtitle && <Text style={{ fontSize:10, color: colors.textSecondary }}>{a.subtitle}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SpoonDishQuickActions;
