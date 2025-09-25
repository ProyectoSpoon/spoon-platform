import React from 'react'
import AppNavigator from './navigation/AppNavigator'
import { ThemeProvider } from './src/design-system/context/ThemeContext'
import { AuthProvider } from './src/hooks/useAuth'

export default function App() {
  return (
    <ThemeProvider initialTheme="light" persistTheme={false}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  )
}
