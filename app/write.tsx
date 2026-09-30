import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AppBackground, Field, GhostButton, IconButton, MoodSelector, PrimaryButton, SectionLabel } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import type { Mood } from '@/types/thought';
import { useColors } from '@/hooks/useColors';

export default function WriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { thoughts, draft, setDraft, saveThought } = useApp();
  const existing = id ? thoughts.find((thought) => thought.id === id) : undefined;
  const [title, setTitle] = useState(existing?.title ?? (id ? '' : draft.title ?? ''));
  const [content, setContent] = useState(existing?.content ?? (id ? '' : draft.content));
  const [mood, setMood] = useState<Mood | undefined>(existing?.mood ?? (id ? undefined : draft.mood));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id && (title || content || mood)) setDraft({ title, content, mood });
  }, [title, content, mood, id]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('A little more space', 'Write something before saving this thought.');
      return;
    }
    setSaving(true);
    try {
      const thought = await saveThought({ title, content, mood }, id);
      Keyboard.dismiss();
      router.replace({ pathname: '/thought/[id]', params: { id: thought.id } });
    } catch {
      Alert.alert('Could not save', 'Your thought was not saved. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Text style={[styles.screenLabel, { color: colors.mutedForeground }]}>{id ? 'EDIT THOUGHT' : 'NEW THOUGHT'}</Text>
          <Pressable onPress={handleSave} disabled={saving} accessibilityRole="button" accessibilityLabel="Save thought">
            <Text style={[styles.saveText, { color: colors.primary, opacity: saving ? 0.5 : 1 }]}>Save</Text>
          </Pressable>
        </View>
        <KeyboardAwareScrollViewCompat
          bottomOffset={20}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>What’s on{'\n'}your mind?</Text>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>No need to make it perfect. Just make it yours.</Text>
          <View style={styles.form}>
            <Field label="Title / optional" value={title} onChangeText={setTitle} placeholder="Give it a name..." returnKeyType="next" />
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Your thought</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                placeholder="Let it out..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.thoughtInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                accessibilityLabel="Thought content"
                testID="field-content"
              />
              <Text style={[styles.characterHint, { color: colors.mutedForeground }]}>{content.length} characters</Text>
            </View>
            <View style={styles.moodSection}>
              <View style={styles.moodLabelRow}>
                <SectionLabel>Mood</SectionLabel>
                {mood && <Pressable onPress={() => setMood(undefined)}><Text style={[styles.clearMood, { color: colors.primary }]}>Clear</Text></Pressable>}
              </View>
              <MoodSelector value={mood} onChange={setMood} />
            </View>
          </View>
          <View style={styles.bottomAction}>
            <PrimaryButton title={id ? 'Update thought' : 'Save thought'} icon="check" onPress={handleSave} loading={saving} />
            <GhostButton title="Keep writing" icon="edit-3" onPress={() => undefined} />
          </View>
        </KeyboardAwareScrollViewCompat>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenLabel: { fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.3 },
  saveText: { fontSize: 15, fontWeight: '700', padding: 10 },
  scrollContent: { paddingTop: 32, paddingBottom: 20 },
  title: { fontSize: 34, lineHeight: 39, fontWeight: '700', letterSpacing: -1 },
  helper: { fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 300 },
  form: { gap: 24, marginTop: 34 },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  thoughtInput: { minHeight: 190, borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16, fontSize: 17, lineHeight: 25 },
  characterHint: { alignSelf: 'flex-end', fontSize: 10, fontFamily: 'monospace' },
  moodSection: { gap: 12 },
  moodLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearMood: { fontSize: 12, fontWeight: '600' },
  bottomAction: { gap: 10, marginTop: 34 },
});