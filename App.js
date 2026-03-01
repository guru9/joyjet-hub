import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// 1. Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Prevent crash on fast refresh */
});

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [session, setSession] = useState({ 
    role: null, 
    name: '', 
    nodes: [] 
  });

  useEffect(() => {
    async function prepare() {
      try {
        // 2. Perform initialization (e.g., check local storage or fonts)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // 3. Signal that JS is ready to render
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // 4. Force hide the native splash screen once Navigation is mounted
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Keep native splash screen visible
  }

  const handleAuth = (role, name, nodes = []) => {
    setSession({ role, name, nodes });
  };

  return (
    <SafeAreaProvider style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false, 
            animation: 'fade_from_bottom' 
          }}
        >
          {!session.role ? (
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleAuth} />}
            </Stack.Screen>
          ) : (
            <>
              {session.role === 'admin' && (
                <Stack.Screen 
                  name="Admin" 
                  component={AdminScreen} 
                  initialParams={{ name: session.name }} 
                />
              )}
              {session.role === 'viewer' && (
                <Stack.Screen 
                  name="Viewer" 
                  component={ViewerScreen} 
                  initialParams={{ 
                    name: session.name, 
                    allowedNodes: session.nodes 
                  }} 
                />
              )}
              {session.role === 'ghost' && (
                <Stack.Screen 
                  name="Ghost" 
                  component={GhostScreen} 
                  initialParams={{ name: session.name }} 
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Matches splash screen color to prevent flickering
  },
});
