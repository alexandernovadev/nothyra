/**
 * Theme - light mode only, uses Nothyra palette
 */

import { Platform } from 'react-native';
import { palette } from './palette';

export const Colors = {
  background: palette.background,
  text: palette.text.primary,
  textSecondary: palette.text.secondary,
  tint: palette.brand.primary,
  icon: palette.text.secondary,
  tabIconDefault: palette.text.secondary,
  tabIconSelected: palette.brand.primary,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
