import { SymptomLogCard } from '@/components/symptoms/symptom-log-card';
import { ThemedText } from '@/components/themed-text';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import type { EnergyLevel, MoodLevel, SymptomId } from '@/constants/symptom-log';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import {
  SYMPTOM_LOGS_COLLECTION,
  sortKeyFromLog,
} from '@/lib/symptom-log/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Timestamp } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LogRow = {
  id: string;
  dateKey: string;
  energyLevel: EnergyLevel;
  mood: MoodLevel;
  symptoms: SymptomId[];
  notes: string;
  createdAt?: Timestamp;
};

const TAB_BAR_CLEARANCE = 56;

export default function SymptomsListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  useEffect(() => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }

    setListError('');
    setLoading(true);

    const q = query(
      collection(db, SYMPTOM_LOGS_COLLECTION),
      where('userId', '==', user.uid),
      limit(100),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: LogRow[] = snap.docs
          .map((docSnap) => {
            const d = docSnap.data();
            const createdAt = d.createdAt as Timestamp | undefined;
            return {
              id: docSnap.id,
              dateKey: String(d.dateKey ?? ''),
              energyLevel: (d.energyLevel as EnergyLevel) ?? 'normal',
              mood: (d.mood as MoodLevel) ?? 'normal',
              symptoms: Array.isArray(d.symptoms)
                ? (d.symptoms as SymptomId[])
                : [],
              notes: typeof d.notes === 'string' ? d.notes : '',
              createdAt,
            };
          })
          .sort(
            (a, b) =>
              sortKeyFromLog({
                createdAt: b.createdAt,
                dateKey: b.dateKey,
              }) -
              sortKeyFromLog({
                createdAt: a.createdAt,
                dateKey: a.dateKey,
              }),
          );
        setRows(next);
        setLoading(false);
      },
      (err) => {
        console.error('[SymptomsList]', err);
        setListError('No se pudo cargar la lista. Revisa la conexión o los índices de Firestore.');
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user]);

  const goToday = () => {
    router.push('/(tabs)/symptoms/new');
  };

  const confirmDelete = (logId: string) => {
    Alert.alert(
      'Eliminar registro',
      '¿Seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, SYMPTOM_LOGS_COLLECTION, logId));
            } catch (e) {
              console.error('[SymptomsList] delete:', e);
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          },
        },
      ],
    );
  };

  const fabBottom = insets.bottom + TAB_BAR_CLEARANCE;
  const fabRight = Math.max(insets.right, 8);

  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">Síntomas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Registra cómo te sientes y revisa tu historial
        </ThemedText>
        {listError ? (
          <ThemedText style={styles.errorText}>{listError}</ThemedText>
        ) : null}

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={palette.brand.primary} />
          </View>
        ) : (
          <View style={styles.listWrap}>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
            {rows.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconRing}>
                  <View style={styles.emptyIconInner}>
                    <Ionicons
                      name="medical-outline"
                      size={38}
                      color={palette.brand.primary}
                    />
                  </View>
                </View>

                <Text style={styles.emptyHey}>Hey</Text>
                <ThemedText style={styles.emptyTitle}>
                  Registra tu primer síntoma ahora.
                </ThemedText>
                <View style={styles.emptySubtitleRow}>
                  <ThemedText style={styles.emptySubtitlePart}>
                    Pulsa el botón
                  </ThemedText>
                  <View style={styles.plusPill}>
                    <Text style={styles.plusPillText}>+</Text>
                  </View>
                  <ThemedText style={styles.emptySubtitlePart}>
                    abajo a la derecha para hacerlo.
                  </ThemedText>
                </View>

                <View style={styles.emptyHint}>
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={palette.brand.secondary}
                  />
                  <ThemedText style={styles.emptyHintText}>
                    El botón morado flotante
                  </ThemedText>
                </View>
              </View>
            ) : (
              rows.map((row) => {
                const timeLabel =
                  row.createdAt && typeof row.createdAt.toDate === 'function'
                    ? row.createdAt.toDate().toLocaleTimeString('es', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : undefined;
                return (
                  <SymptomLogCard
                    key={row.id}
                    dateKey={row.dateKey}
                    energyLevel={row.energyLevel}
                    mood={row.mood}
                    symptoms={row.symptoms}
                    notes={row.notes}
                    timeLabel={timeLabel}
                    onEdit={() =>
                      router.push(`/(tabs)/symptoms/${row.id}`)
                    }
                    onDelete={() => confirmDelete(row.id)}
                  />
                );
              })
            )}
            </ScrollView>
          </View>
        )}

        <Pressable
          accessibilityLabel="Registrar síntomas de hoy"
          onPress={goToday}
          style={({ pressed }) => [
            styles.fab,
            { bottom: fabBottom, right: fabRight },
            pressed && styles.fabPressed,
          ]}
        >
          <Ionicons name="add" size={32} color={palette.text.inverse} />
        </Pressable>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    marginTop: 8,
    color: palette.text.secondary,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  errorText: {
    marginTop: 12,
    color: palette.semantic.error,
    fontSize: 14,
  },
  loader: {
    marginTop: 32,
    alignItems: 'center',
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
    marginTop: 12,
    alignSelf: 'stretch',
    width: '100%',
  },
  list: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    minHeight: 320,
    marginTop: 8,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  emptyIconRing: {
    padding: 4,
    borderRadius: 56,
    backgroundColor: `${palette.brand.primary}18`,
  },
  emptyIconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.surface.input,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${palette.brand.primary}40`,
  },
  emptyHey: {
    marginTop: 28,
    fontSize: 34,
    fontWeight: '800',
    color: palette.brand.primary,
    letterSpacing: -0.5,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: palette.text.primary,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptySubtitleRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    maxWidth: 320,
    paddingHorizontal: 8,
  },
  emptySubtitlePart: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.secondary,
    textAlign: 'center',
  },
  plusPill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPillText: {
    color: palette.text.inverse,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyHint: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: `${palette.brand.secondary}22`,
  },
  emptyHintText: {
    fontSize: 14,
    color: palette.brand.secondary,
    fontWeight: '600',
  },
});
