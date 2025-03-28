import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AppointmentScreen from '../../../screens/CustomerScreens/Appointment/AppointmentScreen';
import BookAppointmentScreen from '../../../screens/CustomerScreens/Appointment/BookAppointmentScreen';
import DoctorAvailabilityScreen from '../../../screens/CustomerScreens/Appointment/DoctorAvailabilityScreen';
import AppointmentConfiramtaionScreen from '../../../screens/CustomerScreens/Appointment/AppointmentConfiramtaionScreen';
import PaymentScreen from '../../../screens/CustomerScreens/Appointment/stripe payment/PaymentScreen';
import PaymentStatusScreen from '../../../screens/CustomerScreens/Appointment/stripe payment/PaymentStatusScreen';
import MyAppointmentDetailsScreen from '../../../screens/CustomerScreens/Appointment/MyAppointmentDetailsScreen';

const Stack = createStackNavigator();

export default function AppointmentScreenNavigation() {

    

    
  return (
    <Stack.Navigator>
        <Stack.Screen name='Appointments' component={AppointmentScreen}  
        
            options={{
                headerShown: false,

            }}
        />
        <Stack.Screen name='New Appointment' component={BookAppointmentScreen}  
            options={{
                headerShown: true,
                headerTintColor: "#fff",
                headerStyle:{
                    backgroundColor: "#222B45"
                }    
            }}
        />
        <Stack.Screen name='Doctor Availability' component={DoctorAvailabilityScreen}  
            options={{
                headerShown: true,
                headerTintColor: "#fff",
                // headerMode: 'float',
                headerStyle:{
                    backgroundColor: "#222B45"
                }    
            }}
        />
        <Stack.Screen name='Appointment Confirmation' component={AppointmentConfiramtaionScreen}  
                options={{
                    headerShown: true,
                    headerTintColor: "#fff",
                    // headerMode: 'float',
                    headerStyle:{
                        backgroundColor: "#222B45"
                    }    
                }}
        />
        <Stack.Screen 
            name='Payment Screen' 
            component={PaymentScreen}  
            options={{
                headerShown: false, // Hide header for a full-screen effect
                // presentation: 'modal', // Make it a full-screen modal
            }} 
            />

        <Stack.Screen name='PaymentStatusScreen' component={PaymentStatusScreen}  
            options={{
                headerShown: false,
                // presentation: 'modal',
            }}
        />
        

    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})