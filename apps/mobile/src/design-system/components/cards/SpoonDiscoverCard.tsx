import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useShadows, useRadii } from '../../context/ThemeContext';

export interface SpoonDiscoverCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonDiscoverCard: React.FC<SpoonDiscoverCardProps> = ({
  title,
  subtitle,
  icon = '🎲',
  onPress,
  testID = 'discover-card'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const shadows = useShadows();
  const radii = useRadii();

  const style = {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
    ...shadows.sm,
  };

  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.75} testID={testID}>
      <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>{icon}</Text>
      <Text style={{ ...typography.titleMedium, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>{title}</Text>
      {subtitle && <Text style={{ ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' }}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

export default SpoonDiscoverCard;
