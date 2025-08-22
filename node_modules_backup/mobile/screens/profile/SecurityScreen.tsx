import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function SecurityScreen() {
  const navigation = useNavigation()
  
  // Estados de autenticación
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginNotifications, setLoginNotifications] = useState(true)
  
  // Estados para cambio de contraseña rápido
  const [showQuickPasswordChange, setShowQuickPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Lista de dispositivos
  const [devices, setDevices] = useState([
    { id: 1, name: 'iPhone 13 Pro', type: 'mobile', location: 'Cúcuta', current: true, lastAccess: 'Dispositivo actual' },
    { id: 2, name: 'Chrome - Windows', type: 'desktop', location: 'Cúcuta', current: false, lastAccess: 'Hace 2 horas' },
    { id: 3, name: 'Safari - MacBook', type: 'desktop', location: 'Bogotá', current: false, lastAccess: 'Hace 1 día' },
    { id: 4, name: 'Android - Samsung', type: 'mobile', location: 'Medellín', current: false, lastAccess: 'Hace 3 días' },
  ])
  
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }
  
  const handleBiometricToggle = (value) => {
    setBiometricEnabled(value)
    Alert.alert(
      'Autenticación Biométrica',
      value ? 'Activada correctamente' : 'Desactivada correctamente'
    )
  }
  
  const handleTwoFactorToggle = (value) => {
    if (value) {
      Alert.alert(
        'Activar 2FA',
        'Se te enviará un código de verificación a tu correo electrónico para completar la activación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar',
            onPress: () => {
              setTwoFactorEnabled(true)
              Alert.alert('✅', 'Autenticación de dos factores activada')
            }
          }
        ]
      )
    } else {
      Alert.alert(
        'Desactivar 2FA',
        '¿Estás seguro? Tu cuenta será menos segura sin la autenticación de dos factores.',
        [
          { text: 'Mantener activado', style: 'cancel' },
          { 
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false)
              Alert.alert('⚠️', 'Autenticación de dos factores desactivada')
            }
          }
        ]
      )
    }
  }
  
  const handleRemoveDevice = (deviceId, deviceName) => {
    Alert.alert(
      'Eliminar dispositivo',
      `¿Estás seguro de que quieres eliminar "${deviceName}"? Se cerrará la sesión en este dispositivo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDevices(devices.filter(d => d.id !== deviceId))
            Alert.alert('✅', `${deviceName} ha sido eliminado`)
          }
        }
      ]
    )
  }
  
  const handleLogoutAllDevices = () => {
    Alert.alert(
      'Cerrar sesión en todos los dispositivos',
      'Esto cerrará tu sesión en todos los dispositivos excepto el actual. Tendrás que volver a iniciar sesión en cada uno.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            setDevices(devices.filter(d => d.current))
            Alert.alert('✅', 'Sesión cerrada en todos los dispositivos')
          }
        }
      ]
    )
  }
  
  const handleQuickPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres')
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      Alert.alert(
        '✅ Contraseña actualizada',
        'Tu contraseña ha sido cambiada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowQuickPasswordChange(false)
              setCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña')
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  const handleViewActivity = () => {
    Alert.alert('Historial de Actividad', 'Función en desarrollo')
  }
  
  const handleBackupCodes = () => {
    if (!twoFactorEnabled) {
      Alert.alert('2FA Requerido', 'Primero debes activar la autenticación de dos factores')
      return
    }
    
    Alert.alert(
      'Códigos de Respaldo',
      'Tus códigos de respaldo:\n\n' +
      '1. ABC-123-XYZ\n' +
      '2. DEF-456-UVW\n' +
      '3. GHI-789-RST\n' +
      '4. JKL-012-OPQ\n' +
      '5. MNO-345-LMN\n\n' +
      'Guarda estos códigos en un lugar seguro',
      [{ text: 'Copiar códigos' }]
    )
  }
  
  const DeviceItem = ({ device }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>
          {device.type === 'mobile' ? '📱' : '💻'}
        </Text>
      </View>
      <View style={styles.deviceInfo}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{device.name}</Text>
          {device.current && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Actual</Text>
            </View>
          )}
        </View>
        <Text style={styles.deviceDetails}>
          {device.location} • {device.lastAccess}
        </Text>
      </View>
      {!device.current && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveDevice(device.id, device.name)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  )
  
  return (
    <ScrollView style={styles.container}>
      {/* Sección: Contraseña */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTRASEÑA</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Cambiar Contraseña</Text>
            <Text style={styles.optionSubtitle}>Última actualización: hace 30 días</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sección: Autenticación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AUTENTICACIÓN</Text>
        
        <View style={styles.switchOption}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Autenticación Biométrica</Text>
            <Text style={styles.optionSubtitle}>Usar huella o Face ID</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#ccc', true: '#E67E22' }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={styles.switchOption}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Verificación en dos pasos</Text>
            <Text style={styles.optionSubtitle}>Añade una capa extra de seguridad</Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={handleTwoFactorToggle}
            trackColor={{ false: '#ccc', true: '#E67E22' }}
            thumbColor="#fff"
          />
        </View>
        
        {twoFactorEnabled && (
          <TouchableOpacity style={styles.option} onPress={handleBackupCodes}>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Códigos de respaldo</Text>
              <Text style={styles.optionSubtitle}>Para acceso de emergencia</Text>
            </View>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Sección: Alertas de Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ALERTAS DE SEGURIDAD</Text>
        
        <View style={styles.switchOption}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Notificar nuevos inicios de sesión</Text>
            <Text style={styles.optionSubtitle}>Recibe alertas de accesos</Text>
          </View>
          <Switch
            value={loginNotifications}
            onValueChange={setLoginNotifications}
            trackColor={{ false: '#ccc', true: '#E67E22' }}
            thumbColor="#fff"
          />
        </View>
        
        <TouchableOpacity style={styles.option} onPress={handleViewActivity}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Ver historial de actividad</Text>
            <Text style={styles.optionSubtitle}>Revisa los accesos recientes</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sección: Dispositivos Conectados */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderWithAction}>
          <Text style={styles.sectionTitle}>DISPOSITIVOS CONECTADOS</Text>
          <Text style={styles.deviceCount}>{devices.length} activos</Text>
        </View>
        
        {devices.map(device => (
          <DeviceItem key={device.id} device={device} />
        ))}
        
        <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('', 'Mostrando todos los dispositivos...')}>
          <Text style={styles.linkText}>Ver historial completo de dispositivos</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botón de cerrar sesión en todos */}
      <TouchableOpacity style={styles.dangerButton} onPress={handleLogoutAllDevices}>
        <Text style={styles.dangerButtonText}>Cerrar sesión en todos los dispositivos</Text>
      </TouchableOpacity>
      
      {/* Información adicional */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🔐</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Mantén tu cuenta segura</Text>
            <Text style={styles.infoText}>
              • Usa una contraseña única y fuerte{'\n'}
              • Activa la autenticación de dos factores{'\n'}
              • Revisa regularmente los dispositivos conectados{'\n'}
              • No compartas tu contraseña con nadie
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>⚠️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Detectaste actividad sospechosa?</Text>
            <Text style={styles.infoText}>
              Si ves dispositivos o actividad que no reconoces, cambia tu contraseña inmediatamente y contacta con soporte.
            </Text>
            <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('ContactSupport')}>
              <Text style={styles.supportButtonText}>Contactar Soporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.bottomSpace} />
      
      {/* Modal de cambio rápido de contraseña */}
      <Modal
        visible={showQuickPasswordChange}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuickPasswordChange(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambio Rápido de Contraseña</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowQuickPasswordChange(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, isChangingPassword && styles.buttonDisabled]}
                onPress={handleQuickPasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Cambiar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  deviceCount: {
    fontSize: 13,
    color: '#E67E22',
    fontWeight: '500',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  arrow: {
    fontSize: 20,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  currentBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  deviceDetails: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#dc3545',
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: '#E67E22',
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  dangerButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportButton: {
    marginTop: 12,
    backgroundColor: '#E67E22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#E67E22',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
})
