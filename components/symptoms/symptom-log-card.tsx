import { ThemedText } from '@/components/themed-text';
import type { EnergyLevel, MoodLevel, SymptomId } from '@/constants/symptom-log';
import {
  ENERGY_LABELS_ES,
  ENERGY_LEVEL_ICONS,
  formatCompactDateSpanish,
  MOOD_LABELS_ES,
  MOOD_LEVEL_ICONS,
  SYMPTOM_LABELS_ES,
} from '@/constants/symptom-log';
import { palette } from '@/constants/palette';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type IonName = ComponentProps<typeof Ionicons>['name'];

const MAX_SYMPTOM_CHIPS = 4;
const NOTES_PREVIEW_LINES = 2;

type SymptomLogCardProps = {
  dateKey: string;
  energyLevel: EnergyLevel;
  mood: MoodLevel;
  symptoms: SymptomId[];
  notes?: string;
  timeLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function SymptomLogCard({
  dateKey,
  energyLevel,
  mood,
  symptoms,
  notes,
  timeLabel,
  onEdit,
  onDelete,
}: SymptomLogCardProps) {
  const symptomCount = symptoms.length;
  const visibleSymptoms = symptoms.slice(0, MAX_SYMPTOM_CHIPS);
  const extraSymptoms = Math.max(0, symptomCount - visibleSymptoms.length);
  const notesTrimmed = notes?.trim() ?? '';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateCompact}>
            {formatCompactDateSpanish(dateKey)}
          </Text>
          {timeLabel ? (
            <Text style={styles.timeDot}> · {timeLabel}</Text>
          ) : null}
        </View>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressedDelete]}
            accessibilityLabel="Eliminar registro"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={palette.semantic.error}
            />
          </Pressable>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressedEdit]}
            accessibilityLabel="Editar registro"
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color={palette.semantic.warning}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.pillRow}>
          <View style={[styles.pill, styles.pillEnergy]}>
            <Ionicons
              name={ENERGY_LEVEL_ICONS[energyLevel] as IonName}
              size={12}
              color={palette.brand.primary}
            />
            <Text style={styles.pillText}>{ENERGY_LABELS_ES[energyLevel]}</Text>
          </View>
          <View style={[styles.pill, styles.pillMood]}>
            <Ionicons
              name={MOOD_LEVEL_ICONS[mood] as IonName}
              size={12}
              color={palette.brand.secondary}
            />
            <Text style={styles.pillTextMood}>{MOOD_LABELS_ES[mood]}</Text>
          </View>
        </View>

        {symptomCount > 0 ? (
          <View style={styles.symptomChips}>
            {visibleSymptoms.map((id) => (
              <View key={id} style={styles.symptomChip}>
                <Text style={styles.symptomChipText} numberOfLines={1}>
                  {SYMPTOM_LABELS_ES[id]}
                </Text>
              </View>
            ))}
            {extraSymptoms > 0 ? (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{extraSymptoms}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <ThemedText style={styles.noSymptoms}>Sin síntomas marcados</ThemedText>
        )}

        {notesTrimmed ? (
          <View style={styles.notesBlock}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={14}
              color={palette.semantic.info}
              style={styles.notesIcon}
            />
            <Text
              style={styles.notesText}
              numberOfLines={NOTES_PREVIEW_LINES}
              ellipsizeMode="tail"
            >
              {notesTrimmed}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border.light,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.brand.secondaryBorderSoft,
    backgroundColor: palette.brand.secondaryMuted,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    paddingRight: 6,
  },
  dateCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.brand.secondary,
    textTransform: 'capitalize',
  },
  timeDot: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.text.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 8,
  },
  iconBtnPressedDelete: {
    opacity: 0.7,
    backgroundColor: palette.semantic.errorMuted,
  },
  iconBtnPressedEdit: {
    opacity: 1,
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  pillEnergy: {
    backgroundColor: `${palette.brand.primary}14`,
  },
  pillMood: {
    backgroundColor: `${palette.brand.secondary}18`,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.text.primary,
  },
  pillTextMood: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.text.primary,
  },
  symptomChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  symptomChip: {
    maxWidth: '100%',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: palette.surface.input,
    borderWidth: 1,
    borderColor: palette.border.light,
  },
  symptomChipText: {
    fontSize: 11,
    color: palette.text.primary,
  },
  moreChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
  },
  moreChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.text.secondary,
  },
  noSymptoms: {
    marginTop: 4,
    fontSize: 11,
    color: palette.text.muted,
    fontStyle: 'italic',
  },
  notesBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: palette.semantic.infoMuted,
    borderWidth: 1,
    borderColor: palette.semantic.infoBorderSoft,
  },
  notesIcon: {
    marginTop: 1,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: palette.text.primary,
  },
});
