import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import { Layout, Text, Input, Spinner } from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';


const CONSULTATION_DURATIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
];

export default function DoctorProffesionalInfo() {
    const { fetchWithAuth } = useContext(AuthContext);
    const [accountData, setAccountData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const [specialization, setSpecialization] = useState('');
    const [experience, setExperience] = useState('');
    const [qualification, setQualification] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [consultationDuration, setConsultationDuration] = useState(15); // Default value

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetchWithAuth('doctor/edit_doctor_proffesional_details/', {
            method: 'GET',
          });
    
          if (response.ok) {
            const data = await response.json();
            const profile = data.profile;
    
            if (profile) {
              console.log("Experience:", profile.experience_years, typeof profile.experience_years);
              console.log("Consultation fee:", profile.consultation_fee, typeof profile.consultation_fee);
              console.log("Consultation Durarytion",profile.consultation_duration);
    
              setAccountData(profile);
              setSpecialization(profile.specialization || '');
              setExperience(profile.experience_years?.toString() || '');
              setQualification(profile.qualifications || '');
              setAboutMe(profile.about_me || '');
              setConsultationFee(profile.consultation_fee || '');
              setConsultationDuration(profile.consultation_duration || 15);
            } else {
              console.log("Doctor profile does not exist. Prompting user to create one.");
            }
          } else {
            const error = await response.json();
            Snackbar.show({
              text: error.message || 'Error fetching account data.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: '#FFFFFF',
              backgroundColor: '#F44336',
            });
          }
        } catch (error) {
          console.error('Error fetching account data:', error);
          Snackbar.show({
            text: 'Failed to fetch data. Please check your connection.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        } finally {
          setIsLoading(false);
        }
      };
    
      fetchData();
    }, []);
    
  
    const handleSave = async () => {
      if (!specialization || !experience || !qualification || !consultationFee || !aboutMe) {
        Snackbar.show({
          text: 'Enter all fields!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
        return;
      }
    
      try {
        console.log("New Consultation Duraryiion",consultationDuration);
        const payload = {
          specialization,
          experience_years: experience, 
          qualifications: qualification, 
          consultation_fee: consultationFee, 
          about_me: aboutMe,  
          consultation_duration: consultationDuration,
        };
    
        const response = await fetchWithAuth('doctor/edit_doctor_proffesional_details/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
    
        if (response.ok) {
          const result = await response.json();
          Snackbar.show({
            text: result.message,
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#4CAF50',
          });
        } else {
          const error = await response.json();
          Snackbar.show({
            text: error.message || 'Account update failed.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        }
      } catch (error) {
        console.error('Error updating account:', error);
        Snackbar.show({
          text: 'Error updating account. Please try again later.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }
    };
    
  
    const handleReset = () => {
      setAboutMe("");
      setSpecialization("");
      setQualification("")
      setConsultationFee("");
      setAboutMe("");
      setConsultationDuration(15);
    }
  
    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;
  
    return (
      <Layout style={{ flex: 1 }}>
        <KeyboardAvoidingView
        
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>

          <View>
            <View style={{marginTop: 20,}}>
                <Text style={styles.headerText} category='h4'>Edit Proffessional Details</Text>
            </View>

            
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization</Text>
                <Input
                style={[styles.input]}
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="Enter your specialization"
                placeholderTextColor="#666"
                
                />
            </View>
    
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience years</Text>
                <Input
                style={[styles.input]}
                value={experience}
                onChangeText={setExperience}
                placeholder="Enter your experience years"
                placeholderTextColor="#666"
                keyboardType='number-pad'
                />
            </View>
    
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Qualifications</Text>
                <Input
                style={[styles.input]}
                value={qualification}
                onChangeText={setQualification}
                placeholder="Enter your qualifications"
                placeholderTextColor="#666"
                
                />
            </View>
    
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Consultation fee</Text>
                <Input
                style={[styles.input]}
                value={consultationFee}
                onChangeText={setConsultationFee}
                placeholder="Enter your consultation fee"
                keyboardType="number-pad"
                placeholderTextColor="#666"
                
                />
            </View>
    

            <View style={styles.inputGroup}>
                <Text style={styles.label}>About me</Text>
                <Input
                style={[styles.input]}
                value={aboutMe}
                onChangeText={setAboutMe}
                placeholder="About me"
                placeholderTextColor="#666"
                />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Consultation Duration</Text>
              <Picker
                selectedValue={consultationDuration}
                onValueChange={(itemValue) => setConsultationDuration(itemValue)}
                style={styles.picker}
              >
                {CONSULTATION_DURATIONS.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>

          </View>
  
          
  
          <View style={{flexDirection: "row", flex: 1,}}>
            <View style={styles.buttonContainer}> 
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Icon name="content-save" size={20} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
  
            <View style={styles.buttonContainer}> 
              <TouchableOpacity style={styles.saveButton} onPress={handleReset}>
                <Icon name="restart" size={20} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
  
  
        </ScrollView>
      </KeyboardAvoidingView>
      </Layout>
    );
  }




  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      // backgroundColor: '#121212',
      padding: 20,
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: {
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      color: '#fff',
      marginBottom: 5,
    },
    input: {
      // backgroundColor: '#1e1e1e',
      // color: '#fff',
      borderRadius: 8,
      padding: 10,
      borderWidth: .5,
      borderColor: '#fff',
    },
    readOnlyInput: {
      // backgroundColor: '#222B45',
      color: '#ccc',
    },
    picker: {
      height: 50,
      width: "100%",
    },
    buttonContainer: {
      flexDirection: 'row', 
      alignItems: "center",
      justifyContent: "center", 
      marginTop: 30,
      marginBottom: 50,
      width: "50%", // Full width container
    },
    
    saveButton: {
      paddingVertical: 12,  // Adjusted padding for a balanced look
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: "center", 
      flexDirection: "row", // Align icon & text in a row
      flex: 1, // Equal width for button
      marginHorizontal: 5, // Space between elements
      backgroundColor: "#007bff",
    },
    
    saveButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: "#fff", // Ensure text color is visible
      marginLeft: 8, // Space between icon and text
    },
    
  });
  