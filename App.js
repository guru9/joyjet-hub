import 'react-native-gesture-handler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Prevent splash from hiding until we are ready
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
        // Essential bridge delay for New Architecture / SDK 55
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
      // 2. Hide splash once the root View is mounted
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  const handleAuth = (role, name, nodes = []) => {
    setSession({ role, name, nodes });
  };

  return (
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider style={styles.flexContainer}>
        {/* Safety View to ensure onLayout triggers and hides Splash */}
        <View style={styles.flexContainer} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!session.role ? (
                <Stack.Screen name="Login">
                  {(props) => <LoginScreen {...props} onLogin={handleAuth} />}
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
