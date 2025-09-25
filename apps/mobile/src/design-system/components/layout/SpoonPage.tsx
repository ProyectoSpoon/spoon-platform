import React from 'react';
import { SafeAreaView, ScrollView, ViewStyle, View } from 'react-native';
import { useColors, useSpacing } from '../../context/ThemeContext';

export interface SpoonPageProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  contentStyle?: ViewStyle;
  testID?: string;
}

/**
 * Contenedor de página estándar con SafeArea + optional Scroll.
 */
export const SpoonPage: React.FC<SpoonPageProps> = ({
  children,
  scroll = true,
  padded = true,
  background,
  contentStyle,
  testID = 'spoon-page'
}) => {
  const colors = useColors();
  const spacing = useSpacing();

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: background || colors.background,
  };

  const innerStyle: ViewStyle = {
    flexGrow: 1,
    padding: padded ? spacing.md : 0,
    ...(contentStyle as object),
  };

  if (scroll) {
    return (
      <SafeAreaView style={baseStyle} testID={testID}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={innerStyle}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={baseStyle} testID={testID}>
      <View style={innerStyle}>{children}</View>
    </SafeAreaView>
  );
};

export default SpoonPage;
