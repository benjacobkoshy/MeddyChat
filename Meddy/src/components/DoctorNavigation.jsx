import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
// import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'; // Correct import
import Icon from 'react-native-vector-icons/FontAwesome'; // Specific import
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';

import DoctorAppointmentScreenTopBarNavigation from '../navigation/Doctor/Appointment/DoctorAppointmentScreenTopBarNavigation';
import DoctorAccountScreenNavigation from '../navigation/Doctor/Account/DoctorAccountScreenNavigation';
import NewsNavigation from '../navigation/Customer/News/NewsNavigation';

const Tab = createMaterialBottomTabNavigator();

export default function DoctorNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Appointment"
      activeColor="#007bff" // Color for the active tab
      inactiveColor="#ccc" // Color for the inactive tabs
      barStyle={{ backgroundColor: '#222B49' }} // Dark theme for the tab bar
    >
        <Tab.Screen
          name="Appointment"
          component={DoctorAppointmentScreenTopBarNavigation}
          options={{
            tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Appointment</Text>,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'calendar-check-o' : 'calendar'}
                size={22}
                color={focused ? '#007bff' : '#ccc'}
              />
            ),
          }}
        />

              <Tab.Screen
                name='News'
                component={NewsNavigation}
                options={{
                  tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>News</Text>,
                  tabBarIcon: ({ focused }) => (
                    <Icon name={focused ? 'newspaper-o' : 'newspaper-o'} size={22} color={focused ? '#007bff' : '#ccc'} />
                  ),
                
                }}
              />

        <Tab.Screen
          name="Account"
          component={DoctorAccountScreenNavigation}
          options={{
            tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Account</Text>,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'user' : 'user-o'}
                size={22}
                color={focused ? '#007bff' : '#ccc'}
              />
            ),
          }}
        />
    </Tab.Navigator>

  );
}

const styles = StyleSheet.create({});
