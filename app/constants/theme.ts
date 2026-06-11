export const COLORS = {
  primary: '#E91E8C',
  primaryLight: '#F48FB1',
  primaryDark: '#C2185B',
  secondary: '#9C27B0',
  accent: '#FF6B9D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  fertile: '#81C784',
  ovulation: '#FFB300',
  
  // Light theme
  light: {
    background: '#FFF5F9',
    card: '#FFFFFF',
    surface: '#FFF0F5',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#F9D7E7',
    inputBg: '#FFF5F9',
  },
  
  // Dark theme
  dark: {
    background: '#0D0D1A',
    card: '#1A1A2E',
    surface: '#251535',
    text: '#F8F8F8',
    textSecondary: '#A0A0B8',
    border: '#2D1F3D',
    inputBg: '#1A1A2E',
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  
  padding: 16,
  radius: 16,
  radiusLg: 24,
};

export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'back_pain', label: 'Back Pain', emoji: '🔴' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💗' },
  { id: 'acne', label: 'Acne', emoji: '😤' },
  { id: 'bloating', label: 'Bloating', emoji: '🫃' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'dizziness', label: 'Dizziness', emoji: '😵' },
  { id: 'hot_flashes', label: 'Hot Flashes', emoji: '🔥' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'irritability', label: 'Irritability', emoji: '😠' },
  { id: 'stress', label: 'Stress', emoji: '😫' },
  { id: 'depression', label: 'Low Mood', emoji: '😔' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙' },
  { id: 'custom', label: 'Custom', emoji: '✏️' },
];

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'sensitive', label: 'Sensitive', emoji: '🥺' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
];

export const FLOW_LEVELS = [
  { id: 'spotting', label: 'Spotting', color: '#FFB3D1' },
  { id: 'light', label: 'Light', color: '#F48FB1' },
  { id: 'medium', label: 'Medium', color: '#E91E8C' },
  { id: 'heavy', label: 'Heavy', color: '#C2185B' },
  { id: 'very_heavy', label: 'Very Heavy', color: '#880E4F' },
];
