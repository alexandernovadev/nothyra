import React from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type BtnProps = PressableProps & {
  /**
   * When true, the button stretches to full available width.
   * Otherwise width comes from parent / `style`.
   */
  fullWidth?: boolean;
  /**
   * Extra container styles; merged with the base pressable style.
   */
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

/**
 * Base pressable with light haptic on press-in.
 * Visuals (colors, typography) are owned by each screen.
 */
export function Btn({ fullWidth, style, onPressIn, disabled, ...rest }: BtnProps) {
  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    if (!disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignore haptics failures (e.g. simulators)
      });
    }
    onPressIn?.(event);
  };

  const combinedStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
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

