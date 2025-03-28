import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Layout } from '@ui-kitten/components';
import Snackbar from 'react-native-snackbar';

export default function ContactSupportScreen() {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    // Replace with actual support email
    const email = 'support@meddy.com';
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailtoLink);
    Snackbar.show({
        text: 'Your respose has been recorded.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#4CAF50',
      });
      setMessage('');
  };

  return (
    <Layout style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>

      <Text style={styles.text}>For any assistance, reach out to us through the following channels:</Text>

      <View style={styles.contactItem}>
        <Icon name="envelope" size={20} color="#007bff" />
        <Text style={styles.contactText} onPress={() => Linking.openURL('mailto:support@meddy.com')}>
          support@meddy.com
        </Text>
      </View>

      <View style={styles.contactItem}>
        <Icon name="phone" size={20} color="#007bff" />
        <Text style={styles.contactText} onPress={() => Linking.openURL('tel:+1234567890')}>
          +1 234 567 890
        </Text>
      </View>

      <Text style={styles.label}>Send us a message</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
        <Text style={styles.buttonText}>Send Message</Text>
      </TouchableOpacity>
    </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    color: '#222B45',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    color: "#fff"
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
