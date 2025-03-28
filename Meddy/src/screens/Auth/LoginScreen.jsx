import React, { useState, useContext } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Layout, Input, Text } from '@ui-kitten/components';
import Snackbar from 'react-native-snackbar';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, API_BASE_URL } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false); // For loading state

  console.log(API_BASE_URL);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Snackbar.show({
        text: 'Please enter both email/username and password.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }
    
  
    setIsLoading(true); // Disable button and show loading spinner
  
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password: password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.redirect === 'user_details') {
          // Store tokens if the user needs to complete their profile
          await AsyncStorage.setItem('accessToken', data.access);
          await AsyncStorage.setItem('refreshToken', data.refresh);
          await AsyncStorage.setItem('role', data.role);
          Snackbar.show({
            text: 'You have successfully login!',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#4CAF50',
          });
          // Navigate to the 'Customer Details' page
          navigation.navigate('Customer Details'); 
        } else if (data.access && data.refresh) {
          Snackbar.show({
            text: 'You have successfully login!',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#4CAF50',
          });
          login(data.access, data.refresh, data.role);
          
        } else {
          Snackbar.show({
            text: 'Something went wrong. Please try again.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        }
      } else {
        Snackbar.show({
          text: 'Invalid credentials!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }
    } catch (error) {
      Snackbar.show({
        text: 'Something went wrong. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    } finally {
      setIsLoading(false); // Re-enable button
    }
  };
  

  return (
    <Layout style={{ flex: 1 }}>
      <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconContainer}>
          {/* <Image style={styles.image} source={require("../../assets/medical_assistance_logo.jpg")} /> */}
          <Icon name="stethoscope" size={54} color="#fff" />
          <Icon name="plus-outline" size={24} color="#007bff" />
          <Icon name="needle" size={54} color="#fff" />
          <Icon name="plus-outline" size={24} color="#007bff" />
          <Icon name="pill" size={54} color="#fff" />
        </View>
        <Text style={styles.title} category='h1'>Login</Text>

        {/* Email input */}
        <Input
          style={styles.input}
          placeholder="Email / Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password input */}
        <Input
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        {/* Login button */}
        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>

        <Pressable style={styles.forgotPassword} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.forgotPasswordText}>Don't have an account? Sign Up</Text>
        </Pressable>

        <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </Pressable>

      
      </ScrollView>
    </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 40,
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: "#fff"
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7, // Dim the button when disabled
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#fff",
  },
});

export default LoginScreen;
