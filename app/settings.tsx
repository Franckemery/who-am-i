import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, GhostButton, IconButton, PrimaryButton, SectionLabel } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { AppSettings } from '@/types/thought';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, setPin, hasPin, exportData, importData, clearThoughts, lockNow } = useApp();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPinValue] = useState('');

  const patch = async (next: Partial<AppSettings>) => {
    await Haptics.selectionAsync();
    await updateSettings(next);
  };

  const handleExport = async () => {
    await Clipboard.setStringAsync(exportData());
    Alert.alert('Export ready', 'Your JSON export was copied to the clipboard. Paste it somewhere safe.');
  };

  const handleImport = async () => {
    try {
      const result = await importData(importText);
      setImportOpen(false);
      setImportText('');
      Alert.alert('Import complete', `${result.imported} thought${result.imported === 1 ? '' : 's'} imported. ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'} skipped.`);
    } catch {
      Alert.alert('Import rejected', 'Use a valid WHO AM I JSON export.');
    }
  };

  const handlePin = async () => {
    if (!/^\d{4,8}$/.test(pin)) {
      Alert.alert('Choose a PIN', 'Use between 4 and 8 digits.');
      return;
    }
    await setPin(pin);
    await updateSettings({ appLock: true });
    setPinOpen(false);
    setPinValue('');
    Alert.alert('PIN enabled', 'Your thoughts will be protected when the app locks.');
  };

  const handleDeleteAll = () => {
    Alert.alert('Delete all thoughts?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: () => Alert.alert('Are you absolutely sure?', 'Every saved thought will be permanently removed.', [
        { text: 'Keep them', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => { void clearThoughts(); } },
      ]) },
    ]);
  };

  return (
    <AppBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SETTINGS</Text>
          <View style={{ width: 42 }} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Make it yours.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A few quiet choices for your private space.</Text>

        <View style={styles.section}>
          <SectionLabel>Security</SectionLabel>
          <SettingRow icon="lock" title="App Lock" copy="Protect your thoughts on return" value={settings.appLock} onValueChange={(value) => { if (value) setPinOpen(true); else void patch({ appLock: false }); }} />
          <SettingRow icon="clock" title="Lock timing" copy={settings.lockDelay === 'never' ? 'Never' : settings.lockDelay === 'immediately' ? 'Immediately' : `After ${settings.lockDelay.replace('m', ' minute')}`} value={false} onValueChange={() => undefined} trailing={<View style={styles.delayRow}>{(['immediately', '1m', '5m', '15m', 'never'] as const).map((delay) => <Pressable key={delay} onPress={() => void patch({ lockDelay: delay })} style={[styles.delayChip, { borderColor: settings.lockDelay === delay ? colors.primary : colors.border, backgroundColor: settings.lockDelay === delay ? `${colors.primary}1F` : colors.card }]}><Text style={[styles.delayText, { color: settings.lockDelay === delay ? colors.primary : colors.mutedForeground }]}>{delay === 'immediately' ? 'Now' : delay === 'never' ? 'Off' : delay}</Text></Pressable>)}</View>} />
          <SettingRow icon="smartphone" title="Biometric unlock" copy="Use Face ID or fingerprint when available" value={settings.biometric} onValueChange={(value) => void patch({ biometric: value })} />
          {settings.appLock && <GhostButton title="Lock now" icon="lock" onPress={lockNow} />}
        </View>

        <View style={styles.section}>
          <SectionLabel>Data</SectionLabel>
          <View style={styles.actionRow}><View style={styles.actionCopy}><Feather name="upload" size={17} color={colors.primary} /><View><Text style={[styles.actionTitle, { color: colors.foreground }]}>Export thoughts</Text><Text style={[styles.actionSub, { color: colors.mutedForeground }]}>Copy a private JSON backup</Text></View></View><Pressable onPress={() => void handleExport}><Text style={[styles.actionLink, { color: colors.primary }]}>Export</Text></Pressable></View>
          <View style={styles.actionRow}><View style={styles.actionCopy}><Feather name="download" size={17} color={colors.primary} /><View><Text style={[styles.actionTitle, { color: colors.foreground }]}>Import thoughts</Text><Text style={[styles.actionSub, { color: colors.mutedForeground }]}>Paste a WHO AM I backup</Text></View></View><Pressable onPress={() => setImportOpen(true)}><Text style={[styles.actionLink, { color: colors.primary }]}>Import</Text></Pressable></View>
          <Pressable onPress={handleDeleteAll} style={[styles.dangerRow, { borderColor: `${colors.destructive}55` }]}><Feather name="trash-2" size={17} color={colors.destructive} /><Text style={[styles.dangerText, { color: colors.destructive }]}>Delete all thoughts</Text></Pressable>
        </View>

        <View style={styles.section}>
          <SectionLabel>About</SectionLabel>
          <View style={styles.about}><Text style={[styles.aboutName, { color: colors.foreground }]}>WHO AM I</Text><Text style={[styles.aboutTagline, { color: colors.mutedForeground }]}>Every thought is a part of me.</Text><Text style={[styles.version, { color: colors.mutedForeground }]}>Version 1.0.0 · Local-first</Text></View>
        </View>
      </ScrollView>
      <Modal visible={importOpen} transparent animationType="slide" onRequestClose={() => setImportOpen(false)}>
        <View style={[styles.modalBackdrop, { paddingBottom: insets.bottom + 12 }]}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Import backup</Text><Text style={[styles.modalCopy, { color: colors.mutedForeground }]}>Paste the JSON you exported from WHO AM I.</Text><TextInput multiline value={importText} onChangeText={setImportText} placeholder="{ thoughts: [...] }" placeholderTextColor={colors.mutedForeground} style={[styles.importInput, { color: colors.foreground, borderColor: colors.border }]} /><PrimaryButton title="Import JSON" icon="download" onPress={() => void handleImport()} /><GhostButton title="Cancel" onPress={() => setImportOpen(false)} /></View></View>
      </Modal>
      <Modal visible={pinOpen} transparent animationType="slide" onRequestClose={() => setPinOpen(false)}>
        <View style={[styles.modalBackdrop, { paddingBottom: insets.bottom + 12 }]}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Create a private PIN</Text><Text style={[styles.modalCopy, { color: colors.mutedForeground }]}>Use 4 to 8 digits. It is stored securely on this device.</Text><TextInput value={pin} onChangeText={setPinValue} maxLength={8} keyboardType="number-pad" secureTextEntry placeholder="••••" placeholderTextColor={colors.mutedForeground} style={[styles.pinInput, { color: colors.foreground, borderColor: colors.border }]} /><PrimaryButton title="Enable app lock" icon="shield" onPress={() => void handlePin()} /><GhostButton title="Cancel" onPress={() => setPinOpen(false)} /></View></View>
      </Modal>
    </AppBackground>
  );
}

function SettingRow({ icon, title, copy, value, onValueChange, trailing }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; copy: string; value: boolean; onValueChange: (value: boolean) => void; trailing?: React.ReactNode }) {
  const colors = useColors();
  return <View style={styles.settingBlock}><View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={16} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingSub, { color: colors.mutedForeground }]}>{copy}</Text></View>{trailing ?? <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.secondary, true: `${colors.primary}88` }} thumbColor={value ? colors.primary : colors.mutedForeground} />}</View>{trailing && <View style={styles.trailing}>{trailing}</View>}</View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  topBar: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.4 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', marginTop: 30 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 300 },
  section: { gap: 15, marginTop: 35 },
  settingBlock: { gap: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSub: { fontSize: 12, lineHeight: 17 },
  trailing: { paddingLeft: 48 },
  delayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  delayChip: { paddingHorizontal: 10, minHeight: 31, justifyContent: 'center', borderRadius: 10, borderWidth: 1 },
  delayText: { fontSize: 11, fontWeight: '600' },
  actionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  actionCopy: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '600' },
  actionSub: { fontSize: 12, marginTop: 3 },
  actionLink: { fontSize: 12, fontWeight: '700' },
  dangerRow: { minHeight: 50, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dangerText: { fontSize: 13, fontWeight: '600' },
  about: { alignItems: 'center', paddingVertical: 17, gap: 5 },
  aboutName: { fontSize: 17, fontWeight: '700', letterSpacing: 2.3 },
  aboutTagline: { fontSize: 12 },
  version: { fontFamily: 'monospace', fontSize: 10, marginTop: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, .68)', paddingHorizontal: 14 },
  modal: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 13 },
  modalTitle: { fontSize: 21, fontWeight: '700' },
  modalCopy: { fontSize: 13, lineHeight: 19, marginBottom: 4 },
  importInput: { minHeight: 160, borderRadius: 15, borderWidth: 1, padding: 14, fontSize: 13, textAlignVertical: 'top' },
  pinInput: { minHeight: 56, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center' },
});