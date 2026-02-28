import React, { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import GhostScreen from './screens/GhostScreen';
import AdminViewerHub from './screens/AdminViewerHub';

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <LoginScreen onLogin={(data) => setSession(data)} />;
  }

  return (
    session.role === 'ghost' 
      ? <GhostScreen name={session.name} /> 
      : <AdminViewerHub role={session.role} userName={session.name} />
  );
}
