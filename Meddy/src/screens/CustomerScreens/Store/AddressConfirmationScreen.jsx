import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import { Layout, Text, Input, Spinner } from '@ui-kitten/components';
import { useLayoutEffect } from 'react';

export default function AddressConfirmationScreen({ navigation, route }) {

  const { totalAmount, methodOfOrdering } = route.params;
  console.log("Method of ordering",methodOfOrdering);
  // console.log(totalAmount);
  const { fetchWithAuth, userToken } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);


  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
    });

    return () => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'flex' },
        });
    };
}, [navigation]);

  const [address, setAddress] = useState({
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone_number: '',
    alternate_phone_number: '',
  });

  const [profile, setProfile] = useState({
    name: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone_number: '',
    alternate_phone_number: '',
  });

  useEffect(() => {
    const fetchAddressAndProfile = async () => {
      try {
        const response = await fetchWithAuth(
          `product/manage-address/`,
          { method: 'GET' }
        );
  
        if (response.ok) {
          const result = await response.json();
          // console.log("API Response:", result); // Log the entire response
          setAddress({
            addressLine: result.order_address?.addressLine || result.profile?.address || '',
            city: result.order_address?.city || '',
            state: result.order_address?.state || result.profile?.place || '',
            zipCode: result.order_address?.zipCode || result.profile?.pin || '',
            country: result.order_address?.country || '',
            phone_number: result.order_address?.phone_number || result.profile?.phone_number || '',
            alternate_phone_number: result.order_address?.alternate_phone_number || result.profile?.alternate_phone_number || '',
          });
          setProfile(result.profile || {});
        } else {
          console.error("Error fetching address and profile:", response.status);
          Snackbar.show({
            text: errorData.error || 'Unable to fetch data.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        Snackbar.show({
          text: errorData.error || 'An error occurred while fetching data.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }finally{
        setIsLoading(false);
      }
    };
  
    fetchAddressAndProfile();
  }, []);
  

  const handleSave = async () => {
    console.log("City",address.city,"Country",address.country)
    if(address.addressLine==='' || address.city==='' || address.state==='' || address.zipCode==='' || address.country==='' || address.phone_number===''){
      Snackbar.show({
        text:'Enter all fields!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return false;
    }
    const payload = {
      address_line: address.addressLine,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode,
      country: address.country,
      phone_number: address.phone_number,
      alternate_phone_number: address.alternate_phone_number,
    };
  
    const response = await fetchWithAuth(`product/manage-address/`,{
        method: 'POST',
        body: JSON.stringify({ order_address: payload }),
        },
    );
  
    if (response.ok) {
      Snackbar.show({
        text: 'Address updated successfully.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#4CAF50',
      });
    } else {
      console.error('Error:', await response.text());
      Snackbar.show({
        text: errorData.error || 'Failed to update address.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    }
  };
  
  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={styles.container}>
      <ScrollView>
      <Text style={styles.heading}>Confirm Your Address</Text>

      <Text style={styles.label}>Name *</Text>
      <Input
        style={[styles.input, styles.readOnlyInput]}
        value={profile.name}
        editable={false}
      />

      <Text style={styles.label}>Address Line *</Text>
      <Input
        style={styles.input}
        value={address.addressLine}
        onChangeText={(text) => setAddress({ ...address, addressLine: text })}
        placeholder="Enter Address Line 1"
        placeholderTextColor="#888"
      />


      <Text style={styles.label}>Phone Number *</Text>
     
      <Input
        style={[styles.input, styles.readOnlyInput]}
        value={address.phone_number}
        onChangeText={(text) => setAddress({ ...address, phone_number: text })}
        placeholder="Enter Phone Number"
        placeholderTextColor="#888"
        editable={false}
      />

      <Text style={styles.label}>Alternate Phone Number</Text>
      <Input
        style={styles.input}
        value={address.alternate_phone_number}
        onChangeText={(text) => setAddress({ ...address, alternate_phone_number: text })}
        placeholder="Enter Alternate Phone Number"
        placeholderTextColor="#888"
      />


      <Text style={styles.label}>City *</Text>
      <Input
        style={styles.input}
        value={address.city}
        onChangeText={(text) => setAddress({ ...address, city: text })}
        placeholder="Enter City"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>State *</Text>
      <Input
        style={styles.input}
        value={address.state}
        onChangeText={(text) => setAddress({ ...address, state: text })}
        placeholder="Enter State"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Zip Code *</Text>
      <Input
        style={styles.input}
        value={address.zipCode}
        onChangeText={(text) => setAddress({ ...address, zipCode: text })}
        placeholder="Enter Zip Code"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Country </Text>
      <Input
        style={[styles.input, styles.readOnlyInput]}
        value={address.country}
        onChangeText={(text) => setAddress({ ...address, country: text })}
        placeholder="Enter Country"
        placeholderTextColor="#888"
        editable={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.saveButton, styles.saveButtonPrimary]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, styles.saveButtonSecondary]} onPress={() => {navigation.navigate('Payment Summary',{'totalAmount': totalAmount, 'methodOfOrdering':methodOfOrdering }) }}>
          <Text style={styles.saveButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // backgroundColor: '#121212',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    // backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    // color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  readOnlyInput: {
    // backgroundColor: '#333',
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row', // Align buttons in a row
    justifyContent: 'space-between', // Add space between buttons
    marginTop: 30,
    marginBottom: 50,
  },
  saveButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1, // Equal width for both buttons
    marginHorizontal: 5, // Add space between the buttons
  },
  saveButtonPrimary: {
    backgroundColor: '#0078D7', // Primary button color
  },
  saveButtonSecondary: {
    backgroundColor: '#28a745', // Secondary button color
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
