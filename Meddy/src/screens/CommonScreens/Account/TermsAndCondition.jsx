import React from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';

const TermsAndConditionsScreen = () => {
  return (
    <>
    <Layout style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.title} category='h3'>Terms and Conditions</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.sectionText}>
        Welcome to Meddy! These terms and conditions outline the rules and regulations for the use of Meddy app.
      </Text>

      <Text style={styles.sectionTitle}>2. Acceptance of Terms</Text>
      <Text style={styles.sectionText}>
        By accessing or using our app, you agree to comply with and be bound by these terms. If you do not agree to these terms, you must not use our app.
      </Text>

      <Text style={styles.sectionTitle}>3. Changes to Terms</Text>
      <Text style={styles.sectionText}>
        We may update our terms from time to time. We will notify you of any changes by posting the new terms on this page. You are advised to review this page periodically for any changes.
      </Text>

      <Text style={styles.sectionTitle}>4. Use of the App</Text>
      <Text style={styles.sectionText}>
        You agree to use the app only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the app.
      </Text>

      <Text style={styles.sectionTitle}>5. Account Registration</Text>
      <Text style={styles.sectionText}>
        To use certain features of our app, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process.
      </Text>

      <Text style={styles.sectionTitle}>6. User Content</Text>
      <Text style={styles.sectionText}>
        You are responsible for any content you create, upload, or share through the app. You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content.
      </Text>

      <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
      <Text style={styles.sectionText}>
        In no event shall Meddy, its directors, employees, or agents be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the app.
      </Text>

      <Text style={styles.sectionTitle}>8. Governing Law</Text>
      <Text style={styles.sectionText}>
        These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
      </Text>

      <Text style={styles.sectionTitle}>9. Contact Us</Text>
      <Text style={styles.sectionText}>
        If you have any questions about these terms, please contact us at meddy@gmail.com.
      </Text>

      <Text style={styles.footer}>
        Last updated: 30-01-2025
      </Text>
    </ScrollView>
    </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
  },
  footer: {
    fontSize: 14,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default TermsAndConditionsScreen;
