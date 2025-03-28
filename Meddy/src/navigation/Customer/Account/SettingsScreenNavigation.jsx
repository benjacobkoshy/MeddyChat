import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../../../screens/CommonScreens/Account/SettingsScreen';
import TermsAndConditionsScreen from '../../../screens/CommonScreens/Account/TermsAndCondition';
import PrivacyPolicyScreen from '../../../screens/CommonScreens/Account/PrivacyPolicyScreen';
import ContactSupportScreen from '../../../screens/CommonScreens/Account/ContactSupportScreen';

const Stack = createStackNavigator();

export default function SettingsScreenNavigation() {
  return (
    <Stack.Navigator>
        <Stack.Screen name='Settings' component={SettingsScreen}
                    options={{
                      headerShown: true,
                      headerTintColor: "#fff",
                      headerStyle:{
                        backgroundColor: "#222B45"
                      }
                    }}
                  />
        <Stack.Screen name='Terms and Condition' component={TermsAndConditionsScreen}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle:{
                backgroundColor: "#222B45"
              }
            }}
          />
          <Stack.Screen name='Privacy Policy' component={PrivacyPolicyScreen}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle:{
                backgroundColor: "#222B45"
              }
            }}
          />
          <Stack.Screen name='Contact Support' component={ContactSupportScreen}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle:{
                backgroundColor: "#222B45"
              }
            }}
          />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})