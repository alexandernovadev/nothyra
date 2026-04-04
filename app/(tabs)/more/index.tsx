import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { Btn } from '@/components/ui/btn';
import { MainLayout } from '@/components/ui/layouts/MainLayout';
import { palette } from '@/constants/palette';
import { useAuth } from '@/contexts/auth-context';
import blogSeed from '@/data/blog.json';
import recipesSeed from '@/data/recipes.json';
import symptomSeed from '@/data/syntom.json';
import { BLOG_POSTS_COLLECTION, type BlogPostDoc } from '@/lib/blog/firestore';
import { getAppVersion } from '@/lib/app-version';
import { db } from '@/lib/firebase';
import { RECIPES_COLLECTION, type RecipeDoc } from '@/lib/recipes/firestore';
import { SYMPTOM_LOGS_COLLECTION, type SymptomLogFirestoreDoc } from '@/lib/symptom-log/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const appVersion = getAppVersion();

const DEVELOPER_URL = 'https://github.com/alexandernovadev';

function getInitials(displayName: string | null | undefined, email: string | null | undefined): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  if (email) {
    const letter = email[0];
    return letter ? letter.toUpperCase() : '?';
  }
  return '?';
}

/**
 * More tab: avatar, summary, settings-style rows, logout.
 */
export default function MoreScreen() {
  const { logout, email, user, role } = useAuth();
  const router = useRouter();
  const [seedingRecipes, setSeedingRecipes] = useState(false);
  const [seedingBlog, setSeedingBlog] = useState(false);
  const [seedingSymptoms, setSeedingSymptoms] = useState(false);
  const displayName = user?.displayName ?? '';
  const initials = getInitials(displayName, email);
  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuario';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSeedRecipes = () => {
    if (seedingRecipes || seedingBlog || seedingSymptoms || !user?.uid) return;

    Alert.alert(
      'Cargar recetas base',
      `Se cargarán ${recipesSeed.length} recetas en Firestore.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: async () => {
            setSeedingRecipes(true);
            try {
              let inserted = 0;
              const rows = recipesSeed as Omit<RecipeDoc, 'createdAt' | 'updatedAt' | 'createdBy'>[];

              for (const recipe of rows) {
                await addDoc(collection(db, RECIPES_COLLECTION), {
                  ...recipe,
                  createdBy: user.uid,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                inserted += 1;
              }

              Alert.alert('Listo', `Se cargaron ${inserted} recetas.`);
            } catch (error) {
              console.error('[SeedRecipes]', error);
              Alert.alert('Error', 'No se pudieron cargar las recetas.');
            } finally {
              setSeedingRecipes(false);
            }
          },
        },
      ],
    );
  };

  const handleSeedBlog = () => {
    if (seedingRecipes || seedingBlog || seedingSymptoms || !user?.uid) return;

    Alert.alert(
      'Cargar artículos base',
      `Se cargarán ${blogSeed.length} artículos en Firestore.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: async () => {
            setSeedingBlog(true);
            try {
              let inserted = 0;
              const rows = blogSeed as Omit<BlogPostDoc, 'createdAt' | 'updatedAt' | 'createdBy'>[];

              for (const post of rows) {
                await addDoc(collection(db, BLOG_POSTS_COLLECTION), {
                  title: post.title,
                  excerpt: post.excerpt,
                  coverImageUrl: post.coverImageUrl,
                  author: post.author,
                  content: post.content,
                  tags: post.tags,
                  status: post.status,
                  createdBy: user.uid,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                inserted += 1;
              }

              Alert.alert('Listo', `Se cargaron ${inserted} artículos.`);
            } catch (error) {
              console.error('[SeedBlog]', error);
              Alert.alert('Error', 'No se pudieron cargar los artículos.');
            } finally {
              setSeedingBlog(false);
            }
          },
        },
      ],
    );
  };

  const handleSeedSymptoms = () => {
    if (seedingRecipes || seedingBlog || seedingSymptoms || !user?.uid) return;

    Alert.alert(
      'Cargar síntomas base',
      `Se cargarán ${symptomSeed.length} registros para tu usuario actual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: async () => {
            setSeedingSymptoms(true);
            try {
              let inserted = 0;
              const rows = symptomSeed as Omit<SymptomLogFirestoreDoc, 'userId' | 'createdAt' | 'updatedAt'>[];

              for (const row of rows) {
                await addDoc(collection(db, SYMPTOM_LOGS_COLLECTION), {
                  userId: user.uid,
                  dateKey: row.dateKey,
                  energyLevel: row.energyLevel,
                  mood: row.mood,
                  symptoms: row.symptoms,
                  notes: row.notes,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                inserted += 1;
              }

              Alert.alert('Listo', `Se cargaron ${inserted} registros de síntomas.`);
            } catch (error) {
              console.error('[SeedSymptoms]', error);
              Alert.alert('Error', 'No se pudieron cargar los síntomas.');
            } finally {
              setSeedingSymptoms(false);
            }
          },
        },
      ],
    );
  };

  return (
    <MainLayout>
      <View style={styles.root}>
        <ThemedText type="title" style={styles.screenTitle}>
          Más
        </ThemedText>
        <ThemedText style={styles.screenHint}>
          Cuenta y opciones de la app
        </ThemedText>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />
            <View style={styles.heroInner}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
              <View style={styles.heroTextCol}>
                <ThemedText type="defaultSemiBold" style={styles.profileName}>
                  {displayName || 'Sin nombre'}
                </ThemedText>
                {email ? (
                  <ThemedText style={styles.profileEmail} numberOfLines={2}>
                    {email}
                  </ThemedText>
                ) : null}
                <View style={styles.rolePill}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={palette.brand.secondary}
                  />
                  <Text style={styles.rolePillText}>{roleLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <ThemedText style={styles.sectionLabel}>Acciones</ThemedText>

          <View style={styles.card}>
            <Pressable
              onPress={() => router.push('/(tabs)/more/profile')}
              style={({ pressed }) => [styles.rowPress, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
            >
              <View style={styles.rowIconWrap}>
                <Ionicons
                  name="person-circle-outline"
                  size={22}
                  color={palette.brand.primary}
                />
              </View>
              <View style={styles.rowBody}>
                <ThemedText type="defaultSemiBold" style={styles.rowTitle}>
                  Editar perfil
                </ThemedText>
                <ThemedText style={styles.rowSubtitle}>
                  Nombre que verás en la app
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={palette.text.muted}
              />
            </Pressable>
          </View>

          {role === 'admin' && (
            <>
              <View style={styles.card}>
                <Pressable
                  onPress={() => router.push('/(tabs)/more/recipes')}
                  style={({ pressed }) => [styles.rowPress, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Recetas"
                >
                  <View style={styles.rowIconWrap}>
                    <Ionicons
                      name="restaurant-outline"
                      size={22}
                      color={palette.brand.secondary}
                    />
                  </View>
                  <View style={styles.rowBody}>
                    <ThemedText type="defaultSemiBold" style={styles.rowTitle}>
                      Recetas
                    </ThemedText>
                    <ThemedText style={styles.rowSubtitle}>
                      Platos publicados por el equipo
                    </ThemedText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={palette.text.muted}
                  />
                </Pressable>
              </View>

              <View style={styles.card}>
                <Pressable
                  onPress={() => router.push('/(tabs)/more/blog')}
                  style={({ pressed }) => [styles.rowPress, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Blog de salud"
                >
                  <View style={styles.rowIconWrap}>
                    <Ionicons
                      name="newspaper-outline"
                      size={22}
                      color={palette.brand.primary}
                    />
                  </View>
                  <View style={styles.rowBody}>
                    <ThemedText type="defaultSemiBold" style={styles.rowTitle}>
                      Blog de salud
                    </ThemedText>
                    <ThemedText style={styles.rowSubtitle}>
                      Artículos y consejos del equipo
                    </ThemedText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={palette.text.muted}
                  />
                </Pressable>
              </View>

              {/* <View style={styles.card}>
                <Btn
                  style={styles.seedBtn}
                  onPress={handleSeedRecipes}
                  disabled={seedingRecipes || seedingBlog || seedingSymptoms}
                >
                  <View style={styles.seedBtnInner}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={palette.text.inverse}
                    />
                    <ThemedText type="defaultSemiBold" style={styles.seedBtnText}>
                      {seedingRecipes ? 'Cargando recetas...' : 'Cargar recetas base'}
                    </ThemedText>
                  </View>
                </Btn>
              </View> */}

              {/* <View style={styles.card}>
                <Btn
                  style={styles.seedBlogBtn}
                  onPress={handleSeedBlog}
                  disabled={seedingRecipes || seedingBlog || seedingSymptoms}
                >
                  <View style={styles.seedBtnInner}>
                    <Ionicons
                      name="newspaper-outline"
                      size={20}
                      color={palette.text.inverse}
                    />
                    <ThemedText type="defaultSemiBold" style={styles.seedBtnText}>
                      {seedingBlog ? 'Cargando artículos...' : 'Cargar artículos base'}
                    </ThemedText>
                  </View>
                </Btn>
              </View> */}

              {/* <View style={styles.card}>
                <Btn
                  style={styles.seedSymptomsBtn}
                  onPress={handleSeedSymptoms}
                  disabled={seedingRecipes || seedingBlog || seedingSymptoms}
                >
                  <View style={styles.seedBtnInner}>
                    <Ionicons
                      name="pulse-outline"
                      size={20}
                      color={palette.text.inverse}
                    />
                    <ThemedText type="defaultSemiBold" style={styles.seedBtnText}>
                      {seedingSymptoms ? 'Cargando síntomas...' : 'Cargar síntomas base'}
                    </ThemedText>
                  </View>
                </Btn>
              </View> */}
            </>
          )}

          <View style={styles.card}>
            <Btn style={styles.logoutBtn} onPress={handleLogout}>
              <View style={styles.logoutInner}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={palette.text.inverse}
                />
                <ThemedText type="defaultSemiBold" style={styles.logoutBtnText}>
                  Cerrar sesión
                </ThemedText>
              </View>
            </Btn>
          </View>

          <View style={styles.footerMeta}>
            {appVersion ? (
              <View style={styles.versionRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={palette.text.muted}
                />
                <ThemedText style={styles.version}>Versión {appVersion}</ThemedText>
              </View>
            ) : null}
            <ExternalLink href={DEVELOPER_URL} style={styles.footerLinkWrap}>
              <ThemedText style={styles.footerLink}>{DEVELOPER_URL}</ThemedText>
            </ExternalLink>
            <ThemedText style={styles.footerCopyright}>© NovaAlex Labs</ThemedText>
          </View>
        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  screenTitle: {
    marginBottom: 4,
  },
  screenHint: {
    fontSize: 14,
    color: palette.text.secondary,
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  heroCard: {
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border.light,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  heroAccent: {
    height: 4,
    backgroundColor: palette.brand.secondary,
    opacity: 0.85,
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  initialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: palette.text.inverse,
    fontSize: 22,
    fontWeight: '700',
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 18,
    color: palette.text.primary,
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 14,
    color: palette.text.secondary,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.brand.secondaryMuted,
    borderWidth: 1,
    borderColor: palette.brand.secondaryBorderSoft,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.brand.secondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border.light,
    marginBottom: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  rowPress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  rowPressed: {
    backgroundColor: palette.brand.primaryMuted,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.brand.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    color: palette.text.primary,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: palette.text.muted,
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: palette.semantic.error,
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: palette.text.inverse,
    fontSize: 16,
  },
  seedBtn: {
    width: '100%',
    backgroundColor: palette.brand.primary,
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedBlogBtn: {
    width: '100%',
    backgroundColor: palette.brand.secondary,
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedSymptomsBtn: {
    width: '100%',
    backgroundColor: '#6A4C93',
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seedBtnText: {
    color: palette.text.inverse,
    fontSize: 15,
  },
  footerMeta: {
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
    paddingHorizontal: 8,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  version: {
    fontSize: 13,
    color: palette.text.muted,
  },
  footerLinkWrap: {
    maxWidth: '100%',
  },
  footerLink: {
    fontSize: 12,
    color: palette.brand.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    fontSize: 11,
    color: palette.text.muted,
    textAlign: 'center',
  },
});
