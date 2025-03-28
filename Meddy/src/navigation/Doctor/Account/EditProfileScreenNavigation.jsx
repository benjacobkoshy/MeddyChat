import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import DoctorProffesionalInfo from '../../../screens/DoctorScreens/Account/DoctorProffesionalInfo';
import PersonalProffesionalNavigationScreen from '../../../screens/DoctorScreens/Account/PersonalProffesionalNavigationScreen';
import DoctorAvailabilities from '../../../screens/DoctorScreens/Account/DoctorAvailabilities';
import UserAccountInfo from '../../../screens/CommonScreens/Account/UserAccountInfo';

export default function EditProfileScreenNavigation() {
 const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
        <Stack.Screen name='Doctor Details' component={PersonalProffesionalNavigationScreen} 
            options={{
                headerShown: false
              }}
        />
        <Stack.Screen name='Personal Details' component={UserAccountInfo} 
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              // headerMode: 'float',
              headerStyle:{
                backgroundColor: "#222B45"
              }
              }}
        />
        <Stack.Screen name='Proffessional Details' component={DoctorProffesionalInfo} 
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              // headerMode: 'float',
              headerStyle:{
                backgroundColor: "#222B45"
              }
              }}
        />

        <Stack.Screen name='Availability' component={DoctorAvailabilities} 
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