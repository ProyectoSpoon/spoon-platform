import React from 'react';
import { View, Text } from 'react-native';
import { useColors, useSpacing, useTypography } from '../../context/ThemeContext';

export interface SpoonSearchEmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  testID?: string;
}

export const SpoonSearchEmptyState: React.FC<SpoonSearchEmptyStateProps> = ({ title, message, icon='🔍', testID='search-empty' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  return (
    <View style={{ alignItems:'center', padding: spacing.lg, marginTop: spacing.lg * 1.5 }} testID={testID}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{icon}</Text>
      <Text style={{ ...typography.titleMedium, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 }}>{title}</Text>
      <Text style={{ ...typography.bodySmall, color: colors.textSecondary, textAlign:'center', lineHeight: 18 }}>{message}</Text>
    </View>
  );
};

export default SpoonSearchEmptyState;
