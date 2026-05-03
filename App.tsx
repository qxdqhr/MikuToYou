/**
 * MikuToYou
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { navigationTheme } from './src/theme/navigationTheme';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootTabs } from './src/navigation/RootTabs';
import { AppProvider } from './src/state/AppContext';

function App() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar
              barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
            />
            <RootTabs />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
