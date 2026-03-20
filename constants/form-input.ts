/**
 * Shared TextInput look: login, registro, perfil, formularios.
 * Usar desde FormField y, si hace falta, importar `formInputStyles` en inputs puntuales.
 */
import { StyleSheet } from 'react-native';

import { palette } from '@/constants/palette';

export const FORM_INPUT_ICON_LEFT = 14;
export const FORM_INPUT_ICON_TOP = 14;
/** Padding izquierdo cuando hay icono (Ionicons ~22px + aire) */
export const FORM_INPUT_PADDING_LEFT_WITH_ICON = 48;

export const formInputStyles = StyleSheet.create({
  input: {
    backgroundColor: palette.surface.input,
    paddingLeft: FORM_INPUT_PADDING_LEFT_WITH_ICON,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.text.primary,
  },
  inputTop: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomWidth: 2,
    borderBottomColor: palette.border.light,
  },
  inputMiddle: {
    borderBottomWidth: 2,
    borderBottomColor: palette.border.light,
  },
  inputBottom: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  inputSingle: {
    borderRadius: 22,
  },
});
