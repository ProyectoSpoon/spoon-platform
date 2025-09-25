import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useColors } from '../../src/design-system'
import { useNavigation } from '@react-navigation/native'
import { Section, SettingItem } from '../../src/components/ui'
import { authService } from '../../src/services/authService'
import { useAuth } from '../../src/hooks/useAuth'
import { SpoonButton } from '../../src/design-system/components/buttons'

export default function UserProfileScreen() {
  const navigation = useNavigation()
  const colors = useColors()
  const { user, profile } = useAuth()

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => {
          try {
            const result = await authService.signOut()
            if (!result.success) {
              Alert.alert('Error', result.error || 'No se pudo cerrar sesión')
              return
            }
            // Navegar a Login (o pantalla inicial pública)
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] })
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Error inesperado al cerrar sesión')
          }
        }}
      ]
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <Text style={[styles.headerTitle, { color: colors.textOnPrimary }]}>
          {profile?.full_name || 'Mi Perfil'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textOnPrimary, opacity: 0.9 }]}>Usuario: {user?.email || '—'}</Text>
      </View>
      
      <View style={styles.content}>
        <Section title="Configuración de Cuenta">
          <SettingItem
            title="Editar Perfil"
            subtitle="Nombre, foto, información personal"
            onPress={() => navigation.navigate('EditProfile' as never)}
          />

          <SettingItem
            title="Seguridad"
            subtitle="Contraseña, autenticación"
            onPress={() => navigation.navigate('Security' as never)}
          />

          <SettingItem
            title="Notificaciones"
            subtitle="Alertas, correos, push"
            onPress={() => navigation.navigate('Notifications' as never)}
          />

          <SettingItem
            title="Privacidad"
            subtitle="Datos, visibilidad, permisos"
            onPress={() => navigation.navigate('Privacy' as never)}
          />

          <SettingItem
            title="Preferencias"
            subtitle="Idioma, tema, configuración"
            onPress={() => navigation.navigate('Preferences' as never)}
          />

          <SettingItem
            title="Ayuda"
            subtitle="Preguntas frecuentes, soporte"
            onPress={() => navigation.navigate('Help' as never)}
          />

          <SettingItem
            title="Acerca de"
            subtitle="Versión, términos, política"
            onPress={() => navigation.navigate('About' as never)}
          />
        </Section>

        <View style={{ marginTop: 20 }}>
          <SpoonButton.danger
            text="Cerrar Sesión"
            onPress={handleLogout}
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  headerSubtitle: { fontSize: 16 },
  content: {
    padding: 20,
  },
  logoutButton: { },
  logoutText: { },
})

