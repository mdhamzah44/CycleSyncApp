import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, Platform } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CyclesScreen from '../screens/CyclesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AIScreen from '../screens/AIScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LogPeriodScreen from '../screens/LogPeriodScreen';
import LogSymptomsScreen from '../screens/LogSymptomsScreen';
import LogHealthScreen from '../screens/LogHealthScreen';
import LogIntimacyScreen from '../screens/LogIntimacyScreen';
import PregnancyScreen from '../screens/PregnancyScreen';
import RemindersScreen from '../screens/RemindersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  const { colors, primaryColor, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Calendar: { active: 'calendar', inactive: 'calendar-outline' },
            Cycles: { active: 'water', inactive: 'water-outline' },
            Analytics: { active: 'bar-chart', inactive: 'bar-chart-outline' },
            AI: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
          };
          const icon = icons[route.name];
          if (!icon) return null;
          return (
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={(focused ? icon.active : icon.inactive) as any}
                size={focused ? 24 : 22}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Cycles" component={CyclesScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="AI" component={AIScreen} options={{ tabBarLabel: 'AI Chat' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Main" component={HomeTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LogPeriod" component={LogPeriodScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LogSymptoms" component={LogSymptomsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LogHealth" component={LogHealthScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LogIntimacy" component={LogIntimacyScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Pregnancy" component={PregnancyScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
