import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// 1. Keep splash visible while we initialize
SplashScreen.preventAutoHideAsync().catch(() => {});

import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [session, setSession] = useState({ role: null, name: '', nodes: [] });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait 2 seconds to ensure native bridge is solid
        await new Promise(resolve => setTimeout(resolve, 2000));
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 2. This hides the white screen and shows your UI
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  const handleAuth = (role, name, nodes = []) => {
    setSession({ role, name, nodes });
  };

  return (
    // 3. Added explicit style to prevent 0-pixel height bug
    <SafeAreaProvider style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!session.role ? (
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleAuth} />}
            </Stack.Screen>
          ) : (
            <>
              {session.role === 'admin' && <Stack.Screen name="Admin" component={AdminScreen} initialParams={{ name: session.name }} />}
              {session.role === 'viewer' && <Stack.Screen name="Viewer" component={ViewerScreen} initialParams={{ name: session.name, allowedNodes: session.nodes }} />}
              {session.role === 'ghost' && <Stack.Screen name="Ghost" component={GhostScreen} initialParams={{ name: session.name }} />}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Crucial for SDK 55
    backgroundColor: '#000',
  },
});
