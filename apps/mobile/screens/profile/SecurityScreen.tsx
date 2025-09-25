import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { Section, SettingItem, DeviceItem } from '../../src/components/ui'
import { useAuth } from '../../src/hooks/useAuth'
import { getUserSecuritySettings, updateUserSecuritySettings, getUserDevices, removeDevice, logUserActivity } from '../../src/lib/supabase'
import { useColors, SpoonColors } from '../../src/design-system'

export default function SecurityScreen() {
  const navigation = useNavigation()
  const colors = useColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  
  const { user } = useAuth()
  // Estados de autenticación
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginNotifications, setLoginNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // Estados para cambio de contraseña rápido
  const [showQuickPasswordChange, setShowQuickPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Lista de dispositivos
  const [devices, setDevices] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      try {
        const settings = await getUserSecuritySettings(user.id)
        if (settings) {
          setBiometricEnabled(!!settings.biometric_enabled)
          setTwoFactorEnabled(!!settings.two_factor_enabled)
          setLoginNotifications(!!settings.login_notifications)
        }
        const devs = await getUserDevices(user.id)
        if (devs) setDevices(devs)
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const persist = async (patch: any) => {
    if (!user) return
    try {
      await updateUserSecuritySettings(user.id, patch)
      await logUserActivity(user.id, 'security_update', 'Actualización de configuración de seguridad')
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la configuración')
    }
  }
  
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }
  
  const handleBiometricToggle = (value) => {
    setBiometricEnabled(value)
  persist({ biometric_enabled: value })
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
              persist({ two_factor_enabled: true })
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
              persist({ two_factor_enabled: false })
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
            removeDevice(deviceId).then(() => {
              setDevices((ds) => ds.filter((d) => d.id !== deviceId))
              Alert.alert('✅', `${deviceName} ha sido eliminado`)
            }).catch(() => Alert.alert('Error', 'No se pudo eliminar'))
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
            // For now just clear non-current; backend endpoint pending
            setDevices((ds) => ds.filter(d => d.current))
            Alert.alert('✅', 'Sesión cerrada en todos los dispositivos (excepto este)')
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
  await new Promise<void>(resolve => setTimeout(resolve, 2000))
      
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
  
  // DeviceItem component moved to shared UI components
  
  return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }] }>
  <Section title="Contraseña">
        <SettingItem
          title="Cambiar Contraseña"
          subtitle="Última actualización: hace 30 días"
          onPress={handleChangePassword}
        />
      </Section>
      
      <Section title="Autenticación">
        <SettingItem
          title="Autenticación Biométrica"
          subtitle="Usar huella o Face ID"
          hasToggle
          toggleValue={biometricEnabled}
          onToggleChange={handleBiometricToggle}
        />

        <SettingItem
          title="Verificación en dos pasos"
          subtitle="Añade una capa extra de seguridad"
          hasToggle
          toggleValue={twoFactorEnabled}
          onToggleChange={handleTwoFactorToggle}
        />

        {twoFactorEnabled && (
          <SettingItem
            title="Códigos de respaldo"
            subtitle="Para acceso de emergencia"
            onPress={handleBackupCodes}
          />
        )}
      </Section>
      
      <Section title="Alertas de Seguridad">
        <SettingItem
          title="Notificar nuevos inicios de sesión"
          subtitle="Recibe alertas de accesos"
          hasToggle
          toggleValue={loginNotifications}
          onToggleChange={(v) => { setLoginNotifications(v); persist({ login_notifications: v }) }}
        />

        <SettingItem
          title="Ver historial de actividad"
          subtitle="Revisa los accesos recientes"
          onPress={handleViewActivity}
        />
      </Section>
      
  <Section title={`Dispositivos conectados (${devices.length})`}>
        {devices.map((d) => (
          <DeviceItem
            key={d.id}
            id={String(d.id)}
            name={d.name}
            type={d.type as any}
            location={d.location}
            lastAccess={d.lastAccess}
            current={d.current}
            onRemove={handleRemoveDevice}
            onPress={() => Alert.alert('Dispositivo', `👤 ${d.name}`)}
          />
        ))}

        <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('', 'Mostrando todos los dispositivos...')}>
          <Text style={[styles.linkText, { color: colors.warning }]}>Ver historial completo de dispositivos</Text>
        </TouchableOpacity>
      </Section>
      
      {/* Botón de cerrar sesión en todos */}
      <TouchableOpacity style={[styles.dangerButton, { borderTopColor: colors.border, borderBottomColor: colors.border }]} onPress={handleLogoutAllDevices}>
        <Text style={[styles.dangerButtonText, { color: colors.error }]}>Cerrar sesión en todos los dispositivos</Text>
      </TouchableOpacity>
      
      {/* Información adicional */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🔐</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Mantén tu cuenta segura</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }] }>
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
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>¿Detectaste actividad sospechosa?</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }] }>
              Si ves dispositivos o actividad que no reconoces, cambia tu contraseña inmediatamente y contacta con soporte.
            </Text>
            <TouchableOpacity style={[styles.supportButton, { backgroundColor: colors.warning }]} onPress={() => navigation.navigate('ContactSupport')}>
              <Text style={[styles.supportButtonText, { color: colors.textOnPrimary }]}>Contactar Soporte</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface }] }>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Cambio Rápido de Contraseña</Text>
            
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border }]}
              placeholder="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border }]}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border }]}
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
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.primaryDark }, isChangingPassword && styles.buttonDisabled]}
                onPress={handleQuickPasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <Text style={[styles.modalConfirmText, { color: colors.textOnPrimary }]}>Cambiar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  linkButton: { paddingHorizontal: 20, paddingVertical: 15 },
  linkText: { fontSize: 16, fontWeight: '500' },
  dangerButton: {
    backgroundColor: colors.surface,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  dangerButtonText: { fontSize: 16, fontWeight: '500' },
  infoSection: { paddingHorizontal: 20, paddingVertical: 20 },
  infoItem: { flexDirection: 'row', marginBottom: 24 },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
  supportButton: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  supportButtonText: { fontSize: 14, fontWeight: '500' },
  bottomSpace: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: SpoonColors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalCancelButton: { flex: 1, paddingVertical: 12, marginRight: 8, borderWidth: 1, borderRadius: 8, alignItems: 'center', borderColor: colors.border },
  modalCancelText: { fontSize: 16 },
  modalConfirmButton: { flex: 1, paddingVertical: 12, marginLeft: 8, borderRadius: 8, alignItems: 'center' },
  modalConfirmText: { fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
})

