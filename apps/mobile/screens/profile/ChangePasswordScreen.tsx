import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, } from 'react-native'
import { useColors, SpoonColors, SpoonShadows } from '../../src/design-system'
import { getOverlay } from '../../src/design-system/utils/overlays'

import { useNavigation } from '@react-navigation/native'
import { PasswordRequirement, SecurityTip } from '../../src/components/ui'

export default function ChangePasswordScreen() {
  const colors = useColors()
  const overlayLight = getOverlay('light', colors)
  const navigation = useNavigation()
  
  // Estados para los campos
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  
  // Estados de visibilidad
  const [mostrarContrasenaActual, setMostrarContrasenaActual] = useState(false)
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false)
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false)
  
  // Estados de validación
  const [tieneMinimo8, setTieneMinimo8] = useState(false)
  const [tieneMayuscula, setTieneMayuscula] = useState(false)
  const [tieneMinuscula, setTieneMinuscula] = useState(false)
  const [tieneNumero, setTieneNumero] = useState(false)
  const [tieneEspecial, setTieneEspecial] = useState(false)
  const [esDiferente, setEsDiferente] = useState(false)
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  
  // Validar contraseña en tiempo real
  useEffect(() => {
    if (nuevaContrasena) {
      setTieneMinimo8(nuevaContrasena.length >= 8)
      setTieneMayuscula(/[A-Z]/.test(nuevaContrasena))
      setTieneMinuscula(/[a-z]/.test(nuevaContrasena))
      setTieneNumero(/[0-9]/.test(nuevaContrasena))
      setTieneEspecial(/[!@#$%^&*(),.?":{}|<>]/.test(nuevaContrasena))
      setEsDiferente(nuevaContrasena !== contrasenaActual && nuevaContrasena.length > 0)
      setMostrarRequisitos(true)
    } else {
      setMostrarRequisitos(false)
    }
  }, [nuevaContrasena, contrasenaActual])
  
  const contrasenaValida = 
    tieneMinimo8 && 
    tieneMayuscula && 
    tieneMinuscula && 
    tieneNumero && 
    tieneEspecial && 
    esDiferente
  
  const handleCambiarContrasena = async () => {
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }
    
    if (!contrasenaValida) {
      Alert.alert('Error', 'La contraseña no cumple con todos los requisitos')
      return
    }
    
    if (nuevaContrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simular cambio de contraseña
  await new Promise<void>(resolve => setTimeout(resolve, 2000))
      
      Alert.alert(
        'Contraseña Actualizada',
        'Tu contraseña ha sido cambiada exitosamente. Por seguridad, se cerrarán todas las sesiones activas en otros dispositivos.',
        [
          {
            text: 'Entendido',
            onPress: () => navigation.goBack()
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const mostrarAyuda = () => {
    Alert.alert(
      'Ayuda de Seguridad',
      'CONTRASEÑA SEGURA:\nUna buena contraseña debe ser única, compleja y difícil de adivinar.\n\n' +
      'GESTORES DE CONTRASEÑAS:\nTe recomendamos usar aplicaciones como 1Password, LastPass o Bitwarden.\n\n' +
      'AUTENTICACIÓN DE DOS FACTORES:\nHabilita 2FA en la sección de Seguridad para mayor protección.\n\n' +
      'SEÑALES DE ALERTA:\nSi recibes notificaciones de inicios de sesión no autorizados, cambia tu contraseña inmediatamente.'
    )
  }
  
  const olvideMiContrasena = () => {
    Alert.alert(
      'Restablecer Contraseña',
      'Si no recuerdas tu contraseña actual, puedes restablecerla usando tu correo electrónico. Te enviaremos un enlace para crear una nueva contraseña.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar enlace',
          onPress: () => {
            Alert.alert('✉️', 'Se ha enviado un enlace de restablecimiento a tu email')
          }
        }
      ]
    )
  }
  
  // Replaced by shared components PasswordRequirement and SecurityTip
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
  <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}> 
        {/* Header */}
  <View style={[styles.header, { backgroundColor: colors.primaryDark }]}> 
          <View style={[styles.headerIcon, { backgroundColor: overlayLight }] }>
            <Text style={styles.headerIconText}>🔒</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.textOnPrimary }]}>Protege tu cuenta</Text>
            <Text style={[styles.headerSubtitle, { color: SpoonColors.withOpacity(colors.textOnPrimary,0.9) }]}>Usa una contraseña segura y única</Text>
          </View>
        </View>
        
        {/* Formulario */}
  <View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight, ...SpoonShadows.card() }]}> 
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Información de Seguridad</Text>
          
          {/* Contraseña actual */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Contraseña actual</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={contrasenaActual}
                onChangeText={setContrasenaActual}
                placeholder="Ingresa tu contraseña actual"
                secureTextEntry={!mostrarContrasenaActual}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                onPress={() => setMostrarContrasenaActual(!mostrarContrasenaActual)}
                style={styles.eyeButton}
              >
                <Text>{mostrarContrasenaActual ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Nueva contraseña */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Nueva contraseña</Text>
            <View style={[styles.inputWrapper, contrasenaValida && styles.inputValid]}>
              <TextInput
                style={styles.input}
                value={nuevaContrasena}
                onChangeText={setNuevaContrasena}
                placeholder="Ingresa una nueva contraseña segura"
                secureTextEntry={!mostrarNuevaContrasena}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                onPress={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                style={styles.eyeButton}
              >
                <Text>{mostrarNuevaContrasena ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Confirmar contraseña */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Confirmar nueva contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry={!mostrarConfirmarContrasena}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                style={styles.eyeButton}
              >
                <Text>{mostrarConfirmarContrasena ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Requisitos de seguridad */}
        {mostrarRequisitos && (
          <View style={[styles.requisitosContainer, contrasenaValida && styles.requisitosValid]}>
            <View style={styles.requisitosHeader}>
              <Text style={[styles.requisitosTitle, contrasenaValida && styles.requisitosTitleValid]}>
                {contrasenaValida ? '✓ ' : 'ℹ️ '}Requisitos de Seguridad
              </Text>
            </View>
            
            <PasswordRequirement text="Al menos 8 caracteres" met={tieneMinimo8} />
            <PasswordRequirement text="Una letra mayúscula (A-Z)" met={tieneMayuscula} />
            <PasswordRequirement text="Una letra minúscula (a-z)" met={tieneMinuscula} />
            <PasswordRequirement text="Un número (0-9)" met={tieneNumero} />
            <PasswordRequirement text="Un carácter especial (!@#$%^&*)" met={tieneEspecial} />
            <PasswordRequirement text="Diferente a la contraseña actual" met={esDiferente} />
          </View>
        )}
        
        {/* Consejos de seguridad */}
        <View style={styles.consejosContainer}>
          <View style={styles.consejosHeader}>
            <Text style={styles.consejosTitle}>💡 Consejos de Seguridad</Text>
          </View>
          
          <SecurityTip text="Usa una combinación única de palabras" />
          <SecurityTip text="No reutilices contraseñas de otras cuentas" />
          <SecurityTip text="Considera usar un gestor de contraseñas" />
          <SecurityTip text="Habilita la autenticación de dos factores" />
        </View>
        
        {/* Botones */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primaryDark }, (!contrasenaValida || isLoading) && styles.buttonDisabled]}
          onPress={handleCambiarContrasena}
          disabled={!contrasenaValida || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.textOnPrimary} />
              <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>Cambiando contraseña...</Text>
            </View>
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>Cambiar Contraseña</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.borderLight }]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={olvideMiContrasena} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: colors.primaryDark }]}>¿Olvidaste tu contraseña actual?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputValid: {},
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
  },
  eyeButton: {
    padding: 8,
  },
  requisitosContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  requisitosValid: {},
  requisitosHeader: {
    marginBottom: 12,
  },
  requisitosTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  requisitosTitleValid: {},
  requisitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requisitoIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  requisitoIconValid: {},
  requisitoTexto: {
    fontSize: 13,
  },
  requisitoTextoValid: {
    fontWeight: '500',
  },
  consejosContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  consejosHeader: {
    marginBottom: 12,
  },
  consejosTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  consejoItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  consejoBullet: {
    marginRight: 8,
  },
  consejoTexto: {
    flex: 1,
    fontSize: 13,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {},
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})

