import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { cyclesAPI } from '../utils/api';
import { FLOW_LEVELS, SIZES, COLORS } from '../constants/theme';
import { format } from 'date-fns';

export default function LogPeriodScreen({ navigation }: any) {
  const { colors, primaryColor, isDark } = useTheme();
  const [mode, setMode] = useState<'start' | 'end'>('start');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState('medium');
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState<any[]>([]);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const res = await cyclesAPI.getAll();
      const cycs = res.data.cycles;
      setCycles(cycs);
      const active = cycs.find((c: any) => !c.endDate);
      setActiveCycle(active);
      if (active) setMode('end');
    } catch {}
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await cyclesAPI.startPeriod({ startDate: selectedDate, flow });
      Alert.alert('Period Started!', `Logged your period starting ${format(new Date(selectedDate), 'MMM d')}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to log period');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!activeCycle) return;
    setLoading(true);
    try {
      await cyclesAPI.endPeriod(activeCycle._id, selectedDate);
      Alert.alert('Period Ended!', `Period lasted ${calculateDays(activeCycle.startDate, selectedDate)} days`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to end period');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const markedDates: any = {
    [selectedDate]: { selected: true, selectedColor: primaryColor },
  };
  cycles.forEach((c: any) => {
    markedDates[c.startDate.split('T')[0]] = { marked: true, dotColor: '#E91E8C' };
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Log Period</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
        {(['start', 'end'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.toggleButton, mode === m && { backgroundColor: primaryColor }]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.toggleText, { color: mode === m ? '#fff' : colors.textSecondary }]}>
              {m === 'start' ? '🩸 Period Start' : '✅ Period End'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Period Banner */}
      {activeCycle && (
        <View style={[styles.activeBanner, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={[styles.activeBannerText, { color: COLORS.primary }]}>
            Active period since {format(new Date(activeCycle.startDate), 'MMM d')}
          </Text>
        </View>
      )}

      {/* Calendar */}
      <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          theme={{
            calendarBackground: colors.card,
            selectedDayBackgroundColor: primaryColor,
            todayTextColor: primaryColor,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,
            arrowColor: primaryColor,
            monthTextColor: colors.text,
          }}
          maxDate={new Date().toISOString().split('T')[0]}
        />
      </View>

      <Text style={[styles.selectedDate, { color: primaryColor }]}>
        {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
      </Text>

      {/* Flow Level (only for start) */}
      {mode === 'start' && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Flow Level</Text>
          <View style={styles.flowContainer}>
            {FLOW_LEVELS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.flowButton,
                  { backgroundColor: flow === f.id ? f.color : colors.card },
                  flow === f.id && { shadowColor: f.color, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
                ]}
                onPress={() => setFlow(f.id)}
              >
                <View style={[styles.flowIndicator, { backgroundColor: f.color, opacity: flow === f.id ? 1 : 0.4 }]} />
                <Text style={[styles.flowLabel, { color: flow === f.id ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Recent Cycles */}
      {cycles.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Periods</Text>
          <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
            {cycles.slice(0, 5).map((c: any) => (
              <View key={c._id} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: COLORS.primary }]} />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: colors.text }]}>
                    {format(new Date(c.startDate), 'MMM d, yyyy')}
                  </Text>
                  {c.endDate && (
                    <Text style={[styles.historyDuration, { color: colors.textSecondary }]}>
                      {c.periodLength} days
                    </Text>
                  )}
                </View>
                {!c.endDate && (
                  <View style={[styles.activePill, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={[styles.activePillText, { color: COLORS.primary }]}>Active</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
        onPress={mode === 'start' ? handleStart : handleEnd}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : mode === 'start' ? '🩸 Log Period Start' : '✅ Log Period End'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60 },
  title: { fontSize: SIZES.xl, fontWeight: '700' },
  toggleContainer: { flexDirection: 'row', margin: 16, borderRadius: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  toggleButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  toggleText: { fontSize: SIZES.md, fontWeight: '600' },
  activeBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 0, padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  activeBannerText: { fontSize: SIZES.sm, fontWeight: '600' },
  calendarCard: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  selectedDate: { textAlign: 'center', fontSize: SIZES.md, fontWeight: '600', marginVertical: 12 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  flowContainer: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  flowButton: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  flowIndicator: { width: 20, height: 20, borderRadius: 10, marginBottom: 6 },
  flowLabel: { fontSize: SIZES.xs, fontWeight: '600' },
  historyCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: SIZES.md, fontWeight: '600' },
  historyDuration: { fontSize: SIZES.sm, marginTop: 2 },
  activePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  activePillText: { fontSize: SIZES.xs, fontWeight: '700' },
  saveButton: { margin: 16, marginTop: 20, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
