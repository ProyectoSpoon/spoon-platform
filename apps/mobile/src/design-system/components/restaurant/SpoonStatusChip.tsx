import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useRadii, useTypography } from '../../context/ThemeContext';

export interface SpoonStatusChipProps {
  open: boolean;
  onPress?: () => void;
  testID?: string;
}

export const SpoonStatusChip: React.FC<SpoonStatusChipProps> = ({ open, onPress, testID='status-chip' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const typography = useTypography();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: open ? colors.success : colors.error,
      }}
      testID={testID}
    >
      <Text style={{ ...typography.labelSmall, color: colors.white, fontWeight: '700' }}>
        {open ? 'Abierto' : 'Cerrado'}
      </Text>
    </TouchableOpacity>
  );
};

export default SpoonStatusChip;
