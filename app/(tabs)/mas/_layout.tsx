import { Stack } from 'expo-router';

export default function MasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}
