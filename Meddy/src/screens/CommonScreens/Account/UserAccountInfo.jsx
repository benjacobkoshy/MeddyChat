import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import { Layout, Text, Input, Spinner, Button } from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';


export default function UserAccountInfo() {
  const { fetchWithAuth, userToken, API_BASE_URL } = useContext(AuthContext);
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [currentImage, setCurrentImage] = useState([]);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [place, setPlace] = useState('');
  const [pin, setPin] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth('home/edit_account/', {
        method: 'GET',
      });
  
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        setAccountData(profile);
        setName(profile.name || '');
        setUsername(profile.username || '');
        setEmail(profile.email || '');
        setAddress(profile.address || '');
        setPhone(profile.phone_number || '');
        setAltPhone(profile.alternate_phone_number || '');
        setPlace(profile.place || '');
        setPin(profile.pin || '');
        setMedicalHistory(profile.medical_history || '');
        setBloodGroup(profile.blood_group || '');
        setDob(profile.dob || '');
        setGender(profile.gender || '');
        setProfileImage(profile.image || null);  // Update profile image
      } else {
        const error = await response.json();
        Snackbar.show({
          text: error.message || 'Error fetching account data.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#FF3D71',
        });
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      Snackbar.show({
        text: 'Failed to fetch data. Please check your connection.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#FF3D71',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Move useEffect down so it uses the new fetchData function
  useEffect(() => {
    fetchData();
  }, []);
  


  
  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES // Use READ_EXTERNAL_STORAGE for older versions
      );
      return result === RESULTS.GRANTED;
    }
    return true;
  };
  
  const pickImage = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        Snackbar.show({
          text: 'Permission to access media library is required!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#FF3D71',
        });
        return;
      }
  
      launchImageLibrary({ mediaType: 'photo' }, async (response) => {
        if (!response || !response.assets || response.assets.length === 0) {
          Snackbar.show({
            text: 'Image selection failed!',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#FF3D71',
          });
          return;
        }
  
        const imageUri = response.assets[0].uri;
        const imageName = response.assets[0].fileName || 'profile.jpg';
        const imageType = response.assets[0].type || 'image/jpeg';
  
        if (!imageUri) return;
  
      
    
  
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: imageType,
          name: imageName,
        });
  
        try {
          const result = await fetch(`${API_BASE_URL}/home/add_image/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          });
  
          const resultData = await result.json();
  
          if (result.ok) {
            setProfileImage(resultData.image_url); // Set new image immediately
            fetchData(); // Fetch updated account data
          
            Snackbar.show({
              text: 'Profile picture updated successfully.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: '#FFFFFF',
              backgroundColor: '#00E096',
            });
          } else {
            Snackbar.show({
              text: resultData.error || 'Failed to update profile picture.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: '#FFFFFF',
              backgroundColor: '#FF3D71',
            });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          Snackbar.show({
            text: 'Error uploading image.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#FF3D71',
          });
        }
      });
    } catch (error) {
      console.error('Error picking image:', error);
    }finally{
      console.log("Inside finally")
      fetchData();
    }
  };
  
    


  const handleSave = async () => {
    if (!address || !phone || !altPhone || !place || !pin || !medicalHistory) {
      Snackbar.show({
        text: 'Please fill all required fields!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#FF3D71',
      });
      return;
    }

    try {
      const payload = {
        address,
        phone_number: phone,
        alternate_phone_number: altPhone,
        place,
        pin,
        medical_history: medicalHistory,
      };

      const response = await fetchWithAuth('home/edit_account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Snackbar.show({
          text: 'Account details updated successfully.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#00E096',
        });
      } else {
        const error = await response.json();
        Snackbar.show({
          text: error.message || 'Account update failed.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#FF3D71',
        });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      Snackbar.show({
        text: 'Error updating account. Please try again later.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#FF3D71',
      });
    }
  };

  const handleReset = () => {
    setAddress('');
    setPhone('');
    setAltPhone('');
    setPlace('');
    setPin('');
    setMedicalHistory('');
  };

  

  if (isLoading) {
    return (
      <Layout style={styles.loader}>
        <Spinner size='giant' status='primary' />
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>

              <View style={styles.profileImageContainer}>
                {profileImage ? (
                  <TouchableOpacity onPress={() => { setCurrentImage([{ uri: `${API_BASE_URL}${profileImage}` }]); setVisible(true); }}>
                    <Image source={{ uri: `${API_BASE_URL}${profileImage}` }} style={styles.profileImage} />
                  </TouchableOpacity> 
                ) : (
                  <Icon name="account-circle" size={100} color="#8F9BB3" />
                )}
                <TouchableOpacity onPress={pickImage}>
                <View style={styles.editIcon}>
                  <Icon name="camera" size={20} color="#FFFFFF" />
                </View>
                </TouchableOpacity>
              </View>

          </View>

          
          {/* Account Information */}
          <Text category='h5' style={styles.headerText}>
            Edit Account Information
          </Text>

          {/* Read-only Fields */}
          {[
            { label: 'Name', value: name },
            { label: 'Username', value: username },
            { label: 'Email', value: email },
            { label: 'Date of Birth', value: dob },
            { label: 'Gender', value: gender },
            { label: 'Blood Group', value: bloodGroup },
          ].map((field, index) => (
            <Input
              key={index}
              label={field.label}
              value={field.value}
              style={styles.input}
              disabled
              accessoryLeft={(props) => <Icon {...props} name="lock" size={20} color="#8F9BB3" />}
            />
          ))}

          {/* Editable Fields */}
          {[
            { label: 'Address', value: address, onChange: setAddress },
            { label: 'Phone', value: phone, onChange: setPhone, keyboardType: 'phone-pad' },
            { label: 'Alternate Phone', value: altPhone, onChange: setAltPhone, keyboardType: 'phone-pad' },
            { label: 'Place', value: place, onChange: setPlace },
            { label: 'PIN', value: pin, onChange: setPin, keyboardType: 'number-pad' },
            { label: 'Medical History', value: medicalHistory, onChange: setMedicalHistory, multiline: true },
          ].map((field, index) => (
            <Input
              key={index}
              label={field.label}
              value={field.value}
              onChangeText={field.onChange}
              style={styles.input}
              keyboardType={field.keyboardType}
              multiline={field.multiline}
              textStyle={field.multiline ? { minHeight: 80 } : undefined}
            />
          ))}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              style={styles.actionButton}
              status='primary'
              accessoryLeft={(props) => <Icon {...props} name="content-save" size={20} />}
              onPress={handleSave}
            >
              Save Changes
            </Button>

            <Button
              style={styles.actionButton}
              status='basic'
              accessoryLeft={(props) => <Icon {...props} name="restart" size={20} />}
              onPress={handleReset}
            >
              Reset
            </Button>

            <Button
              style={styles.actionButton}
              status='info'
              accessoryLeft={(props) => <Icon {...props} name="lock-reset" size={20} />}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              Change Password
            </Button>
          </View>
        </ScrollView>

          {/* For viewing image */}
          <ImageViewing images={currentImage} imageIndex={0} visible={visible} onRequestClose={() => setVisible(false)} />

      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2138',
  },
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3366FF',
    borderRadius: 12,
    padding: 4,
  },
  headerText: {
    marginBottom: 16,
    color: '#E4E9F2',
  },
  input: {
    marginBottom: 16,
  },
  actionsContainer: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});