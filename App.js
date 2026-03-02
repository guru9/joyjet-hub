import 'react-native-gesture-handler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Platform, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

[span_2](start_span)// 1. Mandatory Splash Control for SDK 55[span_2](end_span)
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
        // High delay to ensure New Architecture stability before any screen mounts
        await new Promise(resolve => setTimeout(resolve, 3000)); 
      } catch (e) {
        console.error("Initialization Error:", e);
      } finally {
        if (isMounted.current) setAppIsReady(true);
      }
    }
    prepare();

    [span_3](start_span)// FALLBACK: Force-hide splash if the bridge hangs[span_3](end_span)
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
      [span_4](start_span)// 2. Hide splash screen manually[span_4](end_span)
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider style={styles.flexContainer}>
        <View 
          style={styles.flexContainer} 
          onLayout={onLayoutRootView}
          collapsable={false} 
        >
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false, 
                animation: 'fade',
                contentStyle: { backgroundColor: '#000000' } 
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
