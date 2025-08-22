import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function ConfigurationTab() {
  const navigation = useNavigation()
  
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
  
  const SectionHeader = ({ title, subtitle }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  )
  
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    hasToggle, 
    toggleValue, 
    onToggleChange,
    danger = false 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={!hasToggle ? onPress : undefined}
      activeOpacity={hasToggle ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: '#ccc', true: '#E67E22' }}
          thumbColor="#fff"
        />
      ) : value ? (
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.settingArrow, danger && styles.dangerText]}>{'>'}</Text>
      )}
    </TouchableOpacity>
  )
  
  return (
    <ScrollView style={styles.container}>
      {/* Sección: Cuenta */}
      <View style={styles.section}>
        <SectionHeader title="Cuenta" />
        
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
      </View>
      
      {/* Sección: Privacidad */}
      <View style={styles.section}>
        <SectionHeader 
          title="Privacidad" 
          subtitle="Controla quién puede ver tu información"
        />
        
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
      </View>
      
      {/* Sección: Notificaciones */}
      <View style={styles.section}>
        <SectionHeader title="Notificaciones" />
        
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
      </View>
      
      {/* Sección: Preferencias */}
      <View style={styles.section}>
        <SectionHeader title="Preferencias" />
        
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
      </View>
      
      {/* Sección: Ayuda y soporte */}
      <View style={styles.section}>
        <SectionHeader title="Ayuda y soporte" />
        
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
      </View>
      
      {/* Sección: Zona de peligro */}
      <View style={styles.section}>
        <SectionHeader title="Cuenta" />
        
        <SettingItem
          icon="🚪"
          title="Cerrar sesión"
          subtitle="Salir de tu cuenta en este dispositivo"
          onPress={handleLogout}
          danger
        />
      </View>
      
      <View style={styles.bottomSpace} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
  },
  settingArrow: {
    fontSize: 18,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#dc3545',
  },
  bottomSpace: {
    height: 80,
  },
})
