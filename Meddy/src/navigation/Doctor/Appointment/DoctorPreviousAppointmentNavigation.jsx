import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'

import DoctorPreviousAppointmentsScreen from '../../../screens/DoctorScreens/Appointment/DoctorPreviousAppointmentsScreen'
import PreviousAppointmentDetailsScreen from '../../../screens/DoctorScreens/Appointment/PreviousAppointmentDetailsScreen'

const Stack = createStackNavigator();


export default function DoctorPreviousAppointmentNavigation() {
  return (
    <Stack.Navigator>
          <Stack.Screen name='PreviousAppointments' component={DoctorPreviousAppointmentsScreen} 
            options={{
              headerShown: false,
              
            }}
          />
          <Stack.Screen name='Previous Appointment Details' component={PreviousAppointmentDetailsScreen} 
                  options={{
                    headerShown: true,
                    headerStyle:{
                      backgroundColor: "#222B45"
                    },    
                    headerTintColor: "#fff",
                    
                  }}
                />
        </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})