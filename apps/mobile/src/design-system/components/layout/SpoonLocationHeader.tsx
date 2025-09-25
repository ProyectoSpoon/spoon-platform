import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColors, useSpacing, useRadii, useShadows, useTypography } from '../../context/ThemeContext';

export interface SpoonLocationHeaderProps {
  locationLabel: string;
  locationValue: string;
  onLocationPress?: () => void;
  onRefresh?: () => void;
  onProfile?: () => void;
  testID?: string;
}

export const SpoonLocationHeader: React.FC<SpoonLocationHeaderProps> = ({
  locationLabel,
  locationValue,
  onLocationPress,
  onRefresh,
  onProfile,
  testID = 'location-header'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const shadows = useShadows();
  const typography = useTypography();

  const container = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  };

  const locationSection = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  };

  const iconBox = {
    padding: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  };

  const pillBtn = {
    padding: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    borderRadius: radii.md,
    marginLeft: spacing.xs,
  };

  return (
    <View style={container} testID={testID}>
      <TouchableOpacity style={locationSection} onPress={onLocationPress} activeOpacity={0.7}>
        <View style={iconBox}><Text style={{ fontSize: 18 }}>📍</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.labelSmall, color: colors.textSecondary }}>{locationLabel}</Text>
          <Text style={{ ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' }} numberOfLines={2}>{locationValue}</Text>
        </View>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginLeft: spacing.xs }}>⌄</Text>
      </TouchableOpacity>
      <TouchableOpacity style={pillBtn} onPress={onRefresh} testID={`${testID}-refresh`}><Text style={{ fontSize: 18 }}>🔄</Text></TouchableOpacity>
      <TouchableOpacity style={pillBtn} onPress={onProfile} testID={`${testID}-profile`}><Text style={{ fontSize: 22 }}>👤</Text></TouchableOpacity>
    </View>
  );
};

export default SpoonLocationHeader;
