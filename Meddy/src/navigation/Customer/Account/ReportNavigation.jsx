import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ReportNavigationScreen from '../../../screens/CustomerScreens/Account/ReportNavigationScreen';
import MedicalReportScreen from '../../../screens/CustomerScreens/Account/MedicalReportScreen';
import DietSuggestionScreen from '../../../screens/CustomerScreens/Account/DietSuggestionScreen';

const Stack = createStackNavigator();

export default function ReportNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Medical Report' component={ReportNavigationScreen}
          options={{
            headerShown: false,
            headerTintColor: "#fff",
            // headerMode: 'float',
            headerStyle:{
              backgroundColor: "#222B45"
            }
          }}
        />

      <Stack.Screen name='View Medical Report' component={MedicalReportScreen}
          options={{
            headerShown: true,
            headerTintColor: "#fff",
            // headerMode: 'float',
            headerStyle:{
              backgroundColor: "#222B45"
            }
          }}
        />

        
      <Stack.Screen name='Diet Suggestion' component={DietSuggestionScreen}
          options={{
            headerShown: true,
            headerTintColor: "#fff",
            // headerMode: 'float',
            headerStyle:{
              backgroundColor: "#222B45"
            }
          }}
        />



    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})