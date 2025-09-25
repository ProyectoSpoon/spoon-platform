import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useShadows } from '../src/design-system';

interface SimpleMenuCardProps {
  name: string;
  category: string;
  price: string;
  description: string;
  onPress?: () => void;
}

export const SimpleMenuCard: React.FC<SimpleMenuCardProps> = ({
  name,
  category,
  price,
  description,
  onPress,
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const shadows = useShadows();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.outline,
      }}
      activeOpacity={0.7}
    >
      {/* Header con nombre y precio */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
      }}>
        <Text style={{
          ...typography.titleMedium,
          color: colors.textPrimary,
          fontWeight: '700',
          flex: 1,
          marginRight: spacing.sm,
        }}>
          {name}
        </Text>
        <Text style={{
          ...typography.titleSmall,
          color: colors.primary,
          fontWeight: '700',
        }}>
          {price}
        </Text>
      </View>

      {/* Categoría */}
      <Text style={{
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
      }}>
        {category}
      </Text>

      {/* Descripción */}
      <View style={{ 
        backgroundColor: colors.surfaceVariant, 
        padding: spacing.sm, 
        borderRadius: 8,
        marginTop: spacing.xs 
      }}>
        {description.split('\n').map((line, index) => {
          const trimmedLine = line.trim();
          // Destacar líneas con solo "-" para mejor visibilidad
          const isDashLine = trimmedLine.endsWith(': -');
          
          return (
            <Text
              key={index}
              style={{
                ...typography.bodySmall,
                color: isDashLine ? colors.textSecondary : colors.textPrimary,
                lineHeight: 20,
                marginBottom: 4,
                fontWeight: isDashLine ? '400' : '500',
              }}
            >
              {trimmedLine || '\u00A0'}
            </Text>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

// Default export para permitir import SimpleMenuCard from './SimpleMenuCard'
export default SimpleMenuCard;