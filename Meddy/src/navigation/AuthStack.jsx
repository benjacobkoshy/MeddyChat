import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import TermsAndConditionsScreen from '../screens/CommonScreens/Account/TermsAndCondition';
import CustomerDetailsScreen from '../screens/Auth/CustomerDetailsScreen';


const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen name='Login' component={LoginScreen} 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name='Register' component={RegisterScreen} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Terms and Condition" component={TermsAndConditionsScreen} 
            options={{
              headerStyle: {
                backgroundColor: '#222B45',
              },
              headerTintColor: "#fff",
            }}
        />
        <Stack.Screen name="Customer Details" component={CustomerDetailsScreen}
        options={{
          headerShown: false,
        }} 

        />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})