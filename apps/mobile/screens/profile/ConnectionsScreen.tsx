import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, TextInput, Pressable, } from 'react-native'
import { useColors, SpoonColors, SpoonShadows } from '../../src/design-system'
import { useCompatibilityColor } from '../../src/design-system/constants/status'

import Icon from '../../src/components/Icon'
import { Section, SettingItem, DeviceItem, RequestCard, SuggestionCard } from '../../src/components/ui'
import { useNavigation } from '@react-navigation/native'

type Navigation = any

enum EstadoConexion {
  Conectado = 'conectado',
  Pendiente = 'pendiente',
  Bloqueado = 'bloqueado',
}

enum TipoSolicitud {
  Enviada = 'enviada',
  Recibida = 'recibida',
}

type Conexion = {
  id: string
  nombre: string
  avatar?: string
  ubicacion: string
  gustosCompartidos: string[]
  fechaConexion: Date
  estado: EstadoConexion
  resenasCompartidas: number
  ultimaActividad: Date
}

type SolicitudConexion = {
  id: string
  nombre: string
  avatar?: string
  ubicacion: string
  gustosCompartidos: string[]
  fechaSolicitud: Date
  tipoSolicitud: TipoSolicitud
  mensaje?: string | null
}

type Usuario = {
  id: string
  nombre: string
  avatar?: string
  ubicacion: string
  gustosCompartidos: string[]
  compatibilidad: number
  restaurantesFavoritos: number
}

const Tabs = {
  CONEXIONES: 'Conexiones',
  SOLICITUDES: 'Solicitudes',
  SUGERENCIAS: 'Sugerencias',
  CONFIG: 'Configuración',
} as const

export default function ConnectionsScreen() {
  const navigation = useNavigation<Navigation>()
  const colors = useColors()
  const [activeTab, setActiveTab] = useState<string>(Tabs.CONEXIONES)

  // Estados de configuración
  const [permitirConexiones, setPermitirConexiones] = useState(true)
  const [conexionesPorUbicacion, setConexionesPorUbicacion] = useState(true)
  const [conexionesPorGustos, setConexionesPorGustos] = useState(true)
  const [notificacionesConexiones, setNotificacionesConexiones] = useState(true)
  const [mostrarActividad, setMostrarActividad] = useState(false)
  const [radioConexion, setRadioConexion] = useState(5)

  // Datos mock
  const [conexiones, setConexiones] = useState<Conexion[]>([
    {
      id: '1',
      nombre: 'María García',
      avatar: undefined,
      ubicacion: 'Cúcuta Centro',
      gustosCompartidos: ['Italiana', 'Mexicana', 'Postres'],
      fechaConexion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      estado: EstadoConexion.Conectado,
      resenasCompartidas: 12,
      ultimaActividad: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '2',
      nombre: 'Carlos Rodríguez',
      avatar: undefined,
      ubicacion: 'Barrio Latino',
      gustosCompartidos: ['Comida Rápida', 'Asiática'],
      fechaConexion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      estado: EstadoConexion.Conectado,
      resenasCompartidas: 8,
      ultimaActividad: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ])

  const [solicitudes, setSolicitudes] = useState<SolicitudConexion[]>([
    {
      id: '1',
      nombre: 'Ana Martínez',
      avatar: undefined,
      ubicacion: 'La Libertad',
      gustosCompartidos: ['Vegetariana', 'Saludable'],
      fechaSolicitud: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      tipoSolicitud: TipoSolicitud.Recibida,
      mensaje: '¡Hola! Vi que también te gusta la comida italiana. ¿Conectamos?',
    },
    {
      id: '2',
      nombre: 'Luis Herrera',
      avatar: undefined,
      ubicacion: 'El Contento',
      gustosCompartidos: ['BBQ', 'Parrilla'],
      fechaSolicitud: new Date(Date.now() - 1000 * 60 * 60 * 12),
      tipoSolicitud: TipoSolicitud.Recibida,
      mensaje: null,
    },
  ])

  const [sugerencias, setSugerencias] = useState<Usuario[]>([
    {
      id: '1',
      nombre: 'Sophie Chen',
      avatar: undefined,
      ubicacion: 'Caobos',
      gustosCompartidos: ['Asiática', 'Fusion'],
      compatibilidad: 85,
      restaurantesFavoritos: 15,
    },
    {
      id: '2',
      nombre: 'Diego Morales',
      avatar: undefined,
      ubicacion: 'Centro',
      gustosCompartidos: ['Tradicional', 'Colombiana'],
      compatibilidad: 78,
      restaurantesFavoritos: 22,
    },
  ])

  const stats = useMemo(() => ({
    conexionesCount: conexiones.length,
    resenasCompartidas: conexiones.reduce((s, c) => s + c.resenasCompartidas, 0),
    activosHoy: conexiones.filter((c) => c.ultimaActividad > new Date(Date.now() - 1000 * 60 * 60 * 24)).length,
  }), [conexiones])

  function formatRelative(date: Date) {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `hace ${days}d`
    if (hours > 0) return `hace ${hours}h`
    return `hace ${Math.max(minutes, 1)}m`
  }

  // Actions
  const onSearch = () => {
    // Simple prompt replacement
    Alert.prompt?.('Buscar Conexiones', undefined, (text) => {
      Alert.alert('Buscar', `🔍 Buscando: "${text}"`)
    })
  }

  const buscarNuevosAmigos = () => {
    Alert.alert('Buscar', '🔍 Buscando nuevos amigos cerca de ti...')
  }

  const verPerfilConexion = (conexion: Conexion) => {
    Alert.alert('Perfil', `👤 Abriendo perfil de ${conexion.nombre}`)
  }

  const accionConexion = (conexion: Conexion, accion: string) => {
    if (accion === 'perfil') return verPerfilConexion(conexion)
    if (accion === 'mensaje') return Alert.alert('Mensaje', `💬 Enviando mensaje a ${conexion.nombre}`)
    if (accion === 'bloquear') return confirmarBloqueo(conexion)
  }

  const aceptarSolicitud = (s: SolicitudConexion) => {
    setSolicitudes((prev) => prev.filter((x) => x.id !== s.id))
    setConexiones((prev) => [
      ...prev,
      {
        id: s.id,
        nombre: s.nombre,
        avatar: s.avatar,
        ubicacion: s.ubicacion,
        gustosCompartidos: s.gustosCompartidos,
        fechaConexion: new Date(),
        estado: EstadoConexion.Conectado,
        resenasCompartidas: 0,
        ultimaActividad: new Date(),
      },
    ])
    Alert.alert('Conectado', `✅ Conectado con ${s.nombre}`)
  }

  const rechazarSolicitud = (s: SolicitudConexion) => {
    setSolicitudes((prev) => prev.filter((x) => x.id !== s.id))
    Alert.alert('Rechazada', `❌ Solicitud de ${s.nombre} rechazada`)
  }

  const verPerfilUsuario = (u: Usuario) => {
    Alert.alert('Perfil', `👤 Abriendo perfil de ${u.nombre}`)
  }

  const enviarSolicitud = (u: Usuario) => {
    Alert.alert('Enviar solicitud', `📤 Solicitud enviada a ${u.nombre}`)
  }

  const confirmarBloqueo = (conexion: Conexion) => {
    Alert.alert('Bloquear', `¿Bloquear a ${conexion.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Bloquear', style: 'destructive', onPress: () => {
        setConexiones((prev) => prev.filter((c) => c.id !== conexion.id))
        Alert.alert('Bloqueado', `🚫 ${conexion.nombre} ha sido bloqueado`)
      } }
    ])
  }

  const confirmarEliminarTodas = () => {
    Alert.alert('Eliminar todas las conexiones', 'Esta acción eliminará todas tus conexiones permanentemente. ¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar Todo', style: 'destructive', onPress: () => { setConexiones([]); Alert.alert('Eliminado', '🗑️ Todas las conexiones han sido eliminadas') } }
    ])
  }

  // Renderers
  function renderStats() {
    return (
      <View style={[styles.statsCard, { backgroundColor: colors.primaryDark, ...SpoonShadows.card() }]}>
        <View style={styles.statItem}>
          <Icon name="people" size={18} color={colors.textOnPrimary} />
          <Text style={[styles.statValue, { color: colors.textOnPrimary }]}>{stats.conexionesCount}</Text>
          <Text style={[styles.statLabel, { color: SpoonColors.withOpacity(colors.textOnPrimary,0.9) }]}>Conexiones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="star" size={18} color={colors.textOnPrimary} />
          <Text style={[styles.statValue, { color: colors.textOnPrimary }]}>{stats.resenasCompartidas}</Text>
          <Text style={[styles.statLabel, { color: SpoonColors.withOpacity(colors.textOnPrimary,0.9) }]}>Reseñas compartidas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="online-prediction" size={18} color={colors.textOnPrimary} />
          <Text style={[styles.statValue, { color: colors.textOnPrimary }]}>{stats.activosHoy}</Text>
          <Text style={[styles.statLabel, { color: SpoonColors.withOpacity(colors.textOnPrimary,0.9) }]}>Activos hoy</Text>
        </View>
      </View>
    )
  }

  function renderConexionItem({ item }: { item: Conexion }) {
    // Use shared DeviceItem for consistent device/connection rendering
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DeviceItem
            id={item.id}
            name={item.nombre}
            type={item.avatar ? 'mobile' : 'mobile'}
            location={item.ubicacion}
            lastAccess={formatRelative(item.ultimaActividad)}
            current={item.estado === EstadoConexion.Conectado}
            onPress={() => verPerfilConexion(item)}
            onRemove={() => confirmarBloqueo(item)}
          />

          <TouchableOpacity onPress={() => accionConexion(item, 'menu')} style={styles.menuButton}>
            <Icon name="more-vert" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  function renderSolicitudItem({ item }: { item: SolicitudConexion }) {
    return (
      <RequestCard
        id={item.id}
        name={item.nombre}
        location={item.ubicacion}
        gustos={item.gustosCompartidos}
        fecha={formatRelative(item.fechaSolicitud)}
        mensaje={item.mensaje}
        onAccept={(id) => aceptarSolicitud(item)}
        onReject={(id) => rechazarSolicitud(item)}
        onPress={() => verPerfilConexion({ ...item, fechaConexion: item.fechaSolicitud, estado: EstadoConexion.Pendiente, resenasCompartidas: 0, ultimaActividad: new Date() })}
      />
    )
  }

  function renderSugerenciaItem({ item }: { item: Usuario }) {
    return (
      <SuggestionCard
        id={item.id}
        name={item.nombre}
        location={item.ubicacion}
        gustos={item.gustosCompartidos}
        compatibility={item.compatibilidad}
        favoritesCount={item.restaurantesFavoritos}
        onView={(id) => verPerfilUsuario(item)}
        onConnect={(id) => enviarSolicitud(item)}
      />
    )
  }

  // Deprecated local logic replaced by useCompatibilityColor (design-system/constants/status)
  const getCompatibilityColor = useCompatibilityColor();

  function renderConfiguracion() {
    return (
      <View>
        <Section title="Configuración de Conexiones">
          <SettingItem title="Permitir conexiones" hasToggle toggleValue={permitirConexiones} onToggleChange={(v) => { setPermitirConexiones(v); Alert.alert('Guardado','⚙️ Configuración guardada') }} />
          <SettingItem title="Mostrar mi actividad" hasToggle toggleValue={mostrarActividad} onToggleChange={(v) => { setMostrarActividad(v); Alert.alert('Guardado','⚙️ Configuración guardada') }} />
          <SettingItem title="Notificaciones de conexiones" hasToggle toggleValue={notificacionesConexiones} onToggleChange={(v) => { setNotificacionesConexiones(v); Alert.alert('Guardado','⚙️ Configuración guardada') }} />
        </Section>

        <Section title="Criterios de sugerencias">
          <SettingItem title="Conexiones por ubicación" hasToggle toggleValue={conexionesPorUbicacion} onToggleChange={(v) => { setConexionesPorUbicacion(v); Alert.alert('Guardado','⚙️ Configuración guardada') }} />
          <SettingItem title="Conexiones por gustos" hasToggle toggleValue={conexionesPorGustos} onToggleChange={(v) => { setConexionesPorGustos(v); Alert.alert('Guardado','⚙️ Configuración guardada') }} />
        </Section>

        <Section title="Radio de conexión">
          <Text style={{color: colors.textSecondary, marginTop:8}}>Buscar personas dentro de {radioConexion} km</Text>
          <View style={{flexDirection:'row', marginTop:12, alignItems:'center'}}>
            <TouchableOpacity onPress={() => setRadioConexion(Math.max(1, radioConexion - 1))} style={styles.stepperButton}><Text>-</Text></TouchableOpacity>
            <View style={{width:16}}/>
            <Text>{radioConexion} km</Text>
            <View style={{width:16}}/>
            <TouchableOpacity onPress={() => setRadioConexion(Math.min(50, radioConexion + 1))} style={styles.stepperButton}><Text>+</Text></TouchableOpacity>
          </View>
        </Section>

        <Section title="Privacidad y Seguridad">
          <SettingItem title="Usuarios bloqueados" onPress={() => Alert.alert('Bloqueados','Mostrando usuarios bloqueados...')} />
          <SettingItem title="Reportar un problema" onPress={() => Alert.alert('Reportar','Abrir formulario...')} />
          <SettingItem title="Eliminar todas las conexiones" onPress={confirmarEliminarTodas} danger />
        </Section>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }] }>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Conexiones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onSearch} style={styles.iconButton}><Icon name="search" size={20} color={colors.textPrimary}/></TouchableOpacity>
          <TouchableOpacity onPress={buscarNuevosAmigos} style={styles.iconButton}><Icon name="person-add" size={20} color={colors.textPrimary}/></TouchableOpacity>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }] }>
        {Object.values(Tabs).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && { backgroundColor: SpoonColors.withOpacity(colors.primary,0.12), borderColor: colors.primary, borderWidth:1 }]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabLabel, { color: activeTab === t ? colors.primary : colors.textSecondary, fontWeight: activeTab === t ? '600' : '400' }]}>{t}{t===Tabs.CONEXIONES && ` (${conexiones.length})`}{t===Tabs.SOLICITUDES && ` (${solicitudes.length})`}{t===Tabs.SUGERENCIAS && ` (${sugerencias.length})`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === Tabs.CONEXIONES && (
          <View style={{flex:1}}>
      {renderStats()}
            {conexiones.length === 0 ? (
              <View style={styles.emptyState}>
        <Icon name="people-outline" size={64} color={colors.borderLight}/>
                <Text style={styles.emptyTitle}>No tienes conexiones aún</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Comienza a conectar con otros amantes de la comida</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={buscarNuevosAmigos}><Text style={[styles.primaryLabel, { color: colors.textOnPrimary }]}>Buscar Amigos</Text></TouchableOpacity>
              </View>
            ) : (
              <FlatList data={conexiones} keyExtractor={(i) => i.id} renderItem={renderConexionItem} contentContainerStyle={{padding:16}} />
            )}
          </View>
        )}

        {activeTab === Tabs.SOLICITUDES && (
          solicitudes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={64} color={colors.borderLight}/>
              <Text style={styles.emptyTitle}>No hay solicitudes pendientes</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Las nuevas solicitudes de conexión aparecerán aquí</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => setActiveTab(Tabs.SUGERENCIAS)}><Text style={[styles.primaryLabel, { color: colors.textOnPrimary }]}>Ver Sugerencias</Text></TouchableOpacity>
            </View>
          ) : (
            <FlatList data={solicitudes} keyExtractor={(i) => i.id} renderItem={renderSolicitudItem} contentContainerStyle={{padding:16}} />
          )
        )}

        {activeTab === Tabs.SUGERENCIAS && (
          <View style={{flex:1}}>
            <View style={{backgroundColor:colors.surface, padding:16, borderRadius:12, ...SpoonShadows.card() }}>
              <Text style={{fontSize:16, fontWeight:'600', color: colors.textPrimary}}>Encontrar personas con gustos similares</Text>
              <View style={{height:12}} />
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: SpoonColors.withOpacity(colors.primary,0.08) }, conexionesPorUbicacion && { backgroundColor: colors.primaryDark }]} onPress={() => setConexionesPorUbicacion(!conexionesPorUbicacion)}>
                  <Icon name="location-on" size={14} color={conexionesPorUbicacion ? colors.textOnPrimary : colors.textSecondary} />
                  <Text style={{color: conexionesPorUbicacion ? colors.textOnPrimary : colors.textSecondary, marginLeft:6}}>Cerca de ti</Text>
                </TouchableOpacity>
                <View style={{width:8}} />
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: SpoonColors.withOpacity(colors.primary,0.08) }, conexionesPorGustos && { backgroundColor: colors.primaryDark }]} onPress={() => setConexionesPorGustos(!conexionesPorGustos)}>
                  <Icon name="favorite" size={14} color={conexionesPorGustos ? colors.textOnPrimary : colors.textSecondary} />
                  <Text style={{color: conexionesPorGustos ? colors.textOnPrimary : colors.textSecondary, marginLeft:6}}>Gustos similares</Text>
                </TouchableOpacity>
              </View>
            </View>

            {sugerencias.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="recommend" size={64} color={colors.borderLight}/>
                <Text style={styles.emptyTitle}>No hay sugerencias disponibles</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Ajusta tus preferencias para encontrar más personas</Text>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]} onPress={() => setActiveTab(Tabs.CONFIG)}><Text style={[styles.primaryLabel, { color: colors.textOnPrimary }]}>Configurar</Text></TouchableOpacity>
              </View>
            ) : (
              <FlatList data={sugerencias} keyExtractor={(i) => i.id} renderItem={renderSugerenciaItem} contentContainerStyle={{padding:16}} />
            )}
          </View>
        )}

        {activeTab === Tabs.CONFIG && (
          <ScrollView contentContainerStyle={{padding:16}}>
            {renderConfiguracion()}
            <View style={{height:80}} />
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, paddingHorizontal: 16, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1 },
  headerTitle: { fontSize:18, fontWeight:'600' },
  headerActions: { flexDirection:'row', alignItems:'center' },
  iconButton: { padding:8, marginLeft:8 },
  tabBar: { flexDirection:'row', paddingVertical:8, paddingHorizontal:8, borderBottomWidth:1 },
  tab: { paddingHorizontal:10, paddingVertical:6, borderRadius:20, marginRight:8 },
  tabLabel: { },
  content: { flex: 1 },
  statsCard: { margin:16, padding:16, borderRadius:12, flexDirection:'row', alignItems:'center' },
  statItem: { flex:1, alignItems:'center' },
  statValue: { fontSize:18, fontWeight:'700', marginTop:6 },
  statLabel: { fontSize:12, marginTop:4 },
  statDivider: { width:1, height:48, marginHorizontal:8 },
  card: { marginBottom:12, borderRadius:12, padding:12, marginHorizontal:16 },
  listItem: { flexDirection:'row', alignItems:'center' },
  avatarCircle: { width:48, height:48, borderRadius:24, justifyContent:'center', alignItems:'center' },
  avatarLetter: { fontWeight:'700' },
  itemBody: { flex:1, marginLeft:12 },
  itemTitle: { fontWeight:'600', fontSize:16 },
  row: { flexDirection:'row', alignItems:'center', marginTop:4 },
  itemSubtitle: { marginLeft:4, fontSize:12 },
  tagsRow: { flexDirection:'row', flexWrap:'wrap', marginTop:8 },
  tag: { paddingHorizontal:8, paddingVertical:4, borderRadius:12, marginRight:6, marginTop:4 },
  tagText: { fontSize:12, fontWeight:'500' },
  smallText: { fontSize:12, marginTop:6 },
  menuButton: { padding:8 },
  requestHeader: { flexDirection:'row', alignItems:'center' },
  messageBox: { marginTop:12, padding:12, borderRadius:8 },
  requestActions: { flexDirection:'row', marginTop:12 },
  outlinedButton: { flex:1, borderWidth:1, padding:10, borderRadius:8, flexDirection:'row', alignItems:'center', justifyContent:'center', marginRight:8 },
  outlinedLabel: { marginLeft:6 },
  primaryButton: { flex:1, padding:10, borderRadius:8, flexDirection:'row', alignItems:'center', justifyContent:'center' },
  primaryLabel: { marginLeft:6 },
  emptyState: { flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  emptyTitle: { fontSize:18, fontWeight:'600', marginTop:8 },
  emptySubtitle: { marginTop:6, textAlign:'center' },
  filterChip: { flexDirection:'row', alignItems:'center', padding:8, borderRadius:20, paddingHorizontal:12 },
  sectionCard: { padding:12, borderRadius:12 },
  sectionTitle: { fontSize:16, fontWeight:'600' },
  settingRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12 },
  toggleButton: { paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  stepperButton: { padding:8, borderWidth:1, borderRadius:6 },
  navItem: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12, borderTopWidth:1 },
  dangerItem: { padding:12, borderTopWidth:1 },
  compatibilityBadge: { paddingHorizontal:8, paddingVertical:4, borderRadius:12 },
  compatibilityText: { fontWeight:'700' },
})


