import React from 'react';
import { Image, View, Text } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing, useShadows } from '../../context/ThemeContext';
import { getOverlay } from '../../utils/overlays';
import { SpoonCard } from '../cards/SpoonCard';

export interface SpoonFoodCardProps {
  name: string;
  restaurant: string;
  price: string | number; // permitir número y formatear internamente
  rating: number;
  imageUrl: string;
  description?: string;
  showRatingBadge?: boolean;
  placeholderEmoji?: string;
  hideImage?: boolean;
  onPress?: () => void;
  onAddToCart?: () => void;
  isPopular?: boolean;
  tags?: string[];
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  testID?: string;
}

export const SpoonFoodCard: React.FC<SpoonFoodCardProps> = ({
  name,
  restaurant,
  price,
  rating,
  imageUrl,
  description,
  showRatingBadge = true,
  placeholderEmoji = '🍽️',
  hideImage = false,
  onPress,
  onAddToCart,
  isPopular = false,
  tags = [],
  width = '100%',
  height,
  style,
  testID = 'spoon-food-card'
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();

  // Normalizar price si viene número
  const priceStr = typeof price === 'number' ? `$${price.toLocaleString('es-CO')}` : price;

  const cardStyle: ViewStyle = { width, height, ...style };
  const imageContainerStyle: ViewStyle = hideImage ? { display:'none' } : {
    height: 90,
    width: '100%',
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
  };
  const imageStyle: ViewStyle = { width:'100%', height:'100%' };

  const descriptionStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.textPrimary, // contraste fuerte
    marginBottom: spacing.xs,
    lineHeight: 16,
  };

  const nameStyle: TextStyle = { ...typography.titleSmall, color: colors.textPrimary, fontWeight:'700', marginBottom:2 };
  const restaurantStyle: TextStyle = { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs };
  const priceStyle: TextStyle = { ...typography.titleSmall, color: colors.primary, fontWeight:'700' };

  const ratingBadgeStyle: ViewStyle = {
    position:'absolute', top: spacing.xs, right: spacing.xs,
    backgroundColor: getOverlay('extra', colors), borderRadius:6, paddingHorizontal:4, paddingVertical:2,
    flexDirection:'row', alignItems:'center'
  };
  const ratingTextStyle: TextStyle = { ...typography.labelSmall, color: colors.white, fontSize:10, fontWeight:'700' };
  const popularBadgeStyle: ViewStyle = {
    position:'absolute', top: spacing.xs, left: spacing.xs,
    backgroundColor: colors.warning, borderRadius:8, paddingHorizontal: spacing.xs, paddingVertical:2,
    flexDirection:'row', alignItems:'center'
  };
  const popularTextStyle: TextStyle = { ...typography.labelSmall, color: colors.white, fontSize:8, fontWeight:'700' };

  const contentStyle: ViewStyle = { flex:1, padding: spacing.xs };
  const tagsContainerStyle: ViewStyle = { flexDirection:'row', flexWrap:'wrap', marginBottom: spacing.xs };
  const tagStyle: ViewStyle = { backgroundColor: `${colors.primary}10`, borderRadius:4, paddingHorizontal:4, paddingVertical:1, marginRight:4, marginBottom:2 };
  const tagTextStyle: TextStyle = { fontSize:8, color: colors.primary, fontWeight:'500' };
  const footerStyle: ViewStyle = { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:'auto' };
  const placeholderStyle: ViewStyle = { ...imageStyle, backgroundColor: colors.surfaceVariant, alignItems:'center', justifyContent:'center' };
  const placeholderIconStyle: TextStyle = { fontSize:34, color: colors.textSecondary };

  const renderImage = () => {
    if (hideImage) return null;
    if (imageUrl && /^https?:/.test(imageUrl)) {
      return <Image source={{ uri: imageUrl }} style={imageStyle} />;
    }
    return (
      <View style={placeholderStyle}>
        <Text style={placeholderIconStyle}>{placeholderEmoji}</Text>
      </View>
    );
  };

  return (
    <SpoonCard.elevated style={cardStyle} onPress={onPress} padding={0} testID={testID}>
      <View style={imageContainerStyle}>
        {renderImage()}
        {isPopular && (
          <View style={popularBadgeStyle}>
            <Text style={[popularTextStyle,{ marginRight:2 }]}>🔥</Text>
            <Text style={popularTextStyle}>POPULAR</Text>
          </View>
        )}
        {showRatingBadge && rating>0 && (
          <View style={ratingBadgeStyle}>
            <Text style={[ratingTextStyle,{ marginRight:2 }]}>⭐</Text>
            <Text style={ratingTextStyle}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={contentStyle}>
        <Text style={nameStyle} numberOfLines={2}>{name}</Text>
        {!!restaurant && <Text style={restaurantStyle} numberOfLines={2}>{restaurant}</Text>}
        {!!description && (
          <View>
            {description.split(/\n+/).map((line, idx) => (
              <Text key={idx} style={descriptionStyle}>{line.trim() || '\u00A0'}</Text>
            ))}
          </View>
        )}
        {tags.length>0 && (
          <View style={tagsContainerStyle}>
            {tags.slice(0,2).map((t,i)=>(
              <View key={i} style={tagStyle}><Text style={tagTextStyle}>{t}</Text></View>
            ))}
          </View>
        )}
        <View style={footerStyle}>
          <Text style={priceStyle}>{priceStr}</Text>
          {/* Botón agregar deshabilitado */}
        </View>
      </View>
    </SpoonCard.elevated>
  );
};

export default SpoonFoodCard;