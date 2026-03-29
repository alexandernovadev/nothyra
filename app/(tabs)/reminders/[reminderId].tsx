import { ReminderForm } from '@/components/reminders/reminder-form';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function ReminderEditScreen() {
  const { reminderId: raw } = useLocalSearchParams<{ reminderId: string }>();
  const router = useRouter();
  const reminderId =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';

  if (!reminderId?.trim()) {
    return (
      <MainLayout>
        <View style={styles.fallback}>
          <ThemedText type="title">Recordatorio no válido</ThemedText>
          <Btn onPress={() => router.back()} style={styles.back}>
            <ThemedText type="link">← Volver</ThemedText>
          </Btn>
        </View>
      </MainLayout>
    );
  }

  return <ReminderForm reminderId={reminderId.trim()} />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    gap: 16,
  },
  back: {
    alignSelf: 'flex-start',
  },
});
