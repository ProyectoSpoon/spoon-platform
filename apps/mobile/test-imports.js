// Test de importación
console.log('=== TESTING PROFILE IMPORTS ===')

try {
  const profileIndex = require('./screens/profile/index.ts')
  console.log('✅ Index.ts importado correctamente')
  console.log('Exports disponibles:', Object.keys(profileIndex))
} catch (error) {
  console.log('❌ Error importando index.ts:', error.message)
}

try {
  const { UserProfileScreen } = require('./screens/profile')
  console.log('✅ UserProfileScreen importado:', typeof UserProfileScreen)
} catch (error) {
  console.log('❌ Error importando UserProfileScreen:', error.message)
}
