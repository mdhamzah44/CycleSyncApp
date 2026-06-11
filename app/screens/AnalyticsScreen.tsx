import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { analyticsAPI, symptomsAPI } from '../utils/api';
import { SIZES, COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors, primaryColor, isDark } = useTheme();
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [overviewRes, trendsRes] = await Promise.all([
        analyticsAPI.overview(),
        symptomsAPI.getTrends(3),
      ]);
      setOverview(overviewRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      console.log(err);
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

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(${isDark ? '233,30,140' : '233,30,140'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    labelColor: () => colors.textSecondary,
    propsForDots: { r: '5', strokeWidth: '2', stroke: primaryColor },
  };

  const moodData = overview?.moodData?.slice(-7) || [];
  const hasMoodData = moodData.length > 0;

  const topSymptoms = overview?.topSymptoms || [];
  const hasSymptomData = topSymptoms.length > 0;

  const stats = [
    { label: 'Total Cycles', value: overview?.cycleSummary?.totalCycles || 0, emoji: '🔄', color: primaryColor },
    { label: 'Avg Cycle', value: overview?.cycleSummary?.avgCycleLength ? `${overview.cycleSummary.avgCycleLength}d` : '--', emoji: '📅', color: '#9C27B0' },
    { label: 'Avg Period', value: overview?.cycleSummary?.avgPeriodLength ? `${overview.cycleSummary.avgPeriodLength}d` : '--', emoji: '🩸', color: '#E91E8C' },
    { label: 'Regularity', value: overview?.cycleSummary?.regularityScore ? `${overview.cycleSummary.regularityScore}%` : '--', emoji: '📊', color: '#4CAF50' },
    { label: 'Avg Sleep', value: overview?.healthStats?.avgSleep ? `${overview.healthStats.avgSleep}h` : '--', emoji: '😴', color: '#2196F3' },
    { label: 'Avg Water', value: overview?.healthStats?.avgWater ? `${overview.healthStats.avgWater}ml` : '--', emoji: '💧', color: '#00BCD4' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Mood Chart */}
      {hasMoodData && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Trend (Last 7 days)</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <LineChart
              data={{
                labels: moodData.map((_: any, i: number) => `${i + 1}`),
                datasets: [{ data: moodData.map((m: any) => m.score || 5) }],
              }}
              width={width - 64}
              height={160}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </>
      )}

      {/* Top Symptoms */}
      {hasSymptomData && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Symptoms (3 months)</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <BarChart
              data={{
                labels: topSymptoms.slice(0, 5).map((s: any) => s.type.replace('_', ' ').slice(0, 8)),
                datasets: [{ data: topSymptoms.slice(0, 5).map((s: any) => s.count) }],
              }}
              width={width - 64}
              height={160}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
              withInnerLines={false}
            />
          </View>
        </>
      )}

      {/* Regularity Score */}
      {overview?.cycleSummary?.regularityScore !== null && overview?.cycleSummary?.regularityScore !== undefined && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cycle Regularity</Text>
          <View style={[styles.regularityCard, { backgroundColor: colors.card }]}>
            <View style={styles.regularityCircle}>
              <Text style={[styles.regularityScore, { color: primaryColor }]}>
                {overview.cycleSummary.regularityScore}
              </Text>
              <Text style={[styles.regularityLabel, { color: colors.textSecondary }]}>/100</Text>
            </View>
            <View style={styles.regularityInfo}>
              <Text style={[styles.regularityTitle, { color: colors.text }]}>
                {overview.cycleSummary.regularityScore >= 80 ? '✅ Very Regular'
                  : overview.cycleSummary.regularityScore >= 60 ? '⚠️ Somewhat Regular'
                  : '❗ Irregular'}
              </Text>
              <Text style={[styles.regularityDesc, { color: colors.textSecondary }]}>
                {overview.cycleSummary.regularityScore >= 80
                  ? 'Your cycle is very consistent. Great job tracking!'
                  : overview.cycleSummary.regularityScore >= 60
                  ? 'Some variation in your cycle. Keep tracking for better insights.'
                  : 'Your cycle shows significant variation. Consider consulting a healthcare provider.'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Cycle Summary */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Summary (30 days)</Text>
      <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        {[
          { label: 'Exercise Days', value: overview?.healthStats?.exerciseDays || 0, icon: '🏃', unit: 'days' },
          { label: 'Avg Sleep', value: overview?.healthStats?.avgSleep || '--', icon: '😴', unit: 'hrs' },
          { label: 'Avg Water', value: overview?.healthStats?.avgWater || '--', icon: '💧', unit: 'ml' },
        ].map(item => (
          <View key={item.label} style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>{item.icon}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.summaryValue, { color: primaryColor }]}>
              {item.value} {typeof item.value === 'number' ? item.unit : ''}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: SIZES.xxl, fontWeight: '800', margin: 20, marginTop: 60 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  statCard: { width: (width - 52) / 3, padding: 14, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: SIZES.lg, fontWeight: '800' },
  statLabel: { fontSize: SIZES.xs, marginTop: 2, fontWeight: '500', textAlign: 'center' },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  chartCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  regularityCard: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 16 },
  regularityCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  regularityScore: { fontSize: SIZES.xxl, fontWeight: '900' },
  regularityLabel: { fontSize: SIZES.xs },
  regularityInfo: { flex: 1 },
  regularityTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 4 },
  regularityDesc: { fontSize: SIZES.sm, lineHeight: 18 },
  summaryCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  summaryIcon: { fontSize: 20, marginRight: 12 },
  summaryLabel: { flex: 1, fontSize: SIZES.md, fontWeight: '500' },
  summaryValue: { fontSize: SIZES.md, fontWeight: '700' },
});
