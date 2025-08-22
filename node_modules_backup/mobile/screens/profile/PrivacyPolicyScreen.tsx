import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Política de Privacidad</Text>
      <Text style={styles.subtitle}>Conoce cómo manejamos tus datos</Text>
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
