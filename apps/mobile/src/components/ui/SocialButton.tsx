import React from 'react'
import { TouchableOpacity, Text, StyleSheet, } from 'react-native'

import Icon from '../Icon'
import { useColors } from '../../design-system'

type Props = {
  name: string
  username: string
  icon?: string
  color?: string
  onPress?: () => void
}

export default function SocialButton({ name, username, icon = 'public', color, onPress }: Props) {
  const colors = useColors()
  const accent = color ?? colors.primaryDark
  return (
    <TouchableOpacity style={[styles.button, { borderColor: colors.borderLight, backgroundColor: colors.surface }]} onPress={onPress ?? (() => {})}>
      <Icon name={icon} size={20} color={accent} />
      <Text style={[styles.name, { color: accent }]}>{name}</Text>
      <Text style={[styles.username, { color: colors.textSecondary }]}>{username}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  name: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  username: { fontSize: 10, opacity: 0.8 },
})

