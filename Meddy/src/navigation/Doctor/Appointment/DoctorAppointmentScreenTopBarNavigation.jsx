import { StyleSheet, View } from 'react-native';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Layout, Text } from '@ui-kitten/components';
import Icon from "react-native-vector-icons/FontAwesome";

import DoctorUpcomingAppointmentNavigation from './DoctorUpcomingAppointmentNavigation';
import DoctorPreviousAppointmentNavigation from './DoctorPreviousAppointmentNavigation';

const Tab = createMaterialTopTabNavigator();

export default function DoctorAppointmentScreenTopBarNavigation() {
  return (
    <Layout style={{flex:1}}>
      <View style={styles.headerContainer}>
        <Icon name="user-md" size={24} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerText} category="h4">Appointment</Text>
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#222B45" },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#ccc",
          tabBarIndicatorStyle: { backgroundColor: "#fff" },
        }}
      >
      <Tab.Screen name="Upcoming Appointments" component={DoctorUpcomingAppointmentNavigation} 
        options={{
          
        }}
      />
      <Tab.Screen name="Previous Appointments" component={DoctorPreviousAppointmentNavigation} />
    </Tab.Navigator>
    </Layout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#222B45",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 0.3,
  },
  headerText: {
    marginLeft: 10,
    color: "#fff",
  },
  headerIcon: {
    marginLeft: 10,
  },
});
