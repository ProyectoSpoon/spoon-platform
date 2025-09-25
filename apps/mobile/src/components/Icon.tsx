import React from 'react'
import { TouchableOpacity } from 'react-native'
import type { ViewStyle, GestureResponderEvent } from 'react-native'
import { useColors } from '../design-system'

type IconProps = {
  name: string
  size?: number
  color?: string
  style?: ViewStyle
  onPress?: (e: GestureResponderEvent) => void
}

export default function Icon({ name, size = 20, color, style, onPress }: IconProps) {
  const colors = useColors()
  // Lazy require to avoid type resolution issues if vector icons types are missing
  let Comp: any
  try {
    Comp = require('react-native-vector-icons/MaterialIcons').default
  } catch {
    // Fallback: render nothing or a placeholder box
    Comp = ({}) => null
  }
  const content = (
    <Comp name={name as any} size={size} color={color ?? colors.textPrimary} style={style as any} />
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}


