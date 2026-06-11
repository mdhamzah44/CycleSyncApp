import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { symptomsAPI } from '../utils/api';
import { SYMPTOMS, MOODS, SIZES } from '../constants/theme';
import { format } from 'date-fns';

export default function LogSymptomsScreen({ navigation, route }: any) {
  const { colors, primaryColor } = useTheme();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const date = route.params?.date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadExisting();
  }, []);

  const loadExisting = async () => {
    try {
      const res = await symptomsAPI.getToday();
      if (res.data.symptom) {
        const s = res.data.symptom;
        setExistingId(s._id);
        setSelectedSymptoms(s.symptoms?.map((x: any) => x.type) || []);
        setSelectedMood(s.mood || '');
        setMoodScore(s.moodScore || 5);
        setEnergyLevel(s.energyLevel || 3);
        setStressLevel(s.stressLevel || 3);
        setNotes(s.notes || '');
      }
    } catch {}
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const save = async () => {
    setLoading(true);
    try {
      const data = {
        date,
        symptoms: selectedSymptoms.map(type => ({ type, severity: 3 })),
        mood: selectedMood,
        moodScore,
        energyLevel,
        stressLevel,
        notes,
      };

      if (existingId) {
        await symptomsAPI.update(existingId, data);
      } else {
        await symptomsAPI.log(data);
      }

      Alert.alert('Saved!', 'Your symptoms have been logged.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const ScaleSelector = ({ label, value, onChange, max = 5 }: any) => (
    <View style={styles.scaleContainer}>
      <Text style={[styles.scaleLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.scaleButtons}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <TouchableOpacity
            key={n}
            style={[
              styles.scaleButton,
              { backgroundColor: n <= value ? primaryColor : colors.surface || '#f5f5f5' },
            ]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.scaleButtonText, { color: n <= value ? '#fff' : colors.textSecondary }]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Log Symptoms</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[styles.dateLabel, { color: primaryColor }]}>{format(new Date(date), 'MMMM d, yyyy')}</Text>

      {/* Mood */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you feeling? 💭</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodButton,
              { backgroundColor: selectedMood === mood.id ? primaryColor : colors.card },
              selectedMood === mood.id && { shadowColor: primaryColor, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
            ]}
            onPress={() => setSelectedMood(mood.id === selectedMood ? '' : mood.id)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, { color: selectedMood === mood.id ? '#fff' : colors.text }]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scales */}
      <View style={[styles.scalesCard, { backgroundColor: colors.card }]}>
        <ScaleSelector label="Mood Score" value={moodScore} onChange={setMoodScore} max={10} />
        <ScaleSelector label="Energy Level" value={energyLevel} onChange={setEnergyLevel} />
        <ScaleSelector label="Stress Level" value={stressLevel} onChange={setStressLevel} />
      </View>

      {/* Symptoms */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Symptoms</Text>
      <View style={styles.symptomsGrid}>
        {SYMPTOMS.map(sym => (
          <TouchableOpacity
            key={sym.id}
            style={[
              styles.symptomButton,
              { backgroundColor: selectedSymptoms.includes(sym.id) ? primaryColor : colors.card },
              selectedSymptoms.includes(sym.id) && { shadowColor: primaryColor, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
            ]}
            onPress={() => toggleSymptom(sym.id)}
          >
            <Text style={styles.symptomEmoji}>{sym.emoji}</Text>
            <Text style={[
              styles.symptomLabel,
              { color: selectedSymptoms.includes(sym.id) ? '#fff' : colors.text },
            ]}>
              {sym.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
      <TextInput
        style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any personal notes..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
        onPress={save}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Symptoms'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60 },
  title: { fontSize: SIZES.xl, fontWeight: '700' },
  dateLabel: { textAlign: 'center', fontSize: SIZES.md, fontWeight: '600', marginBottom: 16 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  moodRow: { marginBottom: 8 },
  moodButton: { alignItems: 'center', padding: 12, borderRadius: 16, minWidth: 75, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontSize: SIZES.xs, fontWeight: '600' },
  scalesCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  scaleContainer: {},
  scaleLabel: { fontSize: SIZES.md, fontWeight: '600', marginBottom: 8 },
  scaleButtons: { flexDirection: 'row', gap: 8 },
  scaleButton: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scaleButtonText: { fontSize: SIZES.sm, fontWeight: '700' },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  symptomButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50, gap: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  symptomEmoji: { fontSize: 16 },
  symptomLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  notesInput: { marginHorizontal: 16, borderRadius: 16, padding: 14, fontSize: SIZES.md, borderWidth: 1, minHeight: 100, textAlignVertical: 'top' },
  saveButton: { margin: 16, marginTop: 20, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
