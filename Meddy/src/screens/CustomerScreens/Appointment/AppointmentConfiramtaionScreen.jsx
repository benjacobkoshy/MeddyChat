import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, ScrollView, View, Platform } from 'react-native';
import { Layout, Text, Input, Button, Card, Icon } from '@ui-kitten/components';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';

export default function AppointmentConfirmationScreen({ navigation, route }) {

    const {fetchWithAuth} = useContext(AuthContext);


  const { id, day, date, time, doctorName } = route.params;
  const [doctor, setDoctor] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('');

    const [isLoading, setIsLoading] = useState(true);

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
                
              } catch (error) {
                console.error("Error fetching doctors:", error);
              } finally {
                setIsLoading(false);
              }
            };
    
            fetchDoctors();
          }, []);


          const handleConfirmAppointment = () => {
            if(!symptoms){
                Snackbar.show({
                  text: 'Enter the symptoms to continue.',
                  duration: Snackbar.LENGTH_SHORT,
                  textColor: '#FFFFFF',
                  backgroundColor: '#F44336',
                });
                return

            }
            const appointmentData = {
              id: id,
            //   doctorName: doctor?.name,
              day: day,
              date: date,
              time: time,
              symptoms: symptoms,
              reason: reason || '',
              status: 'pending',
              payment_status: 'pending',
            };
            // console.log('Appointment Confirmed:', appointmentData);
            navigation.navigate('Payment Screen', { appointmentData });
          };
        
          if (isLoading || !doctor) {
            return (
              <Layout style={styles.loadingContainer}>
                <Text>Loading doctor details...</Text>
              </Layout>
            );
          }
        
          return (
            <Layout style={styles.container}>
              <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <ScrollView
                  contentContainerStyle={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <Card style={styles.card}>
                    <View style={styles.header}>
                      <Icon name="calendar-outline" fill="#4F46E5" style={styles.headerIcon} />
                      <Text category="h5" style={styles.title}>Confirm Your Appointment</Text>
                    </View>
        
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Doctor Details</Text>
                      <View style={styles.detailRow}>
                        <Icon name="person-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>{doctor.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="briefcase-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>{doctor.specialization}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="star-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>{doctor.experience_years} years of experience</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="book-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>Qualifications: {doctor.qualifications}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="credit-card-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>Consultation Fee: ₹{doctor.consultation_fee}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="clock-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>Duration: {doctor.consultation_duration} mins</Text>
                      </View>
                    </View>
        
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Appointment Details</Text>
                      <View style={styles.detailRow}>
                        <Icon name="calendar-outline" style={styles.detailIcon} />
                        <Text style={styles.detailText}>{day}, {date} at {time}</Text>
                      </View>
                    </View>
        
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Additional Information</Text>
                      <Input
                        placeholder="Describe any symptoms..."
                        placeholderTextColor="#94A3B8"
                        value={symptoms}
                        onChangeText={setSymptoms}
                        multiline
                        textStyle={styles.inputText}
                        style={styles.textArea}
                        accessoryLeft={<Icon name="activity-outline" style={styles.inputIcon} />}
                      />
        
                      <Input
                        placeholder="Reason for appointment..."
                        placeholderTextColor="#94A3B8"
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        textStyle={styles.inputText}
                        style={styles.textArea}
                        accessoryLeft={<Icon name="edit-2-outline" style={styles.inputIcon} />}
                      />
                    </View>
                  </Card>
                </ScrollView>
        
                <View style={styles.footer}>
                  <Button
                    style={styles.confirmButton}
                    accessoryRight={<Icon name="checkmark-circle-2-outline" fill="white" />}
                    onPress={handleConfirmAppointment}
                  >
                    CONFIRM APPOINTMENT
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </Layout>
          );
        }
        
        const styles = StyleSheet.create({
          container: {
            flex: 1,
            backgroundColor: '#0F172A',
          },
          loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0F172A',
          },
          scrollContainer: {
            padding: 16,
          },
          card: {
            borderRadius: 16,
            backgroundColor: '#1E293B',
            padding: 24,
          },
          header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
          },
          headerIcon: {
            width: 24,
            height: 24,
            marginRight: 12,
          },
          title: {
            color: '#E2E8F0',
            fontSize: 24,
            fontWeight: '700',
          },
          section: {
            marginBottom: 24,
          },
          sectionTitle: {
            color: '#CBD5E1',
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
          },
          detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          },
          detailIcon: {
            width: 20,
            height: 20,
            marginRight: 12,
            tintColor: '#4F46E5',
          },
          detailText: {
            color: '#E2E8F0',
            fontSize: 16,
          },
          textArea: {
            backgroundColor: '#334155',
            borderColor: '#475569',
            borderRadius: 12,
            marginBottom: 16,
            minHeight: 100,
          },
          inputText: {
            color: '#F8FAFC',
            fontSize: 14,
          },
          inputIcon: {
            width: 20,
            height: 20,
            marginRight: 8,
            tintColor: '#94A3B8',
          },
          footer: {
            backgroundColor: '#1E293B',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#334155',
          },
          confirmButton: {
            borderRadius: 12,
            backgroundColor: '#4F46E5',
            borderColor: 'transparent',
            paddingVertical: 16,
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
          },
        });