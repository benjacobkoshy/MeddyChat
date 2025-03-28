import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import UserAccountInfo from '../../../screens/CommonScreens/Account/UserAccountInfo'
import AccountScreen from '../../../screens/CustomerScreens/Account/AccountScreen'
import HelpScreen from '../../../screens/CommonScreens/Account/HelpScreen'
import NotificationScreen from '../../../screens/CommonScreens/Account/NotificationScreen'
import SettingsScreenNavigation from './SettingsScreenNavigation'
import ReportNavigation from './ReportNavigation'

const Stack = createStackNavigator();

export default function AccountScreenNavigation() {
  return (
    <>
        {/* <StatusBar backgroundColor={"1e1e1e"} /> */}
        <Stack.Navigator>
          <Stack.Screen name='Account Screen' component={AccountScreen} 
              options={{
                headerShown: false
              }}
          />
          <Stack.Screen name='Edit Profile' component={UserAccountInfo}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              // headerMode: 'float',
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

        <Stack.Screen name='Report Stack' component={ReportNavigation}
            options={{
              headerShown: false,
              headerTintColor: "#fff",
              // headerMode: 'float',
              headerStyle:{
                backgroundColor: "#222B45"
              }
            }}
          />


        </Stack.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})