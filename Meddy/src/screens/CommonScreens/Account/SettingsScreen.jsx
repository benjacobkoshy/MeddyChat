import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Layout } from '@ui-kitten/components';
import FastImage from 'react-native-fast-image';
import { MMKV } from 'react-native-mmkv';
import ReactNativeBiometrics from "react-native-biometrics";
import Snackbar from 'react-native-snackbar';
import OneSignal from 'react-native-onesignal';

const storage = new MMKV();
const rnBiometrics = new ReactNativeBiometrics();

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Load stored biometric setting
    const storedState = storage.getBoolean("biometricAuth") || false;
    setBiometricEnabled(storedState);
    const storedNotifications = storage.getBoolean("notificationsEnabled") || false;
    setNotificationsEnabled(storedNotifications);
  }, []);

  const toggleBiometricAuth = async (value) => {
    if (value) {
      try {
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        if (available) {
          const { success } = await rnBiometrics.simplePrompt({ promptMessage: "Authenticate to enable biometrics" });
          if (success) {
            setBiometricEnabled(true);
            storage.set("biometricAuth", true);
            Alert.alert("Success", "Biometric login enabled!");
          } else {
            Alert.alert("Failed", "Biometric authentication was canceled.");
          }
        } else {
          Alert.alert("Not Available", "Biometric authentication is not supported on this device.");
        }
      } catch (error) {
        Alert.alert("Error", "Biometric authentication failed.");
        console.error(error);
      }
    } else {
      setBiometricEnabled(false);
      storage.delete("biometricAuth");
      Alert.alert("Disabled", "Biometric login has been disabled.");
    }
  };

  const toggleNotifications = async (value) => {
    if (value) {
      OneSignal.promptForPushNotificationsWithUserResponse(response => {
        if (response) {
          setNotificationsEnabled(true);
          storage.set("notificationsEnabled", true);
          OneSignal.setSubscription(true);
          Alert.alert("Notifications Enabled", "You will receive updates and alerts.");
        } else {
          setNotificationsEnabled(false);
          storage.set("notificationsEnabled", false);
          Alert.alert("Permission Denied", "You have disabled push notifications.");
        }
      });
    } else {
      setNotificationsEnabled(false);
      storage.set("notificationsEnabled", false);
      OneSignal.setSubscription(false);
      Alert.alert("Notifications Disabled", "You will no longer receive push notifications.");
    }
  };

  // Clear all caches
  const clearAllCaches = async () => {
    try {
      storage.clearAll();  // Clears MMKV storage
      await FastImage.clearDiskCache(); // Clears image cache stored on disk
      await FastImage.clearMemoryCache(); // Clears RAM cache
      Snackbar.show({
        text: 'All cache cleared successfully!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#4CAF50',
      });
    } catch (error) {
      Snackbar.show({
        text: 'Cache clearing failed:', error,
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });

    }
  };

  return (
    <Layout style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Dark Mode */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Biometric Login */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Enable Biometric Login</Text>
        <Switch value={biometricEnabled} onValueChange={toggleBiometricAuth} />
      </View>

      {/* Push Notifications */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>

      {/* Clear Cache */}
      <TouchableOpacity style={styles.button} onPress={clearAllCaches}>
        <Text style={styles.buttonText}>Clear Cache</Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Privacy Policy")}>
        <Text style={styles.linkText}>Privacy Policy</Text>
      </TouchableOpacity>

      {/* Terms & Conditions */}
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Terms and Condition")}>
        <Text style={styles.linkText}>Terms & Conditions</Text>
      </TouchableOpacity>

      {/* Contact Support */}
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Contact Support")}>
        <Text style={styles.linkText}>Contact Support</Text>
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: '#3366FF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
  },
  linkText: {
    color: '#3366FF',
    fontSize: 16,
  },
});
