import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { Layout } from '@ui-kitten/components';

export default function PrivacyPolicyScreen() {
  return (
    <Layout style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to Meddy. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data.
      </Text>

      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.text}>
        - **Personal Information**: When you sign up, we collect your name, email, phone number, and medical history (if provided).{'\n'}
        - **Health Data**: Any symptoms or health-related information shared with our chatbot.{'\n'}
        - **Device Information**: We collect information about your device, such as IP address, OS, and browser type.{'\n'}
        - **Usage Data**: Interaction logs with our chatbot, appointment bookings, and medicine purchases.
      </Text>

      <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
      <Text style={styles.text}>
        - To provide and improve our medical assistance services.{'\n'}
        - To personalize your experience and provide health recommendations.{'\n'}
        - To process payments for medical products and appointments.{'\n'}
        - To send notifications regarding appointments, medicine reminders, or health alerts.
      </Text>

      <Text style={styles.sectionTitle}>4. Data Sharing</Text>
      <Text style={styles.text}>
        - We **do not sell your data** to third parties.{'\n'}
        - Data may be shared with healthcare professionals for better diagnosis (with your consent).{'\n'}
        - Secure payment data is handled via trusted third-party payment gateways (e.g., Stripe, Razorpay).
      </Text>

      <Text style={styles.sectionTitle}>5. Data Security</Text>
      <Text style={styles.text}>
        - We use encryption to protect your data from unauthorized access.{'\n'}
        - Your medical data is securely stored and accessible only to authorized personnel.
      </Text>

      <Text style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.text}>
        - You can request access to your data or ask for deletion at any time.{'\n'}
        - You can opt out of notifications and data collection (except for mandatory health tracking).
      </Text>

      <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
      <Text style={styles.text}>
        - We may update this policy periodically. You will be notified of significant changes.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact Us</Text>
      <Text style={styles.text}>
        If you have any questions, contact us at support@meddy.com.
      </Text>
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
    marginBottom: 15,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#fff',
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
});
