import 'react-native-gesture-handler'; // MUST be the first import (Trigger: Public Build)
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, LogBox, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Prevent Auto-Hide immediately to handle New Architecture bridge timing
SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync('#000000').catch(() => {});
LogBox.ignoreAllLogs(); 

import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import GuideScreen from './src/screens/GuideScreen';
import CyberAlertModal from './src/components/CyberAlertModal';
import * as TaskManager from 'expo-task-manager';
import socket from './src/services/socket';

// Define background location task to prevent crash on Android
TaskManager.defineTask('GHOST_LOCATION', ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const loc = locations[0];
    if (loc) {
      // Background ping can be added here if needed
    }
  }
});

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [session, setSession] = useState({ role: null, name: '', nodes: [] });
  const [showGuide, setShowGuide] = useState(false);
  const isMounted = useRef(true);

  const handleLogout = useCallback(() => {
    socket.disconnect();
    setSession({ role: null, name: '', nodes: [] });
    setShowGuide(false);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Essential delay for New Architecture bridge stability (0.83+)
        // 0.1s delay instead of 2.5s to prevent perceived 'black screen'
        await new Promise(resolve => setTimeout(resolve, 100)); 
        await SystemUI.setBackgroundColorAsync('#000000').catch(() => {});
      } catch (e) {
        console.warn("Init Warning:", e);
      } finally {
        if (isMounted.current) {
          setAppIsReady(true);
        }
      }
    }
    prepare();

    // Safety timeout: only hide if prepare hangs, otherwise let onLayout handle it
    const timeout = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    return () => {
      isMounted.current = false;
      clearTimeout(timeout);
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // CRITICAL: Hide splash ONLY once the UI root is mounted and measured
      // This is the most reliable way to prevent black screens on Android 11+
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  const renderCurrentStack = () => {
    if (!session.role) {
      return (
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen 
              {...props} 
              onLogin={(role, name, nodes) => {
                setSession({ role, name, nodes });
                setShowGuide(false);
              }} 
            />
          )}
        </Stack.Screen>
      );
    }

    if (showGuide && (session.role === 'admin' || session.role === 'viewer')) {
      return (
        <Stack.Screen name="Guide">
          {(props) => <GuideScreen {...props} onBack={() => setShowGuide(false)} />}
        </Stack.Screen>
      );
    }

    return (
      <>
        {session.role === 'admin' && (
          <Stack.Screen name="Admin">
            {(props) => <AdminScreen {...props} name={session.name} onLogout={handleLogout} onShowGuide={() => setShowGuide(true)} />}
          </Stack.Screen>
        )}
        {session.role === 'viewer' && (
          <Stack.Screen name="Viewer">
            {(props) => <ViewerScreen {...props} name={session.name} allowedNodes={session.nodes} onLogout={handleLogout} onShowGuide={() => setShowGuide(true)} />}
          </Stack.Screen>
        )}
        {session.role === 'ghost' && (
          <Stack.Screen name="Ghost">
            {(props) => <GhostScreen {...props} name={session.name} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </>
    );
  };

  return (
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.flexContainer}>
          {appIsReady && (
            <View 
              style={styles.flexContainer} 
              onLayout={onLayoutRootView}
            >
              <NavigationContainer theme={DarkTheme}>
                <Stack.Navigator 
                  screenOptions={{ 
                    headerShown: false, 
                    animation: 'fade',
                    contentStyle: { backgroundColor: '#000000' }
                  }}
                >
                  {renderCurrentStack()}
                </Stack.Navigator>
              </NavigationContainer>
              <CyberAlertModal />
            </View>
          )}
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
