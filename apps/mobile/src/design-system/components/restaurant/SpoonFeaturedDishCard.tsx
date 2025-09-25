import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii } from '../../context/ThemeContext';

export interface SpoonFeaturedDishCardProps {
  name: string;
  price: string;
  icon: string;
  label?: string;
  testID?: string;
  imageSource?: ImageSourcePropType; // opcional para mostrar imagen en vez de icon
}

export const SpoonFeaturedDishCard: React.FC<SpoonFeaturedDishCardProps> = ({ name, price, icon, label='Plato destacado', testID='featured-dish-card', imageSource }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor: colors.primary + '33', marginBottom: spacing.lg }} testID={testID}>
      <View style={{ width:80, height:80, backgroundColor: colors.background, borderRadius: radii.sm, alignItems:'center', justifyContent:'center', marginRight: spacing.md, overflow:'hidden' }}>
        {imageSource ? (
          <Image source={imageSource} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 40 }}>{icon}</Text>
        )}
      </View>
      <View style={{ flex:1 }}>
        <Text style={{ ...typography.labelSmall, color: colors.primary, fontWeight:'700', marginBottom: 4 }}>{label}</Text>
        <Text style={{ ...typography.titleSmall, color: colors.textPrimary, fontWeight:'600', marginBottom: 4 }}>{name}</Text>
        <Text style={{ ...typography.labelMedium, color: colors.primary, fontWeight:'700' }}>{price}</Text>
      </View>
    </View>
  );
};

export default SpoonFeaturedDishCard;
