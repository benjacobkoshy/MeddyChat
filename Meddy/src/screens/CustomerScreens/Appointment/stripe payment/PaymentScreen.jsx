import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React from 'react'
import { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { fetchStripePublishableKey } from '../../Store/Stripe Payment/FetchStripePublishableKey ';
import { AuthContext } from '../../../../context/AuthContext';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Layout, Text, Card, Button, Spinner } from '@ui-kitten/components';
import { PaymentConfiguration } from '@stripe/stripe-react-native';
import Snackbar from "react-native-snackbar";


export default function PaymentScreen({navigation, route}) {

    const {fetchWithAuth, API_BASE_URL} = useContext(AuthContext);
    const [doctor, setDoctor] = useState('');

    const [amount, setAmount] = useState(null); // Add delivery fee
    const [stripeKey, setStripeKey] = useState(null);
    const [paymentId, setPaymentId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const {appointmentData} = route.params;
    const id = appointmentData.id;
    console.log(appointmentData);


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

    useEffect(() => {
        const fetchDoctors = async () => {
          try {
            const response = await fetchWithAuth(`appointment/doctor-details/${id}/`, {
              method: "GET",
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              const errorText = await response.text();
              throw new Error(`Unexpected response format: ${errorText}`);
            }

            const doctorData = await response.json();
            // console.log("Fetched Doctor Data:", doctorData);
            setDoctor(doctorData);
            setAmount(doctorData.consultation_fee);
            
          } catch (error) {
            console.error("Error fetching doctors:", error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchDoctors();
      }, [id]);



     






    // useLayoutEffect(() => {
    //     // Hide the top tab bar
    //     navigation.getParent()?.setOptions({
    //         tabBarStyle: { display: 'none' },
    //     });

    //     // Hide the bottom tab bar
    //     navigation.getParent('root')?.setOptions({
    //         tabBarStyle: { display: 'none' },
    //     });

    //     return () => {
    //         // Restore the top tab bar
    //         navigation.getParent()?.setOptions({
    //             tabBarStyle: { display: 'flex' },
    //         });

    //         // Restore the bottom tab bar
    //         navigation.getParent('root')?.setOptions({
    //             tabBarStyle: { display: 'flex' },
    //         });
    //     };
    // }, [navigation]);


    const fetchPaymentIntentClientSecret = async () => {
        try {
          const response = await fetchWithAuth('product/create-payment-intent/', {
            method: 'POST',
            body: JSON.stringify({ amount: parseInt(amount) * 100 }), // Convert to paise for INR
          });
          
          const intent = await response.json();
          // console.log('Full PaymentIntent:', intent);
      
          const { client_secret, id: paymentId } = intent;  // Extract the necessary data
          // console.log('Client Secret:', client_secret);
          // console.log('Payment Id:', paymentId);
      
          // Set the paymentId state if needed
          setPaymentId(paymentId);
          
          // Return the client_secret for payment sheet initialization
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
            merchantDisplayName: 'Meddy Appointment',
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
            await openPaymentSheet(paymentId);  // Pass paymentId to openPaymentSheet
          }
        } catch (err) {
          console.error('Unhandled Error during initialization:', err.message);
          Snackbar.show({
            text: 'Something went wrong while initializing payment. Please try again.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        }
        setPaymentProcessing(false);
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
                // console.log("Passing method of ordering", methodOfOrdering)
                const response = await fetchWithAuth('appointment/save-appointment/',{
                  method: "POST",
                  body: JSON.stringify({
                    ...appointmentData,
                    payment_status: "paid",
                    payment_id: paymentId,
                  }),
                })

                if(response.ok){
                  navigation.navigate('PaymentStatusScreen', {
                    status: 'success',
                    paymentIntentId: paymentId,
                    totalAmount: amount,
                    appointmentData: appointmentData
                  });
                }else{

                }
                
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

      if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;
    
      return(
        <StripeProvider publishableKey={stripeKey}>
            <Layout style={styles.container}>
              <Text category="h5" style={styles.title}>Consultation Payment</Text>
              
              <Card style={styles.card}>
                <Text category="s1" style={styles.text}><Text style={styles.label}>Doctor:</Text> {doctor.name}</Text>
                <Text category="s1" style={styles.text}><Text style={styles.label}>Specialty:</Text> {doctor.specialization}</Text>
                <Text category="h6" style={styles.amount}>
                  Total Amount: ₹{amount}
                </Text>
              </Card>
        
              <Button
                style={styles.payButton}
                onPress={initializePaymentSheet}
                disabled={paymentProcessing}
                accessoryLeft={paymentProcessing ? () => <ActivityIndicator color="white" /> : undefined}>
                {paymentProcessing ? 'Processing...' : `Pay ₹${amount}`}
              </Button>
            </Layout>
        </StripeProvider>
      )
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    // backgroundColor: '#F7F9FC',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 22,
  },
  card: {
    // backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 25,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#fff',
  },
  amount: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#3366ff',
    fontSize: 18,
  },
  payButton: {
    borderRadius: 25,
    paddingVertical: 15,
    backgroundColor: '#3366FF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
  },
})