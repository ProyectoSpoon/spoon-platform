import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'

import Icon from '../../src/components/Icon'
import Section from '../../src/components/ui/Section'
import SettingItem from '../../src/components/ui/SettingItem'
import { useColors, SpoonColors } from '../../src/design-system'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../../src/hooks/useAuth'
import { getUserNotificationSettings, updateUserNotificationSettings } from '../../src/lib/supabase'

// NOTE: This file is a pragmatic conversion of the Flutter file provided.
// Assumption: there's a global configuration provider in the original app.
// Here we use local state that mirrors the shape of the global config so
// the UI and handlers can be wired later to your real state management.

type NotificacionesConfig = {
  pedidos: boolean
  ofertas: boolean
  promociones: boolean
  resenasNuevas: boolean
  conexiones: boolean
  recordatorios: boolean
  modoNoMolestar: boolean
  horaInicioNoMolestar: number
  horaFinNoMolestar: number
  frecuenciaEmail: 'nunca' | 'diario' | 'semanal' | 'mensual'
  emailResumen: boolean
  eventos: boolean
}

type ConfiguracionUsuario = {
  notificacionesPush: boolean
  notificacionesEmail: boolean
  notificaciones: NotificacionesConfig
}

const initialConfig: ConfiguracionUsuario = {
  notificacionesPush: true,
  notificacionesEmail: true,
  notificaciones: {
    pedidos: true,
    ofertas: false,
    promociones: false,
    resenasNuevas: true,
    conexiones: true,
    recordatorios: false,
    modoNoMolestar: false,
    horaInicioNoMolestar: 23,
    horaFinNoMolestar: 7,
    frecuenciaEmail: 'semanal',
    emailResumen: true,
    eventos: true,
  },
}

export default function NotificationsScreen() {
  const navigation = useNavigation<any>()
  const [config, setConfig] = useState<ConfiguracionUsuario>(initialConfig)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const colors = useColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const updateTopLevel = async <K extends keyof ConfiguracionUsuario>(key: K, value: ConfiguracionUsuario[K]) => {
    setConfig((c) => ({ ...c, [key]: value }))
    if (!user) return
    try {
      await persist({ ...config, [key]: value })
    } catch (e) {
      showError('No se pudo actualizar la configuración')
    }
  }

  const updateNotificaciones = async (patch: Partial<NotificacionesConfig>) => {
    setConfig((c) => ({ ...c, notificaciones: { ...c.notificaciones, ...patch } }))
    if (!user) return
    try {
      await persist({ ...config, notificaciones: { ...config.notificaciones, ...patch } })
    } catch (e) {
      showError('No se pudo actualizar las notificaciones')
    }
  }

  const persist = async (cfg: ConfiguracionUsuario) => {
    if (!user) return
    const backend: any = {
      notificaciones_push: cfg.notificacionesPush,
      notificaciones_email: cfg.notificacionesEmail,
      pedidos: cfg.notificaciones.pedidos,
      ofertas: cfg.notificaciones.ofertas,
      promociones: cfg.notificaciones.promociones,
      resenas_nuevas: cfg.notificaciones.resenasNuevas,
      conexiones: cfg.notificaciones.conexiones,
      recordatorios: cfg.notificaciones.recordatorios,
      modo_no_molestar: cfg.notificaciones.modoNoMolestar,
      hora_inicio_no_molestar: cfg.notificaciones.horaInicioNoMolestar,
      hora_fin_no_molestar: cfg.notificaciones.horaFinNoMolestar,
      frecuencia_email: cfg.notificaciones.frecuenciaEmail,
      email_resumen: cfg.notificaciones.emailResumen,
      eventos: cfg.notificaciones.eventos,
    }
    await updateUserNotificationSettings(user.id, backend)
  }

  const fromBackend = (row: any): ConfiguracionUsuario => ({
    notificacionesPush: row.notificaciones_push,
    notificacionesEmail: row.notificaciones_email,
    notificaciones: {
      pedidos: row.pedidos,
      ofertas: row.ofertas,
      promociones: row.promociones,
      resenasNuevas: row.resenas_nuevas,
      conexiones: row.conexiones,
      recordatorios: row.recordatorios,
      modoNoMolestar: row.modo_no_molestar,
      horaInicioNoMolestar: row.hora_inicio_no_molestar ?? 23,
      horaFinNoMolestar: row.hora_fin_no_molestar ?? 7,
      frecuenciaEmail: row.frecuencia_email || 'semanal',
      emailResumen: row.email_resumen,
      eventos: row.eventos,
    },
  })

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      try {
        const row = await getUserNotificationSettings(user.id)
        if (row) setConfig(fromBackend(row))
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false)
      }
    }
     load()
  }, [user])

  const showSuccess = (msg: string) => {
    Alert.alert('✔️ Éxito', msg)
  }

  const showError = (msg: string) => {
    Alert.alert('❌ Error', msg)
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`

  const mostrarSelectorFrecuencia = () => {
    // Simplified: prompt a choice via Alert (replace with bottom sheet/modal if desired)
    Alert.alert('Frecuencia de emails', 'Selecciona frecuencia', [
      { text: 'Nunca', onPress: () => updateNotificaciones({ frecuenciaEmail: 'nunca' }) },
      { text: 'Diaria', onPress: () => updateNotificaciones({ frecuenciaEmail: 'diario' }) },
      { text: 'Semanal', onPress: () => updateNotificaciones({ frecuenciaEmail: 'semanal' }) },
      { text: 'Mensual', onPress: () => updateNotificaciones({ frecuenciaEmail: 'mensual' }) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  const probarNotificacion = () => {
    // Simulación de notificación de prueba
    Alert.alert('Prueba', '📱 Notificación de prueba enviada')
  }

  const verHistorial = () => {
    // Navigate to a history screen if exists
    navigation.navigate?.('NotificationHistory' as any)
  }

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.infoBox}>
        <Icon name="info-outline" />
        <View style={{ width: 12 }} />
    <Text style={[styles.infoText, { color: colors.info }]}>Personaliza qué notificaciones quieres recibir y cuándo.</Text>
      </View>

      <View style={{ height: 20 }} />

      <Section title="Notificaciones Push" subtitle="Recibe alertas en tu dispositivo">
        <SettingItem
          title="Notificaciones Push"
          subtitle={config.notificacionesPush ? 'Activadas' : 'Desactivadas'}
          hasToggle
          toggleValue={config.notificacionesPush}
          onToggleChange={(v) => updateTopLevel('notificacionesPush', v)}
        />

        {config.notificacionesPush && (
          <>
            <View style={{ height: 8 }} />
            <SettingItem title="Estado de pedidos" subtitle="Confirmación, preparación, entrega" hasToggle toggleValue={config.notificaciones.pedidos} onToggleChange={(v) => updateNotificaciones({ pedidos: v })} icon="delivery-dining" />
            <SettingItem title="Ofertas y promociones" subtitle="Descuentos especiales" hasToggle toggleValue={config.notificaciones.ofertas} onToggleChange={(v) => updateNotificaciones({ ofertas: v })} icon="local-offer" />
            <SettingItem title="Nuevos restaurantes" subtitle="Locales nuevos en tu zona" hasToggle toggleValue={config.notificaciones.promociones} onToggleChange={(v) => updateNotificaciones({ promociones: v })} icon="restaurant-menu" />
            <SettingItem title="Reseñas y actividad" subtitle="Nuevas reseñas y respuestas" hasToggle toggleValue={config.notificaciones.resenasNuevas} onToggleChange={(v) => updateNotificaciones({ resenasNuevas: v })} icon="rate-review" />
            <SettingItem title="Conexiones sociales" subtitle="Nuevos seguidores y amigos" hasToggle toggleValue={config.notificaciones.conexiones} onToggleChange={(v) => updateNotificaciones({ conexiones: v })} icon="people" />
            <SettingItem title="Recordatorios" subtitle="Reseñas pendientes, lugares favoritos" hasToggle toggleValue={config.notificaciones.recordatorios} onToggleChange={(v) => updateNotificaciones({ recordatorios: v })} icon="alarm" />
          </>
        )}
      </Section>

      <View style={{ height: 20 }} />

      <Section title="Notificaciones por Email" subtitle="Recibe información en tu correo">
        <SettingItem title="Notificaciones por Email" subtitle={config.notificacionesEmail ? 'Activadas' : 'Desactivadas'} hasToggle toggleValue={config.notificacionesEmail} onToggleChange={(v) => updateTopLevel('notificacionesEmail', v)} icon="mail-outline" />

        {config.notificacionesEmail && (
          <>
            <View style={{ height: 8 }} />
            <SettingItem title="Resumen semanal" subtitle="Tu actividad y recomendaciones" hasToggle toggleValue={config.notificaciones.emailResumen} onToggleChange={(v) => updateNotificaciones({ emailResumen: v })} icon="summarize" />
            <SettingItem title="Ofertas especiales" subtitle="Promociones por email" hasToggle toggleValue={config.notificaciones.ofertas} onToggleChange={(v) => updateNotificaciones({ ofertas: v })} icon="star" />
            <SettingItem title="Novedades de la app" subtitle="Nuevas funciones y actualizaciones" hasToggle toggleValue={config.notificaciones.eventos} onToggleChange={(v) => updateNotificaciones({ eventos: v })} icon="new-releases" />
            <SettingItem title="Frecuencia de emails" subtitle={formatFrequency(config.notificaciones.frecuenciaEmail)} onPress={mostrarSelectorFrecuencia} icon="schedule" />
          </>
        )}
      </Section>

      <View style={{ height: 20 }} />

      <Section title="Configuración en la App" subtitle="Sonidos, vibración y horarios">
        <SettingItem title="Notificaciones en la app" subtitle="Siempre activadas para mejor experiencia" onPress={() => showSuccess('Las notificaciones en la app están siempre activadas')} icon="notifications-none" />
        <SettingItem title="Sonidos" subtitle="Configurado por el sistema" onPress={() => showSuccess('Los sonidos se configuran desde ajustes del sistema')} icon="volume-up" />
        <SettingItem title="Vibración" subtitle="Configurado por el sistema" onPress={() => showSuccess('La vibración se configura desde ajustes del sistema')} icon="vibration" />
      </Section>

      <View style={{ height: 20 }} />

      <Section title="Modo No Molestar" subtitle="Configura horarios sin notificaciones">
        <SettingItem title="Modo No Molestar" subtitle={config.notificaciones.modoNoMolestar ? `Activado de ${formatHour(config.notificaciones.horaInicioNoMolestar)} a ${formatHour(config.notificaciones.horaFinNoMolestar)}` : 'Desactivado'} hasToggle toggleValue={config.notificaciones.modoNoMolestar} onToggleChange={(v) => updateNotificaciones({ modoNoMolestar: v })} icon="bedtime" />

        {config.notificaciones.modoNoMolestar && (
          <>
            <View style={{ height: 8 }} />
            <SettingItem title="Hora de inicio" subtitle={formatHour(config.notificaciones.horaInicioNoMolestar)} onPress={() => showSuccess('Seleccionar hora de inicio (pendiente de implementación)')} icon="access-time" />
            <SettingItem title="Hora de fin" subtitle={formatHour(config.notificaciones.horaFinNoMolestar)} onPress={() => showSuccess('Seleccionar hora de fin (pendiente de implementación)')} icon="access-time" />
          </>
        )}
      </Section>

      <View style={{ height: 20 }} />

      <Section title="Vista Previa" subtitle="Prueba cómo se ven las notificaciones">
        <SettingItem title="Probar notificación push" subtitle="Enviar una notificación de prueba" onPress={probarNotificacion} icon="send" />
        <SettingItem title="Ver historial" subtitle="Últimas notificaciones recibidas" onPress={verHistorial} icon="history" />
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

// Local UI primitives replaced by shared `Section` and `SettingItem` components.

function formatFrequency(f: NotificacionesConfig['frecuenciaEmail']) {
  switch (f) {
    case 'nunca':
      return 'Nunca'
    case 'diario':
      return 'Diaria'
    case 'semanal':
      return 'Semanal'
    case 'mensual':
      return 'Mensual'
    default:
      return 'Semanal'
  }
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: SpoonColors.withOpacity(colors.info, 0.08), borderColor: SpoonColors.withOpacity(colors.info, 0.3), borderWidth: 1 },
  infoText: { marginLeft: 8 },
})


