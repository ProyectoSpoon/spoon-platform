import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '../../src/design-system'

import { Section } from '../../src/components/ui'

export default function PrivacyPolicyScreen() {
  const colors = useColors()
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Section title="Política de Privacidad" subtitle="Conoce cómo manejamos tus datos">
        <Text style={[styles.bodyText, { color: colors.textSecondary }] }>
          Nuestra política de privacidad explica qué datos recolectamos, cómo los usamos y
          las opciones que tienes sobre tu información. Revisa los detalles y contacta
          con soporte si tienes dudas.
        </Text>
      </Section>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16 },
  bodyText: { fontSize: 14, lineHeight: 20, marginHorizontal: 20, marginTop: 8 },
})

