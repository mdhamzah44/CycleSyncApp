import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, TextInput, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { remindersAPI } from '../utils/api';
import { SIZES } from '../constants/theme';

const REMINDER_TYPES = [
  { id: 'period', label: 'Period', emoji: '🩸' },
  { id: 'ovulation', label: 'Ovulation', emoji: '✨' },
  { id: 'fertility', label: 'Fertile Window', emoji: '🌿' },
  { id: 'medication', label: 'Medication', emoji: '💊' },
  { id: 'birth_control', label: 'Birth Control', emoji: '🛡️' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
  { id: 'appointment', label: 'Appointment', emoji: '🏥' },
  { id: 'custom', label: 'Custom', emoji: '⭐' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RemindersScreen() {
  const { colors, primaryColor } = useTheme();
  const [reminders, setReminders] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState('period');
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => { loadReminders(); }, []));

  const loadReminders = async () => {
    try {
      const res = await remindersAPI.getAll();
      setReminders(res.data.reminders || []);
    } catch {}
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    await remindersAPI.update(id, { isActive });
    setReminders(prev => prev.map(r => r._id === id ? { ...r, isActive } : r));
  };

  const deleteReminder = (id: string) => {
    Alert.alert('Delete Reminder', 'Remove this reminder?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await remindersAPI.delete(id);
        setReminders(prev => prev.filter(r => r._id !== id));
      }},
    ]);
  };

  const saveReminder = async () => {
    const title = newTitle || REMINDER_TYPES.find(t => t.id === newType)?.label || '';
    if (!title) return Alert.alert('Error', 'Enter a title');
    setLoading(true);
    try {
      const res = await remindersAPI.create({ type: newType, title, time: newTime, repeatDays: newDays, isActive: true });
      setReminders(prev => [...prev, res.data.reminder]);
      setShowModal(false);
      setNewTitle('');
      setNewType('period');
      setNewDays([1, 2, 3, 4, 5]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (d: number) => {
    setNewDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const getTypeEmoji = (type: string) => REMINDER_TYPES.find(t => t.id === type)?.emoji || '🔔';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reminders</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        {reminders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No reminders yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Add reminders to stay on top of your health</Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: primaryColor }]} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>Add First Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reminders.map(r => (
            <View key={r._id} style={[styles.reminderCard, { backgroundColor: colors.card }]}>
              <Text style={styles.reminderEmoji}>{getTypeEmoji(r.type)}</Text>
              <View style={styles.reminderInfo}>
                <Text style={[styles.reminderTitle, { color: colors.text }]}>{r.title}</Text>
                <Text style={[styles.reminderTime, { color: colors.textSecondary }]}>
                  {r.time} • {r.repeatDays?.map((d: number) => DAYS[d]).join(', ') || 'Daily'}
                </Text>
              </View>
              <Switch
                value={r.isActive}
                onValueChange={(v) => toggleReminder(r._id, v)}
                thumbColor={r.isActive ? '#fff' : '#ccc'}
                trackColor={{ true: primaryColor, false: colors.border }}
              />
              <TouchableOpacity onPress={() => deleteReminder(r._id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Default reminder suggestions */}
        <Text style={[styles.suggestTitle, { color: colors.text }]}>Quick Add</Text>
        <View style={styles.suggestions}>
          {REMINDER_TYPES.slice(0, 6).map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.suggestion, { backgroundColor: colors.card }]}
              onPress={() => { setNewType(type.id); setNewTitle(type.label); setShowModal(true); }}
            >
              <Text style={styles.suggestionEmoji}>{type.emoji}</Text>
              <Text style={[styles.suggestionLabel, { color: colors.text }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Reminder</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Type */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {REMINDER_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeBtn, { backgroundColor: newType === type.id ? primaryColor : colors.card }]}
                    onPress={() => { setNewType(type.id); if (!newTitle) setNewTitle(type.label); }}
                  >
                    <Text style={styles.typeBtnEmoji}>{type.emoji}</Text>
                    <Text style={[styles.typeBtnLabel, { color: newType === type.id ? '#fff' : colors.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Title */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Reminder title..."
              placeholderTextColor={colors.textSecondary}
            />

            {/* Time */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Time</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="HH:MM (24-hour)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numbers-and-punctuation"
            />

            {/* Days */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Repeat Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, { backgroundColor: newDays.includes(i) ? primaryColor : colors.card }]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[styles.dayBtnText, { color: newDays.includes(i) ? '#fff' : colors.text }]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
              onPress={saveReminder}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : '🔔 Add Reminder'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  title: { fontSize: SIZES.xxl, fontWeight: '800' },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '700' },
  emptyDesc: { fontSize: SIZES.md, textAlign: 'center' },
  emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
  reminderCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  reminderEmoji: { fontSize: 24 },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: SIZES.md, fontWeight: '600' },
  reminderTime: { fontSize: SIZES.sm, marginTop: 2 },
  deleteBtn: { padding: 6 },
  suggestTitle: { fontSize: SIZES.base, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestion: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  suggestionEmoji: { fontSize: 18 },
  suggestionLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '700' },
  fieldLabel: { fontSize: SIZES.md, fontWeight: '700' },
  fieldInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: SIZES.md },
  typeBtn: { alignItems: 'center', padding: 12, borderRadius: 14, minWidth: 80, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  typeBtnEmoji: { fontSize: 24, marginBottom: 4 },
  typeBtnLabel: { fontSize: SIZES.xs, fontWeight: '600' },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  dayBtnText: { fontSize: SIZES.xs, fontWeight: '700' },
  saveBtn: { padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
