import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii, useShadows } from '../../context/ThemeContext';

export interface SpoonSearchResultItemProps {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  rating?: number;
  distance?: string;
  price?: string;
  icon?: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonSearchResultItem: React.FC<SpoonSearchResultItemProps> = ({
  title,
  subtitle,
  type,
  rating,
  distance,
  price,
  icon='🍽️',
  onPress,
  testID='search-result-item'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();
  const shadows = useShadows();

  const container = {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  };

  const headerRow = { flexDirection: 'row' as const };
  const emojiBox = {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.sm,
  };
  const info = { flex: 1 };
  const titleStyle = { ...typography.titleSmall, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 };
  const subtitleStyle = { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 4 };
  const metaRow = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, alignItems: 'center' as const };
  const metaText = { ...typography.labelSmall, color: colors.textSecondary, marginRight: spacing.sm };
  const priceStyle = { ...typography.labelSmall, color: colors.primary, fontWeight: '600' };
  const typeChip = {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
  };
  const typeText = { ...typography.labelSmall, color: colors.white, fontWeight: '600' };

  return (
    <TouchableOpacity style={container} onPress={onPress} activeOpacity={0.75} testID={testID}>
      <View style={headerRow}>
        <View style={emojiBox}><Text style={{ fontSize: 28 }}>{icon}</Text></View>
        <View style={info}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={typeChip}><Text style={typeText}>{type.toUpperCase()}</Text></View>
            {!!rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: spacing.xs }}>
                <Text style={{ fontSize: 14 }}>⭐</Text>
                <Text style={{ ...typography.labelSmall, color: colors.textPrimary, fontWeight: '600', marginLeft: 2 }}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={titleStyle} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={subtitleStyle} numberOfLines={2}>{subtitle}</Text>}
          <View style={metaRow}>
            {!!distance && <Text style={metaText}>📍 {distance}</Text>}
            {!!price && <Text style={priceStyle}>{price}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SpoonSearchResultItem;
