import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Alert, ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useColors, SpoonColors, SpoonShadows } from '../../src/design-system'

type User = {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  avatar?: string
  initials?: string
  favoriteCategories?: string[]
}

const CATEGORIES = [
  'Pizza',
  'Hamburguesas',
  'Comida Mexicana',
  'Comida China',
  'Comida Italiana',
  'Sopas',
  'Postres',
  'Comida Vegana',
  'Mariscos',
  'Parrilla',
  'Comida Rápida',
  'Comida Saludable',
]

export default function EditProfileScreen() {
  const colors = useColors()
  const navigation = useNavigation()
  const route = useRoute()

  const initialUser: User | undefined = (route as any).params?.user

  const [name, setName] = useState(initialUser?.name ?? '')
  const [email, setEmail] = useState(initialUser?.email ?? '')
  const [phone, setPhone] = useState(initialUser?.phone ?? '')
  const [address, setAddress] = useState(initialUser?.address ?? '')
  const [avatar, setAvatar] = useState<string | undefined>(initialUser?.avatar)
  const [categories, setCategories] = useState<string[]>(initialUser?.favoriteCategories ?? [])

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Determine if there are changes compared to provided initialUser
  useEffect(() => {
    const textChanged =
      name !== (initialUser?.name ?? '') ||
      email !== (initialUser?.email ?? '') ||
      phone !== (initialUser?.phone ?? '') ||
      address !== (initialUser?.address ?? '')
    const categoriesChanged =
      JSON.stringify(categories || []) !== JSON.stringify(initialUser?.favoriteCategories || [])
    setHasChanges(textChanged || categoriesChanged)
  }, [name, email, phone, address, categories, initialUser])

  // Header Save button
  useLayoutEffect(() => {
    navigation.setOptions?.({
      headerRight: () =>
        hasChanges ? (
          <TouchableOpacity onPress={onSavePress} style={styles.headerButton} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.textOnPrimary ?? colors.surface} />
            ) : (
              <Text style={[styles.headerButtonText, { color: colors.primaryDark }]}>GUARDAR</Text>
            )}
          </TouchableOpacity>
        ) : null,
    })
  }, [navigation, hasChanges, isLoading, colors])

  const toggleCategory = useCallback(
    (cat: string) => {
      setCategories(prev => (prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]))
    },
    [setCategories]
  )

  const onChangePhoto = useCallback(() => {
    Alert.alert('Cambiar foto de perfil', undefined, [
      { text: 'Tomar foto', onPress: () => {/* TODO: cámara */} },
      { text: 'Elegir de galería', onPress: () => {/* TODO: galería */} },
      { text: 'Eliminar foto', onPress: () => setAvatar(undefined), style: 'destructive' },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }, [])

  const validate = useCallback(() => {
    if (!name || name.trim().length < 2) {
      Alert.alert('Validación', 'El nombre es requerido y debe tener al menos 2 caracteres')
      return false
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Validación', 'Ingresa un correo electrónico válido')
      return false
    }
    return true
  }, [name, email])

  async function onSavePress() {
    if (!validate()) return
    setIsLoading(true)
    try {
      // If a save callback is passed via route params, use it (e.g., navigator can pass a function)
      const onSave = (route as any).params?.onSave
      const payload: User = {
        ...initialUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar,
        favoriteCategories: categories,
      }

      if (typeof onSave === 'function') {
        await onSave(payload)
      } else {
        // Fallback: show simulated success. Integrate with your API or supabase here.
  await new Promise<void>(res => setTimeout(res, 700))
      }

      Alert.alert('Éxito', 'Perfil actualizado exitosamente')
      navigation.goBack()
    } catch (e) {
      console.error('Error saving profile', e)
      Alert.alert('Error', `No se pudo actualizar el perfil: ${String(e)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Cambios no guardados', 'Tienes cambios sin guardar. ¿Deseas descartarlos?', [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
      ])
    } else {
      navigation.goBack()
    }
  }, [hasChanges, navigation])

  const initials = useMemo(() => {
    if (initialUser?.initials) return initialUser.initials
    if (name) return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
    return ''
  }, [initialUser, name])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
  <View style={[styles.card, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
          <Text style={styles.sectionTitle}>Foto de perfil</Text>
          <View style={styles.photoRow}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.borderLight }]}> 
                <Text style={[styles.avatarInitials, { color: colors.primaryDark }]}>{initials}</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: colors.borderLight }]} onPress={onChangePhoto}>
                <Text style={[styles.changePhotoText, { color: colors.textPrimary }]}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

  <View style={[styles.card, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
          <Text style={styles.sectionTitle}>Información personal</Text>
          <TextInput
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
          <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
          <TextInput placeholder="Teléfono" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          <TextInput placeholder="Dirección" value={address} onChangeText={setAddress} style={[styles.input, { height: 80 }]} multiline />
        </View>

  <View style={[styles.card, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
          <Text style={styles.sectionTitle}>Categorías favoritas</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>Selecciona tus tipos de comida favoritos</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map(cat => {
              const selected = categories.includes(cat)
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  style={[styles.chip, { backgroundColor: selected ? colors.primary : SpoonColors.withOpacity(colors.primary, 0.08) }]}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.textOnPrimary : colors.textPrimary }]}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {categories.length > 0 && <Text style={[styles.selectedCount, { color: colors.warning }]}>{categories.length} seleccionada{categories.length !== 1 ? 's' : ''}</Text>}
        </View>

        <View style={{ height: 24 }} />

        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={[styles.primaryButton, (!hasChanges || isLoading) ? styles.primaryButtonDisabled : null]}
            onPress={onSavePress}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>Guardar cambios</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.outlinedButton, { borderColor: colors.borderLight }]} onPress={onCancel} disabled={isLoading}>
            <Text style={[styles.outlinedButtonText, { color: colors.textPrimary }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 28, fontWeight: '700' },
  photoActions: { marginLeft: 12, flex: 1 },
  changePhotoButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  changePhotoText: {},
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  helperText: { fontSize: 13, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {},
  chipText: {},
  chipTextSelected: {},
  selectedCount: { marginTop: 8, fontSize: 12, fontWeight: '500' },
  primaryButton: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontWeight: '700' },
  outlinedButton: { borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  outlinedButtonText: {},
  headerButton: { marginRight: 12, padding: 8 },
  headerButtonText: { fontWeight: '700' },
})

