import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { Layout } from '@ui-kitten/components';

export default function HelpScreen() {
  return (
    <Layout style={styles.container}>
      <Text style={styles.header}>Help & Support</Text>

      {/* FAQs Section */}
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>📖 Frequently Asked Questions</Text>
      </TouchableOpacity>

      {/* User Guide */}
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>📋 How to Use the App</Text>
      </TouchableOpacity>

      {/* Troubleshooting */}
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>⚠️ Troubleshooting</Text>
      </TouchableOpacity>

      {/* Contact Support */}
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>📧 Contact Support</Text>
      </TouchableOpacity>

      {/* Feedback & Suggestions */}
      <TouchableOpacity style={styles.item}>
        <Text style={styles.itemText}>💬 Send Feedback</Text>
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff"
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: "#fff",
  },
});
