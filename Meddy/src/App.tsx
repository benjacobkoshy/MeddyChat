import { StyleSheet, Text, View, StatusBar } from 'react-native';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RootNavigation from './navigation/RootNavigation';
import AppointmentScreen from './screens/CustomerScreens/Appointment/AppointmentScreen';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import BiometricAuthWrapper from './context/BiometricAuthWrapper';
import { OneSignal } from 'react-native-onesignal';



export default function App() {
  return (
    <>
      <StatusBar backgroundColor={"#222B45"} />
      <IconRegistry icons={EvaIconsPack} />
      
      <ApplicationProvider {...eva} theme={eva.dark}>
      <BiometricAuthWrapper>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
        </BiometricAuthWrapper>
      </ApplicationProvider>
      
    </>
    
    // <AppointmentScreen />
  );
}

const styles = StyleSheet.create({})