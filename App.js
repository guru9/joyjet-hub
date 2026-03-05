import 'react-native-gesture-handler'; // MUST be the first import
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, LogBox, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Prevent Auto-Hide immediately to handle New Architecture bridge timing
SplashScreen.preventAutoHideAsync().catch(() => {});
LogBox.ignoreAllLogs(); 

import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [session, setSession] = useState({ role: null, name: '', nodes: [] });
  const isMounted = useRef(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Essential delay for New Architecture bridge stability (0.83+)
        await new Promise(resolve => setTimeout(resolve, 2500)); 
      } catch (e) {
        console.warn("Init Warning:", e);
      } finally {
        if (isMounted.current) {
          setAppIsReady(true);
          // 2. Hide splash after the mandatory stability delay
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    }
    prepare();

    // FALLBACK: Force-hide splash if the bridge hangs (Safety for Android 16)
    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 7000);

    return () => {
      isMounted.current = false;
      clearTimeout(timeout);
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 2. Hide splash ONLY once the UI root is mounted and measured
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  // 3. Removed 'if (!appIsReady) return null;' to ensure root layout is always available

  return (
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View 
          style={[styles.flexContainer, !appIsReady && { opacity: 0 }]} 
          onLayout={onLayoutRootView}
          collapsable={false}
        >
          <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false, 
                animation: 'fade',
                contentStyle: { backgroundColor: '#000000' } // Fixes white flash during transitions
              }}
            >
              {!session.role ? (
                <Stack.Screen name="Login">
                  {(props) => (
                    <LoginScreen 
                      {...props} 
                      onLogin={(role, name, nodes) => setSession({ role, name, nodes })} 
                    />
                  )}
                </Stack.Screen>
              ) : (
                <>
                  {session.role === 'admin' && (
                    <Stack.Screen name="Admin" component={AdminScreen} initialParams={{ name: session.name }} />
                  )}
                  {session.role === 'viewer' && (
                    <Stack.Screen name="Viewer" component={ViewerScreen} initialParams={{ name: session.name, allowedNodes: session.nodes }} />
                  )}
                  {session.role === 'ghost' && (
                    <Stack.Screen name="Ghost" component={GhostScreen} initialParams={{ name: session.name }} />
                  )}
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
