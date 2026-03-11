import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

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
  /** Estilo del input: 'top' | 'middle' | 'bottom' para bordes redondeados */
  variant?: 'top' | 'middle' | 'bottom';
} & Omit<TextInputProps, 'placeholder' | 'secureTextEntry' | 'editable'>;

export function FormField<T extends FieldValues>({
  control,
  name,
  icon,
  placeholder,
  error,
  secureTextEntry,
  showTogglePassword,
  editable = true,
  variant = 'middle',
  ...rest
}: FormFieldProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const inputStyle = [
    styles.input,
    variant === 'top' && styles.inputTop,
    variant === 'middle' && styles.inputMiddle,
    variant === 'bottom' && styles.inputBottom,
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
            style={styles.icon}
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
            style={inputStyle}
            autoCapitalize="none"
            {...rest}
          />
          {secureTextEntry && showTogglePassword && (
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={palette.text.secondary}
              style={styles.toggleIcon}
              onPress={() => {
                setIsPasswordVisible((prev) => !prev);
                // Mantener foco para que el teclado no cambie/desaparezca
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
    left: 14,
    top: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: palette.surface.input,
    paddingLeft: 48,
    paddingRight: 44,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.text.primary,
  },
  toggleIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 1,
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
});
