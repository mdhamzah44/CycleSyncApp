import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { cyclesAPI } from '../utils/api';
import { COLORS, SIZES } from '../constants/theme';
import { format } from 'date-fns';

export default function CalendarScreen({ navigation }: any) {
  const { colors, isDark, primaryColor } = useTheme();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [predictions, setPredictions] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayInfo, setSelectedDayInfo] = useState<any>(null);

  useFocusEffect(useCallback(() => {
    loadCalendarData();
  }, []));

  const loadCalendarData = async () => {
    try {
      const res = await cyclesAPI.getCalendarMarkers();
      const { markers, predictions: pred } = res.data;
      setMarkedDates(markers);
      setPredictions(pred);
    } catch (err) {
      console.log(err);
    }
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const info: any[] = [];
    const marker = markedDates[day.dateString];
    if (marker?.dots) {
      marker.dots.forEach((dot: any) => {
        if (dot.key === 'period') info.push({ label: 'Period Day', color: '#E91E8C', emoji: '🩸' });
        if (dot.key === 'future_period') info.push({ label: 'Predicted Period', color: '#F48FB1', emoji: '📅' });
        if (dot.key === 'fertile') info.push({ label: 'Fertile Window', color: '#81C784', emoji: '🌿' });
        if (dot.key === 'ovulation') info.push({ label: 'Ovulation Day', color: '#FFB300', emoji: '✨' });
      });
    }
    setSelectedDayInfo(info);
  };

  const theme = {
    backgroundColor: colors.background,
    calendarBackground: colors.card,
    textSectionTitleColor: primaryColor,
    selectedDayBackgroundColor: primaryColor,
    selectedDayTextColor: '#fff',
    todayTextColor: primaryColor,
    dayTextColor: colors.text,
    textDisabledColor: colors.textSecondary,
    dotColor: primaryColor,
    arrowColor: primaryColor,
    monthTextColor: colors.text,
    indicatorColor: primaryColor,
    textDayFontWeight: '500',
    textMonthFontWeight: '700',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>

      <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
        <Calendar
          markedDates={{
            ...markedDates,
            ...(selectedDate ? { [selectedDate]: { ...markedDates[selectedDate], selected: true } } : {}),
          }}
          markingType="multi-dot"
          onDayPress={onDayPress}
          theme={theme}
          enableSwipeMonths
        />
      </View>

      {/* Legend */}
      <View style={[styles.legendCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Legend</Text>
        <View style={styles.legendGrid}>
          {[
            { color: '#E91E8C', label: 'Period' },
            { color: '#F48FB1', label: 'Predicted Period' },
            { color: '#81C784', label: 'Fertile Window' },
            { color: '#FFB300', label: 'Ovulation' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Selected Day Info */}
      {selectedDate && (
        <View style={[styles.dayInfoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.dayInfoDate, { color: primaryColor }]}>
            {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </Text>
          {selectedDayInfo && selectedDayInfo.length > 0 ? (
            selectedDayInfo.map((info: any, i: number) => (
              <View key={i} style={styles.dayInfoRow}>
                <Text style={styles.dayInfoEmoji}>{info.emoji}</Text>
                <Text style={[styles.dayInfoLabel, { color: colors.text }]}>{info.label}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.dayInfoEmpty, { color: colors.textSecondary }]}>No events this day</Text>
          )}
          <TouchableOpacity
            style={[styles.logButton, { backgroundColor: primaryColor }]}
            onPress={() => navigation.navigate('LogSymptoms', { date: selectedDate })}
          >
            <Text style={styles.logButtonText}>Log for this day</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upcoming Events */}
      {predictions && (
        <View style={[styles.upcomingCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.upcomingTitle, { color: colors.text }]}>Upcoming Events</Text>
          {[
            { label: 'Next Period', date: predictions.nextPeriodDate, color: '#E91E8C', emoji: '🩸' },
            { label: 'Fertile Window Starts', date: predictions.fertileWindowStart, color: '#81C784', emoji: '🌿' },
            { label: 'Ovulation', date: predictions.ovulationDate, color: '#FFB300', emoji: '✨' },
            { label: 'Fertile Window Ends', date: predictions.fertileWindowEnd, color: '#81C784', emoji: '🌿' },
          ].map(event => event.date ? (
            <View key={event.label} style={styles.eventRow}>
              <Text style={styles.eventEmoji}>{event.emoji}</Text>
              <View style={styles.eventInfo}>
                <Text style={[styles.eventLabel, { color: colors.text }]}>{event.label}</Text>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                  {format(new Date(event.date), 'EEE, MMM d')}
                </Text>
              </View>
              <View style={[styles.eventBadge, { backgroundColor: event.color + '20' }]}>
                <Text style={[styles.eventBadgeText, { color: event.color }]}>
                  {format(new Date(event.date), 'MMM d')}
                </Text>
              </View>
            </View>
          ) : null)}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: SIZES.xxl, fontWeight: '800', margin: 20, marginTop: 60 },
  calendarCard: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  legendCard: { margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  legendTitle: { fontSize: SIZES.md, fontWeight: '700', marginBottom: 10 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendLabel: { fontSize: SIZES.sm },
  dayInfoCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  dayInfoDate: { fontSize: SIZES.lg, fontWeight: '700', marginBottom: 10 },
  dayInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dayInfoEmoji: { fontSize: 18, marginRight: 10 },
  dayInfoLabel: { fontSize: SIZES.md, fontWeight: '500' },
  dayInfoEmpty: { fontSize: SIZES.sm, fontStyle: 'italic', marginBottom: 10 },
  logButton: { marginTop: 10, padding: 12, borderRadius: 12, alignItems: 'center' },
  logButtonText: { color: '#fff', fontWeight: '700', fontSize: SIZES.md },
  upcomingCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  upcomingTitle: { fontSize: SIZES.md, fontWeight: '700', marginBottom: 10 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  eventEmoji: { fontSize: 20, marginRight: 10 },
  eventInfo: { flex: 1 },
  eventLabel: { fontSize: SIZES.md, fontWeight: '600' },
  eventDate: { fontSize: SIZES.sm, marginTop: 2 },
  eventBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  eventBadgeText: { fontSize: SIZES.sm, fontWeight: '700' },
});
