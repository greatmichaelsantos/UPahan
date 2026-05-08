import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuestUnits from '../screens/guest/GuestUnits';
import GuestUnitDetail from '../screens/guest/GuestUnitDetail';

const Stack = createNativeStackNavigator();

export default function GuestNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuestUnits" component={GuestUnits} />
      <Stack.Screen name="GuestUnitDetail" component={GuestUnitDetail} />
    </Stack.Navigator>
  );
}
