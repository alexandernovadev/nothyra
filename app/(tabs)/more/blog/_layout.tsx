import { Stack } from 'expo-router';

export default function BlogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[postId]" />
      <Stack.Screen name="form" />
    </Stack>
  );
}
