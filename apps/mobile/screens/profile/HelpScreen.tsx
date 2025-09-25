import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native'

import Icon from '../../src/components/Icon'
import { copyToClipboard } from '../../src/utils/ui'
import { ContactCard } from '../../src/components/ui'
import { useColors, SpoonColors } from '../../src/design-system'
import { useNavigation } from '@react-navigation/native'

type Categoria = { id: string; titulo: string; icono: string; descripcion: string; color: string }
type FAQ = { categoria: string; pregunta: string; respuesta: string }

export default function HelpScreen() {
  const navigation = useNavigation<any>()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const colors = useColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const categorias: Categoria[] = [
  { id: 'cuenta', titulo: 'Cuenta y Perfil', icono: 'account-circle', descripcion: 'Gestión de cuenta, perfil y configuración', color: colors.info },
  { id: 'pedidos', titulo: 'Pedidos y Entregas', icono: 'local-shipping', descripcion: 'Realizar pedidos, seguimiento y entregas', color: colors.primaryDark },
  { id: 'pagos', titulo: 'Pagos y Facturación', icono: 'payment', descripcion: 'Métodos de pago, facturas y reembolsos', color: colors.success },
  { id: 'restaurantes', titulo: 'Restaurantes', icono: 'restaurant', descripcion: 'Búsqueda, reseñas y favoritos', color: colors.secondary },
  { id: 'tecnico', titulo: 'Problemas Técnicos', icono: 'build', descripcion: 'App, notificaciones y errores', color: colors.error },
  { id: 'privacidad', titulo: 'Privacidad y Seguridad', icono: 'security', descripcion: 'Datos personales y seguridad', color: colors.secondaryDark },
  ]

  const preguntasFrecuentes: FAQ[] = [
    { categoria: 'cuenta', pregunta: '¿Cómo cambio mi foto de perfil?', respuesta: 'Ve a Configuración > Editar Perfil > toca tu foto actual > selecciona "Cambiar foto" > elige desde galería o tomar nueva foto.' },
    { categoria: 'cuenta', pregunta: '¿Puedo cambiar mi email registrado?', respuesta: 'Sí, ve a Configuración > Editar Perfil > Email > introduce tu nuevo email. Recibirás un código de verificación.' },
    { categoria: 'cuenta', pregunta: '¿Cómo elimino mi cuenta?', respuesta: 'Ve a Configuración > Seguridad > Eliminar cuenta. Ten en cuenta que esta acción es irreversible.' },
    { categoria: 'pedidos', pregunta: '¿Cómo hago un pedido?', respuesta: 'Busca el restaurante, selecciona los platos, agrégalos al carrito, revisa tu pedido y confirma el pago.' },
    { categoria: 'pedidos', pregunta: '¿Puedo cancelar un pedido?', respuesta: 'Puedes cancelar hasta 5 minutos después de confirmar. Ve a "Mis Pedidos" > selecciona el pedido > "Cancelar".' },
    { categoria: 'pedidos', pregunta: '¿Cómo sigo mi pedido?', respuesta: 'Ve a "Mis Pedidos" para ver el estado en tiempo real. También recibirás notificaciones automáticas.' },
    { categoria: 'pagos', pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Aceptamos tarjetas de crédito/débito, PSE, Nequi, Daviplata y pago en efectivo.' },
    { categoria: 'pagos', pregunta: '¿Cómo solicito un reembolso?', respuesta: 'Ve a "Mis Pedidos" > selecciona el pedido > "Reportar problema" > "Solicitar reembolso". Se procesa en 3-5 días hábiles.' },
    { categoria: 'restaurantes', pregunta: '¿Cómo busco restaurantes cerca de mí?', respuesta: 'Usa el buscador en la pantalla principal o activa tu ubicación para ver restaurantes cercanos automáticamente.' },
    { categoria: 'restaurantes', pregunta: '¿Cómo escribo una reseña?', respuesta: 'Después de recibir tu pedido, ve a "Mis Pedidos" > selecciona el pedido > "Escribir reseña".' },
    { categoria: 'tecnico', pregunta: 'La app se cierra inesperadamente', respuesta: 'Reinicia la app, verifica que tengas la última versión, reinicia tu dispositivo. Si persiste, contáctanos.' },
    { categoria: 'tecnico', pregunta: 'No recibo notificaciones', respuesta: 'Ve a Configuración > Notificaciones > verifica que estén activadas. También revisa los permisos en tu dispositivo.' },
    { categoria: 'privacidad', pregunta: '¿Cómo protegen mis datos?', respuesta: 'Usamos encriptación de extremo a extremo y cumplimos con estándares internacionales de protección de datos.' },
  ]

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return preguntasFrecuentes
    return preguntasFrecuentes.filter((f) => f.pregunta.toLowerCase().includes(q) || f.respuesta.toLowerCase().includes(q))
  }, [searchQuery])

  const abrirChat = () => {
    Alert.alert('Chat', '💬 Abriendo chat en vivo...')
  }

  const abrirWhatsApp = () => {
    const numero = '+57 300 123 4567'
  copyToClipboard(numero, `📱 Número copiado: ${numero}`)
  }

  const enviarEmail = () => {
    const email = 'ayuda@spoon.app'
  copyToClipboard(email, `📧 Email copiado: ${email}`)
  }

  const llamar = () => {
    const telefono = '(057) 123-4567'
  copyToClipboard(telefono, `📞 Teléfono copiado: ${telefono}`)
  }

  const abrirTutorial = (tipo: string) => {
    Alert.alert('Tutorial', `🎥 Abriendo tutorial ${tipo}...`)
  }

  const abrirBlog = () => {
    const url = 'https://blog.spoon.app'
  copyToClipboard(url, `🔗 URL copiada: ${url}`)
  }

  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>¡Hola! ¿En qué podemos ayudarte?</Text>
          <Text style={styles.heroSubtitle}>Encuentra respuestas rápidas o contacta a nuestro equipo de soporte.</Text>
        </View>
        <View style={styles.heroIconBox}>
      <Icon name="help-outline" size={32} color={colors.textOnPrimary} />
        </View>
      </View>

      <View style={{ height: 24 }} />

      <View style={styles.searchCard}>
        <TextInput
          value={searchQuery}
          onChangeText={(t) => { setSearchQuery(t); setIsSearching(t.trim().length > 0) }}
          placeholder="Buscar en el centro de ayuda..."
          style={styles.searchInput}
        />
      </View>

      <View style={{ height: 24 }} />

      {!isSearching && (
        <>
          <Text style={styles.sectionTitle}>Contacto Rápido</Text>
          <View style={{ height: 12 }} />
          <View style={styles.contactRow}>
            <ContactCard icon="chat-bubble" title="Chat en Vivo" subtitle="Respuesta inmediata" color={colors.success} onPress={abrirChat} />
            <View style={{ width: 12 }} />
            <ContactCard icon="message" title="WhatsApp" subtitle="+57 300 123 4567" color={colors.success} onPress={abrirWhatsApp} />
          </View>

          <View style={{ height: 12 }} />
          <View style={styles.contactRow}>
            <ContactCard icon="email" title="Email" subtitle="ayuda@spoon.app" color={colors.info} onPress={enviarEmail} />
            <View style={{ width: 12 }} />
            <ContactCard icon="phone" title="Teléfono" subtitle="(057) 123-4567" color={colors.primaryDark} onPress={llamar} />
          </View>

          <View style={{ height: 32 }} />

          <Text style={styles.sectionTitle}>Categorías de Ayuda</Text>
          <View style={{ height: 12 }} />
          <View style={styles.categoriesGrid}>
            {categorias.map((c) => (
              <TouchableOpacity key={c.id} style={styles.categoryItem} onPress={() => setSelectedCategory(c)}>
                <View style={[styles.categoryIcon, { backgroundColor: `${c.color}20` }]}>
                  <Icon name={c.icono as any} size={20} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>{c.titulo}</Text>
                  <Text style={styles.categorySubtitle}>{c.descripcion}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </>
      )}

      <Text style={styles.sectionTitle}>{isSearching ? `Resultados de búsqueda (${filteredFAQs.length})` : 'Preguntas Frecuentes'}</Text>
      <View style={{ height: 12 }} />

      {filteredFAQs.length === 0 ? (
        <View style={styles.emptyState}>
      <Icon name="search-off" size={64} color={SpoonColors.grey300} />
          <Text style={styles.emptyTitle}>No encontramos resultados</Text>
          <Text style={styles.emptySubtitle}>Intenta con otras palabras clave o contacta a nuestro equipo de soporte.</Text>
        </View>
      ) : (
        <View>
          {filteredFAQs.map((faq, idx) => (
            <TouchableOpacity key={`${faq.pregunta}-${idx}`} style={styles.faqItem} onPress={() => setExpandedFAQ(expandedFAQ === faq.pregunta ? null : faq.pregunta)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="help-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.faqQuestion}>{faq.pregunta}</Text>
              </View>
              {expandedFAQ === faq.pregunta && <Text style={styles.faqAnswer}>{faq.respuesta}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isSearching && (
        <>
          <View style={{ height: 32 }} />
          <Text style={styles.sectionTitle}>Recursos Adicionales</Text>
          <View style={{ height: 12 }} />
          <View style={styles.sectionCard}>
            <TouchableOpacity onPress={() => abrirTutorial('basico')} style={styles.navItem}><Text style={styles.navTitle}>Tutorial de primeros pasos</Text><Icon name="chevron-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={() => abrirTutorial('avanzado')} style={styles.navItem}><Text style={styles.navTitle}>Guía de uso avanzado</Text><Icon name="chevron-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={() => navigation.navigate?.('TermsConditions')} style={styles.navItem}><Text style={styles.navTitle}>Términos y condiciones</Text><Icon name="chevron-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={abrirBlog} style={styles.navItem}><Text style={styles.navTitle}>Blog de Spoon</Text><Icon name="chevron-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity onPress={() => navigation.navigate?.('ContactSupport')} style={styles.navItem}><Text style={styles.navTitle}>Formulario de contacto detallado</Text><Icon name="chevron-right" size={20} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        </>
      )}

      <Modal visible={!!selectedCategory} animationType="slide" onRequestClose={() => setSelectedCategory(null)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{selectedCategory?.titulo}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}><Icon name="close" size={22} color={colors.textSecondary}/></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}>
              <Text style={{ color: colors.textSecondary }}>{selectedCategory?.descripcion}</Text>
            </View>
            <View style={{ height: 16 }} />
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Artículos relacionados</Text>
              <Text style={{ color: colors.textSecondary }}>Los artículos específicos de esta categoría se cargarán aquí. Esta funcionalidad se puede expandir con contenido dinámico del backend.</Text>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={styles.primaryButton} onPress={() => { setSelectedCategory(null); navigation.navigate?.('ContactSupport') }}>
                <Text style={styles.primaryLabel}>Ir al formulario de contacto</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}
const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  heroCard: { padding: 20, borderRadius: 16, backgroundColor: colors.primaryDark, flexDirection: 'row', alignItems: 'center' },
  heroTitle: { color: colors.textOnPrimary, fontSize: 20, fontWeight: '700' },
  heroSubtitle: { color: SpoonColors.withOpacity(colors.textOnPrimary, 0.9), marginTop: 8 },
  heroIconBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: SpoonColors.withOpacity(colors.textOnPrimary, 0.2), justifyContent: 'center', alignItems: 'center' },
  searchCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.borderLight },
  searchInput: { padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  contactRow: { flexDirection: 'row' },
  categoriesGrid: { marginTop: 8 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 8 },
  categoryIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryTitle: { fontWeight: '700' },
  categorySubtitle: { color: colors.textSecondary, fontSize: 12 },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
  faqItem: { backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 8 },
  faqQuestion: { marginLeft: 8, fontWeight: '600' },
  faqAnswer: { marginTop: 8, color: colors.textSecondary, lineHeight: 20 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  navItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  navTitle: { fontWeight: '600' },
  primaryButton: { backgroundColor: colors.primaryDark, padding: 12, borderRadius: 8, alignItems: 'center' },
  primaryLabel: { color: colors.textOnPrimary, fontWeight: '700' },
})


