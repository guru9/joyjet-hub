import 'react-native-gesture-handler'; // MUST be the first import
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {});

// Import your screens (Ensure these paths are correct)
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
        // Pre-initialization logic (e.g., loading fonts or storage) goes here
        // 2. We add a safety delay to ensure the native bridge is stable
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 3. Manually hide the splash screen once the UI is ready to mount
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
    // 4. Wrap with GestureHandlerRootView and provide explicit flex: 1
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider style={styles.flexContainer} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!session.role ? (
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={handleAuth} />}
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
                    initialParams={{ name: session.name, allowedNodes: session.nodes }} 
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1, // Crucial for New Architecture to prevent 0-height screens
    backgroundColor: '#000000',
  },
});
