import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type BtnProps = PressableProps & {
  /**
   * Si true, el botón ocupa el 100% del ancho disponible.
   * Por defecto respeta el ancho que le dé el estilo externo.
   */
  fullWidth?: boolean;
  /**
   * Estilo adicional del contenedor.
   * Se fusiona con el estilo base del botón.
   */
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

/**
 * Botón base reutilizable con haptic feedback.
 * No impone colores ni tipografía: el estilo visual se controla desde cada pantalla.
 */
export function Btn({ fullWidth, style, onPressIn, disabled, ...rest }: BtnProps) {
  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    if (!disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignorar errores de haptics (por ejemplo en emuladores)
      });
    }
    onPressIn?.(event);
  };

  const combinedStyle: BtnProps['style'] = (state) => {
    const baseStyles: StyleProp<ViewStyle>[] = [
      styles.base,
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
    ];

    const extra =
      typeof style === 'function'
        ? style(state)
        : style;

    return [...baseStyles, extra].filter(Boolean);
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      style={combinedStyle}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.7,
  },
});

