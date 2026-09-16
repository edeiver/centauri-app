import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme';
import AICoachScreen from '../screens/AICoachScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Dashboard: { active: 'telescope', inactive: 'telescope-outline' },
  Transactions: { active: 'planet', inactive: 'planet-outline' },
  AICoach: { active: 'sparkles', inactive: 'sparkles-outline' },
};

function AppTabs() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const tabLabels = {
    Dashboard: t('nav.dashboard'),
    Transactions: t('nav.transactions'),
    AICoach: t('nav.aiCoach'),
  };

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
        tabBarLabel: tabLabels[route.name],
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

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={AppTabs} name="Tabs" />
      <Stack.Screen component={ProfileScreen} name="Profile" options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
