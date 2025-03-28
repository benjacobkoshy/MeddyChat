import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MyOldAppointments from '../../../screens/CustomerScreens/Appointment/MyOldAppointments';
import MyOldAppointmentDetails from '../../../screens/CustomerScreens/Appointment/MyOldAppointmentDetails';
import GeneratePrescriptionPDF from '../../../screens/CustomerScreens/Appointment/PrescriptionPdfDownloader';
import BuyPrescribedMedicine from '../../../screens/CustomerScreens/Appointment/BuyPrescribedMedicine';

const Stack = createStackNavigator();

export default function MyOldAppointmentsNavigation() {
  return (
    <Stack.Navigator>
        <Stack.Screen name='MyOldAppointments'  component={MyOldAppointments}
            options={{
                headerShown: false,
            }}
        />
        <Stack.Screen name='Appointment Details'  component={MyOldAppointmentDetails}
            options={{
                headerTintColor: "#fff",
                headerStyle: { backgroundColor: "#222B45" },
                presentation: "modal",
            }}
        />
        <Stack.Screen
            name="Generate PDF"
            component={GeneratePrescriptionPDF}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            presentation: "modal",
            }}
        />
        <Stack.Screen
            name="Buy Medicine"
            component={BuyPrescribedMedicine}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            presentation: "modal",
            }}
        />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})