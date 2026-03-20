import { Stack } from 'expo-router';

export default function SymptomsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[entryId]" />
    </Stack>
  );
}
