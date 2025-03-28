import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerNavigation from '../components/CustomerNavigation';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home Screen" component={CustomerNavigation} options={{ headerShown: false }} />
      {/* Add other protected screens here */}
    </Stack.Navigator>
  );
};

export default AppStack;
