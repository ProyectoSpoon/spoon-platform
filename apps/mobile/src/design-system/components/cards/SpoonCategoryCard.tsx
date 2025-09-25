import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useColors, useSpacing, useRadii, useShadows, useTypography } from '../../context/ThemeContext';

export interface SpoonCategoryCardProps {
  label: string;
  icon?: string;              // emoji fallback
  imageSource?: ImageSourcePropType; // optional image
  onPress?: () => void;
  testID?: string;
}

export const SpoonCategoryCard: React.FC<SpoonCategoryCardProps> = ({
  label,
  icon,
  imageSource,
  onPress,
  testID = 'category-card'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const shadows = useShadows();
  const typography = useTypography();

  const wrapper = {
    alignItems: 'center' as const,
    marginRight: spacing.md,
    width: 70,
  };

  const circle = {
    width: 60,
    height: 60,
    backgroundColor: colors.surface,
    borderRadius: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.xs,
  overflow: 'hidden' as const,
    ...shadows.sm,
  };

  return (
    <TouchableOpacity style={wrapper} onPress={onPress} activeOpacity={0.7} testID={testID}>
      <View style={circle}>
        {imageSource ? (
          <Image source={imageSource} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        ) : (
          <Text style={{ fontSize: 30 }}>{icon}</Text>
        )}
      </View>
      <Text style={{ ...typography.labelSmall, color: colors.textPrimary, fontWeight: '500', textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default SpoonCategoryCard;
