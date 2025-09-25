import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { Section, SettingItem } from '../../src/components/ui'
import { useColors, useSpacing, useTypography } from '../../src/design-system'

export default function ConfigurationTab() {
  const navigation = useNavigation()
  const colors = useColors()
  const spacing = useSpacing()
  const type = useTypography()
  
  // Estados de configuración
  const [notificacionesPush, setNotificacionesPush] = useState(true)
  const [notificacionesEmail, setNotificacionesEmail] = useState(false)
  const [perfilPublico, setPerfilPublico] = useState(true)
  const [mostrarActividad, setMostrarActividad] = useState(true)
  const [modoExplorador, setModoExplorador] = useState(false)
  
  // Datos del usuario (simulados - en producción vendrían del estado global)
  const userEmail = 'test789@gmail.com'
  const userLanguage = 'Español'
  const userLocation = 'Cúcuta'
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            console.log('Cerrando sesión...')
            // Aquí iría la lógica de logout
          }
        }
      ]
    )
  }
  
  const handleChangeEmail = () => {
    Alert.alert('Cambiar Email', 'Función en desarrollo')
  }
  
  const handleChangeLanguage = () => {
    Alert.alert(
      'Seleccionar idioma',
      '',
      [
        { text: 'Español', onPress: () => console.log('Español seleccionado') },
        { text: 'English', onPress: () => console.log('English selected') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }
  
  // Usamos componentes compartidos: Section y SettingItem
  
  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>   
      {/* Sección: Cuenta */}
      <Section title="Cuenta">
        <SettingItem
          icon="👤"
          title="Editar perfil"
          subtitle="Cambiar nombre, foto y datos personales"
          onPress={() => navigation.navigate('EditProfile')}
        />
        
        <SettingItem
          icon="✉️"
          title="Email"
          value={userEmail}
          onPress={handleChangeEmail}
        />
        
        <SettingItem
          icon="🔒"
          title="Seguridad"
          subtitle="Contraseña, autenticación de dos factores"
          onPress={() => navigation.navigate('Security')}
        />
      </Section>
      
      {/* Sección: Privacidad */}
      <Section title="Privacidad" subtitle="Controla quién puede ver tu información">
        <SettingItem
          icon="🌍"
          title="Perfil público"
          subtitle="Permitir que otros usuarios vean tu perfil"
          hasToggle
          toggleValue={perfilPublico}
          onToggleChange={setPerfilPublico}
        />
        
        <SettingItem
          icon="👁️"
          title="Mostrar actividad reciente"
          subtitle="Mostrar tus reseñas y visitas recientes"
          hasToggle
          toggleValue={mostrarActividad}
          onToggleChange={setMostrarActividad}
        />
        
        <SettingItem
          icon="🛡️"
          title="Configuración de privacidad"
          subtitle="Configuración detallada de privacidad y datos"
          onPress={() => navigation.navigate('Privacy')}
        />
        
        <SettingItem
          icon="👥"
          title="Conexiones"
          subtitle="Gestionar seguidores y configuración de red"
          onPress={() => navigation.navigate('Connections')}
        />
        
        <SettingItem
          icon="🔍"
          title="Modo explorador"
          subtitle="Permitir que otros exploradores te encuentren cerca"
          hasToggle
          toggleValue={modoExplorador}
          onToggleChange={setModoExplorador}
        />
      </Section>
      
      {/* Sección: Notificaciones */}
      <Section title="Notificaciones">
        <SettingItem
          icon="🔔"
          title="Notificaciones push"
          subtitle="Recibir notificaciones en el dispositivo"
          hasToggle
          toggleValue={notificacionesPush}
          onToggleChange={setNotificacionesPush}
        />
        
        <SettingItem
          icon="📧"
          title="Notificaciones por email"
          subtitle="Recibir resúmenes y actualizaciones por correo"
          hasToggle
          toggleValue={notificacionesEmail}
          onToggleChange={setNotificacionesEmail}
        />
        
        <SettingItem
          icon="⚙️"
          title="Personalizar notificaciones"
          subtitle="Elegir qué tipos de notificaciones recibir"
          onPress={() => navigation.navigate('Notifications')}
        />
      </Section>
      
      {/* Sección: Preferencias */}
      <Section title="Preferencias">
        <SettingItem
          icon="🌐"
          title="Idioma"
          value={userLanguage}
          onPress={handleChangeLanguage}
        />
        
        <SettingItem
          icon="📍"
          title="Ubicación"
          value={userLocation}
          onPress={() => navigation.navigate('Preferences')}
        />
        
        <SettingItem
          icon="🎨"
          title="Todas las preferencias"
          subtitle="Idioma, unidades, configuración regional"
          onPress={() => navigation.navigate('Preferences')}
        />
      </Section>
      
      {/* Sección: Ayuda y soporte */}
      <Section title="Ayuda y soporte">
        <SettingItem
          icon="❓"
          title="Centro de ayuda"
          subtitle="Preguntas frecuentes y tutoriales"
          onPress={() => navigation.navigate('Help')}
        />
        
        <SettingItem
          icon="💬"
          title="Contactar soporte"
          subtitle="Enviar comentarios o reportar problemas"
          onPress={() => navigation.navigate('ContactSupport')}
        />
        
        <SettingItem
          icon="ℹ️"
          title="Acerca de Spoon"
          subtitle="Versión, términos y política de privacidad"
          onPress={() => navigation.navigate('About')}
        />
      </Section>
      
      {/* Sección: Zona de peligro */}
      <Section title="Cuenta">
        <SettingItem
          icon="🚪"
          title="Cerrar sesión"
          subtitle="Salir de tu cuenta en este dispositivo"
          onPress={handleLogout}
          danger
        />
      </Section>
      
      <View style={styles.bottomSpace} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomSpace: { height: 80 },
})

