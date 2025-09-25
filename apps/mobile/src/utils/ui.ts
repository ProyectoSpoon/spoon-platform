import { Alert, Share, Platform, } from 'react-native'

// FunciÃ³n temporal sin clipboard - solo muestra el texto
export function copyToClipboard(text: string, toastMessage?: string) {
  Alert.alert(
    'ðŸ“‹ Copiar al Portapapeles',
    `Texto: ${text}`,
    [
      {
        text: 'Compartir',
        onPress: () => {
          Share.share({ message: text }).catch(() => {
            Alert.alert('Info', 'No se pudo compartir')
          })
        }
      },
      { text: 'Cerrar', style: 'cancel' }
    ]
  )
}

export async function shareText(text: string) {
  try {
    if (Platform.OS === 'web') {
      copyToClipboard(text, 'Texto copiado para compartir')
      return
    }
    await Share.share({ message: text })
  } catch (err) {
    copyToClipboard(text, 'Texto copiado para compartir')
  }
}

export function confirmDestructive(title: string, message: string, onConfirm: () => void) {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ])
}

