import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, Brand, PrimaryButton } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, unlockWithPin, unlockWithBiometric, hasPin } = useApp();
  const [pin, setPin] = useState('');
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  useEffect(() => {
    void (async () => {
      if (settings.biometric) setCanUseBiometric(await hasPin());
    })();
  }, [settings.biometric, hasPin]);

  const unlock = async () => {
    const ok = await unlockWithPin(pin);
    if (ok) router.replace('/');
    else {
      setPin('');
      Alert.alert('Not quite', 'That PIN does not match.');
    }
  };

  const biometric = async () => {
    const ok = await unlockWithBiometric();
    if (ok) router.replace('/');
    else Alert.alert('Could not unlock', 'Use your PIN to continue.');
  };

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        <Brand />
        <View style={styles.center}>
          <View style={[styles.lockOrb, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Feather name="lock" size={27} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Your space is private.</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>Unlock WHO AM I to return to your thoughts.</Text>
          <TextInput value={pin} onChangeText={setPin} onSubmitEditing={() => void unlock()} autoFocus secureTextEntry keyboardType="number-pad" maxLength={8} placeholder="Enter your PIN" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
          <PrimaryButton title="Unlock" icon="arrow-right" onPress={() => void unlock()} disabled={pin.length < 4} />
          {canUseBiometric && <Pressable onPress={() => void biometric()} style={({ pressed }) => [styles.biometric, pressed && { opacity: 0.7 }]}><Feather name="smartphone" size={16} color={colors.primary} /><Text style={[styles.biometricText, { color: colors.primary }]}>Use biometric unlock</Text></Pressable>}
        </View>
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>Everything stays on this device.</Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  center: { alignItems: 'center', gap: 13, width: '100%' },
  lockOrb: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 23, fontWeight: '700', textAlign: 'center' },
  copy: { maxWidth: 270, textAlign: 'center', fontSize: 14, lineHeight: 21, marginBottom: 12 },
  input: { width: '100%', minHeight: 56, borderRadius: 17, borderWidth: 1, paddingHorizontal: 16, textAlign: 'center', fontSize: 17 },
  biometric: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10 },
  biometricText: { fontSize: 13, fontWeight: '600' },
  footer: { fontSize: 11, textAlign: 'center', fontFamily: 'monospace' },
});