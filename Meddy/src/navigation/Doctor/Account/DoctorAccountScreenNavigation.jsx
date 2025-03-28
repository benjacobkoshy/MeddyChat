import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DoctorAccountScreen from '../../../screens/DoctorScreens/Account/DoctorAccountScreen'
import EditProfileScreenNavigation from './EditProfileScreenNavigation'
import SettingsScreenNavigation from '../../Customer/Account/SettingsScreenNavigation'
import HelpScreen from '../../../screens/CommonScreens/Account/HelpScreen'
import NotificationScreen from '../../../screens/CommonScreens/Account/NotificationScreen'

import { createStackNavigator } from '@react-navigation/stack'


export default function DoctorAccountScreenNavigation() {

    const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
        <Stack.Screen name='Account Screen' component={DoctorAccountScreen} 
            options={{
                headerShown: false
              }}
        />
        <Stack.Screen name='Doctor Profile' component={EditProfileScreenNavigation} 
            options={{
              headerShown: false,
              headerTintColor: "#fff",
              
              headerStyle:{
                backgroundColor: "#222B45"
              }
              }}
        />
        <Stack.Screen name='Settings Stack' component={SettingsScreenNavigation}
                    options={{
                      headerShown: false,
                      headerTintColor: "#fff",
                      // headerMode: 'float',
                      headerStyle:{
                        backgroundColor: "#222B45"
                      }
                    }}
                  />
        <Stack.Screen name='Help' component={HelpScreen}
          options={{
            headerShown: true,
            headerTintColor: "#fff",
            // headerMode: 'float',
            headerStyle:{
              backgroundColor: "#222B45"
            }
          }}
        />
        <Stack.Screen name='Notification' component={NotificationScreen}
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