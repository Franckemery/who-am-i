import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { getMood } from '@/types/thought';

export default function ThoughtDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { thoughts, deleteThought, toggleFavorite } = useApp();
  const thought = thoughts.find((item) => item.id === id);
  const mood = getMood(thought?.mood);

  if (!thought) {
    return (
      <AppBackground>
        <View style={[styles.notFound, { paddingTop: insets.top }]}>
          <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Thought not found.</Text>
          <GhostButton title="Go home" onPress={() => router.replace('/')} icon="arrow-left" />
        </View>
      </AppBackground>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete this thought?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void deleteThought(thought.id).then(() => router.replace('/')); } },
    ]);
  };

  return (
    <AppBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
          <View style={styles.topActions}>
            <IconButton icon={thought.isFavorite ? 'star' : 'star'} label="Favorite" onPress={() => void toggleFavorite(thought.id)} tone={thought.isFavorite ? 'primary' : 'ghost'} />
            <IconButton icon="edit-2" label="Edit" onPress={() => router.push({ pathname: '/write', params: { id: thought.id } })} />
          </View>
        </View>
        <View style={[styles.moodLine, { borderColor: colors.border }]}>
          {mood && <><Feather name={mood.icon} size={16} color={mood.color} /><Text style={[styles.moodText, { color: mood.color }]}>{mood.label}</Text></>}
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date(thought.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{thought.title || 'Untitled thought'}</Text>
        <Text selectable style={[styles.thought, { color: colors.foreground }]}>{thought.content}</Text>
        <View style={styles.footer}>
          <Text style={[styles.updated, { color: colors.mutedForeground }]}>Updated {new Date(thought.updatedAt).toLocaleDateString()}</Text>
          <PrimaryButton title="Edit thought" icon="edit-2" onPress={() => router.push({ pathname: '/write', params: { id: thought.id } })} />
          <GhostButton title="Delete thought" icon="trash-2" onPress={handleDelete} />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  topBar: { height: 46, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topActions: { flexDirection: 'row', gap: 8 },
  moodLine: { marginTop: 32, paddingBottom: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodText: { fontSize: 12, fontWeight: '700' },
  date: { marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace' },
  title: { fontSize: 30, fontWeight: '700', lineHeight: 36, marginTop: 28, letterSpacing: -0.6 },
  thought: { fontSize: 18, lineHeight: 29, marginTop: 24 },
  footer: { marginTop: 50, gap: 10 },
  updated: { fontFamily: 'monospace', fontSize: 10, marginBottom: 3 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  notFoundTitle: { fontSize: 20, fontWeight: '700' },
});