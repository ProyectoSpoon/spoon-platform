import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Slider
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function PrivacyScreen() {
  const navigation = useNavigation()
  
  // Estados de Visibilidad del Perfil
  const [perfilPublico, setPerfilPublico] = useState(true)
  const [mostrarActividad, setMostrarActividad] = useState(true)
  const [mostrarUbicacion, setMostrarUbicacion] = useState(false)
  const [mostrarFavoritos, setMostrarFavoritos] = useState(true)
  const [mostrarResenas, setMostrarResenas] = useState(true)
  const [mostrarFotos, setMostrarFotos] = useState(true)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true)
  
  // Estados de Conexiones Sociales
  const [permitirConexiones, setPermitirConexiones] = useState(true)
  const [conexionesAmigos, setConexionesAmigos] = useState(false)
  const [conexionesUbicacion, setConexionesUbicacion] = useState(false)
  const [conexionesGustos, setConexionesGustos] = useState(true)
  
  // Estados de Modo Explorador
  const [modoExplorador, setModoExplorador] = useState(false)
  const [explorarRestaurantes, setExplorarRestaurantes] = useState(false)
  const [explorarEventos, setExplorarEventos] = useState(false)
  const [notificarCercania, setNotificarCercania] = useState(false)
  const [radioExplorador, setRadioExplorador] = useState(2.0)
  
  // Estados de Control de Datos
  const [compartirAnaliticas, setCompartirAnaliticas] = useState(true)
  const [personalizarAnuncios, setPersonalizarAnuncios] = useState(false)
  const [compartirTerceros, setCompartirTerceros] = useState(false)
  const [guardarHistorial, setGuardarHistorial] = useState(true)
  
  const mostrarAyudaPrivacidad = () => {
    Alert.alert(
      'Ayuda de Privacidad',
      'PERFIL PÚBLICO: Permite que otros usuarios encuentren y vean tu perfil básico.\n\n' +
      'ACTIVIDAD RECIENTE: Muestra tus últimas reseñas y lugares visitados.\n\n' +
      'CONEXIONES: Controla quién puede enviarte solicitudes de amistad.\n\n' +
      'MODO EXPLORADOR: Te hace visible para otros usuarios cuando estás buscando compañía para comer.\n\n' +
      'DATOS ANALÍTICOS: Información anónima que ayuda a mejorar la aplicación.\n\n' +
      'Puedes cambiar estas configuraciones en cualquier momento.',
      [{ text: 'Entendido' }]
    )
  }
  
  const descargarDatos = () => {
    Alert.alert(
      'Descargar mis datos',
      'Te enviaremos un archivo con toda tu información personal a tu correo electrónico registrado. Este proceso puede tomar hasta 48 horas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('✉️', 'Solicitud de descarga enviada. Recibirás un email con instrucciones.')
          }
        }
      ]
    )
  }
  
  const eliminarHistorial = () => {
    Alert.alert(
      'Eliminar historial',
      '¿Estás seguro de que quieres eliminar tu historial de búsquedas y navegación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('🗑️', 'Historial de actividad eliminado')
          }
        }
      ]
    )
  }
  
  const eliminarCuenta = () => {
    Alert.alert(
      '⚠️ Eliminar cuenta',
      'Esta acción eliminará permanentemente tu cuenta y todos tus datos. No podrás recuperar tu información después.\n\n¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar definitivamente',
          style: 'destructive',
          onPress: () => {
            Alert.alert('⚠️', 'Proceso de eliminación de cuenta iniciado')
          }
        }
      ]
    )
  }
  
  const PrivacySection = ({ title, subtitle, icon, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>{icon}</Text>
        </View>
        <View style={styles.sectionTextContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  )
  
  const PrivacyToggle = ({ title, subtitle, value, onValueChange, enabled = true }) => (
    <View style={[styles.toggleItem, !enabled && styles.toggleItemDisabled]}>
      <View style={styles.toggleTextContainer}>
        <Text style={[styles.toggleTitle, !enabled && styles.textDisabled]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, !enabled && styles.textDisabled]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={enabled ? onValueChange : undefined}
        trackColor={{ false: '#ccc', true: '#E67E22' }}
        thumbColor="#fff"
        disabled={!enabled}
      />
    </View>
  )
  
  const PrivacyAction = ({ title, subtitle, onPress, danger = false }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.actionArrow, danger && styles.dangerText]}>{'>'}</Text>
    </TouchableOpacity>
  )
  
  return (
    <ScrollView style={styles.container}>
      {/* Header informativo */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🛡️</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Tu privacidad es importante</Text>
          <Text style={styles.headerSubtitle}>Configura qué información quieres compartir</Text>
        </View>
      </View>
      
      {/* Visibilidad del Perfil */}
      <PrivacySection
        title="Visibilidad del Perfil"
        subtitle="Controla qué información de tu perfil pueden ver otros usuarios"
        icon="👁️"
      >
        <PrivacyToggle
          title="Perfil público"
          subtitle="Permitir que otros usuarios encuentren tu perfil"
          value={perfilPublico}
          onValueChange={setPerfilPublico}
        />
        <PrivacyToggle
          title="Mostrar actividad reciente"
          subtitle="Mostrar tus últimas reseñas y visitas"
          value={mostrarActividad}
          onValueChange={setMostrarActividad}
        />
        <PrivacyToggle
          title="Mostrar ubicación actual"
          subtitle="Permitir que otros vean tu ubicación aproximada"
          value={mostrarUbicacion}
          onValueChange={setMostrarUbicacion}
        />
        <PrivacyToggle
          title="Mostrar restaurantes favoritos"
          subtitle="Compartir tu lista de lugares favoritos"
          value={mostrarFavoritos}
          onValueChange={setMostrarFavoritos}
        />
        <PrivacyToggle
          title="Mostrar reseñas públicas"
          subtitle="Permitir que otros vean las reseñas que escribes"
          value={mostrarResenas}
          onValueChange={setMostrarResenas}
        />
        <PrivacyToggle
          title="Mostrar fotos"
          subtitle="Compartir las fotos que subes de comida"
          value={mostrarFotos}
          onValueChange={setMostrarFotos}
        />
        <PrivacyToggle
          title="Mostrar estadísticas"
          subtitle="Mostrar tu número de reseñas y lugares visitados"
          value={mostrarEstadisticas}
          onValueChange={setMostrarEstadisticas}
        />
      </PrivacySection>
      
      {/* Conexiones Sociales */}
      <PrivacySection
        title="Conexiones Sociales"
        subtitle="Gestiona cómo otros usuarios pueden conectar contigo"
        icon="👥"
      >
        <PrivacyToggle
          title="Permitir conexiones"
          subtitle="Permitir que otros usuarios te envíen solicitudes"
          value={permitirConexiones}
          onValueChange={setPermitirConexiones}
        />
        <PrivacyToggle
          title="Solo amigos de amigos"
          subtitle="Limitar conexiones a amigos de tus conexiones"
          value={conexionesAmigos}
          onValueChange={setConexionesAmigos}
          enabled={permitirConexiones}
        />
        <PrivacyToggle
          title="Conexiones por ubicación"
          subtitle="Permitir conexiones basadas en proximidad"
          value={conexionesUbicacion}
          onValueChange={setConexionesUbicacion}
          enabled={permitirConexiones}
        />
        <PrivacyToggle
          title="Conexiones por gustos similares"
          subtitle="Sugerir personas con preferencias similares"
          value={conexionesGustos}
          onValueChange={setConexionesGustos}
          enabled={permitirConexiones}
        />
      </PrivacySection>
      
      {/* Modo Explorador */}
      <PrivacySection
        title="Modo Explorador"
        subtitle="Configura cómo y cuándo apareces en las búsquedas de otros"
        icon="🔍"
      >
        <PrivacyToggle
          title="Habilitar modo explorador"
          subtitle="Permitir que otros te encuentren cuando estés cerca"
          value={modoExplorador}
          onValueChange={setModoExplorador}
        />
        <PrivacyToggle
          title="Explorar restaurantes"
          subtitle="Aparecer cuando otros busquen compañía para comer"
          value={explorarRestaurantes}
          onValueChange={setExplorarRestaurantes}
          enabled={modoExplorador}
        />
        <PrivacyToggle
          title="Explorar eventos gastronómicos"
          subtitle="Participar en eventos y cenas grupales"
          value={explorarEventos}
          onValueChange={setExplorarEventos}
          enabled={modoExplorador}
        />
        <PrivacyToggle
          title="Notificar cuando esté cerca"
          subtitle="Avisar a conexiones cuando estés en la zona"
          value={notificarCercania}
          onValueChange={setNotificarCercania}
          enabled={modoExplorador}
        />
        
        {modoExplorador && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderIcon}>📍</Text>
              <Text style={styles.sliderTitle}>Radio de exploración: {radioExplorador.toFixed(1)} km</Text>
            </View>
            <Text style={styles.sliderSubtitle}>Aparecer en búsquedas dentro de este radio</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={10}
              value={radioExplorador}
              onValueChange={setRadioExplorador}
              minimumTrackTintColor="#E67E22"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#E67E22"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0.5 km</Text>
              <Text style={styles.sliderLabel}>10 km</Text>
            </View>
          </View>
        )}
      </PrivacySection>
      
      {/* Control de Datos */}
      <PrivacySection
        title="Control de Datos"
        subtitle="Administra cómo se utilizan tus datos para mejorar la experiencia"
        icon="💾"
      >
        <PrivacyToggle
          title="Compartir datos analíticos"
          subtitle="Ayudar a mejorar la app con datos anónimos de uso"
          value={compartirAnaliticas}
          onValueChange={setCompartirAnaliticas}
        />
        <PrivacyToggle
          title="Personalizar anuncios"
          subtitle="Mostrar anuncios relevantes según tus intereses"
          value={personalizarAnuncios}
          onValueChange={setPersonalizarAnuncios}
        />
        <PrivacyToggle
          title="Compartir con socios"
          subtitle="Permitir que restaurantes accedan a datos relevantes"
          value={compartirTerceros}
          onValueChange={setCompartirTerceros}
        />
        <PrivacyToggle
          title="Guardar historial de navegación"
          subtitle="Recordar búsquedas para mejorar recomendaciones"
          value={guardarHistorial}
          onValueChange={setGuardarHistorial}
        />
      </PrivacySection>
      
      {/* Gestión de Datos */}
      <PrivacySection
        title="Gestión de Datos"
        subtitle="Opciones para gestionar tu información personal"
        icon="⚙️"
      >
        <PrivacyAction
          title="Descargar mis datos"
          subtitle="Obtener una copia de toda tu información"
          onPress={descargarDatos}
        />
        <PrivacyAction
          title="Eliminar historial de actividad"
          subtitle="Borrar tu historial de búsquedas y navegación"
          onPress={eliminarHistorial}
        />
        <PrivacyAction
          title="Política de privacidad"
          subtitle="Leer nuestra política de privacidad completa"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <PrivacyAction
          title="Eliminar cuenta y datos"
          subtitle="Eliminar permanentemente tu cuenta"
          onPress={eliminarCuenta}
          danger
        />
      </PrivacySection>
      
      <View style={styles.bottomSpace} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 16,
    margin: 16,
    borderRadius: 16,
  },
  headerIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionContent: {
    paddingVertical: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  toggleItemDisabled: {
    opacity: 0.5,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  textDisabled: {
    color: '#999',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  actionArrow: {
    fontSize: 18,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#dc3545',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sliderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sliderSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 11,
    color: '#999',
  },
  bottomSpace: {
    height: 40,
  },
})
