import React from 'react';
import { ScrollView, SafeAreaView, View, Text, Image } from 'react-native';
import { SpoonCard } from '../cards';
import { SpoonText } from '../data-display/SpoonText';
import { useSpacing, useTypography, useColors, useRadii, useShadows } from '../../context/ThemeContext';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}

/**
 * Layout reutilizable para pantallas de autenticación (Login / Register)
 * Centraliza logo, card y espacio de scroll.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  testID = 'auth-layout'
}) => {
  const spacing = useSpacing();
  const typography = useTypography();
  const colors = useColors();
  const radii = useRadii();
  const shadows = useShadows();

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: colors.background }} testID={testID}>
      <ScrollView contentContainerStyle={{ flexGrow:1, padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems:'center', marginTop:60, marginBottom:48 }}>
          <Image 
            source={require('../../../../assets/logo-spoon.png')}
            style={{ width: 120, height: 120, resizeMode: 'contain' }}
            accessibilityLabel="Logo Spoon"
          />
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.md }}>
          {title && (
            <SpoonText style={{ fontSize: typography.headlineSmall.fontSize, fontWeight:'bold', color:colors.secondaryDark, textAlign:'center', marginBottom: spacing.lg }}>{title}</SpoonText>
          )}
          {subtitle && (
            <SpoonText style={{ fontSize:16, color:colors.secondary, textAlign:'center', marginBottom: spacing.md }}>{subtitle}</SpoonText>
          )}
          {children}
        </View>
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthLayout;
