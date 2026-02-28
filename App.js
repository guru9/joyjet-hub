import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import GhostScreen from './src/screens/GhostScreen';
import AdminScreen from './src/screens/AdminScreen';
import ViewerScreen from './src/screens/ViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState({ role: null, name: '' });

  // Function to handle login and switch screens
  const handleAuth = (role, name) => {
    setSession({ role, name });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        
        {/* GATEKEEPER: If no role is selected, show Login */}
        {!session.role ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={handleAuth} />}
          </Stack.Screen>
        ) : (
          <>
            {/* ROLE 1: SUPER ADMIN (Full Control & Logs) */}
            {session.role === 'admin' && (
              <Stack.Screen 
                name="Admin" 
                component={AdminScreen} 
                initialParams={{ name: session.name }} 
              />
            )}

            {/* ROLE 2: VIEWER (3 Assigned Ghost Nodes Only) */}
            {session.role === 'viewer' && (
              <Stack.Screen 
                name="Viewer" 
                component={ViewerScreen} 
                initialParams={{ 
                  name: session.name, 
                  allowedNodes: ['Node_Alpha', 'Node_Beta', 'Node_Gamma'] 
                }} 
              />
            )}

            {/* ROLE 3: GHOST (The Battery Optimizer Mask) */}
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
  );
}
