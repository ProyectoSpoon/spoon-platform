import React, { useEffect, useRef } from 'react';
import { Animated, View, Modal, TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing, useShadows } from '../../context/ThemeContext';
import { getOverlay, applyAlpha } from '../../utils/overlays';
import { SpoonButton } from '../buttons/SpoonButton';
import { SpoonCard } from '../cards/SpoonCard';

/**
 * Tipos de modales disponibles en el design system
 */
export enum SpoonModalType {
  DIALOG = 'dialog',
  BOTTOM_SHEET = 'bottom-sheet',
  FULLSCREEN = 'fullscreen',
  CENTER = 'center',
}

/**
 * Tamaños de modales
 */
export enum SpoonModalSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  AUTO = 'auto',
}

/**
 * Props para el componente SpoonModal
 */
export interface SpoonModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: SpoonModalType;
  size?: SpoonModalSize;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

/**
 * Props para acciones del modal
 */
export interface SpoonModalAction {
  text: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'text';
  loading?: boolean;
}

/**
 * Props extendidas para modales con acciones
 */
export interface SpoonModalWithActionsProps extends SpoonModalProps {
  primaryAction?: SpoonModalAction;
  secondaryAction?: SpoonModalAction;
  actions?: SpoonModalAction[];
}

/**
 * Modal personalizado del design system Spoon
 * 
 * @example
 * ```tsx
 * // Modal básico
 * <SpoonModal visible={isVisible} onClose={() => setVisible(false)}>
 *   <Text>Contenido del modal</Text>
 * </SpoonModal>
 * 
 * // Modal de diálogo
 * <SpoonModal.dialog
 *   visible={isVisible}
 *   title="Confirmar acción"
 *   subtitle="¿Estás seguro de continuar?"
 *   primaryAction={{ text: 'Confirmar', onPress: handleConfirm }}
 *   secondaryAction={{ text: 'Cancelar', onPress: handleCancel }}
 * />
 * 
 * // Bottom Sheet
 * <SpoonModal.bottomSheet
 *   visible={isVisible}
 *   title="Opciones"
 *   onClose={handleClose}
 * >
 *   <SpoonButton.text text="Opción 1" onPress={() => {}} />
 *   <SpoonButton.text text="Opción 2" onPress={() => {}} />
 * </SpoonModal.bottomSheet>
 * ```
 */
export const SpoonModal: React.FC<SpoonModalWithActionsProps> & {
  dialog: React.FC<SpoonModalWithActionsProps>;
  bottomSheet: React.FC<SpoonModalProps>;
  fullscreen: React.FC<SpoonModalProps>;
  center: React.FC<SpoonModalWithActionsProps>;
} = ({
  visible,
  onClose,
  children,
  type = SpoonModalType.CENTER,
  size = SpoonModalSize.MEDIUM,
  title,
  subtitle,
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'fade',
  backdropOpacity = 0.5,
  style,
  contentStyle,
  primaryAction,
  secondaryAction,
  actions,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animatedValue]);

  if (!visible) return null;

  // Estilos base
  const backdropStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: backdropOpacity === 0.5 ? getOverlay('strong', colors) : applyAlpha(colors.black, backdropOpacity),
    justifyContent: getJustifyContent(),
    alignItems: getAlignItems(),
    padding: type === SpoonModalType.FULLSCREEN ? 0 : spacing.md,
  };

  const containerStyle: ViewStyle = {
    ...getContainerStyle(),
    ...style,
  };

  const contentContainerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    ...getContentStyle(),
    ...contentStyle,
  };

  const headerStyle: ViewStyle = {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  };

  const titleStyle: TextStyle = {
    ...typography.titleLarge,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: subtitle ? spacing.xs : 0,
  };

  const subtitleStyle: TextStyle = {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  };

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  };

  const actionsStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  };

  const closeButtonStyle: ViewStyle = {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  };

  function getJustifyContent(): 'flex-start' | 'center' | 'flex-end' {
    switch (type) {
      case SpoonModalType.BOTTOM_SHEET:
        return 'flex-end';
      case SpoonModalType.FULLSCREEN:
        return 'flex-start';
      default:
        return 'center';
    }
  }

  function getAlignItems(): 'stretch' | 'center' {
    return type === SpoonModalType.FULLSCREEN ? 'stretch' : 'center';
  }

  function getContainerStyle(): ViewStyle {
    const baseStyle: ViewStyle = {};

    switch (type) {
      case SpoonModalType.BOTTOM_SHEET:
        return {
          ...baseStyle,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        };

      case SpoonModalType.FULLSCREEN:
        return {
          ...baseStyle,
          flex: 1,
          opacity: animatedValue,
        };

      default:
        return {
          ...baseStyle,
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
    }
  }

  function getContentStyle(): ViewStyle {
    const baseStyle: ViewStyle = {
      borderRadius: type === SpoonModalType.FULLSCREEN ? 0 : 16,
      ...shadows.lg,
    };

    if (type === SpoonModalType.BOTTOM_SHEET) {
      return {
        ...baseStyle,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        maxHeight: '80%',
      };
    }

    if (type === SpoonModalType.FULLSCREEN) {
      return {
        ...baseStyle,
        flex: 1,
        borderRadius: 0,
      };
    }

    // Size styles for center and dialog
    switch (size) {
      case SpoonModalSize.SMALL:
        return { ...baseStyle, width: '80%', maxWidth: 300 };
      case SpoonModalSize.MEDIUM:
        return { ...baseStyle, width: '90%', maxWidth: 400 };
      case SpoonModalSize.LARGE:
        return { ...baseStyle, width: '95%', maxWidth: 500 };
      default:
        return baseStyle;
    }
  }

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const renderActions = () => {
    const allActions: SpoonModalAction[] = [];
    
    if (secondaryAction) allActions.push(secondaryAction);
    if (primaryAction) allActions.push(primaryAction);
    if (actions) allActions.push(...actions);

    if (allActions.length === 0) return null;

    return (
      <View style={actionsStyle}>
        {allActions.map((action, index) => {
          const ButtonComponent = action.type === 'primary' ? SpoonButton.primary :
                                 action.type === 'secondary' ? SpoonButton.secondary :
                                 action.type === 'danger' ? SpoonButton.danger :
                                 SpoonButton.outlined;

          return (
            <ButtonComponent
              key={index}
              text={action.text}
              onPress={action.onPress}
              isLoading={action.loading}
              fullWidth
              testID={`${testID}-action-${index}`}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={backdropStyle}>
          <TouchableWithoutFeedback>
            <Animated.View style={containerStyle}>
              <View style={contentContainerStyle}>
                {/* Botón de cerrar */}
                {showCloseButton && type !== SpoonModalType.FULLSCREEN && (
                  <TouchableOpacity
                    style={closeButtonStyle}
                    onPress={onClose}
                    testID={`${testID}-close`}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                )}

                {/* Header */}
                {(title || subtitle) && (
                  <View style={headerStyle}>
                    {title && (
                      <Text style={titleStyle} testID={`${testID}-title`}>
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text style={subtitleStyle} testID={`${testID}-subtitle`}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                )}

                {/* Body */}
                <View style={bodyStyle}>
                  {children}
                </View>

                {/* Actions */}
                {renderActions()}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Constructores estáticos (Flutter-style)
SpoonModal.dialog = (props) => (
  <SpoonModal
    {...props}
    type={SpoonModalType.DIALOG}
    size={SpoonModalSize.SMALL}
    animationType="fade"
  />
);

SpoonModal.bottomSheet = (props) => (
  <SpoonModal
    {...props}
    type={SpoonModalType.BOTTOM_SHEET}
    animationType="slide"
    showCloseButton={false}
  />
);

SpoonModal.fullscreen = (props) => (
  <SpoonModal
    {...props}
    type={SpoonModalType.FULLSCREEN}
    animationType="slide"
    showCloseButton={false}
    closeOnBackdrop={false}
  />
);

SpoonModal.center = (props) => (
  <SpoonModal
    {...props}
    type={SpoonModalType.CENTER}
    animationType="fade"
  />
);

export default SpoonModal;
