// src/design-system/components/modals/SpoonDialog.tsx

import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';
import { SpoonModal, SpoonModalAction, SpoonModalType, SpoonModalSize } from './SpoonModal';
import { SpoonButton } from '../buttons/SpoonButton';

/**
 * Tipos de Dialog disponibles
 */
export enum SpoonDialogType {
  ALERT = 'alert',
  CONFIRMATION = 'confirmation',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading',
  CUSTOM = 'custom',
}

/**
 * Props para el componente SpoonDialog
 */
export interface SpoonDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  content?: React.ReactNode;
  type?: SpoonDialogType;
  icon?: React.ReactNode;
  primaryAction?: SpoonModalAction;
  secondaryAction?: SpoonModalAction;
  actions?: SpoonModalAction[];
  barrierDismissible?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Dialog personalizado del design system Spoon
 * 
 * Proporciona consistencia visual y funcionalidad estándar para diferentes
 * tipos de diálogos en la aplicación.
 * 
 * @example
 * ```tsx
 * // Dialog de alerta
 * <SpoonDialog.alert
 *   visible={showAlert}
 *   title="Atención"
 *   message="Esta acción no se puede deshacer"
 *   onClose={() => setShowAlert(false)}
 *   primaryAction={{
 *     text: 'Entendido',
 *     onPress: () => setShowAlert(false)
 *   }}
 * />
 * 
 * // Dialog de confirmación
 * <SpoonDialog.confirmation
 *   visible={showConfirm}
 *   title="Confirmar eliminación"
 *   message="¿Estás seguro de que quieres eliminar este elemento?"
 *   onClose={() => setShowConfirm(false)}
 *   primaryAction={{
 *     text: 'Eliminar',
 *     onPress: handleDelete,
 *     type: 'danger'
 *   }}
 *   secondaryAction={{
 *     text: 'Cancelar',
 *     onPress: () => setShowConfirm(false)
 *   }}
 * />
 * 
 * // Dialog de éxito
 * <SpoonDialog.success
 *   visible={showSuccess}
 *   title="¡Éxito!"
 *   message="Tu pedido ha sido procesado correctamente"
 *   onClose={() => setShowSuccess(false)}
 * />
 * 
 * // Dialog de error
 * <SpoonDialog.error
 *   visible={showError}
 *   title="Error"
 *   message="No se pudo procesar tu solicitud. Inténtalo de nuevo."
 *   onClose={() => setShowError(false)}
 * />
 * 
 * // Dialog de carga
 * <SpoonDialog.loading
 *   visible={isLoading}
 *   title="Procesando..."
 *   message="Por favor espera mientras procesamos tu pedido"
 * />
 * ```
 */
export const SpoonDialog: React.FC<SpoonDialogProps> & {
  alert: React.FC<Omit<SpoonDialogProps, 'type'>>;
  confirmation: React.FC<Omit<SpoonDialogProps, 'type'>>;
  success: React.FC<Omit<SpoonDialogProps, 'type'>>;
  error: React.FC<Omit<SpoonDialogProps, 'type'>>;
  warning: React.FC<Omit<SpoonDialogProps, 'type'>>;
  info: React.FC<Omit<SpoonDialogProps, 'type'>>;
  loading: React.FC<Omit<SpoonDialogProps, 'type' | 'barrierDismissible'>>;
} = ({
  visible,
  onClose,
  title,
  message,
  content,
  type = SpoonDialogType.ALERT,
  icon,
  primaryAction,
  secondaryAction,
  actions,
  barrierDismissible = true,
  style,
  testID,
}) => {
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  // Obtener icono según el tipo
  const getDialogIcon = () => {
    if (icon) return icon;

    const iconStyle = {
      fontSize: 48,
      textAlign: 'center' as const,
      marginBottom: spacing.md,
    };

    switch (type) {
      case SpoonDialogType.SUCCESS:
        return <Text style={[iconStyle, { color: colors.success }]}>✓</Text>;
      case SpoonDialogType.ERROR:
        return <Text style={[iconStyle, { color: colors.error }]}>✕</Text>;
      case SpoonDialogType.WARNING:
        return <Text style={[iconStyle, { color: colors.warning }]}>⚠</Text>;
      case SpoonDialogType.INFO:
        return <Text style={[iconStyle, { color: colors.info }]}>ℹ</Text>;
      case SpoonDialogType.LOADING:
        return (
          <View style={[iconStyle, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      default:
        return null;
    }
  };

  // Obtener acciones por defecto según el tipo
  const getDefaultActions = (): SpoonModalAction[] => {
    if (actions) return actions;

    const defaultPrimary = primaryAction || {
      text: 'Aceptar',
      onPress: onClose,
    };

    const defaultSecondary = secondaryAction;

    switch (type) {
      case SpoonDialogType.CONFIRMATION:
        return [
          defaultSecondary || {
            text: 'Cancelar',
            onPress: onClose,
            type: 'secondary',
          },
          {
            ...defaultPrimary,
            text: defaultPrimary.text || 'Confirmar',
          },
        ];
      
      case SpoonDialogType.ERROR:
        return [
          {
            ...defaultPrimary,
            text: defaultPrimary.text || 'Reintentar',
            type: 'primary',
          },
        ];
      
      case SpoonDialogType.SUCCESS:
        return [
          {
            ...defaultPrimary,
            text: defaultPrimary.text || 'Continuar',
            type: 'primary',
          },
        ];
      
      case SpoonDialogType.LOADING:
        return []; // Sin acciones para loading
      
      default:
        return [defaultPrimary];
    }
  };

  const renderContent = () => {
    if (content) {
      return content;
    }

    return (
      <View style={styles.defaultContent}>
        {getDialogIcon()}
        
        {title && (
          <Text style={[styles.title, {
            ...typography.titleLarge,
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }]}>
            {title}
          </Text>
        )}
        
        {message && (
          <Text style={[styles.message, {
            ...typography.bodyMedium,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
          }]}>
            {message}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SpoonModal
      visible={visible}
      onClose={onClose}
      type={SpoonModalType.DIALOG}
      size={SpoonModalSize.SMALL}
      closeOnBackdrop={barrierDismissible}
      showCloseButton={false}
      actions={getDefaultActions()}
      style={style}
      testID={testID}
    >
      {renderContent()}
    </SpoonModal>
  );
};

// Constructores estáticos (Flutter-style)
SpoonDialog.alert = (props) => (
  <SpoonDialog {...props} type={SpoonDialogType.ALERT} />
);

SpoonDialog.confirmation = (props) => (
  <SpoonDialog {...props} type={SpoonDialogType.CONFIRMATION} />
);

SpoonDialog.success = (props) => (
  <SpoonDialog 
    {...props} 
    type={SpoonDialogType.SUCCESS}
    primaryAction={{
      text: 'Continuar',
      onPress: props.onClose,
      ...props.primaryAction,
    }}
  />
);

SpoonDialog.error = (props) => (
  <SpoonDialog 
    {...props} 
    type={SpoonDialogType.ERROR}
    primaryAction={{
      text: 'Reintentar',
      onPress: props.onClose,
      ...props.primaryAction,
    }}
  />
);

SpoonDialog.warning = (props) => (
  <SpoonDialog 
    {...props} 
    type={SpoonDialogType.WARNING}
    primaryAction={{
      text: 'Entendido',
      onPress: props.onClose,
      ...props.primaryAction,
    }}
  />
);

SpoonDialog.info = (props) => (
  <SpoonDialog 
    {...props} 
    type={SpoonDialogType.INFO}
    primaryAction={{
      text: 'OK',
      onPress: props.onClose,
      ...props.primaryAction,
    }}
  />
);

SpoonDialog.loading = (props) => (
  <SpoonDialog 
    {...props} 
    type={SpoonDialogType.LOADING} 
    barrierDismissible={false}
  />
);

const styles = StyleSheet.create({
  defaultContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontWeight: '600',
  },
  message: {
    paddingHorizontal: 8,
  },
});

export default SpoonDialog;
