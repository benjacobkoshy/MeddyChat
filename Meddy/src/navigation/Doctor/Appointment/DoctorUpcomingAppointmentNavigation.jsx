import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import DoctorUpcomingAppointmentScreen from '../../../screens/DoctorScreens/Appointment/DoctorUpcomingAppointmentScreen'
import AppointmentDetailsScreen from '../../../screens/DoctorScreens/Appointment/AppointmentDetailsScreen'
import PatientMedicalHistory from '../../../screens/DoctorScreens/Appointment/PatientMedicalHistory'
import PrescriptionScreen from '../../../screens/DoctorScreens/Appointment/PrescriptionScreen'
import ChatScreen from '../../../screens/CommonScreens/Chat/ChatScreen'
import DoctorConsultationModal from '../../../screens/DoctorScreens/Appointment/DoctorConsultationModal'

const Stack = createStackNavigator();

export default function DoctorUpcomingAppointmentNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='UpcomingAppointments' component={DoctorUpcomingAppointmentScreen} 
        options={{
          headerShown: false,
          
        }}
      />
      <Stack.Screen name='Appointment Details' component={AppointmentDetailsScreen} 
        options={{
          headerShown: true,
          headerStyle:{
            backgroundColor: "#222B45"
          },    
          headerTintColor: "#fff",
          
        }}
      />

      <Stack.Screen name='Patient Medical History' component={PatientMedicalHistory} 
        options={{
          headerShown: true,
          headerStyle:{
            backgroundColor: "#222B45"
          },    
          headerTintColor: "#fff",
          
        }}
      />

      <Stack.Screen name='Prescribe Medicine' component={PrescriptionScreen} 
        options={{
          headerShown: false,
          headerStyle:{
            backgroundColor: "#222B45"
          },    
          headerTintColor: "#fff",
          presentation: 'modal'
        }}
      />

    {/* <Stack.Screen name='Chat' component={ChatScreen} 
        options={{
          headerShown: true,
          headerStyle:{
            backgroundColor: "#222B45"
          },    
          headerTintColor: "#fff",
          presentation: 'modal'
        }}
      /> */}
      <Stack.Screen name='Consultation' component={DoctorConsultationModal} 
        options={{
          headerShown: true,
          headerStyle:{
            backgroundColor: "#222B45"
          },    
          headerTintColor: "#fff",
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})