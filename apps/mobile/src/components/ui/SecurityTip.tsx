import React from 'react'
import { View, Text, StyleSheet, } from 'react-native'

import { useColors } from '../../design-system'

type Props = { text: string }

export default function SecurityTip({ text }: Props) {
  const colors = useColors()
  return (
    <View style={styles.row}>
  <Text style={[styles.bullet, { color: colors.textSecondary }]}>•</Text>
  <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  bullet: { marginRight: 8 },
  text: { lineHeight: 20 },
})

