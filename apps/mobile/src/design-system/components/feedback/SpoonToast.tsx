import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing, useShadows } from '../../context/ThemeContext';
import { applyAlpha } from '../../utils/overlays';

/**
 * Tipos de toast disponibles
 */
export enum SpoonToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEFAULT = 'default',
}

/**
 * Posiciones del toast
 */
export enum SpoonToastPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  CENTER = 'center',
}

/**
 * Props para el componente SpoonToast
 */
export interface SpoonToastProps {
  visible: boolean;
  message: string;
  description?: string;
  type?: SpoonToastType;
  position?: SpoonToastPosition;
  duration?: number;
  onHide?: () => void;
  action?: {
    text: string;
    onPress: () => void;
  };
  showCloseButton?: boolean;
  icon?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Datos para mostrar un toast
 */
export interface SpoonToastData {
  id: string;
  message: string;
  description?: string;
  type?: SpoonToastType;
  duration?: number;
  action?: {
    text: string;
    onPress: () => void;
  };
}

/**
 * Toast personalizado del design system Spoon
 * 
 * @example
 * ```tsx
 * // Toast bÃ¡sico
 * <SpoonToast
 *   visible={showToast}
 *   message="OperaciÃ³n exitosa"
 *   type={SpoonToastType.SUCCESS}
 *   onHide={() => setShowToast(false)}
 * />
 * 
 * // Toast con acciÃ³n
 * <SpoonToast.success
 *   visible={showToast}
 *   message="Archivo eliminado"
 *   action={{ text: 'Deshacer', onPress: handleUndo }}
 * />
 * ```
 */
export const SpoonToast: React.FC<SpoonToastProps> & {
  success: React.FC<Omit<SpoonToastProps, 'type'>>;
  error: React.FC<Omit<SpoonToastProps, 'type'>>;
  warning: React.FC<Omit<SpoonToastProps, 'type'>>;
  info: React.FC<Omit<SpoonToastProps, 'type'>>;
  show: (data: SpoonToastData) => void;
  hide: (id?: string) => void;
  hideAll: () => void;
} = ({
  visible,
  message,
  description,
  type = SpoonToastType.DEFAULT,
  position = SpoonToastPosition.BOTTOM,
  duration = 4000,
  onHide,
  action,
  showCloseButton = false,
  icon,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();

  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto hide
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  // Estilos
  const containerStyle: ViewStyle = {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    ...getPositionStyle(),
  };

  const toastStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
    ...shadows.md,
    ...style,
  };

  const iconContainerStyle: ViewStyle = {
    marginRight: spacing.sm,
    marginTop: 2,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
  };

  const messageStyle: TextStyle = {
    ...typography.bodyMedium,
    color: getTextColor(),
    fontWeight: '600',
    marginBottom: description ? spacing.xs : 0,
  };

  const descriptionStyle: TextStyle = {
    ...typography.bodySmall,
    color: getTextColor(),
    opacity: 0.8,
    lineHeight: 18,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  };

  const actionButtonStyle: ViewStyle = {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  backgroundColor: applyAlpha(colors.white, 0.2),
    marginRight: spacing.xs,
  };

  const actionTextStyle: TextStyle = {
    ...typography.labelSmall,
    color: getTextColor(),
    fontWeight: '600',
  };

  const closeButtonStyle: ViewStyle = {
    padding: spacing.xs,
    borderRadius: 4,
  };

  const closeIconStyle: TextStyle = {
    color: getTextColor(),
    fontSize: 16,
    opacity: 0.7,
  };

  function getPositionStyle(): ViewStyle {
    const screenHeight = Dimensions.get('window').height;
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: getTranslateRange(),
    });

    switch (position) {
      case SpoonToastPosition.TOP:
        return {
          top: spacing.xl,
          transform: [{ translateY }],
        };
      case SpoonToastPosition.CENTER:
        return {
          top: screenHeight / 2 - 40,
          transform: [{ translateY }],
        };
      default: // BOTTOM
        return {
          bottom: spacing.xl,
          transform: [{ translateY }],
        };
    }
  }

  function getTranslateRange(): [number, number] {
    switch (position) {
      case SpoonToastPosition.TOP:
        return [-100, 0];
      case SpoonToastPosition.CENTER:
        return [0, 0]; // No translation for center
      default: // BOTTOM
        return [100, 0];
    }
  }

  function getBackgroundColor(): string {
    switch (type) {
      case SpoonToastType.SUCCESS:
        return colors.success;
      case SpoonToastType.ERROR:
        return colors.error;
      case SpoonToastType.WARNING:
        return colors.warning;
      case SpoonToastType.INFO:
        return colors.info;
      default:
        return colors.surface;
    }
  }

  function getTextColor(): string {
    switch (type) {
      case SpoonToastType.SUCCESS:
      case SpoonToastType.ERROR:
      case SpoonToastType.WARNING:
      case SpoonToastType.INFO:
        return colors.white;
      default:
        return colors.textPrimary;
    }
  }

  function getDefaultIcon(): string {
    switch (type) {
      case SpoonToastType.SUCCESS:
        return 'âœ…';
      case SpoonToastType.ERROR:
        return 'âŒ';
      case SpoonToastType.WARNING:
        return 'âš ï¸';
      case SpoonToastType.INFO:
        return 'â„¹ï¸';
      default:
        return 'ðŸ“¢';
    }
  }

  const renderIcon = () => {
    const iconText = icon || getDefaultIcon();
    
    return (
      <View style={iconContainerStyle}>
        <Text style={{ fontSize: 20 }}>
          {iconText}
        </Text>
      </View>
    );
  };

  const renderActions = () => {
    if (!action && !showCloseButton) return null;

    return (
      <View style={actionsStyle}>
        {action && (
          <TouchableOpacity
            style={actionButtonStyle}
            onPress={action.onPress}
            testID={`${testID}-action`}
          >
            <Text style={actionTextStyle}>
              {action.text}
            </Text>
          </TouchableOpacity>
        )}

        {showCloseButton && (
          <TouchableOpacity
            style={closeButtonStyle}
            onPress={hideToast}
            testID={`${testID}-close`}
          >
            <Text style={closeIconStyle}>âœ•</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={containerStyle} testID={testID}>
      <View style={toastStyle}>
        {renderIcon()}
        
        <View style={contentStyle}>
          <Text style={messageStyle} testID={`${testID}-message`}>
            {message}
          </Text>
          
          {description && (
            <Text style={descriptionStyle} testID={`${testID}-description`}>
              {description}
            </Text>
          )}
        </View>

        {renderActions()}
      </View>
    </Animated.View>
  );
};

// Sistema de gestiÃ³n global de toasts
class ToastManager {
  private toasts: Map<string, SpoonToastData> = new Map();
  private listeners: Set<(toasts: SpoonToastData[]) => void> = new Set();

  show(data: SpoonToastData) {
    this.toasts.set(data.id, data);
    this.notifyListeners();
    
    // Auto remove after duration
    if (data.duration !== 0) {
      setTimeout(() => {
        this.hide(data.id);
      }, data.duration || 4000);
    }
  }

  hide(id?: string) {
    if (id) {
      this.toasts.delete(id);
    } else {
      // Hide the most recent toast
      const lastToast = Array.from(this.toasts.keys()).pop();
      if (lastToast) {
        this.toasts.delete(lastToast);
      }
    }
    this.notifyListeners();
  }

  hideAll() {
    this.toasts.clear();
    this.notifyListeners();
  }

  subscribe(listener: (toasts: SpoonToastData[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const toastsArray = Array.from(this.toasts.values());
    this.listeners.forEach(listener => listener(toastsArray));
  }
}

const toastManager = new ToastManager();

// Constructores estÃ¡ticos (Flutter-style)
SpoonToast.success = (props) => (
  <SpoonToast {...props} type={SpoonToastType.SUCCESS} />
);

SpoonToast.error = (props) => (
  <SpoonToast {...props} type={SpoonToastType.ERROR} />
);

SpoonToast.warning = (props) => (
  <SpoonToast {...props} type={SpoonToastType.WARNING} />
);

SpoonToast.info = (props) => (
  <SpoonToast {...props} type={SpoonToastType.INFO} />
);

// MÃ©todos estÃ¡ticos para gestiÃ³n global
SpoonToast.show = (data: SpoonToastData) => {
  toastManager.show({
    id: Date.now().toString(),
    ...data,
  });
};

SpoonToast.hide = (id?: string) => {
  toastManager.hide(id);
};

SpoonToast.hideAll = () => {
  toastManager.hideAll();
};

export { toastManager };
export default SpoonToast;

