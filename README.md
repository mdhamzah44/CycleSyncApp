# 🌸 CycleSync — Period Tracker App

A full-featured menstrual health tracking app built with **Expo (React Native)**, **MongoDB**, and **Groq AI**.

---

## 📁 Project Structure

```
cyclesync/
├── App.tsx                    # Root app entry point
├── app.json                   # Expo config
├── app/
│   ├── constants/
│   │   └── theme.ts           # Colors, fonts, sizes, symptom lists
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication state management
│   │   └── ThemeContext.tsx   # Dark/light mode, theme color
│   ├── navigation/
│   │   ├── RootNavigator.tsx  # Auth vs App routing
│   │   ├── AuthNavigator.tsx  # Login/Register stack
│   │   └── AppNavigator.tsx   # Main tabs + modal screens
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Dashboard with cycle phase, insights
│   │   ├── CalendarScreen.tsx # Monthly calendar with markers
│   │   ├── CyclesScreen.tsx   # Period history timeline
│   │   ├── AnalyticsScreen.tsx# Charts, trends, stats
│   │   ├── AIScreen.tsx       # Groq AI chat assistant
│   │   ├── ProfileScreen.tsx  # User profile, theme, partner
│   │   ├── LoginScreen.tsx    # Login
│   │   ├── RegisterScreen.tsx # Registration with goal selection
│   │   ├── LogPeriodScreen.tsx    # Start/end period logging
│   │   ├── LogSymptomsScreen.tsx  # Symptom & mood tracking
│   │   ├── LogHealthScreen.tsx    # Health metrics logging
│   │   ├── LogIntimacyScreen.tsx  # Private intimacy tracking
│   │   ├── PregnancyScreen.tsx    # Pregnancy tracker
│   │   └── RemindersScreen.tsx    # Custom reminders
│   └── utils/
│       └── api.ts             # All API service functions
└── backend/
    ├── server.js              # Express server
    ├── .env.example           # Environment variables template
    ├── middleware/
    │   └── auth.js            # JWT authentication
    ├── models/
    │   ├── User.js            # User + settings + partner
    │   ├── Cycle.js           # Period cycles + BBT + intercourse
    │   ├── Symptom.js         # Daily symptom logs
    │   ├── HealthLog.js       # Health metrics
    │   └── Reminder.js        # Push reminders
    ├── routes/
    │   ├── auth.js            # Register, login, PIN
    │   ├── cycles.js          # CRUD cycles + predictions
    │   ├── symptoms.js        # Symptom logging + trends
    │   ├── health.js          # Health logs + stats
    │   ├── ai.js              # Groq AI chat + insights
    │   ├── analytics.js       # Overview + monthly reports
    │   ├── profile.js         # Profile + export + delete
    │   ├── reminders.js       # Reminder CRUD
    │   ├── pregnancy.js       # Pregnancy mode + weekly updates
    │   └── partner.js         # Partner sharing
    └── utils/
        └── cyclePredictor.js  # Cycle prediction algorithms
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI=mongodb://localhost:27017/cyclesync
#   JWT_SECRET=your_secret_here
#   GROQ_API_KEY=your_groq_key_here

npm install
npm run dev
```

**Get your Groq API key:** https://console.groq.com  
**MongoDB:** Install locally or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### 2. Frontend Setup

```bash
# Root of cyclesync/
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) or press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web

### 3. Update API URL

In `app/utils/api.ts`, update the `BASE_URL`:
```ts
// For physical device, use your computer's local IP:
const BASE_URL = 'http://192.168.1.X:5000/api';

// For emulator (Android):
const BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator:
const BASE_URL = 'http://localhost:5000/api';
```

---

## ✅ Completed Features

### 🩸 Menstrual Tracking
- [x] Log period start & end dates
- [x] Edit/delete previous periods
- [x] Track period & cycle length (auto-calculated)
- [x] Automatic cycle detection
- [x] Period history timeline
- [x] Flow level tracking (spotting → very heavy)
- [x] Current cycle day calculation

### 📅 Smart Calendar
- [x] Monthly calendar view
- [x] Period day highlights (pink)
- [x] Fertile window highlights (green)
- [x] Ovulation day highlights (gold)
- [x] Future cycle predictions
- [x] Log for any selected day

### 🌸 Fertility & Ovulation
- [x] Ovulation prediction (14 days before next period)
- [x] Fertile window prediction (5 days before ovulation)
- [x] Fertility score (0–100)
- [x] Basal body temperature logs
- [x] Cervical mucus tracking
- [x] Days until next period counter

### ❤️ Sexual Activity Tracking
- [x] Log intercourse dates
- [x] Protected/unprotected tracking
- [x] Contraception type selection
- [x] Emergency contraception notes
- [x] Private notes
- [x] Unprotected sex health warning

### 😊 Symptoms Tracking (17 symptom types)
- [x] Cramps, headache, back pain, breast tenderness
- [x] Acne, bloating, fatigue, nausea, dizziness
- [x] Hot flashes, mood swings, anxiety, irritability
- [x] Stress, depression, insomnia, custom
- [x] Mood selection (9 moods with emojis)
- [x] Mood score (1–10)
- [x] Energy & stress level scales

### 🌡 Health Tracking
- [x] Weight logs
- [x] Water intake tracking
- [x] Sleep hours & quality
- [x] Exercise type & duration (8 types)
- [x] Heart rate, blood pressure, body temperature
- [x] Medication tracking with taken/not taken toggle
- [x] Supplement tracking
- [x] Daily notes

### 🤰 Pregnancy Features
- [x] Pregnancy planning mode
- [x] Pregnancy tracking mode
- [x] Due date calculator (from LMP or direct input)
- [x] Weeks pregnant display
- [x] Trimester progress bar
- [x] Weekly baby size & development updates
- [x] Trimester-specific wellness tips
- [x] Pregnancy checklist

### 📊 Analytics & Insights
- [x] Average cycle length
- [x] Average period length
- [x] Cycle regularity score (0–100)
- [x] Mood trend chart (7 days)
- [x] Top symptoms bar chart (3 months)
- [x] Health stats summary (30 days)
- [x] AI-powered personalized insights

### 🔔 Reminders
- [x] 10 reminder types (period, ovulation, medication, water, etc.)
- [x] Custom title & time
- [x] Repeat day selection
- [x] Toggle active/inactive
- [x] Quick-add shortcuts

### 🤖 AI Assistant (Groq / Llama 3.3 70B)
- [x] Context-aware chat (uses cycle data)
- [x] Quick question suggestions
- [x] Cycle insights generation
- [x] Symptom explanation
- [x] Conversation history
- [x] Typing indicator

### 👤 User Profile
- [x] Name, height, weight
- [x] Average cycle/period length preferences
- [x] Goal selection (tracking, pregnancy, contraception, health)
- [x] Profile save

### 🎨 Personalization
- [x] Dark mode / light mode toggle
- [x] 8 theme color options
- [x] Persistent theme preferences

### 🔐 Privacy & Security
- [x] JWT authentication
- [x] Secure token storage (expo-secure-store)
- [x] Data export
- [x] Data deletion controls
- [x] Private intimacy notes

### ☁️ Cloud & Sync
- [x] MongoDB cloud storage
- [x] JWT-based multi-device auth

### 📤 Partner Sharing
- [x] Unique partner code per user
- [x] Connect with partner via code
- [x] Share cycle predictions (non-sensitive)
- [x] Disconnect partner

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/cycles` | Get all cycles + predictions |
| POST | `/api/cycles/start` | Log period start |
| PUT | `/api/cycles/:id/end` | Log period end |
| GET | `/api/cycles/calendar-markers` | Get calendar data |
| GET | `/api/cycles/predictions` | Get predictions |
| GET | `/api/symptoms` | Get symptom logs |
| POST | `/api/symptoms` | Log symptoms |
| GET | `/api/symptoms/trends` | Symptom trends |
| GET | `/api/health` | Get health logs |
| POST | `/api/health` | Log health data |
| POST | `/api/ai/chat` | AI chat |
| GET | `/api/ai/insights` | AI insights |
| POST | `/api/ai/explain-symptom` | Explain symptom |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/reminders` | Get reminders |
| POST | `/api/reminders` | Create reminder |
| GET | `/api/pregnancy/status` | Pregnancy status |
| POST | `/api/pregnancy/enable` | Enable pregnancy mode |
| POST | `/api/partner/connect` | Connect with partner |
| GET | `/api/partner/data` | Get partner's shared data |

---

## 🧠 AI Model

Uses **Groq** with **llama-3.3-70b-versatile** for:
- Fast, context-aware responses
- Personalized cycle insights
- Symptom explanations
- Pattern detection
- Wellness tips

The AI receives anonymized cycle context (current day, predictions, recent symptoms) to provide personalized answers without exposing sensitive data.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo (React Native) + TypeScript |
| Navigation | React Navigation v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Groq SDK (Llama 3.3 70B) |
| Calendar | react-native-calendars |
| Charts | react-native-chart-kit |
| Storage | expo-secure-store |
| Biometrics | expo-local-authentication |

---

## 🏆 Premium Features (Marked for future implementation)

- Advanced AI cycle forecasting
- Wearable integrations (Apple Health, Google Fit)
- Unlimited history & detailed exports
- Priority AI support

---

*Built with ❤️ for menstrual health awareness by MOHD HAMZAH*
