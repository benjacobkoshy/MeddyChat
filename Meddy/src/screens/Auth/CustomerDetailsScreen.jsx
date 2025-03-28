import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { Layout, Text, Input, RadioGroup, Radio } from '@ui-kitten/components';
import Snackbar from 'react-native-snackbar';

export default function CustomerDetailsScreen() {
  const { login, fetchWithAuth } = useContext(AuthContext);
  // const navigation = useNavigation(); // Initialize useNavigation

  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Form fields
  const [gender, setGender] = useState('female');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [place, setPlace] = useState('');
  const [pin, setPin] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  useEffect(() => {
    Snackbar.show({
      text: 'Profile incomplete. Please complete your profile.',
      duration: Snackbar.LENGTH_LONG,
      textColor: '#FFFFFF',
      backgroundColor: '#F44336',
    });
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    console.log(gender);
    // Validate mandatory fields
    if (!address || !phone || !place || !pin || !dob || !bloodGroup) {
      Snackbar.show({
        text: 'Please fill all mandatory fields marked with *.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Retrieve token from AsyncStorage
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      // console.log(accessToken);

      const response = await fetchWithAuth('auth/userdetails/', {
        method: 'POST',
        body: JSON.stringify({
          address,
          gender,
          phone_number: phone,
          alternate_phone_number: altPhone,
          place,
          pin,
          dob,
          blood_group: bloodGroup,
          medical_history: medicalHistory,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(response);
        user_role = data.role;
        Snackbar.show({
          text: 'Your details saved successfully! You can update them any time in the account section!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
        login(accessToken, refreshToken, user_role);
      } else {
        Snackbar.show({
          text: data.message || 'Submission failed. Please try again.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }
    } catch (error) {
      Snackbar.show({
        text: 'An error occurred. Please check your network and try again.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} category='h1'>Customer Details</Text>

        {/* Form Fields */}
        {
          [
            { label: 'Address', value: address, onChange: setAddress, required: true },
            { label: 'Gender', value: gender, onChange: setGender, required: true, isGender: true },
            { label: 'Phone Number', value: phone, onChange: setPhone, required: true },
            { label: 'Alternate Phone Number (Optional)', value: altPhone, onChange: setAltPhone },
            { label: 'Place (e.g., Kerala)', value: place, onChange: setPlace, required: true },
            { label: 'Pin Code', value: pin, onChange: setPin, required: true },
            { label: 'D.O.B', value: dob, onChange: setDob, required: true, isDate: true },
            { label: 'Blood Group (e.g., B+ve)', value: bloodGroup, onChange: setBloodGroup, required: true },
            { label: 'Medical History (e.g., Hepatitis B)', value: medicalHistory, onChange: setMedicalHistory },
          ].map((field, index) => (
            <View key={index} style={styles.inputGroup}>
              {field.required && <Text style={styles.requiredAsterisk}>*</Text>}
          
              {field.isGender ? (
                <RadioGroup
                  selectedIndex={field.value === 'male' ? 0 : 1}
                  onChange={index => field.onChange(index === 0 ? 'male' : 'female')}
                  style={{ flexDirection: 'row', justifyContent: 'space-around' }}
                >
                  <Radio>Male</Radio>
                  <Radio>Female</Radio>
                </RadioGroup>
              ) : field.isDate ? (
                <>
                  <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
                    <Text style={{ color: field.value ? '#fff' : '#ccc' }}>
                      {field.value || field.label}
                    </Text>
                  </Pressable>
                  {showPicker && (
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          field.onChange(formattedDate);
                        }
                      }}
                    />
                  )}
                </>
              ) : (
                <Input
                  style={styles.input}
                  placeholder={field.label}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholderTextColor="#ccc"
                />
              )}
            </View>
          ))
          
        }

        {/* Submit Button */}
        <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Submit</Text>}
        </Pressable>

        
      </ScrollView>
    </KeyboardAvoidingView>
    </Layout>
  );
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 10,
  },
  requiredAsterisk: {
    fontSize: 20,
    color: '#fff',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
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
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
