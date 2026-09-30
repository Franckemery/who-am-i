import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, Brand, EmptyState, IconButton, ThoughtCard } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { thoughts } = useApp();
  const favorites = thoughts.filter((thought) => thought.isFavorite);
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <Brand />
          <View style={styles.headerActions}>
            <IconButton icon="search" label="Search" onPress={() => router.push('/search')} />
            <IconButton icon="sliders" label="Settings" onPress={() => router.push('/settings')} />
          </View>
        </View>
        <FlatList
          data={thoughts.slice(0, 8)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={thoughts.length > 0}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.intro}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>{greeting.toUpperCase()} / YOUR SPACE</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Make room for{'\n'}what’s inside.</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A quiet place for the thoughts that shape you.</Text>
              <Pressable
                testID="button-write"
                accessibilityRole="button"
                accessibilityLabel="Write a new thought"
                onPress={() => router.push('/write')}
                style={({ pressed }) => [styles.writeCta, { backgroundColor: colors.primary }, pressed && styles.pressed]}
              >
                <View style={styles.writeCtaCopy}>
                  <Text style={[styles.writeCtaLabel, { color: colors.primaryForeground }]}>Capture a thought</Text>
                  <Text style={[styles.writeCtaHint, { color: `${colors.primaryForeground}B8` }]}>Start writing freely</Text>
                </View>
                <View style={[styles.ctaIcon, { backgroundColor: `${colors.primaryForeground}18` }]}>
                  <Feather name="arrow-up-right" size={21} color={colors.primaryForeground} />
                </View>
              </Pressable>
              {favorites.length > 0 && (
                <View style={styles.favoritesHeading}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Held close</Text>
                  <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>{favorites.length} favorite{favorites.length === 1 ? '' : 's'}</Text>
                </View>
              )}
              {thoughts.length > 0 && (
                <View style={styles.recentHeading}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent thoughts</Text>
                  <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>{thoughts.length} total</Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => <ThoughtCard thought={item} onPress={() => router.push({ pathname: '/thought/[id]', params: { id: item.id } })} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<EmptyState onWrite={() => router.push('/write')} />}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerActions: { flexDirection: 'row', gap: 8 },
  listContent: { paddingBottom: 20 },
  intro: { paddingTop: 25 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginBottom: 13 },
  title: { fontSize: 35, lineHeight: 40, fontWeight: '700', letterSpacing: -1.1 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 13, maxWidth: 280 },
  writeCta: { borderRadius: 21, minHeight: 78, marginTop: 26, paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  writeCtaCopy: { gap: 4 },
  writeCtaLabel: { fontSize: 16, fontWeight: '700' },
  writeCtaHint: { fontSize: 12 },
  ctaIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  favoritesHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 },
  recentHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionMeta: { fontSize: 12, fontFamily: 'monospace' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});