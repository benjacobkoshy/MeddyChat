import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Layout, Text } from '@ui-kitten/components';

export default function ReportNavigationScreen({ navigation }) {
  return (
    <Layout style={styles.container}>
      <ScrollView>
      
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText} category="h3">
            Report Center
          </Text>
          <Icon name="file-medical" size={30} color="#fff" style={styles.headerIcon} />
        </View>

        {/* Button Section */}
        <View style={styles.buttonContainer}>

          {/* Medical Report */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('View Medical Report')}
          >
            <Icon name="notes-medical" size={20} color="#fff" />
            <Text style={styles.buttonText}>Medical Report</Text>
          </TouchableOpacity>

          {/* Diet Details */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Diet Suggestion')}
          >
            <Icon name="apple-alt" size={20} color="#fff" />
            <Text style={styles.buttonText}>Diet Suggestion</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#222B45',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    flex: 1,
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#007BFF', // Modern blue color
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

