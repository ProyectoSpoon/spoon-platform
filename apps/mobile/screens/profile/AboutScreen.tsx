import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Share, Alert, Image, useColorScheme, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ProfileStackParamList } from '../../navigation/types';
// Provide a lightweight ambient module so TS won't error when project doesn't have
// type declarations for react-native-vector-icons in this workspace.
import Icon from '../../src/components/Icon';
import { copyToClipboard } from '../../src/utils/ui'
import { InfoItem, SocialButton } from '../../src/components/ui'
import { useColors } from '../../src/design-system'
import { socialColors } from '../../src/design-system/constants/socialColors'

type AboutScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'About'>;

export default function AboutScreen() {
  const colors = useColors()
  const navigation = useNavigation<AboutScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: '¡Descarga Spoon! 🍽️\nLa mejor app para descubrir restaurantes increíbles.\nDisponible en: https://spoon.app',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la aplicación');
    }
  };

  const showLicenses = () => {
    Alert.alert(
      'Licencias de Terceros',
      'Flutter SDK - Copyright © Google Inc.\n' +
      'Material Design Icons - Apache License 2.0\n' +
      'Cupertino Icons - MIT License\n' +
      'React Native - MIT License\n' +
      'React Navigation - MIT License\n' +
      'Para ver el texto completo de las licencias, visita: https://spoon.app/licenses',
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Copiar URL',
          onPress: () => copyToClipboard('https://spoon.app/licenses', 'URL copiada'),
        },
      ]
    );
  };

  // InfoItem and SocialButton are provided from shared ui components

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Logo */}
  <View style={[styles.header, { backgroundColor: colors.warning }] }>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.surface, ...colors, }]}> 
            <Icon name="restaurant" size={50} color={colors.warning} />
          </View>
          <Text style={[styles.appName, { color: colors.textOnPrimary, fontSize: 32 }]}>Spoon</Text>
          <Text style={styles.tagline}>Descubre tu próxima comida favorita</Text>
          <View style={styles.versionBadge}>
            <Text style={[styles.versionText, { fontSize: 12 }]}>Versión 2.1.0 (Build 2024.12)</Text>
          </View>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="info" size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Información de la Aplicación</Text>
        </View>
  <InfoItem label="Versión" value="2.1.0" icon="tag" />
        <InfoItem label="Build" value="2024.12.0 (156)" icon="build" />
        <InfoItem label="Fecha de lanzamiento" value="Diciembre 2024" icon="calendar-today" />
        <InfoItem label="Tamaño de la app" value="28.5 MB" icon="storage" />
        <InfoItem label="Compatibilidad" value="iOS 12+ / Android 8+" icon="phone-android" />
      </View>

      {/* Credits Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="group" size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Créditos</Text>
        </View>
        <View style={styles.creditItem}>
          <View style={styles.creditIcon}>
            <Icon name="code" size={24} color={colors.success} />
          </View>
          <View>
            <Text style={styles.creditName}>CARLOS ALBERTO RODRIGUEZ JIMENEZ</Text>
            <Text style={styles.creditRole}>
              Fundador, creador de la idea original, diseñador de producto, desarrollador principal y líder del proyecto Spoon.
            </Text>
          </View>
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="share" size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Síguenos</Text>
        </View>
        <View style={styles.socialGrid}>
          <SocialButton name="instagram" username="@spoon_app" icon="camera-alt" color={socialColors.instagram} />
          <SocialButton name="twitter" username="@SpoonApp" icon="article" color={socialColors.twitter} />
          <SocialButton name="facebook" username="SpoonApp" icon="facebook" color={socialColors.facebook} />
          <SocialButton name="web" username="spoon.app" icon="public" color={colors.success} />
        </View>
      </View>

      {/* Actions Section */}
  <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Acciones</Text>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={shareApp}>
          <Icon name="share" size={20} color={colors.warning} />
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Compartir Spoon</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Icon name="star" size={20} color={colors.warning} />
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Calificar en la tienda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Icon name="bug-report" size={20} color={colors.warning} />
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Reportar un problema</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="gavel" size={24} color={colors.warning} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Información Legal</Text>
        </View>
        <TouchableOpacity 
          style={styles.legalItem} 
          onPress={() => navigation.navigate('TermsConditions')}
        >
          <Text style={[styles.legalText, { color: colors.textPrimary }]}>Términos y Condiciones</Text>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.legalItem} 
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Text style={[styles.legalText, { color: colors.textPrimary }]}>Política de Privacidad</Text>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.legalItem} onPress={showLicenses}>
          <Text style={[styles.legalText, { color: colors.textPrimary }]}>Licencias de terceros</Text>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
  <View style={[styles.footer, { backgroundColor: colors.surface }]}>
  <Icon name="favorite" size={24} color={colors.primaryDark} />
        <Text style={styles.footerText}>Hecho en OCAÑA, Colombia</Text>
        <Text style={styles.copyright}>© 2024 Spoon App. Todos los derechos reservados.</Text>
        <Text style={styles.trademark}>Spoon® es una marca registrada.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  // backgroundColor applied dynamically via colors.background
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
  },
  appName: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  tagline: { fontSize: 16, marginBottom: 16, textAlign: 'center', color: undefined },
  versionBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  versionText: { fontWeight: '500', fontSize: 14 },
  section: { borderRadius: 16, marginHorizontal: 16, marginBottom: 20, padding: 16, elevation: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  color: undefined,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: undefined,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
  backgroundColor: undefined,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
  color: undefined,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  color: undefined,
  },
  creditItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  creditIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  backgroundColor: undefined,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creditName: {
    fontSize: 14,
    fontWeight: '600',
  color: undefined,
    marginBottom: 4,
  },
  creditRole: {
    fontSize: 12,
  color: undefined,
    lineHeight: 16,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  socialName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  socialUsername: {
    fontSize: 10,
    opacity: 0.8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: undefined,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
  color: undefined,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  borderBottomColor: undefined,
  },
  legalText: {
    fontSize: 16,
  color: undefined,
  },
  footer: { alignItems: 'center', padding: 24, marginTop: 20 },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 8,
  color: undefined,
  },
  copyright: {
    fontSize: 12,
  color: undefined,
    textAlign: 'center',
    marginBottom: 4,
  },
  trademark: {
    fontSize: 10,
  color: undefined,
    fontStyle: 'italic',
  },
});
