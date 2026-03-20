import { SymptomLogForm } from '@/components/symptoms/symptom-log-form';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { getTodayDateKey } from '@/constants/symptom-log';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function SymptomLogEditScreen() {
  const { entryId: raw } = useLocalSearchParams<{ entryId: string }>();
  const router = useRouter();
  const entryId =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';

  if (!entryId?.trim()) {
    return (
      <MainLayout>
        <View style={styles.fallback}>
          <ThemedText type="title">Registro no válido</ThemedText>
          <Btn onPress={() => router.back()} style={styles.back}>
            <ThemedText type="link">← Volver</ThemedText>
          </Btn>
        </View>
      </MainLayout>
    );
  }

  return (
    <SymptomLogForm
      entryId={entryId.trim()}
      initialDateKey={getTodayDateKey()}
    />
  );
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
