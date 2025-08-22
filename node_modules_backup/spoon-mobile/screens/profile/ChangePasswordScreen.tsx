import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function ChangePasswordScreen() {
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
      await new Promise(resolve => setTimeout(resolve, 2000))
      
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
  
  const RequisitoItem = ({ texto, cumple }) => (
    <View style={styles.requisitoItem}>
      <Text style={[styles.requisitoIcon, cumple && styles.requisitoIconValid]}>
        {cumple ? '✓' : '○'}
      </Text>
      <Text style={[styles.requisitoTexto, cumple && styles.requisitoTextoValid]}>
        {texto}
      </Text>
    </View>
  )
  
  const ConsejoItem = ({ texto }) => (
    <View style={styles.consejoItem}>
      <Text style={styles.consejoBullet}>•</Text>
      <Text style={styles.consejoTexto}>{texto}</Text>
    </View>
  )
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🔒</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Protege tu cuenta</Text>
            <Text style={styles.headerSubtitle}>Usa una contraseña segura y única</Text>
          </View>
        </View>
        
        {/* Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Información de Seguridad</Text>
          
          {/* Contraseña actual */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={contrasenaActual}
                onChangeText={setContrasenaActual}
                placeholder="Ingresa tu contraseña actual"
                secureTextEntry={!mostrarContrasenaActual}
                placeholderTextColor="#999"
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
            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={[styles.inputWrapper, contrasenaValida && styles.inputValid]}>
              <TextInput
                style={styles.input}
                value={nuevaContrasena}
                onChangeText={setNuevaContrasena}
                placeholder="Ingresa una nueva contraseña segura"
                secureTextEntry={!mostrarNuevaContrasena}
                placeholderTextColor="#999"
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
            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry={!mostrarConfirmarContrasena}
                placeholderTextColor="#999"
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
            
            <RequisitoItem texto="Al menos 8 caracteres" cumple={tieneMinimo8} />
            <RequisitoItem texto="Una letra mayúscula (A-Z)" cumple={tieneMayuscula} />
            <RequisitoItem texto="Una letra minúscula (a-z)" cumple={tieneMinuscula} />
            <RequisitoItem texto="Un número (0-9)" cumple={tieneNumero} />
            <RequisitoItem texto="Un carácter especial (!@#$%^&*)" cumple={tieneEspecial} />
            <RequisitoItem texto="Diferente a la contraseña actual" cumple={esDiferente} />
          </View>
        )}
        
        {/* Consejos de seguridad */}
        <View style={styles.consejosContainer}>
          <View style={styles.consejosHeader}>
            <Text style={styles.consejosTitle}>💡 Consejos de Seguridad</Text>
          </View>
          
          <ConsejoItem texto="Usa una combinación única de palabras" />
          <ConsejoItem texto="No reutilices contraseñas de otras cuentas" />
          <ConsejoItem texto="Considera usar un gestor de contraseñas" />
          <ConsejoItem texto="Habilita la autenticación de dos factores" />
        </View>
        
        {/* Botones */}
        <TouchableOpacity
          style={[styles.primaryButton, (!contrasenaValida || isLoading) && styles.buttonDisabled]}
          onPress={handleCambiarContrasena}
          disabled={!contrasenaValida || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.primaryButtonText}>Cambiando contraseña...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Cambiar Contraseña</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={olvideMiContrasena} style={styles.linkButton}>
          <Text style={styles.linkText}>¿Olvidaste tu contraseña actual?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  headerIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputValid: {
    borderColor: '#28a745',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#333',
  },
  eyeButton: {
    padding: 8,
  },
  requisitosContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  requisitosValid: {
    borderColor: '#28a745',
  },
  requisitosHeader: {
    marginBottom: 12,
  },
  requisitosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffc107',
  },
  requisitosTitleValid: {
    color: '#28a745',
  },
  requisitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requisitoIcon: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
    width: 20,
  },
  requisitoIconValid: {
    color: '#28a745',
  },
  requisitoTexto: {
    fontSize: 13,
    color: '#666',
  },
  requisitoTextoValid: {
    color: '#28a745',
    fontWeight: '500',
  },
  consejosContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  consejosHeader: {
    marginBottom: 12,
  },
  consejosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  consejoItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  consejoBullet: {
    color: '#1976d2',
    marginRight: 8,
  },
  consejoTexto: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
  },
  primaryButton: {
    backgroundColor: '#E67E22',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#E67E22',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
