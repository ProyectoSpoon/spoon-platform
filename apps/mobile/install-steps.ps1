# Paso 1: Limpiar todo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Paso 2: Usar package.json estable
Copy-Item package-stable.json package.json -Force

# Paso 3: Instalar dependencias base
npm install

# Paso 4: Instalar React Navigation específico
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler

# Paso 5: Probar app básica
# Usar App.tsx (sin navegación)

# Paso 6: Si funciona, probar con navegación
# Copy-Item App-with-nav.tsx App.tsx -Force
