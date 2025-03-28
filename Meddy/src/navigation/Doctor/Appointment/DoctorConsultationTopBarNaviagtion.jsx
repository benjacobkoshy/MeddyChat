import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import ChatScreen from '../../../screens/CommonScreens/Chat/ChatScreen';
import DoctorVideoCallScreen from '../../../screens/DoctorScreens/Appointment/DoctorVideoCallScreen';
import PrescriptionScreen from '../../../screens/DoctorScreens/Appointment/PrescriptionScreen';

const Tab = createMaterialTopTabNavigator();

export default function DoctorConsultationTopBarNaviagtion({ appointment, role }) {
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
            // component={DoctorVideoCallScreen}
            children={() => <DoctorVideoCallScreen appointment={appointment} role={role}/>}
        />
        <Tab.Screen
            name="Prescription"
            children={() => <PrescriptionScreen appointment={appointment} />}
        />
        
        </Tab.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})