import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'

import Icon from '../../src/components/Icon'
import SettingItem from '../../src/components/ui/SettingItem'
import { useNavigation } from '@react-navigation/native'
import { useColors, SpoonColors } from '../../src/design-system'
import { useAuth } from '../../src/hooks/useAuth'
import { getUserPreferences, updateUserPreferences } from '../../src/lib/supabase'

type PreferenciasConfig = {
  idioma: string
  region: string
}

const defaultPreferences: PreferenciasConfig = {
  idioma: 'es',
  region: 'CO',
}

export default function PreferencesScreen() {
  const navigation = useNavigation<any>()
  const colors = useColors()
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [current, setCurrent] = useState<PreferenciasConfig>(defaultPreferences)
  const [original, setOriginal] = useState<PreferenciasConfig>(defaultPreferences)
  const { user } = useAuth()

  const idiomas: Record<string, string> = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    pt: 'Português',
  }

  const regiones: Record<string, string> = {
    CO: 'Colombia',
    US: 'Estados Unidos',
    MX: 'México',
    ES: 'España',
    AR: 'Argentina',
    PE: 'Perú',
    CL: 'Chile',
    EC: 'Ecuador',
  }

  useEffect(() => {
    // Initialize preferences (replace with provider read when wiring to global state)
    initializePreferences()
  }, [])

  useEffect(() => {
    checkForChanges()
  }, [current, original])

  async function initializePreferences() {
    if (!user) return;
    setIsLoading(true)
    try {
      const prefs = await getUserPreferences(user.id)
      if (prefs) {
        const loaded = { idioma: prefs.idioma, region: prefs.region }
        setOriginal(loaded)
        setCurrent(loaded)
      } else {
        setOriginal(defaultPreferences)
        setCurrent(defaultPreferences)
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar tus preferencias')
    } finally {
      setIsLoading(false)
    }
  }

  function checkForChanges() {
    const changed = current.idioma !== original.idioma || current.region !== original.region
    if (changed !== hasChanges) setHasChanges(changed)
  }

  function mostrarSelectorIdioma() {
    const buttons = Object.keys(idiomas).map((key) => ({
      text: idiomas[key],
      onPress: () => setCurrent((c) => ({ ...c, idioma: key })),
    })) as Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;

    buttons.push({ text: 'Cancelar', style: 'cancel' })

    Alert.alert('Seleccionar idioma', undefined, buttons)
  }

  function mostrarSelectorRegion() {
    // Build actions list (Alert has limited actions on mobile; for long lists replace with modal)
    const entries = Object.keys(regiones).map((k) => ({ key: k, label: regiones[k] }))
    // For safety on long lists show a modal-like Alert with first 5 and a 'Ver más' option
    if (entries.length <= 6) {
  const buttons = entries.map((e) => ({ text: e.label, onPress: () => setCurrent((c) => ({ ...c, region: e.key })) })) as Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  buttons.push({ text: 'Cancelar', style: 'cancel' })
  Alert.alert('Seleccionar región', undefined, buttons)
      return
    }

    // If many entries, show a simple modal list using a custom screen in the future; for now show a prompt
    Alert.alert('Seleccionar región', 'Abrir lista de regiones', [
      { text: 'Abrir', onPress: () => navigation.navigate?.('RegionSelector', { onSelect: (k: string) => setCurrent((c: PreferenciasConfig) => ({ ...c, region: k })) }) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  async function guardarPreferencias() {
    if (!user) return;
    setIsLoading(true)
    try {
      await updateUserPreferences(user.id, { idioma: current.idioma as any, region: current.region })
      setOriginal(current)
      setHasChanges(false)
      Alert.alert('✔️ Preferencias guardadas', 'Tus preferencias se han guardado correctamente')
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar')
    } finally {
      setIsLoading(false)
    }
  }

  function restaurarValoresPorDefecto() {
    Alert.alert('Restaurar valores por defecto', '¿Deseas restaurar a Español - Colombia?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', style: 'destructive', onPress: () => {
  if (!user) return;
  setCurrent(defaultPreferences)
  setHasChanges(true)
  Alert.alert('Restaurado', 'Preferencias restauradas a Español - Colombia')
      } },
    ])
  }

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="language" />
          <View style={{ width: 12 }} />
          <Text style={styles.headerTitle}>Idioma y región</Text>
        </View>

        <View style={{ flex: 1 }} />

        {hasChanges && (
          <TouchableOpacity onPress={guardarPreferencias} disabled={isLoading} style={[styles.saveButton, { backgroundColor: colors.primaryDark }] }>
            {isLoading ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={[styles.saveLabel, { color: colors.textOnPrimary }]}>GUARDAR</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 16 }} />

  <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.borderLight }] }>
        <SettingItem title="Idioma de la aplicación" subtitle={idiomas[current.idioma] ?? 'Español'} onPress={mostrarSelectorIdioma} icon="translate" />

        <View style={{ height: 8 }} />

        <SettingItem title="Región" subtitle={regiones[current.region] ?? 'Colombia'} onPress={mostrarSelectorRegion} icon="public" />

        <View style={[styles.infoBox, { backgroundColor: SpoonColors.withOpacity(colors.info,0.08), borderColor: SpoonColors.withOpacity(colors.info,0.4) }]}>
          <Icon name="info-outline" />
          <View style={{ width: 8 }} />
          <Text style={[styles.infoText, { color: colors.info }]}>El idioma afecta toda la interfaz. La región determina contenido localizado.</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryDark }, hasChanges && !isLoading ? {} : styles.disabledBtn]} onPress={guardarPreferencias} disabled={!hasChanges || isLoading}>
          {isLoading ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={[styles.primaryLabel, { color: colors.textOnPrimary }]}>{isLoading ? 'Guardando...' : 'Guardar preferencias'}</Text>}
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity style={[styles.outlinedBtn, { borderColor: colors.border }]} onPress={restaurarValoresPorDefecto} disabled={isLoading}>
          <Text style={[styles.outlinedLabel, { color: colors.textPrimary }]}>Restaurar valores por defecto</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  saveLabel: { fontWeight: '700' },
  card: { borderRadius: 12, padding: 12, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  rowTitle: { fontWeight: '600' },
  rowSubtitle: { fontSize: 12 },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 8, borderWidth: 1 },
  infoText: { marginLeft: 8, flex: 1 },
  actionsContainer: { marginTop: 8 },
  primaryBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  primaryLabel: { fontWeight: '700' },
  disabledBtn: { opacity: 0.6 },
  outlinedBtn: { borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  outlinedLabel: {},
})


