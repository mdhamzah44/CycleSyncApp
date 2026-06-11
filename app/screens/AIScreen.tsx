import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { aiAPI } from '../utils/api';
import { SIZES } from '../constants/theme';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'What phase am I in?',
  'Why do I get cramps?',
  'How can I track ovulation?',
  'What foods help with PMS?',
  'Is my cycle normal?',
  'Fertility tips for me',
];

export default function AIScreen() {
  const { colors, isDark, primaryColor } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your CycleSync AI assistant 🌸 I'm here to help you understand your cycle, symptoms, and reproductive health. What would you like to know today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat(messageText, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const styles = createStyles(colors, isDark, primaryColor);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.aiAvatar, { backgroundColor: primaryColor }]}>
          <Text style={styles.aiAvatarEmoji}>🤖</Text>
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>CycleSync AI</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.onlineText, { color: colors.textSecondary }]}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              msg.role === 'user' ? { backgroundColor: primaryColor } : { backgroundColor: colors.card },
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={[styles.aiBubbleAvatar, { backgroundColor: primaryColor + '20' }]}>
                <Text style={{ fontSize: 12 }}>🌸</Text>
              </View>
            )}
            <View style={[styles.messageContent, msg.role === 'user' ? { alignItems: 'flex-end' } : {}]}>
              <Text style={[
                styles.messageText,
                { color: msg.role === 'user' ? '#fff' : colors.text }
              ]}>
                {msg.content}
              </Text>
              <Text style={[
                styles.messageTime,
                { color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
              ]}>
                {format(msg.timestamp, 'HH:mm')}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.card }]}>
            <View style={[styles.aiBubbleAvatar, { backgroundColor: primaryColor + '20' }]}>
              <Text style={{ fontSize: 12 }}>🌸</Text>
            </View>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color={primaryColor} />
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQuestions} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {QUICK_QUESTIONS.map(q => (
            <TouchableOpacity
              key={q}
              style={[styles.quickQuestion, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }]}
              onPress={() => sendMessage(q)}
            >
              <Text style={[styles.quickQuestionText, { color: primaryColor }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything about your cycle..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: input.trim() ? primaryColor : colors.border }]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any, isDark: boolean, primaryColor: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 60, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  aiAvatarEmoji: { fontSize: 22 },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  onlineText: { fontSize: SIZES.xs },

  messages: { flex: 1 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%', borderRadius: 18, padding: 12, gap: 8 },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubble: { alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  aiBubbleAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  messageContent: { flex: 1 },
  messageText: { fontSize: SIZES.md, lineHeight: 22 },
  messageTime: { fontSize: SIZES.xs, marginTop: 4 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 },
  typingText: { fontSize: SIZES.sm },

  quickQuestions: { maxHeight: 50, marginBottom: 8 },
  quickQuestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, height: 36, justifyContent: 'center' },
  quickQuestionText: { fontSize: SIZES.sm, fontWeight: '600' },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 28, gap: 10, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: SIZES.md, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
