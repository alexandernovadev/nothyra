import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#a1e1e1', '#bee5d3']}
      locations={[0, 0.6]}
      style={styles.container}>
      <View style={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}>
        <Image
          source={require('@/assets/images/nothyra/NothyraLogo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="title" style={[styles.title, { color: '#2d3748' }]}>
         Tu espacio saludable y divertido
        </ThemedText>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <MaterialIcons name="mail-outline" size={24} color="#7B8B8E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#7B8B8E"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.inputRow}>
            <MaterialIcons name="lock-outline" size={24} color="#7B8B8E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#7B8B8E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>
        </View>

        {error ? (
          <ThemedText style={[styles.error, { color: '#e74c3c' }]}>{error}</ThemedText>
        ) : null}

        <Pressable
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
          )}
        </Pressable>


      </KeyboardAvoidingView>
        <Image
          source={require('@/assets/images/nothyra/nothy2.png')}
          style={styles.bottomImage}
          contentFit="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logo: {
    width: 300,
    height: 80,
    alignSelf: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    paddingBottom: 24
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  inputContainer: {
    backgroundColor: '#FFFDF7',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#DDE3E4',
    marginLeft: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4C5F60',
    paddingVertical: 4,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6A1B9A',
    borderRadius: 9999,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomImage: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'absolute',
    bottom: -106,
    
  },
});
