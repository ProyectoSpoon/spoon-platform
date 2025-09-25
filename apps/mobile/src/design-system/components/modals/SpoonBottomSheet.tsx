import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Animated, StyleSheet, Modal, View, TouchableWithoutFeedback, Text, ScrollView } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';

/**
 * Props para el componente SpoonBottomSheet
 */
export interface SpoonBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  snapPoints?: string[];
  initialSnapPoint?: number;
  enablePanDownToClose?: boolean;
  enableBackdropDismiss?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  handleStyle?: ViewStyle;
  testID?: string;
}

/**
 * Bottom Sheet personalizado del design system Spoon
 * 
 * @example
 * ```tsx
 * <SpoonBottomSheet
 *   visible={isVisible}
 *   onClose={() => setVisible(false)}
 *   title="Opciones"
 *   snapPoints={['25%', '50%', '75%']}
 * >
 *   <SpoonButton.text text="Opción 1" onPress={() => {}} />
 *   <SpoonButton.text text="Opción 2" onPress={() => {}} />
 * </SpoonBottomSheet>
 * ```
 */
export const SpoonBottomSheet: React.FC<SpoonBottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  snapPoints = ['50%'],
  initialSnapPoint = 0,
  enablePanDownToClose = true,
  enableBackdropDismiss = true,
  backdropOpacity = 0.5,
  style,
  contentStyle,
  handleStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapPoint);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(panY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(panY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, animatedValue, panY, screenHeight]);

  const getSheetHeight = (snapPoint: string): number => {
    if (snapPoint.includes('%')) {
      return (screenHeight * parseInt(snapPoint)) / 100;
    }
    return parseInt(snapPoint);
  };

  const snapToPoint = (index: number) => {
    const snapPoint = snapPoints[index];
    const height = getSheetHeight(snapPoint);
    const translateY = screenHeight - height;

    Animated.spring(panY, {
      toValue: -translateY,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    setCurrentSnapIndex(index);
  };

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: false }
  );

  const handlePanEnd = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    if (enablePanDownToClose && (translationY > 100 || velocityY > 500)) {
      onClose();
      return;
    }

    // Find closest snap point
    let closestIndex = 0;
    let closestDistance = Infinity;

    snapPoints.forEach((snapPoint, index) => {
      const height = getSheetHeight(snapPoint);
      const targetY = screenHeight - height;
      const distance = Math.abs(translationY - targetY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    snapToPoint(closestIndex);
  };

  if (!visible) return null;

  const currentHeight = getSheetHeight(snapPoints[currentSnapIndex]);

  const backdropStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  };

  const backdropOverlayStyle = {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, backdropOpacity],
    }),
  };

  const sheetStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: currentHeight,
    maxHeight: screenHeight * 0.9,
    ...style,
  };

  const handleContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  };

  const handleBarStyle: ViewStyle = {
    width: 40,
    height: 4,
    backgroundColor: colors.outline,
    borderRadius: 2,
    ...handleStyle,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  };

  const titleStyle: TextStyle = {
    ...typography.titleMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: subtitle ? spacing.xs : 0,
  };

  const subtitleStyle: TextStyle = {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  };

  const contentContainerStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    ...contentStyle,
  };

  const handleBackdropPress = () => {
    if (enableBackdropDismiss) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={backdropStyle}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={backdropOverlayStyle} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            sheetStyle,
            {
              transform: [
                {
                  translateY: Animated.add(
                    animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [currentHeight, 0],
                    }),
                    panY
                  ),
                },
              ],
            },
          ]}
        >
          {/* Handle */}
          <View style={handleContainerStyle}>
            <View style={handleBarStyle} />
          </View>

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

          {/* Content */}
          <ScrollView
            style={contentContainerStyle}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SpoonBottomSheet;
