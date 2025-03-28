import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import NewsScreen from '../../../screens/CommonScreens/News/NewsScreen';
import NewsDetailsScreen from '../../../screens/CommonScreens/News/NewsDetailsScreen';

const Stack = createStackNavigator();

export default function NewsNavigation() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
            name='News Screen'
            component={NewsScreen}
            options={{
                headerShown:false,

            }}
        />
        <Stack.Screen
            name="News Details"
            component={NewsDetailsScreen}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            }}
        />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})