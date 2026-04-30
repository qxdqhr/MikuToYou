import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/tokens';

export type RootTabParamList = {
  Chat: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSub,
      }}>
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: '聊天' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
}
