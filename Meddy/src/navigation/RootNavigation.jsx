import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Adjust the path if necessary
import AppStack from './AppStack';  // Your protected routes stack
import AuthStack from './AuthStack';  // Your login/register stack
import DoctorStack from './DoctorStack';
import { ActivityIndicator, View } from 'react-native';



const RootNavigation = () => {
  const { userToken, isLoading, role } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
        {userToken ? (
          role === 'doctor' ? <DoctorStack /> : <AppStack />
        ) : (
          <AuthStack />
        )}
    </NavigationContainer>
  );
};

export default RootNavigation;
