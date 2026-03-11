import { Colors } from '@/constants/theme';

type ColorKey = keyof typeof Colors;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey
): string {
  if (props.light) return props.light;
  return Colors[colorName] as string;
}
