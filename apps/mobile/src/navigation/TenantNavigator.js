import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import TenantDashboard          from '../screens/tenant/TenantDashboard';
import TenantMaintenanceHistory from '../screens/tenant/TenantMaintenanceHistory';
import TenantMaintenanceRequest from '../screens/tenant/TenantMaintenanceRequest';
import TenantPaymentHistory     from '../screens/tenant/TenantPaymentHistory';
import TenantPaymentDeclare     from '../screens/tenant/TenantPaymentDeclare';
import TenantProfile            from '../screens/tenant/TenantProfile';
import TenantDocuments          from '../screens/tenant/TenantDocuments';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const BLUE  = '#4A90D9';

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TenantDashboard" component={TenantDashboard} />
    </Stack.Navigator>
  );
}

function RequestStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TenantMaintenanceHistory" component={TenantMaintenanceHistory} />
      <Stack.Screen name="TenantMaintenanceRequest" component={TenantMaintenanceRequest} />
    </Stack.Navigator>
  );
}

function PaymentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TenantPaymentHistory" component={TenantPaymentHistory} />
      <Stack.Screen name="TenantPaymentDeclare" component={TenantPaymentDeclare} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TenantProfile"   component={TenantProfile} />
      <Stack.Screen name="TenantDocuments" component={TenantDocuments} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Home:     ['home',          'home-outline'],
  Request:  ['construct',     'construct-outline'],
  Payments: ['card',          'card-outline'],
  Profile:  ['person',        'person-outline'],
};

export default function TenantNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   BLUE,
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0EEEB',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
        tabBarIcon: ({ color, focused }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return <Ionicons name={focused ? icons[0] : icons[1]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeStack}     options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="Request"  component={RequestStack}  options={{ tabBarLabel: 'MAINTENANCE' }} />
      <Tab.Screen name="Payments" component={PaymentsStack} options={{ tabBarLabel: 'PAYMENTS' }} />
      <Tab.Screen name="Profile"  component={ProfileStack}  options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}
