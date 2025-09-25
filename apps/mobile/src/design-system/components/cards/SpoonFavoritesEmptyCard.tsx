import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii, useShadows } from '../../context/ThemeContext';

export interface SpoonFavoritesEmptyCardProps {
  message: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonFavoritesEmptyCard: React.FC<SpoonFavoritesEmptyCardProps> = ({
  message,
  onPress,
  testID = 'favorites-empty-card'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();
  const shadows = useShadows();

  const style = {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed' as const,
    ...shadows.sm
  };

  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7} testID={testID}>
      <Text style={{ ...typography.bodyMedium, color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center' }}>{message}</Text>
    </TouchableOpacity>
  );
};

export default SpoonFavoritesEmptyCard;
