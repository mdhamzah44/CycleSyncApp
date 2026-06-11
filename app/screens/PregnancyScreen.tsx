import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { pregnancyAPI } from '../utils/api';
import { SIZES } from '../constants/theme';
import { format, addDays } from 'date-fns';

const TRIMESTER_INFO = [
  {
    num: 1, label: 'First Trimester', weeks: 'Weeks 1–13',
    tip: 'Focus on prenatal vitamins, especially folic acid. Rest when you can — fatigue is normal!',
  },
  {
    num: 2, label: 'Second Trimester', weeks: 'Weeks 14–27',
    tip: 'Many find this the most comfortable trimester. Energy often returns and baby starts moving!',
  },
  {
    num: 3, label: 'Third Trimester', weeks: 'Weeks 28–40',
    tip: 'Prepare your hospital bag and birth plan. Rest and light exercise like walking help.',
  },
];

export default function PregnancyScreen({ navigation }: any) {
  const { colors, primaryColor } = useTheme();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEnable, setShowEnable] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [lastPeriod, setLastPeriod] = useState('');

  useFocusEffect(useCallback(() => {
    loadStatus();
  }, []));

  const loadStatus = async () => {
    try {
      const res = await pregnancyAPI.getStatus();
      setStatus(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const enablePregnancy = async () => {
    if (!dueDate && !lastPeriod) return Alert.alert('Error', 'Enter your due date or last period date');
    try {
      await pregnancyAPI.enable({ dueDate: dueDate || undefined, lastPeriodDate: lastPeriod || undefined });
      setShowEnable(false);
      loadStatus();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    }
  };

  const disablePregnancy = () => {
    Alert.alert('Disable Pregnancy Mode', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Confirm', style: 'destructive', onPress: async () => {
        await pregnancyAPI.disable();
        loadStatus();
      }},
    ]);
  };

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]} />;

  const trimesterInfo = status?.pregnancyMode ? TRIMESTER_INFO.find(t => t.num === status.trimester) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>Pregnancy</Text>

      {!status?.pregnancyMode ? (
        <>
          {/* Not in pregnancy mode */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Text style={styles.infoEmoji}>🤰</Text>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Pregnancy Tracker</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Track your pregnancy journey week by week. Get updates on baby development and personalized tips.
            </Text>
            {!showEnable ? (
              <TouchableOpacity
                style={[styles.enableBtn, { backgroundColor: primaryColor }]}
                onPress={() => setShowEnable(true)}
              >
                <Text style={styles.enableBtnText}>Enable Pregnancy Mode</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.enableForm}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Enter Due Date (optional)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={[styles.formLabel, { color: colors.text }]}>OR Last Period Date</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={lastPeriod}
                  onChangeText={setLastPeriod}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity style={[styles.enableBtn, { backgroundColor: primaryColor }]} onPress={enablePregnancy}>
                  <Text style={styles.enableBtnText}>Start Tracking 🌸</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEnable(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Planning mode features */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conception Planning</Text>
          <View style={[styles.planCard, { backgroundColor: colors.card }]}>
            {[
              { emoji: '📅', title: 'Track ovulation', desc: 'See your fertile window on the calendar' },
              { emoji: '🌡️', title: 'BBT Logging', desc: 'Track basal body temperature to confirm ovulation' },
              { emoji: '🤖', title: 'AI guidance', desc: 'Ask the AI assistant about fertility tips' },
            ].map(item => (
              <View key={item.title} style={styles.planRow}>
                <Text style={styles.planEmoji}>{item.emoji}</Text>
                <View>
                  <Text style={[styles.planTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Pregnancy Dashboard */}
          <View style={[styles.pregnancyHero, { backgroundColor: primaryColor }]}>
            <Text style={styles.pregnancyEmoji}>👶</Text>
            <Text style={styles.pregnancyWeek}>{status.weeksPregnant} weeks</Text>
            <Text style={styles.pregnancyLabel}>pregnant</Text>
            <Text style={styles.pregnancyDue}>Due {format(new Date(status.dueDate), 'MMMM d, yyyy')}</Text>
            <Text style={styles.pregnancyDays}>{status.daysUntilDue} days to go</Text>
          </View>

          {/* Trimester */}
          <View style={[styles.trimesterCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.trimesterTitle, { color: primaryColor }]}>
              {trimesterInfo?.label} — {trimesterInfo?.weeks}
            </Text>
            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: primaryColor, width: `${(status.weeksPregnant / 40) * 100}%` }]} />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {status.weeksPregnant}/40 weeks
            </Text>
          </View>

          {/* Weekly Update */}
          {status.weeklyUpdate && (
            <View style={[styles.weeklyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.weeklyTitle, { color: colors.text }]}>
                Week {status.weeklyUpdate.week} — Baby is the size of a {status.weeklyUpdate.size}!
              </Text>
              <Text style={[styles.weeklyDesc, { color: colors.textSecondary }]}>
                {status.weeklyUpdate.development}
              </Text>
            </View>
          )}

          {/* Tip */}
          {trimesterInfo && (
            <View style={[styles.tipCard, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '30' }]}>
              <Ionicons name="bulb" size={20} color={primaryColor} />
              <Text style={[styles.tipText, { color: colors.text }]}>{trimesterInfo.tip}</Text>
            </View>
          )}

          {/* Checklist */}
          <View style={[styles.checklistCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.checklistTitle, { color: colors.text }]}>Important Reminders</Text>
            {[
              { check: true, text: 'Take prenatal vitamins daily' },
              { check: true, text: 'Stay hydrated — 8+ glasses/day' },
              { check: status.trimester >= 2, text: 'Schedule anatomy scan (18-20 weeks)' },
              { check: status.trimester >= 3, text: 'Prepare hospital bag' },
              { check: status.trimester >= 3, text: 'Create birth plan' },
            ].map((item, i) => (
              <View key={i} style={styles.checkRow}>
                <Ionicons name={item.check ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={item.check ? '#4CAF50' : colors.textSecondary} />
                <Text style={[styles.checkText, { color: item.check ? colors.text : colors.textSecondary }]}>{item.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.disableBtn, { borderColor: colors.border }]} onPress={disablePregnancy}>
            <Text style={[styles.disableBtnText, { color: colors.textSecondary }]}>Disable Pregnancy Mode</Text>
          </TouchableOpacity>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: SIZES.xxl, fontWeight: '800', margin: 20, marginTop: 60 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  infoCard: { margin: 16, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  infoEmoji: { fontSize: 64, marginBottom: 12 },
  infoTitle: { fontSize: SIZES.xl, fontWeight: '800', marginBottom: 8 },
  infoDesc: { fontSize: SIZES.md, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  enableBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20, shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  enableBtnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  enableForm: { width: '100%', gap: 10, marginTop: 8 },
  formLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  formInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: SIZES.md },
  cancelText: { textAlign: 'center', marginTop: 8, fontSize: SIZES.sm },
  planCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  planRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  planEmoji: { fontSize: 28 },
  planTitle: { fontSize: SIZES.md, fontWeight: '700' },
  planDesc: { fontSize: SIZES.sm, marginTop: 2 },
  pregnancyHero: { margin: 16, borderRadius: 24, padding: 28, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  pregnancyEmoji: { fontSize: 56, marginBottom: 8 },
  pregnancyWeek: { fontSize: 52, fontWeight: '900', color: '#fff', lineHeight: 60 },
  pregnancyLabel: { fontSize: SIZES.lg, color: 'rgba(255,255,255,0.85)' },
  pregnancyDue: { fontSize: SIZES.base, color: 'rgba(255,255,255,0.9)', marginTop: 12, fontWeight: '600' },
  pregnancyDays: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  trimesterCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  trimesterTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 12 },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: SIZES.sm, marginTop: 6, textAlign: 'right' },
  weeklyCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  weeklyTitle: { fontSize: SIZES.md, fontWeight: '700', marginBottom: 8 },
  weeklyDesc: { fontSize: SIZES.md, lineHeight: 22 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', margin: 16, marginTop: 8, padding: 14, borderRadius: 16, borderWidth: 1, gap: 10 },
  tipText: { flex: 1, fontSize: SIZES.md, lineHeight: 22 },
  checklistCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  checklistTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  checkText: { fontSize: SIZES.md, flex: 1 },
  disableBtn: { margin: 16, padding: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  disableBtnText: { fontSize: SIZES.md, fontWeight: '600' },
});
