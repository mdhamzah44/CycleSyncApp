import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SIZES, COLORS } from '../constants/theme';

const GOALS = [
  { id: 'tracking', label: 'Track my cycle', emoji: '📅' },
  { id: 'pregnancy_planning', label: 'Plan pregnancy', emoji: '🤰' },
  { id: 'contraception', label: 'Contraception', emoji: '🛡️' },
  { id: 'health', label: 'General health', emoji: '💚' },
];

export default function RegisterScreen({ navigation }: any) {
  const { colors, primaryColor } = useTheme();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('tracking');
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Pass goal so AuthContext / API can store it
      await register(name.trim(), email.trim().toLowerCase(), password, goal);
      // Navigation handled by root navigator reacting to auth state.
      // If stack-based, uncomment:
      // navigation.replace('Home');
    } catch (err: any) {
      console.log('Register error:', JSON.stringify(err));
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Text style={styles.heroEmoji}>🌸</Text>
          <Text style={styles.heroTitle}>CycleSync</Text>
          <Text style={styles.heroSub}>Start your journey</Text>
          <View style={styles.progress}>
            {[1, 2].map(s => (
              <View
                key={s}
                style={[
                  styles.dot,
                  { backgroundColor: step >= s ? '#fff' : 'rgba(255,255,255,0.4)' },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {step === 1 ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Let's get you started
              </Text>

              <View style={styles.form}>
                {/* Name */}
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Your name</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Full name"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Email */}
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password */}
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Min. 6 characters"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                      editable={!loading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Continue →</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Your goal?</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We'll personalize your experience
              </Text>

              <View style={styles.goals}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.goalButton,
                      {
                        backgroundColor: goal === g.id ? primaryColor : colors.inputBg,
                        borderColor: goal === g.id ? primaryColor : colors.border,
                      },
                    ]}
                    onPress={() => setGoal(g.id)}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <Text style={styles.goalEmoji}>{g.emoji}</Text>
                    <Text
                      style={[
                        styles.goalLabel,
                        { color: goal === g.id ? '#fff' : colors.text },
                      ]}
                    >
                      {g.label}
                    </Text>
                    {goal === g.id && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.stepButtons}>
                <TouchableOpacity
                  style={[styles.backButton, { borderColor: colors.border }]}
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Text style={[styles.backText, { color: colors.text }]}>← Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { flex: 1, backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 },
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account 🎉</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: primaryColor }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  hero: { paddingTop: 60, paddingBottom: 48, alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  heroSub: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  progress: { flexDirection: 'row', gap: 8, marginTop: 16 },
  dot: { width: 24, height: 6, borderRadius: 3 },
  card: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    padding: 28,
    paddingBottom: 48,
  },
  title: { fontSize: SIZES.xxl, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: SIZES.md, marginBottom: 24 },
  form: { gap: 14 },
  label: { fontSize: SIZES.sm, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: SIZES.base },
  button: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  goals: { gap: 12, marginBottom: 24 },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  goalEmoji: { fontSize: 24 },
  goalLabel: { flex: 1, fontSize: SIZES.base, fontWeight: '600' },
  checkmark: { fontSize: 18, color: '#fff', fontWeight: '800' },
  stepButtons: { flexDirection: 'row', gap: 12 },
  backButton: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  backText: { fontSize: SIZES.md, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: SIZES.md },
  footerLink: { fontSize: SIZES.md, fontWeight: '700' },
});