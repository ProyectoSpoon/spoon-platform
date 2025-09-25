import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, } from 'react-native'
import { useColors, SpoonColors, SpoonShadows } from '../../src/design-system'
import { socialColors } from '../../src/design-system/constants/socialColors'

import Icon from '../../src/components/Icon'
import { copyToClipboard } from '../../src/utils/ui'
import { ContactCard } from '../../src/components/ui'

type Categoria = { id: string; titulo: string; icono: string }
type Prioridad = { id: string; titulo: string; descripcion: string; color: string }

export default function ContactSupportScreen() {
  const colors = useColors()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [categoria, setCategoria] = useState('general')
  const [prioridad, setPrioridad] = useState('media')
  const [enviando, setEnviando] = useState(false)

  const categorias: Categoria[] = [
    { id: 'general', titulo: 'Consulta General', icono: 'help-outline' },
    { id: 'pedido', titulo: 'Problema con Pedido', icono: 'local-shipping' },
    { id: 'pago', titulo: 'Problema de Pago', icono: 'payment' },
    { id: 'cuenta', titulo: 'Problema de Cuenta', icono: 'account-circle' },
    { id: 'tecnico', titulo: 'Problema Técnico', icono: 'bug-report' },
    { id: 'sugerencia', titulo: 'Sugerencia', icono: 'lightbulb' },
  ]

  const prioridades: Prioridad[] = [
    { id: 'baja', titulo: 'Baja', descripcion: 'No es urgente', color: colors.success },
    { id: 'media', titulo: 'Media', descripcion: 'Importante', color: colors.warning },
    { id: 'alta', titulo: 'Alta', descripcion: 'Urgente', color: colors.error },
  ]

  function validarEmail(value: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
  }

  const enviarSolicitud = async () => {
    if (!nombre.trim()) return Alert.alert('Error', 'El nombre es requerido')
    if (!email.trim()) return Alert.alert('Error', 'El email es requerido')
    if (!validarEmail(email)) return Alert.alert('Error', 'Ingresa un email válido')
    if (!asunto.trim()) return Alert.alert('Error', 'El asunto es requerido')
    if (!mensaje.trim()) return Alert.alert('Error', 'La descripción es requerida')
    if (mensaje.length < 20) return Alert.alert('Error', 'La descripción debe tener al menos 20 caracteres')

    setEnviando(true)
    // Simula envío
    setTimeout(() => {
      setEnviando(false)
      const ticket = `SP${Date.now().toString().slice(-6)}`
      Alert.alert('¡Solicitud Enviada!', `Hemos recibido tu solicitud de soporte.\nNúmero de ticket: #${ticket}`, [
        { text: 'Entendido' },
      ])
      // limpiar formulario
      setNombre('')
      setEmail('')
      setAsunto('')
      setMensaje('')
      setCategoria('general')
      setPrioridad('media')
    }, 1200)
  }

  const abrirChat = () => {
    Alert.alert('Chat', '💬 Abriendo chat en vivo...')
  }

  const copiarWhatsApp = () => {
    const numero = '+57 300 123 4567'
    copyToClipboard(numero, `📱 Número de WhatsApp copiado`)
  }

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.infoBox, { backgroundColor: SpoonColors.withOpacity(colors.info,0.12), borderColor: SpoonColors.withOpacity(colors.info,0.35) }]}>
        <Icon name="support-agent" size={20} color={colors.info} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.infoTitle, { color: colors.info }]}>Estamos aquí para ayudarte</Text>
          <Text style={[styles.infoSubtitle, { color: colors.info }]}>Responderemos en menos de 24 horas.</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />

  <View style={[styles.sectionCard, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
        <View style={styles.sectionHeader}>
          <Icon name="person" size={20} color={colors.primaryDark} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Información de Contacto</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
      </View>

      <View style={{ height: 24 }} />

  <View style={[styles.sectionCard, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
        <View style={styles.sectionHeader}>
          <Icon name="category" size={20} color={colors.primaryDark} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categoría del Problema</Text>
        </View>
        <Text style={styles.helperText}>Selecciona la categoría que mejor describe tu consulta:</Text>
        <View style={{ height: 12 }} />
        <View style={styles.wrapRow}>
          {categorias.map((c) => {
            const selected = c.id === categoria
            return (
              <TouchableOpacity key={c.id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setCategoria(c.id)}>
                <Icon name={c.icono as any} size={14} color={selected ? colors.primaryDark : colors.textSecondary} />
                <Text style={[styles.chipText, { color: selected ? colors.primaryDark : colors.textSecondary }]}>{c.titulo}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={{ height: 24 }} />

  <View style={[styles.sectionCard, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
        <View style={styles.sectionHeader}>
          <Icon name="priority-high" size={20} color={colors.primaryDark} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Prioridad</Text>
        </View>
        {prioridades.map((p) => (
          <TouchableOpacity key={p.id} style={styles.radioRow} onPress={() => setPrioridad(p.id)}>
            <View style={[styles.radio, prioridad === p.id && { borderColor: p.color }]}>
              {prioridad === p.id ? <View style={[styles.radioDot, { backgroundColor: p.color }]} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>{p.titulo}</Text>
              <Text style={{ color: colors.textSecondary }}>{p.descripcion}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 24 }} />

  <View style={[styles.sectionCard, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
        <View style={styles.sectionHeader}>
          <Icon name="description" size={20} color={colors.primaryDark} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Detalles del Problema</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Asunto"
          value={asunto}
          onChangeText={setAsunto}
        />
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="Describe tu problema con el mayor detalle posible..."
          value={mensaje}
          onChangeText={setMensaje}
          multiline
        />
      </View>

      <View style={{ height: 24 }} />

      <View style={[styles.infoNote, { backgroundColor: SpoonColors.withOpacity(colors.warning,0.12), borderColor: SpoonColors.withOpacity(colors.warning,0.35) }]}>
        <Icon name="info-outline" size={18} color={colors.warning} />
        <View style={{ marginLeft: 8 }}>
          <Text style={[styles.infoNoteTitle, { color: colors.warning }]}>Información que nos ayuda</Text>
          <Text style={[styles.infoNoteText, { color: colors.warning }]}>• Incluye capturas de pantalla si es posible{'\n'}• Menciona el modelo de tu dispositivo{'\n'}• Describe los pasos que llevaron al problema{'\n'}• Indica si el problema es recurrente</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />

      <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primaryDark }, enviando && styles.disabledButton]} disabled={enviando} onPress={enviarSolicitud}>
        <Text style={[styles.submitLabel, { color: colors.textOnPrimary }]}>{enviando ? 'Enviando...' : 'Enviar Solicitud'}</Text>
      </TouchableOpacity>

      <View style={{ height: 16 }} />

  <View style={[styles.sectionCard, { backgroundColor: colors.surface, ...SpoonShadows.card() }]}> 
  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Otros métodos de contacto</Text>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <ContactCard icon="chat" title="Chat en Vivo" subtitle="Disponible 24/7" color={colors.success} onPress={abrirChat} />
          <View style={{ width: 12 }} />
          <ContactCard icon="message" title="WhatsApp" subtitle="+57 300 123 4567" color={socialColors.whatsapp} onPress={copiarWhatsApp} />
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  infoTitle: { fontWeight: '700', fontSize: 15 },
  infoSubtitle: { fontSize: 13 },
  sectionCard: { borderRadius: 12, padding: 12, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700' },
  input: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1 },
  helperText: { marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipSelected: { borderWidth: 1 },
  chipText: { marginLeft: 8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  infoNote: { borderRadius: 12, padding: 12, borderWidth: 1 },
  infoNoteTitle: { fontWeight: '700' },
  infoNoteText: { marginTop: 6 },
  submitButton: { padding: 14, borderRadius: 10, alignItems: 'center' },
  submitLabel: { fontWeight: '700' },
  disabledButton: { opacity: 0.6 },
  quickContact: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
})


