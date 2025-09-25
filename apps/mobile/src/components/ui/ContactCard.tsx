import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet, } from 'react-native'

import Icon from '../Icon'
import { useColors } from '../../design-system'

type Props = {
  icon: string
  title: string
  subtitle?: string
  color?: string
  onPress?: () => void
}

export default function ContactCard({ icon, title, subtitle, color, onPress }: Props) {
  const colors = useColors()
  const accent = color ?? colors.primaryDark
  return (
    <TouchableOpacity style={[styles.card, { borderColor: colors.borderLight, backgroundColor: colors.surface }]} onPress={onPress}>
      <Icon name={icon as any} size={24} color={accent} />
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  title: { fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 12, marginTop: 4 },
})

