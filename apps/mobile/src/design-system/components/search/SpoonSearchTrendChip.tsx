import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii, useShadows } from '../../context/ThemeContext';

export interface SpoonSearchTrendChipProps {
  text: string;
  icon?: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonSearchTrendChip: React.FC<SpoonSearchTrendChipProps> = ({ text, icon='📈', onPress, testID='search-trend-chip' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();
  const shadows = useShadows();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flexDirection:'row', alignItems:'center', backgroundColor: colors.surface, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, marginRight: spacing.sm, marginBottom: spacing.sm, ...shadows.sm }} testID={testID}>
      <Text style={{ marginRight: spacing.xs }}>{icon}</Text>
      <Text style={{ ...typography.labelMedium, color: colors.textPrimary, fontWeight: '500' }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default SpoonSearchTrendChip;
