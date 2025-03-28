import { StyleSheet, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import MyAppointments from '../../../screens/CustomerScreens/Appointment/MyAppointmentsScreen';
// import MyAppointmentDetailsScreen from '../../../screens/CustomerScreens/Appointment/MyAppointmentDetailsScreen';
import MyAppointmentDetailsScreen from '../../../screens/CustomerScreens/Appointment/MyAppointmentDetailsScreen';
import ConsultationModel from '../../../screens/CustomerScreens/Appointment/ConsultationModel';
import GeneratePrescriptionPDF from '../../../screens/CustomerScreens/Appointment/PrescriptionPdfDownloader';
import ChatScreen from '../../../screens/CommonScreens/Chat/ChatScreen';

const Stack = createStackNavigator();

export default function MyAppointmentsNavigation() {

    const navigation = useNavigation();
    const route = useRoute();  
    useEffect(() => {
        // Reset `hideTabBar` when leaving "My Appointment Details"
        if (route.name === "My Appointments") {
          navigation.setParams({ hideTabBar: false });
        }
      }, [route.name]);
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="My Appointments Screen"
          component={MyAppointments}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
            name="My Appointment Details"
            component={MyAppointmentDetailsScreen}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            presentation: "modal",
            }}
        />

        {/* <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            presentation: "modal",
            }}
        /> */}
        
        <Stack.Screen
            name="Consultation"
            component={ConsultationModel}
            options={{
            headerShown: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#222B45" },
            // presentation: "modal",
            }}
        />

      </Stack.Navigator>
    );
  }

const styles = StyleSheet.create({})