import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { Layout, Text } from '@ui-kitten/components';


export default function PersonalProffesionalNavigationScreen({ navigation }) {






  return (
    <Layout  style={styles.container}>
      <ScrollView>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText} category='h3'>Account Center</Text>
        <Icon name="user-circle" size={30} color="#fff" style={styles.headerIcon} />
      </View>

      <View style={styles.buttonContainer}>



        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Personal Details')}
        >
          <Icon name="edit" size={16} color="#fff" />
          <Text style={styles.buttonText}>Personal Details</Text>
        </TouchableOpacity>

        {/* Proffessional Details */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Proffessional Details')}
        >
          <Icon name="user-md" size={16} color="#fff" />
          <Text style={styles.buttonText}>Proffessional Details</Text>
        </TouchableOpacity>

        {/* Availabilities */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Availability')}
        >
          <Icon name="calendar" size={16} color="#fff" />
          <Text style={styles.buttonText}>Availability</Text>
        </TouchableOpacity>
      </View>

      

    </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#222B45',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerIcon: {
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: .3,
    borderColor: '#fff',
  },
  buttonText: {
    // color: '#fff',
    // fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: '10%',
    paddingVertical: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: "#FFF",
    width: "40%",
  },
  logoutButtonText: {
    // color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


