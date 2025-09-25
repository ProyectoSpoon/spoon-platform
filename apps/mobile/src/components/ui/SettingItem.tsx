import React from 'react'
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native'
import Icon from '../Icon'
import { useColors } from '../../design-system'

type Props = {
  icon?: string
  title: string
  subtitle?: string
  value?: string
  onPress?: () => void
  hasToggle?: boolean
  toggleValue?: boolean
  onToggleChange?: (v: boolean) => void
  danger?: boolean
}

export default function SettingItem({ icon, title, subtitle, value, onPress, hasToggle, toggleValue, onToggleChange, danger = false }: Props) {
  const colors = useColors()
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.borderLight }]}
      onPress={!hasToggle ? onPress : undefined}
      activeOpacity={hasToggle ? 1 : 0.7}
    >
      <View style={styles.left}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: danger ? colors.error : colors.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {hasToggle ? (
        <Switch value={!!toggleValue} onValueChange={onToggleChange} trackColor={{ false: colors.border, true: colors.primaryDark }} thumbColor={colors.textOnPrimary} />
      ) : value ? (
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: colors.textSecondary }]}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.arrow, { color: danger ? colors.error : colors.warning }]}>{'>'}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 20, marginRight: 15, width: 25, textAlign: 'center' },
  textContainer: { flex: 1, marginRight: 10 },
  title: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  subtitle: { fontSize: 13 },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  valueText: { fontSize: 14, marginRight: 5 },
  arrow: { fontSize: 18, fontWeight: 'bold' },
})

