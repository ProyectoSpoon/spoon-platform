import React from 'react'
import { View, Text, StyleSheet, } from 'react-native'

import { useColors } from '../../design-system'

type Props = { text: string; met: boolean }

export default function PasswordRequirement({ text, met }: Props) {
  const colors = useColors()
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, met && styles.iconValid]}>{met ? '\u2713' : '\u25cb'}</Text>
      <Text style={[styles.text, { color: met ? colors.success : colors.textSecondary }, met && { fontWeight: '600' }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  icon: { marginRight: 8 },
  iconValid: {},
  text: {},
  textValid: {},
})

