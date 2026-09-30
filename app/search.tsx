import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, IconButton, ThoughtCard } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { thoughts } = useApp();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return thoughts;
    return thoughts.filter((thought) => `${thought.title} ${thought.content}`.toLowerCase().includes(normalized));
  }, [query, thoughts]);

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SEARCH</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={[styles.searchField, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="search" size={18} color={colors.primary} />
          <TextInput value={query} onChangeText={setQuery} autoFocus placeholder="Search your thoughts..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} accessibilityLabel="Search thoughts" />
          {query.length > 0 && <IconButton icon="x" label="Clear search" onPress={() => setQuery('')} />}
        </View>
        <Text style={[styles.resultMeta, { color: colors.mutedForeground }]}>{query ? `${results.length} result${results.length === 1 ? '' : 's'}` : `${thoughts.length} thought${thoughts.length === 1 ? '' : 's'}`}</Text>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={results.length > 0}
          renderItem={({ item }) => <ThoughtCard thought={item} onPress={() => router.push({ pathname: '/thought/[id]', params: { id: item.id } })} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={26} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{query ? 'Nothing matched.' : 'No thoughts yet.'}</Text>
              <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>{query ? 'Try another word or phrase.' : 'Your saved thoughts will appear here.'}</Text>
            </View>
          }
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.4 },
  searchField: { minHeight: 54, marginTop: 28, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 7, gap: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  resultMeta: { fontFamily: 'monospace', fontSize: 10, marginTop: 18, marginBottom: 12 },
  list: { paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 100, gap: 9 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 5 },
  emptyCopy: { fontSize: 13 },
});