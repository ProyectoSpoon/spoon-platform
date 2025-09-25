import React from 'react'
import { View, Text, StyleSheet, } from 'react-native'

import Icon from '../Icon'
import { useColors, SpoonColors } from '../../design-system'

type Props = {
  label: string
  value: string
  icon?: string
}

export default function InfoItem({ label, value, icon = 'info' }: Props) {
  const colors = useColors()
  return (
    <View style={[styles.infoItem, { borderBottomColor: colors.borderLight }] }>
      <View style={[styles.infoIconContainer, { backgroundColor: SpoonColors.withOpacity(colors.info, 0.15) }] }>
        <Icon name={icon} size={20} color={colors.warning} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: { flex: 1, justifyContent: 'center' },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500' },
})

