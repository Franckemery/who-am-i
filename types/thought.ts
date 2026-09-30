export type Mood =
  | 'happy'
  | 'calm'
  | 'reflective'
  | 'sad'
  | 'frustrated'
  | 'motivated'
  | 'grateful'
  | 'neutral';

export type Thought = {
  id: string;
  title: string;
  content: string;
  mood?: Mood;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
};

export type AppSettings = {
  appLock: boolean;
  biometric: boolean;
  lockDelay: 'immediately' | '1m' | '5m' | '15m' | 'never';
};

export const MOODS: Array<{
  id: Mood;
  label: string;
  icon: 'sun' | 'cloud' | 'compass' | 'cloud-drizzle' | 'zap' | 'trending-up' | 'heart' | 'minus';
  color: string;
}> = [
  { id: 'happy', label: 'Happy', icon: 'sun', color: '#FBBF24' },
  { id: 'calm', label: 'Calm', icon: 'cloud', color: '#67E8F9' },
  { id: 'reflective', label: 'Reflective', icon: 'compass', color: '#C4B5FD' },
  { id: 'sad', label: 'Sad', icon: 'cloud-drizzle', color: '#93C5FD' },
  { id: 'frustrated', label: 'Frustrated', icon: 'zap', color: '#FB7185' },
  { id: 'motivated', label: 'Motivated', icon: 'trending-up', color: '#F97316' },
  { id: 'grateful', label: 'Grateful', icon: 'heart', color: '#F0ABFC' },
  { id: 'neutral', label: 'Neutral', icon: 'minus', color: '#94A3B8' },
];

export function getMood(mood?: Mood) {
  return MOODS.find((item) => item.id === mood);
}