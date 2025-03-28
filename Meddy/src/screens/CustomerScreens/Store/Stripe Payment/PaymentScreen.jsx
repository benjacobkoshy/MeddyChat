import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { fetchStripePublishableKey } from './FetchStripePublishableKey ';
import { AuthContext } from '../../../../context/AuthContext';
import { useLayoutEffect } from 'react';
import { Layout, Text, Spinner, useTheme, Button } from '@ui-kitten/components';
import Snackbar from "react-native-snackbar";


export default function PaymentScreen({ navigation, route }) {
  const { fetchWithAuth, API_BASE_URL } = useContext(AuthContext);
  const { totalAmount, methodOfOrdering } = route.params; // Total amount from previous screen
  // console.log(totalAmount, methodOfOrdering);
  const [amount, setAmount] = useState((parseFloat(totalAmount) + 50).toFixed(2)); // Add delivery fee
  const [stripeKey, setStripeKey] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const theme = useTheme(); // Access the current theme

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        console.log("Inside initializeStripe");
        const key = await fetchStripePublishableKey(API_BASE_URL);
        console.log("Fetched Stripe Key:", key);
        
        if (key) {
          // PaymentConfiguration.init({ publishableKey: key });
          setStripeKey(key);
        } else {
          throw new Error("Unable to fetch Stripe key.");
        }
      } catch (error) {
        console.error("Error fetching Stripe key:", error.message);
        Snackbar.show({
          text: 'Unable to fetch Stripe key. Please try again later.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };
  
    console.log("Calling initializeStripe");
    initializeStripe();
  }, []);
  
  

  const fetchPaymentIntentClientSecret = async () => {
    try {
      const response = await fetchWithAuth('product/create-payment-intent/', {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount) * 100 }), // Convert to paise for INR
      });

      const intent = await response.json();
      const { client_secret, id: paymentId } = intent; // Extract the necessary data
      setPaymentId(paymentId);
      return { clientSecret: client_secret, paymentId: paymentId };
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      return null;
    }
  };

  const initializePaymentSheet = async () => {
    setPaymentProcessing(true);
    const { clientSecret, paymentId } = await fetchPaymentIntentClientSecret();
    if (!clientSecret || !paymentId) {
      Snackbar.show({
        text: 'Failed to initialize payment. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    try {
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Meddy Store',
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        Snackbar.show({
          text: `Failed to initialize payment: ${error.message}`,
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      } else {
        console.log('Payment Sheet initialized successfully');
        await openPaymentSheet(paymentId); // Pass paymentId to openPaymentSheet
      }
    } catch (err) {
      console.error('Unhandled Error during initialization:', err.message);
      Snackbar.show({
        text: 'Something went wrong while initializing payment. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    }finally{
      setPaymentProcessing(false);
    }
  };

  const openPaymentSheet = async (paymentId) => {
    try {
      const response = await presentPaymentSheet();
      console.log('Payment Sheet Response:', response);

      const { error } = response;

      if (error) {
        console.error('Payment Sheet Error:', error.message);
        Snackbar.show({
          text: `Payment failed: ${error.message}`,
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
        navigation.navigate('PaymentStatusScreen', { status: 'failed' });
      } else {
        if (paymentId) {
          const paymentStatus = await fetchPaymentStatus(paymentId);

          if (paymentStatus === 'succeeded') {
            console.log('Passing method of ordering', methodOfOrdering);
            navigation.navigate('PaymentStatusScreen', {
              status: 'success',
              methodOfOrdering: methodOfOrdering,
              paymentIntentId: paymentId,
              totalAmount: amount,
            });
          } else {
            console.error('Payment failed or status is not succeeded');
            navigation.navigate('PaymentStatusScreen', { status: 'failed' });
          }
        } else {
          console.error('Payment Intent not found');
          navigation.navigate('PaymentStatusScreen', { status: 'failed' });
        }
      }
    } catch (err) {
      console.error('Unhandled Error during payment:', err.message);
      Snackbar.show({
        text: 'Something went wrong during payment. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      navigation.navigate('PaymentStatusScreen', { status: 'failed' });
    }
  };

  const fetchPaymentStatus = async (paymentId) => {
    try {
      const response = await fetchWithAuth('product/payment-status/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      const rawResponse = await response.text();
      console.log('Raw Response:', rawResponse);

      const jsonResponse = JSON.parse(rawResponse); // Parse only if valid JSON
      console.log('Parsed JSON Response:', jsonResponse);
      return jsonResponse.status;
    } catch (error) {
      console.error('Error fetching payment status:', error.message);
      return null;
    }
  };

  if (isLoading) {
    return (
      <Layout style={styles.loader}>
        <Spinner size="giant" />
      </Layout>
    );
  }

  return stripeKey ? (
    <StripeProvider publishableKey={stripeKey}>
      <Layout style={[styles.container, { backgroundColor: theme['color-basic-900'] }]}>
        <Text style={[styles.title, { color: theme['color-basic-100'] }]}>Order Summary</Text>

        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: theme['color-basic-300'] }]}>Product Total:</Text>
          <Text style={[styles.summaryValue, { color: theme['color-basic-100'] }]}>
            ₹{parseFloat(totalAmount).toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: theme['color-basic-300'] }]}>Delivery Fee:</Text>
          <Text style={[styles.summaryValue, { color: theme['color-basic-100'] }]}>₹50.00</Text>
        </View>

        <View style={styles.summaryContainerTotal}>
          <Text style={[styles.totalText, { color: theme['color-basic-100'] }]}>Total Amount:</Text>
          <Text style={[styles.totalValue, { color: theme['color-basic-100'] }]}>₹{amount}</Text>
        </View>

          <Button
              style={styles.payButton}
              onPress={initializePaymentSheet}
              disabled={paymentProcessing}
              accessoryLeft={paymentProcessing ? () => <ActivityIndicator color="white" /> : undefined}>
              {paymentProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </Button>
      </Layout>
    </StripeProvider>
  ) : (
    <Layout style={[styles.errorContainer, { backgroundColor: theme['color-basic-900'] }]}>
      <Text style={[styles.errorText, { color: theme['color-basic-100'] }]}>
        Unable to initialize payment gateway. Please try again later.
      </Text>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 10,
  },
  summaryContainerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,
  },
  summaryValue: {
    fontSize: 18,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  payButton: {
    borderRadius: 25,
    paddingVertical: 15,
    backgroundColor: '#3366FF',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});