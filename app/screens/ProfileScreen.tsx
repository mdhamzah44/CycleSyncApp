import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileAPI, partnerAPI } from '../utils/api';
import { SIZES, COLORS } from '../constants/theme';

const THEME_COLORS = ['#E91E8C', '#9C27B0', '#3F51B5', '#009688', '#FF5722', '#607D8B', '#F44336', '#FF9800'];

const GOALS = [
  { id: 'tracking', label: 'Cycle Tracking', emoji: '📅' },
  { id: 'pregnancy_planning', label: 'Pregnancy Planning', emoji: '🤰' },
  { id: 'contraception', label: 'Contraception', emoji: '🛡️' },
  { id: 'health', label: 'General Health', emoji: '💚' },
];

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  const { colors, primaryColor, isDark, toggleTheme, setPrimaryColor } = useTheme();
  const [partnerCode, setPartnerCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editWeight, setEditWeight] = useState(String(user?.profile?.weight || ''));
  const [editHeight, setEditHeight] = useState(String(user?.profile?.height || ''));
  const [editCycleLen, setEditCycleLen] = useState(String(user?.profile?.averageCycleLength || '28'));
  const [editPeriodLen, setEditPeriodLen] = useState(String(user?.profile?.averagePeriodLength || '5'));
  const [editGoal, setEditGoal] = useState(user?.profile?.goals || 'tracking');

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update({
        name: editName,
        profile: {
          weight: parseFloat(editWeight) || undefined,
          height: parseFloat(editHeight) || undefined,
          averageCycleLength: parseInt(editCycleLen) || 28,
          averagePeriodLength: parseInt(editPeriodLen) || 5,
          goals: editGoal,
        },
      });
      updateUser(res.data.user);
      Alert.alert('Saved!', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const connectPartner = async () => {
    if (!partnerCode.trim()) return;
    setConnecting(true);
    try {
      const res = await partnerAPI.connect(partnerCode.trim().toUpperCase());
      Alert.alert('Connected! 💑', `You are now connected with ${res.data.partnerName}`);
      setPartnerCode('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Partner code not found');
    } finally {
      setConnecting(false);
    }
  };

  const exportData = async () => {
    try {
      const res = await profileAPI.export();
      Alert.alert('Data Exported', 'Your data export is ready. In a production app, this would download a file.');
    } catch {}
  };

  const deleteData = () => {
    Alert.alert('Delete All Data', 'This will permanently delete all your cycle, symptom, and health data. This cannot be undone.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await profileAPI.deleteData();
        Alert.alert('Deleted', 'All your data has been deleted.');
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const SectionCard = ({ title, children }: any) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const FieldInput = ({ label, value, onChange, unit, keyboard = 'default' }: any) => (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.fieldInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <TextInput
          style={[styles.fieldInput, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
        />
        {unit && <Text style={[styles.fieldUnit, { color: colors.textSecondary }]}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: primaryColor }]}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{user?.name}</Text>
        <Text style={styles.heroEmail}>{user?.email}</Text>
        <View style={[styles.partnerCodeBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.partnerCodeLabel}>My Code: </Text>
          <Text style={styles.partnerCodeValue}>{user?.partnerCode}</Text>
        </View>
      </View>

      {/* Profile Info */}
      <SectionCard title="👤 Personal Info">
        <FieldInput label="Name" value={editName} onChange={setEditName} />
        <FieldInput label="Height" value={editHeight} onChange={setEditHeight} unit="cm" keyboard="decimal-pad" />
        <FieldInput label="Weight" value={editWeight} onChange={setEditWeight} unit="kg" keyboard="decimal-pad" />
        <FieldInput label="Avg Cycle Length" value={editCycleLen} onChange={setEditCycleLen} unit="days" keyboard="number-pad" />
        <FieldInput label="Avg Period Length" value={editPeriodLen} onChange={setEditPeriodLen} unit="days" keyboard="number-pad" />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12, marginBottom: 8 }]}>Goal</Text>
        <View style={styles.goalsGrid}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBtn, { backgroundColor: editGoal === g.id ? primaryColor : colors.inputBg }]}
              onPress={() => setEditGoal(g.id)}
            >
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <Text style={[styles.goalLabel, { color: editGoal === g.id ? '#fff' : colors.text }]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: saving ? 0.7 : 1 }]}
          onPress={saveProfile}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="🎨 Appearance">
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? '#fff' : '#ccc'}
            trackColor={{ true: primaryColor, false: colors.border }}
          />
        </View>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12, marginBottom: 10 }]}>Theme Color</Text>
        <View style={styles.colorsRow}>
          {THEME_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorBtn, { backgroundColor: c }, primaryColor === c && styles.colorSelected]}
              onPress={() => setPrimaryColor(c)}
            />
          ))}
        </View>
      </SectionCard>

      {/* Partner Sharing */}
      <SectionCard title="💑 Partner Sharing">
        <Text style={[styles.partnerDesc, { color: colors.textSecondary }]}>
          Share your cycle data with your partner. Ask them to enter your code: {user?.partnerCode}
        </Text>
        <View style={[styles.partnerInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TextInput
            style={[styles.partnerInputText, { color: colors.text }]}
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="Enter partner's code"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            maxLength={8}
          />
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: primaryColor }]}
            onPress={connectPartner}
            disabled={connecting}
          >
            <Text style={styles.connectBtnText}>{connecting ? '...' : 'Connect'}</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>

      {/* Privacy & Security */}
      <SectionCard title="🔐 Privacy & Security">
        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.border }]} onPress={exportData}>
          <Ionicons name="download-outline" size={20} color={primaryColor} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Export My Data</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: 'transparent' }]} onPress={deleteData}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={[styles.actionLabel, { color: '#F44336' }]}>Delete All Data</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </SectionCard>

      {/* App Info */}
      <SectionCard title="ℹ️ About">
        <View style={[styles.actionRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>CycleSync v1.0.0</Text>
        </View>
        <View style={[styles.actionRow, { borderBottomColor: 'transparent' }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      </SectionCard>

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, { borderColor: '#F44336' }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 60, paddingBottom: 32, alignItems: 'center', gap: 6 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: SIZES.xl, fontWeight: '800', color: '#fff' },
  heroEmail: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.85)' },
  partnerCodeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  partnerCodeLabel: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)' },
  partnerCodeValue: { fontSize: SIZES.base, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  sectionCard: { margin: 16, marginBottom: 8, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  fieldLabel: { fontSize: SIZES.sm, fontWeight: '600', flex: 1 },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, height: 40, minWidth: 120 },
  fieldInput: { flex: 1, fontSize: SIZES.md },
  fieldUnit: { fontSize: SIZES.sm, fontWeight: '600' },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  goalBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6 },
  goalEmoji: { fontSize: 16 },
  goalLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  saveBtn: { padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  settingLabel: { fontSize: SIZES.base, fontWeight: '500' },
  colorsRow: { flexDirection: 'row', gap: 12 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  partnerDesc: { fontSize: SIZES.sm, lineHeight: 20, marginBottom: 12 },
  partnerInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  partnerInputText: { flex: 1, padding: 12, fontSize: SIZES.base, letterSpacing: 2, fontWeight: '700' },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  connectBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  actionLabel: { flex: 1, fontSize: SIZES.base, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 8 },
  logoutText: { fontSize: SIZES.base, fontWeight: '700', color: '#F44336' },
});
