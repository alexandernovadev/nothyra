import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import {
  FORM_INPUT_ICON_LEFT,
  FORM_INPUT_ICON_TOP,
  formInputStyles,
} from '@/constants/form-input';
import { palette } from '@/constants/palette';

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  /** Muestra un icono de ojo para alternar visibilidad cuando secureTextEntry es true */
  showTogglePassword?: boolean;
  editable?: boolean;
  /** Estilo del input: 'top' | 'middle' | 'bottom' | 'single' para bordes redondeados */
  variant?: 'top' | 'middle' | 'bottom' | 'single';
} & Omit<TextInputProps, 'placeholder' | 'secureTextEntry' | 'editable'>;

export function FormField<T extends FieldValues>({
  control,
  name,
  icon,
  placeholder,
  error: _error,
  secureTextEntry,
  showTogglePassword,
  editable = true,
  variant = 'middle',
  ...rest
}: FormFieldProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const {
    style: styleProp,
    multiline,
    ...inputRest
  } = rest;

  const inputStyle = [
    formInputStyles.input,
    variant === 'top' && formInputStyles.inputTop,
    variant === 'middle' && formInputStyles.inputMiddle,
    variant === 'bottom' && formInputStyles.inputBottom,
    variant === 'single' && formInputStyles.inputSingle,
  ].filter(Boolean);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          <Ionicons
            name={icon}
            size={22}
            color={palette.text.secondary}
            style={[
              styles.icon,
              multiline && styles.iconMultiline,
            ]}
          />
          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={palette.text.secondary}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            editable={editable}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : undefined}
            style={[
              inputStyle,
              name === 'password' && { paddingRight: 44 },
              styleProp,
            ]}
            autoCapitalize="none"
            {...inputRest}
          />
          {secureTextEntry && showTogglePassword && (
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={palette.text.secondary}
              style={styles.toggleIcon}
              onPress={() => {
                setIsPasswordVisible((prev) => !prev);
                inputRef.current?.focus();
              }}
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: FORM_INPUT_ICON_LEFT,
    top: FORM_INPUT_ICON_TOP,
    zIndex: 1,
  },
  iconMultiline: {
    top: FORM_INPUT_ICON_TOP + 2,
  },
  toggleIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    paddingRight: 20,
  },
});
