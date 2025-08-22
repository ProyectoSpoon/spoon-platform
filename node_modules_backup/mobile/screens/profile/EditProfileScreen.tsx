import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.headerButtonText}>GUARDAR</Text>
            )}
          </TouchableOpacity>
        ) : null,
    })
  }, [navigation, hasChanges, isLoading])

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
        await new Promise(res => setTimeout(res, 700))
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Foto de perfil</Text>
          <View style={styles.photoRow}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.changePhotoButton} onPress={onChangePhoto}>
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categorías favoritas</Text>
          <Text style={styles.helperText}>Selecciona tus tipos de comida favoritos</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map(cat => {
              const selected = categories.includes(cat)
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleCategory(cat)}
                  style={[styles.chip, selected ? styles.chipSelected : null]}
                >
                  <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {categories.length > 0 && <Text style={styles.selectedCount}>{categories.length} seleccionada{categories.length !== 1 ? 's' : ''}</Text>}
        </View>

        <View style={{ height: 24 }} />

        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={[styles.primaryButton, (!hasChanges || isLoading) ? styles.primaryButtonDisabled : null]}
            onPress={onSavePress}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Guardar cambios</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlinedButton} onPress={onCancel} disabled={isLoading}>
            <Text style={styles.outlinedButtonText}>Cancelar</Text>
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
    backgroundColor: '#f7f7f7',
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 28, color: '#fff', fontWeight: '700' },
  photoActions: { marginLeft: 12, flex: 1 },
  changePhotoButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#eee' },
  changePhotoText: { color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  helperText: { color: '#666', fontSize: 13, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#E67E22' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#fff' },
  selectedCount: { marginTop: 8, color: '#E67E22', fontSize: 12, fontWeight: '500' },
  primaryButton: { backgroundColor: '#E67E22', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  outlinedButton: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, alignItems: 'center' },
  outlinedButtonText: { color: '#333' },
  headerButton: { marginRight: 12, padding: 8 },
  headerButtonText: { color: '#fff', fontWeight: '700' },
})
