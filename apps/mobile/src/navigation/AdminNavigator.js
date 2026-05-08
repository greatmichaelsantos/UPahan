import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboard        from '../screens/admin/AdminDashboard';
import AdminUnitList         from '../screens/admin/AdminUnitList';
import AdminUnitDetail       from '../screens/admin/AdminUnitDetail';
import AdminRegisterUnit     from '../screens/admin/AdminRegisterUnit';
import AdminEditUnit         from '../screens/admin/AdminEditUnit';
import AdminPaymentRequests  from '../screens/admin/AdminPaymentRequests';
import AdminMaintenanceList  from '../screens/admin/AdminMaintenanceList';
import AdminMaintenanceDetail from '../screens/admin/AdminMaintenanceDetail';
import AdminProfile          from '../screens/admin/AdminProfile';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const TEAL  = '#277571';

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}

function UnitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminUnitList"     component={AdminUnitList} />
      <Stack.Screen name="AdminUnitDetail"   component={AdminUnitDetail} />
      <Stack.Screen name="AdminRegisterUnit" component={AdminRegisterUnit} />
      <Stack.Screen name="AdminEditUnit"     component={AdminEditUnit} />
    </Stack.Navigator>
  );
}

function PaymentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPaymentRequests" component={AdminPaymentRequests} />
    </Stack.Navigator>
  );
}

function MaintenanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMaintenanceList"   component={AdminMaintenanceList} />
      <Stack.Screen name="AdminMaintenanceDetail" component={AdminMaintenanceDetail} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminProfile" component={AdminProfile} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Admin:    ['home',           'home-outline'],
  Units:    ['business',       'business-outline'],
  Payments: ['card',           'card-outline'],
  Fixes:    ['construct',      'construct-outline'],
  Profile:  ['person-circle',  'person-circle-outline'],
};

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   TEAL,
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
      <Tab.Screen name="Admin"    component={DashboardStack}   options={{ tabBarLabel: 'DASHBOARD' }} />
      <Tab.Screen name="Units"    component={UnitsStack}       options={{ tabBarLabel: 'UNITS' }} />
      <Tab.Screen name="Payments" component={PaymentsStack}    options={{ tabBarLabel: 'PAYMENTS' }} />
      <Tab.Screen name="Fixes"    component={MaintenanceStack} options={{ tabBarLabel: 'FIXES' }} />
      <Tab.Screen name="Profile"  component={ProfileStack}     options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}
