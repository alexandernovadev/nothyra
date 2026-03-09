import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: '#a1e1e1' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
