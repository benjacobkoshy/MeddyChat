import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { MMKV } from "react-native-mmkv";
import { Spinner, Layout } from "@ui-kitten/components";

const storage = new MMKV();
const rnBiometrics = new ReactNativeBiometrics();

export default function BiometricAuthWrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    const isBiometricEnabled = storage.getBoolean("biometricAuth");

    if (isBiometricEnabled) {
      try {
        const { success } = await rnBiometrics.simplePrompt({ promptMessage: "Authenticate to continue" });
        if (success) {
          setAuthenticated(true);
        } else {
          Alert.alert("Authentication Failed", "Biometric authentication is required.");
        }
      } catch (error) {
        Alert.alert("Error", "Biometric authentication failed.");
        console.error(error);
      }
    } else {
      setAuthenticated(true); // If biometric is not enabled, allow access
    }
    setIsLoading(false);
  };

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return authenticated ? children : null;
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
  
})