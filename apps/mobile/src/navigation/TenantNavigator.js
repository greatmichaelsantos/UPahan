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
import TenantReports            from '../screens/tenant/TenantReports';

const Tab        = createBottomTabNavigator();
const InnerStack = createNativeStackNavigator();
const OuterStack = createNativeStackNavigator();
const BLUE       = '#4A90D9';

function HomeStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="TenantDashboard" component={TenantDashboard} />
    </InnerStack.Navigator>
  );
}

function RequestStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="TenantMaintenanceHistory" component={TenantMaintenanceHistory} />
    </InnerStack.Navigator>
  );
}

function PaymentsStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="TenantPaymentHistory" component={TenantPaymentHistory} />
    </InnerStack.Navigator>
  );
}

function ReportsStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="TenantReports" component={TenantReports} />
    </InnerStack.Navigator>
  );
}

function ProfileStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="TenantProfile" component={TenantProfile} />
    </InnerStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:     ['home',      'home-outline'],
  Request:  ['construct', 'construct-outline'],
  Payments: ['card',      'card-outline'],
  Reports:  ['bar-chart', 'bar-chart-outline'],
  Profile:  ['person',    'person-outline'],
};

function TenantTabs() {
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
      <Tab.Screen name="Reports"  component={ReportsStack}  options={{ tabBarLabel: 'REPORTS' }} />
      <Tab.Screen name="Profile"  component={ProfileStack}  options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}

export default function TenantNavigator() {
  return (
    <OuterStack.Navigator screenOptions={{ headerShown: false }}>
      <OuterStack.Screen name="TenantTabs"               component={TenantTabs} />
      <OuterStack.Screen name="TenantDocuments"          component={TenantDocuments} />
      <OuterStack.Screen name="TenantPaymentDeclare"     component={TenantPaymentDeclare} />
      <OuterStack.Screen name="TenantMaintenanceRequest" component={TenantMaintenanceRequest} />
    </OuterStack.Navigator>
  );
}
