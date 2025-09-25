import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useColors, useSpacing, useRadii, useTypography, useShadows } from '../../context/ThemeContext';
import { applyAlpha } from '../../utils/overlays';

export type SpoonNoticeVariant = 'info' | 'warning' | 'success' | 'error' | 'neutral';

export interface SpoonNoticeCardProps {
  title?: string;
  message: string | React.ReactNode;
  variant?: SpoonNoticeVariant;
  icon?: string; // emoji simple por ahora
  style?: ViewStyle;
  testID?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}

const variantMapping = (colors: any) => ({
  info: { bg: applyAlpha(colors.info, 0.08), border: colors.info, fg: colors.info },
  warning: { bg: applyAlpha(colors.warning, 0.1), border: colors.warning, fg: colors.warning },
  success: { bg: applyAlpha(colors.success, 0.1), border: colors.success, fg: colors.success },
  error: { bg: applyAlpha(colors.error, 0.1), border: colors.error, fg: colors.error },
  neutral: { bg: colors.surfaceVariant, border: colors.border, fg: colors.textSecondary },
});

export const SpoonNoticeCard: React.FC<SpoonNoticeCardProps> = ({
  title,
  message,
  variant = 'info',
  icon,
  style,
  testID = 'spoon-notice-card',
  actions,
  compact = false,
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const typo = useTypography();
  const shadows = useShadows();

  const v = variantMapping(colors)[variant];

  return (
    <View
      testID={testID}
      style={{
        backgroundColor: v.bg,
        borderLeftWidth: 4,
        borderLeftColor: v.border,
        padding: compact ? spacing.sm : spacing.md,
        borderRadius: radii.md,
        ...shadows.none,
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...(style as object),
      }}
    >
      {icon && <Text style={{ fontSize: 20, marginRight: spacing.sm }}>{icon}</Text>}
      <View style={{ flex:1 }}>
        {title && (
          <Text style={{ ...typo.labelMedium, color: v.fg, marginBottom: 4, fontWeight: '600' }}>{title}</Text>
        )}
        {typeof message === 'string' ? (
          <Text style={{ ...typo.bodySmall, color: v.fg }}>{message}</Text>
        ) : (
          message
        )}
        {actions && <View style={{ marginTop: spacing.sm }}>{actions}</View>}
      </View>
    </View>
  );
};

export default SpoonNoticeCard;
