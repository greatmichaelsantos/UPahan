import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator   from './AuthNavigator';
import AdminNavigator  from './AdminNavigator';
import TenantNavigator from './TenantNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#277571' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'admin' ? (
        <Stack.Screen name="AdminRoot" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="TenantRoot" component={TenantNavigator} />
      )}
    </Stack.Navigator>
  );
}
