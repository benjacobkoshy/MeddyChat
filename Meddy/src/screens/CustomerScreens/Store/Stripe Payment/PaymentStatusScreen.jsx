import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../../../context/AuthContext';
import { useTheme } from '@ui-kitten/components';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/Feather';

export default function PaymentStatusScreen({ navigation, route }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const { status, methodOfOrdering, paymentIntentId, totalAmount } = route.params;
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

  const saveOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = {
        method_of_ordering: methodOfOrdering,
        stripe_payment_id: paymentIntentId,
        amount: totalAmount,
        ...(methodOfOrdering === 'product' && { product_id: 1 }),
      };

      const response = await fetchWithAuth('product/handle-payment/', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to save order details.');
      }

      const responseData = await response.json();
      console.log('Order saved successfully:', responseData);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Store' }],
      });
    } catch (error) {
      setError(error.message || 'An error occurred while saving the order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'success') {
        saveOrderDetails();
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
      <View style={[styles.container, { backgroundColor }]}> 
        <View style={styles.content}>
          <LottieView
            source={animations[status]}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={[styles.text, { color: theme['color-basic-100'] }]}>
            {messages[status]}
          </Text>

          <View style={styles.paymentIdContainer}>
            <TouchableOpacity onPress={copyToClipboard}>
              <Icon name="copy" size={20} color={theme['color-basic-100']} />
            </TouchableOpacity>
            <Text style={[styles.paymentId, { color: theme['color-basic-100'] }]}>
              {paymentIntentId}
            </Text>
          </View>
          {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}

          {loading && (
            <Text style={[styles.loadingText, { color: theme['color-basic-100'] }]}>Processing your order...</Text>
          )}
          {error && (
            <Text style={[styles.errorText, { color: theme['color-basic-100'] }]}>{error}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paymentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentId: {
    marginLeft: 10,
    fontSize: 16,
  },
  copiedText: {
    marginTop: 5,
    fontSize: 14,
    color: 'lightgreen',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
});
