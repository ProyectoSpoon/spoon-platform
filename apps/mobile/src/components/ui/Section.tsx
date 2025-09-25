import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '../../design-system'

type Props = {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export default function Section({ title, subtitle, children }: Props) {
  const colors = useColors()
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }] }>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <View>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingVertical: 10 },
  header: { paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 },
  title: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 2 },
})

