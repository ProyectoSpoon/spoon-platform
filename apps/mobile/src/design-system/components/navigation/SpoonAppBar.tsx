// src/design-system/components/navigation/SpoonAppBar.tsx

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing, useShadows } from '../../context/ThemeContext';
import { SpoonButton } from '../buttons/SpoonButton';

/**
 * Tipos de AppBar disponibles en el design system
 */
export enum SpoonAppBarType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary', 
  TRANSPARENT = 'transparent',
  GRADIENT = 'gradient',
}

/**
 * Props para el componente SpoonAppBar
 */
export interface SpoonAppBarProps {
  title?: string;
  titleWidget?: React.ReactNode;
  type?: SpoonAppBarType;
  actions?: React.ReactNode[];
  leading?: React.ReactNode;
  automaticallyImplyLeading?: boolean;
  centerTitle?: boolean;
  elevation?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  bottom?: React.ReactNode;
  toolbarHeight?: number;
  style?: ViewStyle;
  testID?: string;
}

/**
 * AppBar personalizado del design system Spoon
 * 
 * Proporciona una interfaz consistente para la navegación superior
 * con diferentes tipos, acciones y configuraciones.
 * 
 * @example
 * ```tsx
 * // AppBar básico
 * <SpoonAppBar title="Inicio" />
 * 
 * // AppBar primario con acciones
 * <SpoonAppBar.primary
 *   title="Configuración"
 *   showBackButton
 *   onBackPress={() => navigation.goBack()}
 *   actions={[
 *     <SpoonButton.text key="save" text="Guardar" onPress={() => {}} />
 *   ]}
 * />
 * 
 * // AppBar transparente
 * <SpoonAppBar.transparent
 *   titleWidget={<Image source={logo} />}
 *   actions={[
 *     <SpoonButton.text key="search" icon="🔍" onPress={() => {}} />
 *   ]}
 * />
 * 
 * // AppBar con gradiente
 * <SpoonAppBar.gradient
 *   title="Spoon"
 *   centerTitle
 *   actions={[
 *     <SpoonButton.text key="profile" icon="👤" onPress={() => {}} />
 *   ]}
 * />
 * ```
 */
export const SpoonAppBar: React.FC<SpoonAppBarProps> & {
  primary: React.FC<Omit<SpoonAppBarProps, 'type'>>;
  secondary: React.FC<Omit<SpoonAppBarProps, 'type'>>;
  transparent: React.FC<Omit<SpoonAppBarProps, 'type'>>;
  gradient: React.FC<Omit<SpoonAppBarProps, 'type'>>;
} = ({
  title,
  titleWidget,
  type = SpoonAppBarType.PRIMARY,
  actions,
  leading,
  automaticallyImplyLeading = true,
  centerTitle = false,
  elevation,
  backgroundColor,
  foregroundColor,
  showBackButton = false,
  onBackPress,
  bottom,
  toolbarHeight = 56,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();

  // Obtener estilos según el tipo
  const getAppBarStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: toolbarHeight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      zIndex: 1000,
    };

    switch (type) {
      case SpoonAppBarType.PRIMARY:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || colors.primary,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        };
      
      case SpoonAppBarType.SECONDARY:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.outline,
        };
      
      case SpoonAppBarType.TRANSPARENT:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || 'transparent',
        };
      
      case SpoonAppBarType.GRADIENT:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      
      default:
        return baseStyle;
    }
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...typography.titleLarge,
      flex: centerTitle ? 0 : 1,
      textAlign: centerTitle ? 'center' : 'left',
      marginLeft: centerTitle ? 0 : spacing.sm,
    };

    switch (type) {
      case SpoonAppBarType.PRIMARY:
        return {
          ...baseStyle,
          color: foregroundColor || colors.white,
        };
      
      case SpoonAppBarType.SECONDARY:
      case SpoonAppBarType.TRANSPARENT:
        return {
          ...baseStyle,
          color: foregroundColor || colors.textPrimary,
        };
      
      case SpoonAppBarType.GRADIENT:
        return {
          ...baseStyle,
          color: foregroundColor || colors.white,
        };
      
      default:
        return baseStyle;
    }
  };

  const renderLeading = () => {
    if (leading) {
      return leading;
    }

    if (showBackButton && automaticallyImplyLeading) {
      const iconColor = type === SpoonAppBarType.PRIMARY || type === SpoonAppBarType.GRADIENT 
        ? colors.white 
        : colors.textPrimary;

      return (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.iconButton}
          testID={`${testID}-back-button`}
        >
          <Text style={[styles.backIcon, { color: iconColor }]}>
            ←
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderTitle = () => {
    if (titleWidget) {
      return (
        <View style={centerTitle ? styles.centeredTitle : styles.title}>
          {titleWidget}
        </View>
      );
    }

    if (title) {
      return (
        <Text 
          style={getTitleStyle()}
          numberOfLines={1}
          testID={`${testID}-title`}
        >
          {title}
        </Text>
      );
    }

    return null;
  };

  const renderActions = () => {
    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <View key={index} style={styles.actionItem}>
            {action}
          </View>
        ))}
      </View>
    );
  };

  const renderGradient = () => {
    if (type !== SpoonAppBarType.GRADIENT) {
      return null;
    }

    return (
      <View style={[StyleSheet.absoluteFillObject, styles.gradient]} />
    );
  };

  const renderContent = () => (
    <View style={[getAppBarStyle(), style]} testID={testID}>
      {renderGradient()}
      
      <View style={styles.toolbar}>
        {renderLeading()}
        {renderTitle()}
        {centerTitle && <View style={{ flex: 1 }} />}
        {renderActions()}
      </View>
      
      {bottom && (
        <View style={styles.bottom}>
          {bottom}
        </View>
      )}
    </View>
  );

  // Para AppBars con gradiente, envolver en un contenedor especial
  if (type === SpoonAppBarType.GRADIENT) {
    return (
      <View style={[getAppBarStyle(), style]} testID={testID}>
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundColor: colors.primary,
          borderRadius: 0,
        }]} />
        
        <View style={styles.toolbar}>
          {renderLeading()}
          {renderTitle()}
          {centerTitle && <View style={{ flex: 1 }} />}
          {renderActions()}
        </View>
        
        {bottom && (
          <View style={styles.bottom}>
            {bottom}
          </View>
        )}
      </View>
    );
  }

  return renderContent();
};

// Constructores estáticos (Flutter-style)
SpoonAppBar.primary = (props) => (
  <SpoonAppBar {...props} type={SpoonAppBarType.PRIMARY} />
);

SpoonAppBar.secondary = (props) => (
  <SpoonAppBar {...props} type={SpoonAppBarType.SECONDARY} />
);

SpoonAppBar.transparent = (props) => (
  <SpoonAppBar {...props} type={SpoonAppBarType.TRANSPARENT} />
);

SpoonAppBar.gradient = (props) => (
  <SpoonAppBar {...props} type={SpoonAppBarType.GRADIENT} />
);

const styles = StyleSheet.create({
  gradientContainer: {
    position: 'relative',
  },
  gradient: {
    borderRadius: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    flex: 1,
  },
  centeredTitle: {
    flex: 1,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItem: {
    marginLeft: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default SpoonAppBar;
