import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { healthAPI } from '../utils/api';
import { SIZES } from '../constants/theme';
import { format } from 'date-fns';

const EXERCISES = ['🧘 Yoga', '🏃 Running', '🚴 Cycling', '🏊 Swimming', '🏋️ Gym', '🚶 Walking', '💃 Dancing', '⚽ Sports'];

export default function LogHealthScreen({ navigation }: any) {
  const { colors, primaryColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Health fields
  const [weight, setWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [medications, setMedications] = useState<{ name: string; taken: boolean }[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadToday(); }, []);

  const loadToday = async () => {
    try {
      const res = await healthAPI.getToday();
      if (res.data.log) {
        const l = res.data.log;
        setExistingId(l._id);
        if (l.weight) setWeight(String(l.weight));
        if (l.waterIntake) setWaterIntake(String(l.waterIntake));
        if (l.sleep?.hours) setSleepHours(String(l.sleep.hours));
        if (l.sleep?.quality) setSleepQuality(l.sleep.quality);
        if (l.exercise?.type) setExerciseType(l.exercise.type);
        if (l.exercise?.duration) setExerciseDuration(String(l.exercise.duration));
        if (l.vitals?.heartRate) setHeartRate(String(l.vitals.heartRate));
        if (l.vitals?.bloodPressureSystolic) setBpSystolic(String(l.vitals.bloodPressureSystolic));
        if (l.vitals?.bloodPressureDiastolic) setBpDiastolic(String(l.vitals.bloodPressureDiastolic));
        if (l.vitals?.bodyTemperature) setBodyTemp(String(l.vitals.bodyTemperature));
        if (l.medications) setMedications(l.medications.map((m: any) => ({ name: m.name, taken: m.taken })));
        if (l.notes) setNotes(l.notes);
      }
    } catch {}
  };

  const addMedication = () => {
    if (!newMedName.trim()) return;
    setMedications(prev => [...prev, { name: newMedName.trim(), taken: false }]);
    setNewMedName('');
  };

  const toggleMed = (i: number) => {
    setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, taken: !m.taken } : m));
  };

  const save = async () => {
    setLoading(true);
    try {
      const data = {
        date: new Date().toISOString(),
        weight: weight ? parseFloat(weight) : undefined,
        waterIntake: waterIntake ? parseInt(waterIntake) : undefined,
        sleep: sleepHours ? { hours: parseFloat(sleepHours), quality: sleepQuality } : undefined,
        exercise: exerciseType ? { type: exerciseType, duration: parseInt(exerciseDuration) || 0 } : undefined,
        vitals: {
          heartRate: heartRate ? parseInt(heartRate) : undefined,
          bloodPressureSystolic: bpSystolic ? parseInt(bpSystolic) : undefined,
          bloodPressureDiastolic: bpDiastolic ? parseInt(bpDiastolic) : undefined,
          bodyTemperature: bodyTemp ? parseFloat(bodyTemp) : undefined,
        },
        medications: medications.map(m => ({ name: m.name, taken: m.taken })),
        notes,
      };
      if (existingId) await healthAPI.update(existingId, data);
      else await healthAPI.log(data);
      Alert.alert('Saved! 💪', 'Health data logged successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const SectionCard = ({ title, children }: any) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const NumberInput = ({ label, value, onChange, unit, placeholder, emoji }: any) => (
    <View style={styles.inputRow}>
      <Text style={styles.inputEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TextInput
            style={[styles.inputText, { color: colors.text }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder || '0'}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
          {unit && <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>{unit}</Text>}
        </View>
      </View>
    </View>
  );

  const ScaleRow = ({ label, value, onChange, max = 5 }: any) => (
    <View style={styles.scaleRow}>
      <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 8 }]}>{label}</Text>
      <View style={styles.scaleButtons}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.scaleBtn, { backgroundColor: n <= value ? primaryColor : colors.inputBg }]}
            onPress={() => onChange(n)}
          >
            <Text style={{ color: n <= value ? '#fff' : colors.textSecondary, fontWeight: '700', fontSize: SIZES.sm }}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Log Health</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={[styles.dateLabel, { color: primaryColor }]}>{format(new Date(), 'MMMM d, yyyy')}</Text>

      {/* Body Metrics */}
      <SectionCard title="⚖️ Body Metrics">
        <NumberInput label="Weight" value={weight} onChange={setWeight} unit="kg" emoji="⚖️" placeholder="65.0" />
        <NumberInput label="Water Intake" value={waterIntake} onChange={setWaterIntake} unit="ml" emoji="💧" placeholder="2000" />
        <NumberInput label="Body Temp" value={bodyTemp} onChange={setBodyTemp} unit="°C" emoji="🌡️" placeholder="36.6" />
      </SectionCard>

      {/* Sleep */}
      <SectionCard title="😴 Sleep">
        <NumberInput label="Hours Slept" value={sleepHours} onChange={setSleepHours} unit="hrs" emoji="🕐" placeholder="8" />
        <ScaleRow label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />
      </SectionCard>

      {/* Exercise */}
      <SectionCard title="🏃 Exercise">
        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 10 }]}>Type</Text>
        <View style={styles.exerciseGrid}>
          {EXERCISES.map(ex => (
            <TouchableOpacity
              key={ex}
              style={[
                styles.exerciseBtn,
                { backgroundColor: exerciseType === ex ? primaryColor : colors.inputBg },
              ]}
              onPress={() => setExerciseType(exerciseType === ex ? '' : ex)}
            >
              <Text style={[styles.exerciseBtnText, { color: exerciseType === ex ? '#fff' : colors.text }]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {exerciseType ? (
          <NumberInput label="Duration" value={exerciseDuration} onChange={setExerciseDuration} unit="min" emoji="⏱️" placeholder="30" />
        ) : null}
      </SectionCard>

      {/* Vitals */}
      <SectionCard title="❤️ Vitals">
        <NumberInput label="Heart Rate" value={heartRate} onChange={setHeartRate} unit="bpm" emoji="💓" placeholder="72" />
        <View style={styles.bpRow}>
          <View style={{ flex: 1 }}>
            <NumberInput label="Systolic" value={bpSystolic} onChange={setBpSystolic} unit="mmHg" emoji="🩸" placeholder="120" />
          </View>
          <Text style={[styles.bpSlash, { color: colors.textSecondary }]}>/</Text>
          <View style={{ flex: 1 }}>
            <NumberInput label="Diastolic" value={bpDiastolic} onChange={setBpDiastolic} unit="mmHg" emoji="" placeholder="80" />
          </View>
        </View>
      </SectionCard>

      {/* Medications */}
      <SectionCard title="💊 Medications & Supplements">
        {medications.map((med, i) => (
          <View key={i} style={[styles.medRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
            <Switch value={med.taken} onValueChange={() => toggleMed(i)} thumbColor={med.taken ? '#fff' : '#ccc'} trackColor={{ true: primaryColor, false: colors.border }} />
          </View>
        ))}
        <View style={[styles.addMedRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TextInput
            style={[styles.addMedInput, { color: colors.text }]}
            value={newMedName}
            onChangeText={setNewMedName}
            placeholder="Add medication or supplement..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={[styles.addMedBtn, { backgroundColor: primaryColor }]} onPress={addMedication}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SectionCard>

      {/* Notes */}
      <SectionCard title="📝 Notes">
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How are you feeling today?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </SectionCard>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
        onPress={save}
        disabled={loading}
      >
        <Text style={styles.saveBtnText}>{loading ? 'Saving...' : '💾 Save Health Data'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60 },
  title: { fontSize: SIZES.xl, fontWeight: '700' },
  dateLabel: { textAlign: 'center', fontSize: SIZES.md, fontWeight: '600', marginBottom: 16 },
  sectionCard: { margin: 16, marginBottom: 8, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  inputEmoji: { fontSize: 22, width: 28 },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', marginBottom: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44 },
  inputText: { flex: 1, fontSize: SIZES.md },
  inputUnit: { fontSize: SIZES.sm, fontWeight: '600' },
  scaleRow: { marginBottom: 12 },
  scaleButtons: { flexDirection: 'row', gap: 8 },
  scaleBtn: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  exerciseBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  exerciseBtnText: { fontSize: SIZES.sm, fontWeight: '600' },
  bpRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bpSlash: { fontSize: SIZES.xl, fontWeight: '300', marginTop: 16 },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  medName: { flex: 1, fontSize: SIZES.md, fontWeight: '500' },
  addMedRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: 8 },
  addMedInput: { flex: 1, padding: 12, fontSize: SIZES.md },
  addMedBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notesInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: SIZES.md, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { margin: 16, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
