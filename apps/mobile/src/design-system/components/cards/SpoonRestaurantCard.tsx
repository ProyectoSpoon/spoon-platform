import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useShadows, useRadii } from '../../context/ThemeContext';

export interface SpoonRestaurantCardProps {
  name: string;
  distance?: string;
  rating?: string;
  status?: string; // "Abierto" etc
  onPress?: () => void;
  favorite?: boolean;
  onFavoritePress?: () => void;
  testID?: string;
}

export const SpoonRestaurantCard: React.FC<SpoonRestaurantCardProps> = ({
  name,
  distance,
  rating,
  status = 'Abierto',
  favorite = false,
  onFavoritePress,
  onPress,
  testID = 'restaurant-card'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const shadows = useShadows();
  const radii = useRadii();

  const baseStyle = {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginRight: spacing.md,
    width: 160,
    ...shadows.sm,
  } as const;

  return (
    <TouchableOpacity style={baseStyle} onPress={onPress} activeOpacity={0.75} testID={testID}>
      <View style={{
        height: 80,
        backgroundColor: colors.surfaceVariant,
        borderRadius: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        position: 'relative'
      }}>
        <Text style={{ fontSize: 32 }}>🏪</Text>
        {onFavoritePress && (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onFavoritePress(); }}
            style={{ position: 'absolute', top: 4, right: 4 }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{favorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{
        ...typography.titleSmall,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
      }} numberOfLines={1}>{name}</Text>
      {distance && (
        <Text style={{
          ...typography.labelSmall,
          color: colors.textSecondary,
          marginBottom: 2,
        }}>{distance} • {status}</Text>
      )}
      {rating && (
        <Text style={{
          ...typography.labelSmall,
          color: colors.warning,
          fontWeight: '600',
        }}>⭐ {rating}</Text>
      )}
    </TouchableOpacity>
  );
};

export default SpoonRestaurantCard;
