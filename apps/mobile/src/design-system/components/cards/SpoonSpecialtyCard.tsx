import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useColors, useSpacing, useTypography, useShadows, useRadii } from '../../context/ThemeContext';

export interface SpoonSpecialtyCardProps {
  name: string;
  price: string;
  icon?: string; // emoji surrogate
  onPress?: () => void;
  testID?: string;
  imageSource?: ImageSourcePropType;
}

export const SpoonSpecialtyCard: React.FC<SpoonSpecialtyCardProps> = ({
  name,
  price,
  icon = '🍲',
  onPress,
  testID = 'specialty-card',
  imageSource
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
    width: 140,
    ...shadows.sm,
  } as const;

  return (
    <TouchableOpacity style={baseStyle} onPress={onPress} activeOpacity={0.75} testID={testID}>
      <View style={{
        height: 70,
        backgroundColor: colors.surfaceVariant,
        borderRadius: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        overflow:'hidden'
      }}>
        {imageSource ? (
          <Image source={imageSource} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>{icon}</Text>
        )}
      </View>
      <Text style={{
        ...typography.titleSmall,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
      }} numberOfLines={1}>{name}</Text>
      <Text style={{
        ...typography.labelSmall,
        color: colors.primary,
        fontWeight: '600',
      }}>{price}</Text>
    </TouchableOpacity>
  );
};

export default SpoonSpecialtyCard;
