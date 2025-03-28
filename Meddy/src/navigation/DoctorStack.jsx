import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import DoctorNavigation from '../components/DoctorNavigation';
import HomeNavigation from '../components/CustomerNavigation';

export default function DoctorStack() {

  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      {/* <Stack.Screen name='Doctor Screen' component={HomeNavigation} options={{ headerShown: false }} /> */}
      <Stack.Screen name='Doctor Screen' component={DoctorNavigation} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})