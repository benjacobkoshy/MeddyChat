import { StyleSheet, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
// import AppointmentScreen from '../../../screens/CustomerScreens/Appointment/AppointmentScreen';
import AppointmentScreenNavigation from './AppointmentScreenNavigation';
// import MyAppointments from '../../../screens/CustomerScreens/Appointment/MyAppointments';
import Icon from "react-native-vector-icons/FontAwesome";
import { Layout, Text } from '@ui-kitten/components';
import MyAppointmentsNavigation from './MyAppointmentsNavigation';
import MyOldAppointmentsNavigation from './MyOldAppointmentsNavigation';

const Tab = createMaterialTopTabNavigator();

export default function AppointmentTopBarNavigation() {
  return (
    <Layout style={{ flex: 1 }}>
      {/* <View style={styles.headerContainer}>
        <Icon name="user-md" size={24} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerText} category="h4">Appointment</Text>
      </View> */}
      <View style={styles.header}>
        <Icon name="user-md" size={24} color="#8F9BB3" />
        <Text category="h6" style={styles.headerText}>
          Appointment
        </Text>
      </View>

      {/* <View style={{ flex: 1, backgroundColor: "#222B45" }}>  */}
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: "#222B45" },
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "#ccc",
            tabBarIndicatorStyle: { backgroundColor: "#fff" },
          }}
        >
          <Tab.Screen name='Book Appointment' component={AppointmentScreenNavigation} />
          <Tab.Screen
            name="My Appointments"
            component={MyAppointmentsNavigation}
            options={({ route }) => {
              // const isHidden = route.params?.hideTabBar ?? false; // Default to false if undefined

              // console.log("isHidden:", isHidden, "Current Params:", route.params);

              // return {
              //   tabBarStyle: isHidden ? { display: "none" } : { backgroundColor: "#222B45" },
              // };
            }}
          />

        <Tab.Screen
            name="My Old Appointments"
            component={MyOldAppointmentsNavigation}
            options={({ route }) => {
              const isHidden = route.params?.hideTabBar ?? false; // Default to false if undefined

              // console.log("isHidden:", isHidden, "Current Params:", route.params);

              return {
                tabBarStyle: isHidden ? { display: "none" } : { backgroundColor: "#222B45" },
              };
            }}
          />


        </Tab.Navigator>
      {/* </View> */}

    </Layout>
  )
}

const styles = StyleSheet.create({
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#222B45',
    },
    headerText: {
      marginLeft: 12,
      color: '#E4E9F2',
    },
  headerIcon: {
    marginLeft: 10,
  },
});
