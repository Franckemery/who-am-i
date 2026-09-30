import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { getMood, type Mood, type Thought } from '@/types/thought';

export function AppBackground({ children }: React.PropsWithChildren) {
  const colors = useColors();
  return (
    <View style={[styles.background, { backgroundColor: colors.background }]}>
      <View style={[styles.topGlow, { backgroundColor: colors.primary }]} />
      <View style={[styles.sideGlow, { backgroundColor: colors.accent }]} />
      {children}
    </View>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.brand}>
      <Image
        source={require('../assets/images/icon.png')}
        style={[styles.brandIcon, compact && styles.brandIconCompact]}
        contentFit="contain"
      />
      {!compact && (
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>WHO AM I</Text>
          <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>Every thought is a part of me.</Text>
        </View>
      )}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'ghost',
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  label: string;
  tone?: 'ghost' | 'primary';
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`icon-${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: tone === 'primary' ? colors.primary : colors.secondary },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={18} color={tone === 'primary' ? colors.primaryForeground : colors.foreground} />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  loading?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={`button-${title}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary, opacity: disabled ? 0.45 : 1 },
        pressed && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <>{icon && <Feather name={icon} size={17} color={colors.primaryForeground} />}<Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{title}</Text></>}
    </Pressable>
  );
}

export function GhostButton({ title, onPress, icon }: { title: string; onPress: () => void; icon?: React.ComponentProps<typeof Feather>['name'] }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.ghostButton, { borderColor: colors.border }, pressed && styles.pressed]}
    >
      {icon && <Feather name={icon} size={16} color={colors.foreground} />}
      <Text style={[styles.ghostButtonText, { color: colors.foreground }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        {...props}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }, props.style]}
      />
    </View>
  );
}

export function SectionLabel({ children }: React.PropsWithChildren) {
  const colors = useColors();
  return <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{children}</Text>;
}

export function MoodSelector({ value, onChange }: { value?: Mood; onChange: (mood?: Mood) => void }) {
  const colors = useColors();
  const moods: Array<{ id: Mood; label: string; icon: React.ComponentProps<typeof Feather>['name']; color: string }> = [
    { id: 'happy', label: 'Happy', icon: 'sun', color: '#FBBF24' },
    { id: 'calm', label: 'Calm', icon: 'cloud', color: '#67E8F9' },
    { id: 'reflective', label: 'Reflective', icon: 'compass', color: '#C4B5FD' },
    { id: 'sad', label: 'Sad', icon: 'cloud-drizzle', color: '#93C5FD' },
    { id: 'frustrated', label: 'Frustrated', icon: 'zap', color: '#FB7185' },
    { id: 'motivated', label: 'Motivated', icon: 'trending-up', color: '#F97316' },
    { id: 'grateful', label: 'Grateful', icon: 'heart', color: '#F0ABFC' },
    { id: 'neutral', label: 'Neutral', icon: 'minus', color: '#94A3B8' },
  ];
  return (
    <View style={styles.moodGrid}>
      {moods.map((mood) => {
        const selected = mood.id === value;
        return (
          <Pressable
            key={mood.id}
            accessibilityRole="button"
            accessibilityLabel={mood.label}
            onPress={() => onChange(selected ? undefined : mood.id)}
            style={({ pressed }) => [
              styles.moodChip,
              { borderColor: selected ? mood.color : colors.border, backgroundColor: selected ? `${mood.color}22` : colors.card },
              pressed && styles.pressed,
            ]}
          >
            <Feather name={mood.icon} size={16} color={mood.color} />
            <Text style={[styles.moodChipText, { color: selected ? colors.foreground : colors.mutedForeground }]}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ThoughtCard({ thought, onPress }: { thought: Thought; onPress: () => void }) {
  const colors = useColors();
  const mood = getMood(thought.mood);
  const date = new Date(thought.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={thought.title || 'Open thought'}
      style={({ pressed }) => [styles.thoughtCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
    >
      <View style={styles.cardTopline}>
        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>{date}</Text>
        <View style={styles.cardMeta}>
          {mood && <Feather name={mood.icon} size={14} color={mood.color} />}
          {thought.isFavorite && <Feather name="star" size={14} color={colors.rose} fill={colors.rose} />}
        </View>
      </View>
      <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.foreground }]}>
        {thought.title || 'Untitled thought'}
      </Text>
      <Text numberOfLines={2} style={[styles.cardContent, { color: colors.mutedForeground }]}>
        {thought.content}
      </Text>
    </Pressable>
  );
}

export function EmptyState({ onWrite }: { onWrite: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyOrb, { borderColor: colors.border }]}>
        <Feather name="edit-3" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing here yet.</Text>
      <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>Write your first thought.</Text>
      <PrimaryButton title="Write" icon="arrow-up-right" onPress={onWrite} />
    </View>
  );
}

export const styles = StyleSheet.create({
  background: { flex: 1, overflow: 'hidden' },
  topGlow: { position: 'absolute', width: 230, height: 230, borderRadius: 140, top: -140, right: -70, opacity: 0.11 },
  sideGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 140, bottom: 110, left: -160, opacity: 0.09 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 42, height: 42, borderRadius: 13 },
  brandIconCompact: { width: 34, height: 34, borderRadius: 11 },
  brandName: { fontSize: 15, fontWeight: '700', letterSpacing: 2.2 },
  brandTagline: { fontSize: 10, marginTop: 3, letterSpacing: 0.3 },
  iconButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  primaryButton: { minHeight: 52, borderRadius: 17, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  primaryButtonText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  ghostButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  ghostButtonText: { fontSize: 14, fontWeight: '600' },
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { minHeight: 38, paddingHorizontal: 11, borderRadius: 13, borderWidth: 1, alignItems: 'center', flexDirection: 'row', gap: 6 },
  moodChipText: { fontSize: 12, fontWeight: '600' },
  thoughtCard: { borderRadius: 20, borderWidth: 1, padding: 17, gap: 8 },
  cardTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontFamily: 'monospace', fontSize: 11, letterSpacing: 0.4 },
  cardMeta: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardContent: { fontSize: 14, lineHeight: 21 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 10 },
  emptyOrb: { width: 74, height: 74, borderRadius: 37, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyCopy: { fontSize: 14, marginBottom: 14 },
});