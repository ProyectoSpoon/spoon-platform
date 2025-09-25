// src/design-system/components/chips/SpoonChip.tsx

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';

/**
 * Tipos de chips disponibles en el design system
 */
export enum SpoonChipType {
  FILTER = 'filter',
  CHOICE = 'choice',
  ACTION = 'action',
  INPUT = 'input',
  TAG = 'tag',
}

/**
 * Tamaños de chips disponibles
 */
export enum SpoonChipSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Props para el componente SpoonChip
 */
export interface SpoonChipProps {
  label: string;
  type?: SpoonChipType;
  size?: SpoonChipSize;
  isSelected?: boolean;
  isEnabled?: boolean;
  avatar?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  onPress?: () => void;
  onDelete?: () => void;
  backgroundColor?: string;
  selectedColor?: string;
  labelColor?: string;
  deleteIconColor?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Chip personalizado del design system Spoon
 * 
 * Proporciona consistencia visual y funcionalidad estándar para diferentes
 * tipos de chips en la aplicación.
 * 
 * @example
 * ```tsx
 * // Chip básico
 * <SpoonChip label="Pizza" onPress={() => {}} />
 * 
 * // Chip de filtro
 * <SpoonChip.filter
 *   label="Vegetariano"
 *   isSelected={isVegetarian}
 *   onPress={() => setIsVegetarian(!isVegetarian)}
 * />
 * 
 * // Chip de selección
 * <SpoonChip.choice
 *   label="Rápido"
 *   isSelected={selectedFilter === 'fast'}
 *   onPress={() => setSelectedFilter('fast')}
 * />
 * 
 * // Chip de acción
 * <SpoonChip.action
 *   label="Añadir filtro"
 *   avatar={<Text>+</Text>}
 *   onPress={() => addFilter()}
 * />
 * 
 * // Chip de entrada
 * <SpoonChip.input
 *   label="Italiana"
 *   onDelete={() => removeTag('italiana')}
 * />
 * 
 * // Chip de etiqueta
 * <SpoonChip.tag
 *   label="Popular"
 *   size={SpoonChipSize.SMALL}
 * />
 * ```
 */
export const SpoonChip: React.FC<SpoonChipProps> & {
  filter: React.FC<Omit<SpoonChipProps, 'type'>>;
  choice: React.FC<Omit<SpoonChipProps, 'type'>>;
  action: React.FC<Omit<SpoonChipProps, 'type'>>;
  input: React.FC<Omit<SpoonChipProps, 'type'>>;
  tag: React.FC<Omit<SpoonChipProps, 'type'>>;
} = ({
  label,
  type = SpoonChipType.FILTER,
  size = SpoonChipSize.MEDIUM,
  isSelected = false,
  isEnabled = true,
  avatar,
  deleteIcon,
  onPress,
  onDelete,
  backgroundColor,
  selectedColor,
  labelColor,
  deleteIconColor,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  // Obtener dimensiones según el tamaño
  const getDimensions = () => {
    switch (size) {
      case SpoonChipSize.SMALL:
        return {
          height: 24,
          paddingHorizontal: spacing.xs,
          fontSize: 12,
          iconSize: 12,
        };
      case SpoonChipSize.MEDIUM:
        return {
          height: 32,
          paddingHorizontal: spacing.sm,
          fontSize: 14,
          iconSize: 16,
        };
      case SpoonChipSize.LARGE:
        return {
          height: 40,
          paddingHorizontal: spacing.md,
          fontSize: 16,
          iconSize: 20,
        };
      default:
        return {
          height: 32,
          paddingHorizontal: spacing.sm,
          fontSize: 14,
          iconSize: 16,
        };
    }
  };

  const dimensions = getDimensions();

  // Obtener colores según el tipo y estado
  const getChipColors = () => {
    const baseColors = {
      background: backgroundColor || colors.surface,
      selected: selectedColor || colors.primary,
      label: labelColor || colors.textPrimary,
      deleteIcon: deleteIconColor || colors.textSecondary,
    };

    switch (type) {
      case SpoonChipType.FILTER:
        return {
          background: isSelected ? baseColors.selected : baseColors.background,
          border: isSelected ? baseColors.selected : colors.outline,
          label: isSelected ? colors.white : baseColors.label,
        };
      
      case SpoonChipType.CHOICE:
        return {
          background: isSelected ? baseColors.selected : colors.surfaceVariant,
          border: isSelected ? baseColors.selected : colors.outline,
          label: isSelected ? colors.white : baseColors.label,
        };
      
      case SpoonChipType.ACTION:
        return {
          background: baseColors.background,
          border: colors.outline,
          label: colors.primary,
        };
      
      case SpoonChipType.INPUT:
        return {
          background: colors.surfaceVariant,
          border: colors.outline,
          label: baseColors.label,
        };
      
      case SpoonChipType.TAG:
        return {
          background: colors.primary + '20', // 20% opacity
          border: colors.primary,
          label: colors.primary,
        };
      
      default:
        return {
          background: baseColors.background,
          border: colors.outline,
          label: baseColors.label,
        };
    }
  };

  const chipColors = getChipColors();

  const getChipStyle = (): ViewStyle => ({
    height: dimensions.height,
    paddingHorizontal: dimensions.paddingHorizontal,
    backgroundColor: chipColors.background,
    borderWidth: 1,
    borderColor: chipColors.border,
    borderRadius: dimensions.height / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isEnabled ? 1 : 0.5,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: dimensions.fontSize,
    fontWeight: '500',
    color: chipColors.label,
    marginHorizontal: spacing.xs,
  });

  const renderAvatar = () => {
    if (!avatar) return null;
    
    return (
      <View style={[styles.avatar, { width: dimensions.iconSize, height: dimensions.iconSize }]}>
        {avatar}
      </View>
    );
  };

  const renderDeleteIcon = () => {
    if (!onDelete && !deleteIcon) return null;
    
    return (
      <TouchableOpacity
        onPress={onDelete}
        style={[styles.deleteButton, { width: dimensions.iconSize, height: dimensions.iconSize }]}
        disabled={!isEnabled}
        testID={`${testID}-delete`}
      >
        {deleteIcon || (
          <Text style={[styles.deleteIcon, { 
            fontSize: dimensions.iconSize, 
            color: deleteIconColor || colors.textSecondary
          }]}>
            ×
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => (
    <>
      {renderAvatar()}
      <Text style={getLabelStyle()} numberOfLines={1}>
        {label}
      </Text>
      {renderDeleteIcon()}
    </>
  );

  // Si es solo un tag sin interacción
  if (type === SpoonChipType.TAG && !onPress && !onDelete) {
    return (
      <View style={[getChipStyle(), style]} testID={testID}>
        {renderContent()}
      </View>
    );
  }

  // Chip interactivo
  return (
    <TouchableOpacity
      style={[getChipStyle(), style]}
      onPress={onPress}
      disabled={!isEnabled || !onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Constructores estáticos (Flutter-style)
SpoonChip.filter = (props) => (
  <SpoonChip {...props} type={SpoonChipType.FILTER} />
);

SpoonChip.choice = (props) => (
  <SpoonChip {...props} type={SpoonChipType.CHOICE} />
);

SpoonChip.action = (props) => (
  <SpoonChip {...props} type={SpoonChipType.ACTION} />
);

SpoonChip.input = (props) => (
  <SpoonChip {...props} type={SpoonChipType.INPUT} />
);

SpoonChip.tag = (props) => (
  <SpoonChip {...props} type={SpoonChipType.TAG} size={SpoonChipSize.SMALL} />
);

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    overflow: 'hidden',
    marginRight: 4,
  },
  deleteButton: {
    marginLeft: 4,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SpoonChip;
