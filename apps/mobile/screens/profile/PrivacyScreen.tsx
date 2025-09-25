import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'

import Icon from '../../src/components/Icon'
import Section from '../../src/components/ui/Section'
import SettingItem from '../../src/components/ui/SettingItem'
import { useColors, SpoonColors } from '../../src/design-system'
import { useAuth } from '../../src/hooks/useAuth'
import { getUserPrivacySettings, updateUserPrivacySettings } from '../../src/lib/supabase'
import { useNavigation } from '@react-navigation/native'

type PrivacyConfig = {
  perfilPublico: boolean
  mostrarActividad: boolean
  mostrarUbicacion: boolean
  mostrarFavoritos: boolean
  mostrarResenas: boolean
  mostrarFotos: boolean
  mostrarEstadisticas: boolean
  permitirConexiones: boolean
  conexionesAmigos: boolean
  conexionesUbicacion: boolean
  conexionesGustos: boolean
  modoExplorador: boolean
  explorarRestaurantes: boolean
  explorarEventos: boolean
  notificarCercania: boolean
  radioExplorador: number
  compartirAnaliticas: boolean
  personalizarAnuncios: boolean
  compartirTerceros: boolean
  guardarHistorial: boolean
}

const initialConfig: PrivacyConfig = {
  perfilPublico: true,
  mostrarActividad: true,
  mostrarUbicacion: false,
  mostrarFavoritos: true,
  mostrarResenas: true,
  mostrarFotos: true,
  mostrarEstadisticas: true,
  permitirConexiones: true,
  conexionesAmigos: true,
  conexionesUbicacion: false,
  conexionesGustos: true,
  modoExplorador: false,
  explorarRestaurantes: false,
  explorarEventos: false,
  notificarCercania: false,
  radioExplorador: 3.0,
  compartirAnaliticas: true,
  personalizarAnuncios: false,
  compartirTerceros: false,
  guardarHistorial: true,
}

export default function PrivacyScreen() {
  const navigation = useNavigation<any>()
  const [config, setConfig] = useState<PrivacyConfig>(initialConfig)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const colors = useColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const update = async (patch: Partial<PrivacyConfig>) => {
    setConfig((c) => ({ ...c, ...patch }))
    if (!user) return;
    try {
      await updateUserPrivacySettings(user.id, mapToBackend({ ...config, ...patch }))
    } catch (e) {
      showError('No se pudo actualizar')
    }
  }

  const mapToBackend = (c: PrivacyConfig) => ({
    perfil_publico: c.perfilPublico,
    mostrar_actividad: c.mostrarActividad,
    mostrar_ubicacion: c.mostrarUbicacion,
    mostrar_favoritos: c.mostrarFavoritos,
    mostrar_resenas: c.mostrarResenas,
    mostrar_fotos: c.mostrarFotos,
    mostrar_estadisticas: c.mostrarEstadisticas,
    permitir_conexiones: c.permitirConexiones,
    conexiones_amigos: c.conexionesAmigos,
    conexiones_ubicacion: c.conexionesUbicacion,
    conexiones_gustos: c.conexionesGustos,
    modo_explorador: c.modoExplorador,
    explorar_restaurantes: c.explorarRestaurantes,
    explorar_eventos: c.explorarEventos,
    notificar_cercania: c.notificarCercania,
    radio_explorador: c.radioExplorador,
    compartir_analiticas: c.compartirAnaliticas,
    personalizar_anuncios: c.personalizarAnuncios,
    compartir_terceros: c.compartirTerceros,
    guardar_historial: c.guardarHistorial,
  })

  const mapFromBackend = (row: any): PrivacyConfig => ({
    perfilPublico: row.perfil_publico,
    mostrarActividad: row.mostrar_actividad,
    mostrarUbicacion: row.mostrar_ubicacion,
    mostrarFavoritos: row.mostrar_favoritos,
    mostrarResenas: row.mostrar_resenas,
    mostrarFotos: row.mostrar_fotos,
    mostrarEstadisticas: row.mostrar_estadisticas,
    permitirConexiones: row.permitir_conexiones,
    conexionesAmigos: row.conexiones_amigos,
    conexionesUbicacion: row.conexiones_ubicacion,
    conexionesGustos: row.conexiones_gustos,
    modoExplorador: row.modo_explorador,
    explorarRestaurantes: row.explorar_restaurantes,
    explorarEventos: row.explorar_eventos,
    notificarCercania: row.notificar_cercania,
    radioExplorador: row.radio_explorador,
    compartirAnaliticas: row.compartir_analiticas,
    personalizarAnuncios: row.personalizar_anuncios,
    compartirTerceros: row.compartir_terceros,
    guardarHistorial: row.guardar_historial,
  })

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true)
      try {
        const row = await getUserPrivacySettings(user.id)
        if (row) setConfig(mapFromBackend(row))
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const showSuccess = (msg: string) => Alert.alert('✔️', msg)
  const showError = (msg: string) => Alert.alert('❌', msg)

  const descargarDatos = () => {
    Alert.alert('Descargar mis datos', 'Se solicitará un archivo con tu información. Revisa tu correo en hasta 48 horas.')
  }

  const eliminarHistorial = () => {
    Alert.alert('Eliminar historial', '¿Deseas eliminar tu historial de navegación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => showSuccess('Historial eliminado') },
    ])
  }

  const verPolitica = () => {
    navigation.navigate?.('PrivacyPolicy' as any)
  }

  const eliminarCuenta = () => {
    Alert.alert('Eliminar cuenta', 'Esta acción es irreversible. ¿Confirmar eliminación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => showSuccess('Proceso de eliminación iniciado') },
    ])
  }

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="shield" size={28} color={colors.textOnPrimary} />
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Tu privacidad es importante</Text>
            <Text style={styles.headerSubtitle}>Configura qué información quieres compartir</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />

      <Section title="Visibilidad del Perfil" subtitle="Controla qué información pueden ver otros">
        <SettingItem title="Perfil público" subtitle="Permitir que otros usuarios encuentren tu perfil" hasToggle toggleValue={config.perfilPublico} onToggleChange={(v) => update({ perfilPublico: v })} icon="public" />
        <SettingItem title="Mostrar actividad reciente" subtitle="Mostrar tus últimas reseñas y visitas" hasToggle toggleValue={config.mostrarActividad} onToggleChange={(v) => update({ mostrarActividad: v })} icon="timeline" />
        <SettingItem title="Mostrar ubicación actual" subtitle="Permitir que otros vean tu ubicación aproximada" hasToggle toggleValue={config.mostrarUbicacion} onToggleChange={(v) => update({ mostrarUbicacion: v })} icon="location-on" />
        <SettingItem title="Mostrar restaurantes favoritos" subtitle="Compartir tu lista de lugares favoritos" hasToggle toggleValue={config.mostrarFavoritos} onToggleChange={(v) => update({ mostrarFavoritos: v })} icon="favorite" />
        <SettingItem title="Mostrar reseñas públicas" subtitle="Permitir que otros vean las reseñas que escribes" hasToggle toggleValue={config.mostrarResenas} onToggleChange={(v) => update({ mostrarResenas: v })} icon="rate-review" />
        <SettingItem title="Mostrar fotos" subtitle="Compartir las fotos que subes de comida" hasToggle toggleValue={config.mostrarFotos} onToggleChange={(v) => update({ mostrarFotos: v })} icon="photo" />
        <SettingItem title="Mostrar estadísticas" subtitle="Mostrar tu número de reseñas y lugares visitados" hasToggle toggleValue={config.mostrarEstadisticas} onToggleChange={(v) => update({ mostrarEstadisticas: v })} icon="analytics" />
      </Section>

      <View style={{ height: 16 }} />

      <Section title="Conexiones Sociales" subtitle="Gestiona cómo otros usuarios pueden conectar contigo">
        <SettingItem title="Permitir conexiones" subtitle="Permitir que otros usuarios te envíen solicitudes" hasToggle toggleValue={config.permitirConexiones} onToggleChange={(v) => update({ permitirConexiones: v })} icon="person-add" />
        <SettingItem title="Solo amigos de amigos" subtitle="Limitar conexiones a amigos de tus conexiones" hasToggle toggleValue={config.conexionesAmigos} onToggleChange={(v) => update({ conexionesAmigos: v })} icon="group" />
        <SettingItem title="Conexiones por ubicación" subtitle="Permitir conexiones basadas en proximidad" hasToggle toggleValue={config.conexionesUbicacion} onToggleChange={(v) => update({ conexionesUbicacion: v })} icon="location-on" />
        <SettingItem title="Conexiones por gustos" subtitle="Sugerir personas con preferencias similares" hasToggle toggleValue={config.conexionesGustos} onToggleChange={(v) => update({ conexionesGustos: v })} icon="favorite" />
      </Section>

      <View style={{ height: 16 }} />

      <Section title="Modo Explorador" subtitle="Configura cómo y cuándo apareces en búsquedas">
        <SettingItem title="Habilitar modo explorador" subtitle="Permitir que otros te encuentren cuando estés cerca" hasToggle toggleValue={config.modoExplorador} onToggleChange={(v) => update({ modoExplorador: v })} icon="radar" />
        <SettingItem title="Explorar restaurantes" subtitle="Aparecer cuando otros busquen compañía para comer" hasToggle toggleValue={config.explorarRestaurantes} onToggleChange={(v) => update({ explorarRestaurantes: v })} icon="restaurant" />
        <SettingItem title="Explorar eventos gastronómicos" subtitle="Participar en eventos y cenas grupales" hasToggle toggleValue={config.explorarEventos} onToggleChange={(v) => update({ explorarEventos: v })} icon="event" />
        <SettingItem title="Notificar cuando esté cerca" subtitle="Avisar a conexiones cuando estés en la zona" hasToggle toggleValue={config.notificarCercania} onToggleChange={(v) => update({ notificarCercania: v })} icon="notifications" />

        {config.modoExplorador && (
          <View style={[styles.explorerBox, { borderColor: SpoonColors.withOpacity(colors.info, 0.25) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="location-searching" />
              <View style={{ width: 12 }} />
              <Text style={{ fontWeight: '600' }}>Radio de exploración: {config.radioExplorador.toFixed(1)} km</Text>
            </View>
            <View style={{ height: 8 }} />
            <View style={styles.radioControls}>
              <TouchableOpacity onPress={() => update({ radioExplorador: Math.max(0.5, +(config.radioExplorador - 0.5).toFixed(1)) })} style={styles.radioBtn}><Text>-</Text></TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity onPress={() => update({ radioExplorador: Math.min(10, +(config.radioExplorador + 0.5).toFixed(1)) })} style={styles.radioBtn}><Text>+</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </Section>

      <View style={{ height: 16 }} />

      <Section title="Control de Datos" subtitle="Administra cómo se utilizan tus datos">
        <SettingItem title="Compartir datos analíticos" subtitle="Ayudar a mejorar la app" hasToggle toggleValue={config.compartirAnaliticas} onToggleChange={(v) => update({ compartirAnaliticas: v })} icon="analytics" />
        <SettingItem title="Personalizar anuncios" subtitle="Mostrar anuncios relevantes" hasToggle toggleValue={config.personalizarAnuncios} onToggleChange={(v) => update({ personalizarAnuncios: v })} icon="ad-units" />
        <SettingItem title="Compartir con socios" subtitle="Permitir que restaurantes accedan a datos" hasToggle toggleValue={config.compartirTerceros} onToggleChange={(v) => update({ compartirTerceros: v })} icon="handshake" />
        <SettingItem title="Guardar historial de navegación" subtitle="Recordar búsquedas para mejorar recomendaciones" hasToggle toggleValue={config.guardarHistorial} onToggleChange={(v) => update({ guardarHistorial: v })} icon="history" />
      </Section>

      <View style={{ height: 16 }} />

      <Section title="Gestión de Datos" subtitle="Opciones para gestionar tu información">
        <SettingItem title="Descargar mis datos" subtitle="Obtener una copia de toda tu información" onPress={descargarDatos} icon="download" />
        <SettingItem title="Eliminar historial de actividad" subtitle="Borrar tu historial de búsquedas y navegación" onPress={eliminarHistorial} icon="delete-sweep" />
        <SettingItem title="Política de privacidad" subtitle="Leer nuestra política completa" onPress={verPolitica} icon="policy" />
        <SettingItem title="Eliminar cuenta y datos" subtitle="Eliminar permanentemente tu cuenta" onPress={eliminarCuenta} icon="delete-forever" danger />
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

// Local UI primitives replaced by shared `Section` and `SettingItem`.

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  headerCard: { padding: 16, borderRadius: 16, backgroundColor: colors.success, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: SpoonColors.withOpacity(colors.textOnPrimary, 0.9), marginTop: 6 },
  explorerBox: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, borderWidth: 1 },
  radioControls: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  radioBtn: { width: 40, height: 32, borderRadius: 8, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
})

