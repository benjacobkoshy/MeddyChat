import { StyleSheet, View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { Layout, Text, Input } from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Snackbar from 'react-native-snackbar';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const {API_BASE_URL} = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false); // For custom popup
  const [modalMessage, setModalMessage] = useState(''); // For modal message
  const [navigateOnClose, setNavigateOnClose] = useState(false); // To track navigation after modal close


  const handleSignUp = async () => {
    // Validate inputs
    if (!name || !userName || !email || !password || !confirmPassword) {
      Snackbar.show({
        text: 'All fields are required!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    if (password !== confirmPassword) {
      Snackbar.show({
        text: 'Passwords do not match!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    if(password.length<8){
      Snackbar.show({
        text: 'Minimum length of password is 8!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    setIsLoading(true); // Disable button while loading

    try {
      // Send data to the backend
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          username: userName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Snackbar.show({
          text: 'You have successfully signed up!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
        navigation.navigate('Login')
      } else {
        Snackbar.show({
          text: JSON.stringify(data.message),
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
      setIsLoading(false); // Re-enable button after registration
    }
  };



  return (
    <Layout style={{ flex: 1 }}>
      <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          {/* <Image source={require('../../assets/medical_assistance_logo.jpg')} style={styles.image} /> */}
            <Icon name="stethoscope" size={54} color="#fff" />
              <Icon name="plus-outline" size={24} color="#007bff" />
              <Icon name="needle" size={54} color="#fff" />
              <Icon name="plus-outline" size={24} color="#007bff" />
            <Icon name="pill" size={54} color="#fff" />
        </View>

        <Text style={styles.title} category='h1'>Sign Up</Text>

        {/* Name input */}
        <Input
          style={styles.input}
          placeholder='Name'
          value={name}
          onChangeText={setName}
          placeholderTextColor="#ccc"
        />

        {/* Username input */}
        <Input
          style={styles.input}
          placeholder='Username'
          value={userName}
          onChangeText={setUserName}
          placeholderTextColor="#ccc"
        />

        {/* Email input */}
        <Input
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          placeholderTextColor="#ccc"
        />

        {/* Password input */}
        <Input
          style={styles.input}
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholderTextColor="#ccc"
        />

        {/* Confirm Password input */}
        <Input
          style={styles.input}
          placeholder='Confirm Password'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          placeholderTextColor="#ccc"
        />

        {/* Signup button */}
        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSignUp} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </Pressable>

        {/* Already have an account link */}
        <Pressable style={styles.forgotPassword} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.forgotPasswordText}>Already have an account? Login</Text>
        </Pressable>
        <Pressable style={styles.forgotPassword} onPress={() => navigation.navigate('Terms and Condition')}>
          <Text style={styles.forgotPasswordText}>Terms and Condition</Text>
        </Pressable>


      </ScrollView>
    </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: "#fff",
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
