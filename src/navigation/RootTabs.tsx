import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ChatScreen } from '../screens/ChatScreen';
import { PersonalityScreen } from '../screens/PersonalityScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/tokens';

export type RootTabParamList = {
  Chat: undefined;
  Persona: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabBarChrome = () => (
  <View
    style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  />
);

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarBackground: tabBarChrome,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          ...(Platform.OS === 'android'
            ? { elevation: 0 }
            : {
                shadowOpacity: 0,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 0,
              }),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSub,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: '聊天' }}
      />
      <Tab.Screen
        name="Persona"
        component={PersonalityScreen}
        options={{ title: '人格' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
}
