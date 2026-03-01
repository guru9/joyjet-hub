import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Screens (Ensure these paths exist in your /src/screens folder)
import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState({ 
    role: null, 
    name: '', 
    nodes: [] 
  });

  // Handle successful login
  const handleAuth = (role, name, nodes = []) => {
    setSession({ role, name, nodes });
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000' }}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false, 
            animation: 'fade_from_bottom' 
          }}
        >
          
          {!session.role ? (
            /* --- AUTHENTICATION GATE --- */
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleAuth} />}
            </Stack.Screen>
          ) : (
            /* --- AUTHORIZED ROUTES --- */
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
