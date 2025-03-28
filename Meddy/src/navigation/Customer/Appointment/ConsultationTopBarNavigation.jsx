import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import CustomerVideoCallScreen from '../../../screens/CustomerScreens/Appointment/CustomerVideoCallScreen';
import ChatScreen from '../../../screens/CommonScreens/Chat/ChatScreen';

const Tab = createMaterialTopTabNavigator();
export default function ConsultationTopBarNavigation({ appointment, role }) {
  return (
    <>

        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: "#222B45" },
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "#ccc",
            tabBarIndicatorStyle: { backgroundColor: "#fff" },
          }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ appointment, role }}
      />

      <Tab.Screen
        name="Video Call"
        component={CustomerVideoCallScreen}
      />
      
    </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({})