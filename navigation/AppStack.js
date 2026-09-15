import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { useTheme } from '../theme';
import AICoachScreen from '../screens/AICoachScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { active: 'sparkles', inactive: 'sparkles-outline' },
  Transactions: { active: 'planet', inactive: 'planet-outline' },
  AICoach: { active: 'hardware-chip', inactive: 'hardware-chip-outline' },
};

const TAB_LABELS = {
  Dashboard: 'Inicio',
  Transactions: 'Órbitas',
  AICoach: 'AI Coach',
};

export default function AppStack() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceContainerLow,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...theme.typography.labelSm,
          textTransform: 'none',
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            color={color}
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen component={DashboardScreen} name="Dashboard" />
      <Tab.Screen component={TransactionsScreen} name="Transactions" />
      <Tab.Screen component={AICoachScreen} name="AICoach" />
    </Tab.Navigator>
  );
}
