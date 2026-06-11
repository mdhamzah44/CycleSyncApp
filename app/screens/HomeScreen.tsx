import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cyclesAPI, aiAPI, analyticsAPI } from '../utils/api';
import { COLORS, SIZES } from '../constants/theme';
import { format, differenceInDays, addDays } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, isDark, primaryColor } = useTheme();
  const [predictions, setPredictions] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [predRes, analyticsRes] = await Promise.all([
        cyclesAPI.getPredictions(),
        analyticsAPI.overview(),
      ]);
      setPredictions(predRes.data.predictions);
      setOverview(analyticsRes.data);

      // Load AI insights in background
      aiAPI.getInsights().then(res => setInsights(res.data.insights || [])).catch(() => {});
    } catch (err) {
      console.log('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCyclePhase = () => {
    if (!predictions) return { phase: 'No Data', description: 'Start logging your cycle', color: COLORS.primaryLight, emoji: '🌸' };
    const { currentCycleDay, averageCycleLength } = predictions;
    const avgLen = averageCycleLength || 28;

    if (currentCycleDay <= 5) return { phase: 'Menstrual', description: 'Your period phase', color: '#E91E8C', emoji: '🩸' };
    if (currentCycleDay <= 13) return { phase: 'Follicular', description: 'Energy is rising', color: '#FF9800', emoji: '🌱' };
    if (currentCycleDay <= 16) return { phase: 'Ovulation', description: 'Peak fertility window', color: '#FFB300', emoji: '✨' };
    return { phase: 'Luteal', description: 'Wind-down phase', color: '#9C27B0', emoji: '🌙' };
  };

  const phase = getCyclePhase();

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView
      style={[styles.container]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Cycle Phase Card */}
      <TouchableOpacity
        style={[styles.cycleCard, { backgroundColor: phase.color }]}
        onPress={() => navigation.navigate('Cycles')}
        activeOpacity={0.9}
      >
        <View style={styles.cycleCardInner}>
          <View>
            <Text style={styles.cycleEmoji}>{phase.emoji}</Text>
            <Text style={styles.cyclePhase}>{phase.phase} Phase</Text>
            <Text style={styles.cycleDescription}>{phase.description}</Text>
            {predictions?.currentCycleDay && (
              <Text style={styles.cycleDay}>Day {predictions.currentCycleDay}</Text>
            )}
          </View>
          <View style={styles.cycleStats}>
            {predictions?.daysUntilNextPeriod !== undefined && (
              <View style={styles.cycleStat}>
                <Text style={styles.cycleStatNum}>{Math.max(0, predictions.daysUntilNextPeriod)}</Text>
                <Text style={styles.cycleStatLabel}>days to{'\n'}period</Text>
              </View>
            )}
            {predictions?.fertilityScore !== undefined && (
              <View style={styles.cycleStat}>
                <Text style={styles.cycleStatNum}>{predictions.fertilityScore}</Text>
                <Text style={styles.cycleStatLabel}>fertility{'\n'}score</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Log</Text>
      <View style={styles.quickActions}>
        {[
          { label: 'Period', icon: 'water', color: '#E91E8C', screen: 'LogPeriod' },
          { label: 'Symptoms', icon: 'heart', color: '#9C27B0', screen: 'LogSymptoms' },
          { label: 'Health', icon: 'fitness', color: '#4CAF50', screen: 'LogHealth' },
          { label: 'Intimacy', icon: 'rose', color: '#FF6B9D', screen: 'LogIntimacy' },
        ].map(action => (
          <TouchableOpacity
            key={action.label}
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Events */}
      {predictions && (
        <>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={[styles.eventsCard, { backgroundColor: colors.card }]}>
            {[
              { label: 'Next Period', date: predictions.nextPeriodDate, color: '#E91E8C', icon: '🩸' },
              { label: 'Fertile Window', date: predictions.fertileWindowStart, color: '#81C784', icon: '🌿' },
              { label: 'Ovulation', date: predictions.ovulationDate, color: '#FFB300', icon: '✨' },
            ].map(event => (
              <View key={event.label} style={styles.eventRow}>
                <Text style={styles.eventEmoji}>{event.icon}</Text>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventLabel, { color: colors.text }]}>{event.label}</Text>
                  <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                    {event.date ? format(new Date(event.date), 'MMM d') : 'Calculating...'}
                  </Text>
                </View>
                {event.date && (
                  <View style={[styles.eventBadge, { backgroundColor: event.color + '20' }]}>
                    <Text style={[styles.eventBadgeText, { color: event.color }]}>
                      {Math.max(0, differenceInDays(new Date(event.date), new Date()))}d
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>AI Insights ✨</Text>
          {insights.slice(0, 2).map((insight: any, i: number) => (
            <View key={i} style={[styles.insightCard, { backgroundColor: colors.card }]}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightDot, { backgroundColor: primaryColor }]} />
                <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
              </View>
              <Text style={[styles.insightText, { color: colors.textSecondary }]}>{insight.insight}</Text>
            </View>
          ))}
        </>
      )}

      {/* Stats */}
      {overview?.cycleSummary && (
        <>
          <Text style={styles.sectionTitle}>My Cycle Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Avg Cycle', value: overview.cycleSummary.avgCycleLength ? `${overview.cycleSummary.avgCycleLength}d` : '--', icon: '🔄' },
              { label: 'Avg Period', value: overview.cycleSummary.avgPeriodLength ? `${overview.cycleSummary.avgPeriodLength}d` : '--', icon: '📅' },
              { label: 'Regularity', value: overview.cycleSummary.regularityScore ? `${overview.cycleSummary.regularityScore}%` : '--', icon: '📊' },
              { label: 'Cycles', value: overview.cycleSummary.totalCycles || '0', icon: '🗓️' },
            ].map(stat => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={styles.statEmoji}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: primaryColor }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* AI Chat Shortcut */}
      <TouchableOpacity
        style={[styles.aiButton, { backgroundColor: primaryColor }]}
        onPress={() => navigation.navigate('AI')}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        <Text style={styles.aiButtonText}>Ask your AI assistant</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  greeting: { fontSize: SIZES.xl, fontWeight: '700', color: colors.text },
  date: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },

  cycleCard: { margin: 16, borderRadius: 24, padding: 24, shadowColor: '#E91E8C', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  cycleCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cycleEmoji: { fontSize: 36, marginBottom: 8 },
  cyclePhase: { fontSize: SIZES.xl, fontWeight: '800', color: '#fff' },
  cycleDescription: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  cycleDay: { fontSize: SIZES.xxxl, fontWeight: '900', color: '#fff', marginTop: 8 },
  cycleStats: { alignItems: 'flex-end', gap: 16 },
  cycleStat: { alignItems: 'center' },
  cycleStatNum: { fontSize: SIZES.xxl, fontWeight: '800', color: '#fff' },
  cycleStatLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: colors.text, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },

  quickActions: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  quickAction: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: SIZES.xs, fontWeight: '600' },

  eventsCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  eventEmoji: { fontSize: 22, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventLabel: { fontSize: SIZES.md, fontWeight: '600' },
  eventDate: { fontSize: SIZES.sm, marginTop: 2 },
  eventBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  eventBadgeText: { fontSize: SIZES.sm, fontWeight: '700' },

  insightCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  insightTitle: { fontSize: SIZES.md, fontWeight: '700' },
  insightText: { fontSize: SIZES.sm, lineHeight: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  statCard: { width: (width - 48) / 2, padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: SIZES.xl, fontWeight: '800' },
  statLabel: { fontSize: SIZES.xs, marginTop: 2, fontWeight: '500' },

  aiButton: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 18, borderRadius: 20, gap: 10, justifyContent: 'space-between' },
  aiButtonText: { flex: 1, color: '#fff', fontSize: SIZES.base, fontWeight: '600' },
});
