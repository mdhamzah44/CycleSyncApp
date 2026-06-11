import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { cyclesAPI } from '../utils/api';
import { SIZES } from '../constants/theme';
import { format } from 'date-fns';

const CONTRACEPTION = ['Condom', 'Pill', 'IUD', 'Patch', 'None', 'Emergency Pill', 'Other'];

export default function LogIntimacyScreen({ navigation }: any) {
  const { colors, primaryColor } = useTheme();
  const [isProtected, setIsProtected] = useState(true);
  const [contraception, setContraception] = useState('Condom');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cyclesAPI.getAll().then(res => {
      const active = res.data.cycles?.find((c: any) => !c.endDate);
      if (active) setActiveCycleId(active._id);
      else if (res.data.cycles?.[0]) setActiveCycleId(res.data.cycles[0]._id);
    }).catch(() => {});
  }, []);

  const save = async () => {
    if (!activeCycleId) {
      Alert.alert('No Cycle', 'Please log a period first to track intimacy.');
      return;
    }
    setLoading(true);
    try {
      await cyclesAPI.logIntercourse(activeCycleId, {
        date: new Date().toISOString(),
        protected: isProtected,
        contraceptionType: isProtected ? contraception : 'None',
        notes,
      });
      Alert.alert('Logged! 💕', 'Intimacy data saved privately.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Log Intimacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.privacyBanner}>
        <Ionicons name="lock-closed" size={16} color={primaryColor} />
        <Text style={[styles.privacyText, { color: primaryColor }]}>All intimacy data is private and encrypted</Text>
      </View>

      <Text style={[styles.dateLabel, { color: primaryColor }]}>{format(new Date(date), 'EEEE, MMMM d')}</Text>

      {/* Protected */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Protected sex</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Used contraception</Text>
          </View>
          <Switch
            value={isProtected}
            onValueChange={setIsProtected}
            thumbColor={isProtected ? '#fff' : '#ccc'}
            trackColor={{ true: primaryColor, false: colors.border }}
          />
        </View>
      </View>

      {/* Contraception Type */}
      {isProtected && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Contraception Used</Text>
          <View style={styles.contraGrid}>
            {CONTRACEPTION.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.contraBtn,
                  { backgroundColor: contraception === c ? primaryColor : colors.card },
                ]}
                onPress={() => setContraception(c)}
              >
                <Text style={[styles.contraBtnText, { color: contraception === c ? '#fff' : colors.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Unprotected warning */}
      {!isProtected && (
        <View style={[styles.warningCard, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            If this was unprotected sex and you're concerned, consider emergency contraception within 72 hours and consult a healthcare provider.
          </Text>
        </View>
      )}

      {/* Notes */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Private Notes</Text>
      <TextInput
        style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any private notes (only you can see this)..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
        onPress={save}
        disabled={loading}
      >
        <Text style={styles.saveBtnText}>{loading ? 'Saving...' : '💕 Save Privately'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60 },
  title: { fontSize: SIZES.xl, fontWeight: '700' },
  privacyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingHorizontal: 16, backgroundColor: 'rgba(233,30,140,0.08)' },
  privacyText: { fontSize: SIZES.sm, fontWeight: '600' },
  dateLabel: { textAlign: 'center', fontSize: SIZES.md, fontWeight: '600', marginVertical: 16 },
  card: { margin: 16, marginBottom: 8, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontSize: SIZES.base, fontWeight: '600' },
  rowSub: { fontSize: SIZES.sm, marginTop: 2 },
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  contraGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  contraBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  contraBtnText: { fontSize: SIZES.sm, fontWeight: '600' },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', margin: 16, padding: 14, borderRadius: 16, borderWidth: 1, gap: 10 },
  warningText: { flex: 1, fontSize: SIZES.sm, color: '#E65100', lineHeight: 20 },
  notesInput: { marginHorizontal: 16, borderRadius: 16, padding: 14, fontSize: SIZES.md, borderWidth: 1, minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { margin: 16, marginTop: 20, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#E91E8C', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
