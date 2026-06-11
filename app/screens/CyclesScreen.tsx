import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { cyclesAPI } from '../utils/api';
import { SIZES, FLOW_LEVELS } from '../constants/theme';
import { format, differenceInDays } from 'date-fns';

export default function CyclesScreen({ navigation }: any) {
  const { colors, primaryColor } = useTheme();
  const [cycles, setCycles] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    loadCycles();
  }, []));

  const loadCycles = async () => {
    try {
      const res = await cyclesAPI.getAll();
      setCycles(res.data.cycles || []);
      setPredictions(res.data.predictions);
    } catch {} finally {
      setLoading(false);
    }
  };

  const deleteCycle = (id: string) => {
    Alert.alert('Delete Cycle', 'Remove this cycle log?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await cyclesAPI.delete(id);
        loadCycles();
      }},
    ]);
  };

  const getFlowColor = (flow: string) => FLOW_LEVELS.find(f => f.id === flow)?.color || '#E91E8C';

  const renderCycle = ({ item, index }: any) => {
    const isActive = !item.endDate;
    const daysSince = differenceInDays(new Date(), new Date(item.startDate));

    return (
      <View style={[styles.cycleCard, { backgroundColor: colors.card }]}>
        <View style={styles.cycleLeft}>
          <View style={[styles.cycleDot, { backgroundColor: getFlowColor(item.flow) }]} />
          {index < cycles.length - 1 && <View style={[styles.cycleLine, { backgroundColor: colors.border }]} />}
        </View>
        <View style={styles.cycleContent}>
          <View style={styles.cycleHeader}>
            <Text style={[styles.cycleDate, { color: colors.text }]}>
              {format(new Date(item.startDate), 'MMM d, yyyy')}
            </Text>
            {isActive && (
              <View style={[styles.activePill, { backgroundColor: primaryColor }]}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            )}
          </View>

          <View style={styles.cycleDetails}>
            {item.endDate && (
              <Text style={[styles.cycleDetail, { color: colors.textSecondary }]}>
                📅 {item.periodLength || '?'} day period
              </Text>
            )}
            {item.cycleLength && (
              <Text style={[styles.cycleDetail, { color: colors.textSecondary }]}>
                🔄 {item.cycleLength}d cycle
              </Text>
            )}
            <Text style={[styles.cycleDetail, { color: colors.textSecondary }]}>
              🩸 {FLOW_LEVELS.find(f => f.id === item.flow)?.label || 'Medium'} flow
            </Text>
            {item.intercourse?.length > 0 && (
              <Text style={[styles.cycleDetail, { color: colors.textSecondary }]}>
                💕 {item.intercourse.length} intimate day{item.intercourse.length > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {!item.endDate && (
            <TouchableOpacity
              style={[styles.endBtn, { backgroundColor: primaryColor + '20', borderColor: primaryColor }]}
              onPress={() => navigation.navigate('LogPeriod')}
            >
              <Text style={[styles.endBtnText, { color: primaryColor }]}>Log Period End →</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => deleteCycle(item._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Cycles</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate('LogPeriod')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Predictions Banner */}
      {predictions && (
        <View style={[styles.predCard, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '30' }]}>
          <View style={styles.predRow}>
            <Text style={styles.predEmoji}>📅</Text>
            <View>
              <Text style={[styles.predLabel, { color: colors.text }]}>Next Period</Text>
              <Text style={[styles.predValue, { color: primaryColor }]}>
                {predictions.nextPeriodDate ? format(new Date(predictions.nextPeriodDate), 'MMM d') : 'Calculating...'}
                {predictions.daysUntilNextPeriod !== undefined && ` · ${Math.max(0, predictions.daysUntilNextPeriod)} days away`}
              </Text>
            </View>
          </View>
          <View style={[styles.predDivider, { backgroundColor: primaryColor + '30' }]} />
          <View style={styles.predRow}>
            <Text style={styles.predEmoji}>🔄</Text>
            <View>
              <Text style={[styles.predLabel, { color: colors.text }]}>Avg Cycle</Text>
              <Text style={[styles.predValue, { color: primaryColor }]}>
                {predictions.averageCycleLength} days
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={cycles}
        keyExtractor={item => item._id}
        renderItem={renderCycle}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No cycles logged yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Start by logging your first period</Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: primaryColor }]}
                onPress={() => navigation.navigate('LogPeriod')}
              >
                <Text style={styles.emptyBtnText}>🩸 Log Period</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  title: { fontSize: SIZES.xxl, fontWeight: '800' },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  predCard: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  predRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  predEmoji: { fontSize: 22 },
  predLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  predValue: { fontSize: SIZES.base, fontWeight: '700', marginTop: 2 },
  predDivider: { width: 1, height: 40, marginHorizontal: 8 },
  cycleCard: { flexDirection: 'row', marginBottom: 0, borderRadius: 0 },
  cycleLeft: { width: 32, alignItems: 'center', paddingTop: 4 },
  cycleDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  cycleLine: { flex: 1, width: 2, minHeight: 40 },
  cycleContent: { flex: 1, paddingBottom: 24, paddingLeft: 12 },
  cycleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cycleDate: { fontSize: SIZES.base, fontWeight: '700' },
  activePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  activePillText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
  cycleDetails: { gap: 3 },
  cycleDetail: { fontSize: SIZES.sm },
  endBtn: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  endBtnText: { fontSize: SIZES.sm, fontWeight: '700' },
  deleteBtn: { padding: 8, alignSelf: 'flex-start' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '700' },
  emptyDesc: { fontSize: SIZES.md },
  emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
});
