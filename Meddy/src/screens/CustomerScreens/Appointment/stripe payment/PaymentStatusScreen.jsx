import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { AuthContext } from '../../../../context/AuthContext';
import { Layout, useTheme, Icon } from '@ui-kitten/components';

export default function PaymentStatusScreen({ navigation, route }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const { status, paymentIntentId, totalAmount } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const backgroundColor =
    status === 'success'
      ? theme['color-success-500']
      : status === 'failed'
      ? theme['color-danger-500']
      : theme['color-warning-500'];

  const animations = {
    success: require('../../../../assets/payment_success.json'),
    pending: require('../../../../assets/payment_pending.json'),
    failed: require('../../../../assets/payment_failed.json'),
  };

  const messages = {
    success: 'Payment Successful!',
    pending: 'Payment Pending...',
    failed: 'Payment Failed. Please try again.',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'success') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Appointments' }],
        });
      } else {
        navigation.goBack();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [status, navigation]);

  const copyToClipboard = () => {
    Clipboard.setString(paymentIntentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={[styles.fullScreenModal, { backgroundColor }]}>
        <LottieView source={animations[status]} autoPlay loop={false} style={styles.animation} />
        <Text style={[styles.text, { color: theme['color-basic-100'] }]}>
          {messages[status]}
        </Text>

        <View style={styles.paymentIdContainer}>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Icon name="copy-outline" fill={theme['color-basic-100']} style={styles.icon} />
          </TouchableOpacity>
          <Text style={[styles.paymentIdText, { color: theme['color-basic-100'] }]}>{paymentIntentId}</Text>
        </View>
        {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}

        {loading && (
          <Text style={[styles.loadingText, { color: theme['color-basic-100'] }]}>Processing your appointment...</Text>
        )}
        {error && (
          <Text style={[styles.errorText, { color: theme['color-basic-100'] }]}>{error}</Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  paymentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  paymentIdText: {
    fontSize: 16,
    marginLeft: 8,
  },
  copyButton: {
    padding: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  copiedText: {
    color: 'lightgreen',
    fontSize: 14,
    marginTop: 5,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    marginTop: 10,
    color: 'red',
  },
});
