import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ContactSupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contactar Soporte</Text>
      <Text style={styles.subtitle}>Envía un mensaje al equipo de soporte</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B4E3D',
  },
})
