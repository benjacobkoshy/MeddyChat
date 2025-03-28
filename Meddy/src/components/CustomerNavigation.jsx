import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import AppointmentScreenNavigation from '../navigation/Customer/Appointment/AppointmentScreenNavigation';
import AppointmentTopBarNavigation from '../navigation/Customer/Appointment/AppointmentTopBarNavigation';
// Other imports
// import HomeScreen from '../screens/Home/HomeScreen';
import ChatBot from '../screens/CustomerScreens/Chatbot/ChatBotScreen';
// import Account from '../screens/Home/Account/AccountScreen';
import AccountScreenNavigation from '../navigation/Customer/Account/AccountScreenNavigation';
// import StoreScreen from '../screens/Home/Store/StoreScreen';
import StoreNavigation from '../navigation/Customer/Store/StoreNavigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import NewsNavigation from '../navigation/Customer/News/NewsNavigation';


const Tab = createMaterialBottomTabNavigator();

export default function CustomerNavigation() {
  return (

    <Tab.Navigator
        initialRouteName="Account"
        activeColor="#007bff"  // Color for the active tab
        inactiveColor="#ccc"   // Color for the inactive tabs
        barStyle={{ backgroundColor: '#222B49' }}  // Dark theme for the tab bar  
  > 

    <Tab.Screen
        name='Chat'
        component={ChatBot}
        options={{
            tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Meddy</Text>,
            
            tabBarIcon: ({ focused }) => (
            <Icon name={focused ? 'comments' : 'comments-o'} size={22} color={focused ? '#007bff' : '#ccc'} />
            ),
        }}
    />

    <Tab.Screen
      name='AppointmentsStack'
      component={AppointmentTopBarNavigation}
      options={{
        tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Appointment</Text>,   
        tabBarIcon: ({ focused }) => (
          <Icon name={focused ? 'calendar-check-o' : 'calendar'} size={22} color={focused ? '#007bff' : '#ccc'} />
        ),
        
      }}
    />
    {/* <Tab.Screen
        name='AppointmentsStack'
        component={AppointmentTopBarNavigation}
        options={({ route }) => {
          // Check if the current screen is 'Payment Screen'
          // const isPaymentScreen = route.state?.routes[route.state.index]?.name === 'Payment Screen';

          return {
            // tabBarStyle: isPaymentScreen ? { display: 'none' } : undefined,
            tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Appointment</Text>,
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? 'calendar-check-o' : 'calendar'} size={22} color={focused ? '#007bff' : '#ccc'} />
            ),
          };
        }}
      /> */}

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
    name='Store Navigation'
    component={StoreNavigation}
    options={{
      tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Store</Text>,
      tabBarIcon: ({ focused }) => (
        <Icon name={focused ? 'shopping-cart' : 'cart-arrow-down'} size={22} color={focused ? '#007bff' : '#ccc'} />
      )
    }}
  />

    
    
    
    <Tab.Screen
      name='Account'
      component={AccountScreenNavigation}
      options={{
        tabBarLabel: <Text style={{ fontSize: 10, color: '#ccc' }}>Account</Text>,
        tabBarIcon: ({ focused }) => (
          <Icon name={focused ? 'user' : 'user-o'} size={22} color={focused ? '#007bff' : '#ccc'} />
        ),
      }}
    />
  </Tab.Navigator>
    
  )
}

const styles = StyleSheet.create({})