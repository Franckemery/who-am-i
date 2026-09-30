import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppSettings, Mood, Thought } from '@/types/thought';

const THOUGHTS_KEY = 'who-am-i.thoughts.v1';
const SETTINGS_KEY = 'who-am-i.settings.v1';
const PIN_KEY = 'who-am-i.pin';
const defaultSettings: AppSettings = {
  appLock: false,
  biometric: false,
  lockDelay: 'immediately',
};

type ThoughtInput = {
  title?: string;
  content: string;
  mood?: Mood;
};

type AppContextValue = {
  thoughts: Thought[];
  settings: AppSettings;
  isReady: boolean;
  isLocked: boolean;
  draft: ThoughtInput;
  saveThought: (input: ThoughtInput, id?: string) => Promise<Thought>;
  deleteThought: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearThoughts: () => Promise<void>;
  setDraft: (draft: ThoughtInput) => void;
  clearDraft: () => void;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  hasPin: () => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lockNow: () => void;
  exportData: () => string;
  importData: (raw: string) => Promise<{ imported: number; skipped: number }>;
};

const AppContext = createContext<AppContextValue | null>(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validThought(value: unknown): value is Thought {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Thought>;
  return (
    typeof item.id === 'string' &&
    typeof item.content === 'string' &&
    item.content.trim().length > 0 &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    typeof item.isFavorite === 'boolean'
  );
}

export function AppProvider({ children }: React.PropsWithChildren) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [draft, setDraftState] = useState<ThoughtInput>({ content: '' });
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [storedThoughts, storedSettings] = await Promise.all([
          AsyncStorage.getItem(THOUGHTS_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (storedThoughts) {
          const parsed: unknown = JSON.parse(storedThoughts);
          if (Array.isArray(parsed)) setThoughts(parsed.filter(validThought));
        }
        const storedDraft = await AsyncStorage.getItem('who-am-i.draft.v1');
        if (storedDraft) {
          const parsedDraft = JSON.parse(storedDraft) as ThoughtInput;
          if (parsedDraft && typeof parsedDraft.content === 'string') setDraftState(parsedDraft);
        }
        const parsedSettings = storedSettings ? (JSON.parse(storedSettings) as Partial<AppSettings>) : {};
        const nextSettings = { ...defaultSettings, ...parsedSettings };
        setSettings(nextSettings);
        setIsLocked(nextSettings.appLock);
      } catch {
        setThoughts([]);
        setSettings(defaultSettings);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const persistThoughts = async (next: Thought[]) => {
    setThoughts(next);
    await AsyncStorage.setItem(THOUGHTS_KEY, JSON.stringify(next));
  };

  const saveThought = async (input: ThoughtInput, id?: string) => {
    const content = input.content.trim();
    if (!content) throw new Error('Your thought needs a little more space.');
    const now = new Date().toISOString();
    const existing = id ? thoughts.find((thought) => thought.id === id) : undefined;
    const thought: Thought = {
      id: existing?.id ?? createId(),
      title: input.title?.trim() ?? '',
      content,
      mood: input.mood,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      isFavorite: existing?.isFavorite ?? false,
    };
    const next = existing
      ? thoughts.map((item) => (item.id === id ? thought : item))
      : [thought, ...thoughts];
    await persistThoughts(next);
    clearDraft();
    return thought;
  };

  const deleteThought = async (id: string) => {
    await persistThoughts(thoughts.filter((thought) => thought.id !== id));
  };

  const toggleFavorite = async (id: string) => {
    await persistThoughts(
      thoughts.map((thought) =>
        thought.id === id ? { ...thought, isFavorite: !thought.isFavorite, updatedAt: new Date().toISOString() } : thought,
      ),
    );
  };

  const clearThoughts = async () => {
    await persistThoughts([]);
  };

  const setDraft = (nextDraft: ThoughtInput) => {
    setDraftState(nextDraft);
    void AsyncStorage.setItem('who-am-i.draft.v1', JSON.stringify(nextDraft));
  };

  const clearDraft = () => {
    setDraftState({ content: '' });
    void AsyncStorage.removeItem('who-am-i.draft.v1');
  };

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (!next.appLock) setIsLocked(false);
  };

  const setPin = async (pin: string) => {
    await SecureStore.setItemAsync(PIN_KEY, pin);
  };

  const hasPin = async () => (await SecureStore.getItemAsync(PIN_KEY)) !== null;

  const unlockWithPin = async (pin: string) => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    const unlocked = Boolean(stored && stored === pin);
    if (unlocked) setIsLocked(false);
    return unlocked;
  };

  const unlockWithBiometric = async () => {
    if (!settings.biometric) return false;
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hardware || !enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock WHO AM I',
      fallbackLabel: 'Use your PIN',
    });
    if (result.success) setIsLocked(false);
    return result.success;
  };

  const lockNow = () => {
    if (settings.appLock) setIsLocked(true);
  };

  const exportData = () =>
    JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), thoughts },
      null,
      2,
    );

  const importData = async (raw: string) => {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { thoughts?: unknown }).thoughts)) {
      throw new Error('This file does not look like a WHO AM I export.');
    }
    const incoming = (parsed as { thoughts: unknown[] }).thoughts.filter(validThought);
    const knownIds = new Set(thoughts.map((thought) => thought.id));
    const additions = incoming.filter((thought) => !knownIds.has(thought.id));
    await persistThoughts([...additions, ...thoughts]);
    return { imported: additions.length, skipped: incoming.length - additions.length };
  };

  const value = useMemo<AppContextValue>(
    () => ({
      thoughts,
      settings,
      isReady,
      isLocked,
      draft,
      saveThought,
      deleteThought,
      toggleFavorite,
      clearThoughts,
      setDraft,
      clearDraft,
      updateSettings,
      setPin,
      hasPin,
      unlockWithPin,
      unlockWithBiometric,
      lockNow,
      exportData,
      importData,
    }),
    [thoughts, settings, isReady, isLocked, draft],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}