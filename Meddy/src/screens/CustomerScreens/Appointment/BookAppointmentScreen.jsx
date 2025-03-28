import { StyleSheet, View, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/AuthContext';
import { Layout, Text, Card, Button, Icon, Spinner } from '@ui-kitten/components';
import { ScrollView } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';
// import Snackbar from "react-native-snackbar";
import ImageViewing from 'react-native-image-viewing';

export default function BookAppointmentScreen({navigation, route}) {

    // const route = useRoute();
    const { fetchWithAuth } = useContext(AuthContext);
    const { id } = route.params;
    console.log(id);

    const [currentImage, setCurrentImage] = useState([]);
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [doctor, setDoctor] = useState('');

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

      if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

      return (
        <Layout style={styles.container}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Card style={styles.card}>
                <View style={styles.header}>
                  <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => { setCurrentImage([{ uri: doctor.image }]); setVisible(true); }}>
                      <Image
                        source={{ uri: doctor.image }}
                        style={styles.doctorImage}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.name} category="h5">{doctor.name}</Text>
                  <Text style={styles.specialization} category="s1">
                    {doctor.specialization}
                  </Text>
                </View>
    
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Icon name="briefcase-outline" fill="#6200ea" style={styles.icon} />
                    <Text category="p1">{doctor.experience_years} Years Experience</Text>
                  </View>
    
                  <View style={styles.detailItem}>
                    <Icon name="book-open-outline" fill="#6200ea" style={styles.icon} />
                    <Text category="p1">{doctor.qualifications}</Text>
                  </View>
    
                  <View style={styles.detailItem}>
                    <Icon name="credit-card-outline" fill="#6200ea" style={styles.icon} />
                    <Text category="p1">₹{doctor.consultation_fee} Consultation Fee</Text>
                  </View>
                </View>
    
                <View style={styles.aboutContainer}>
                  <Text category="s2" style={styles.aboutTitle}>About Doctor</Text>
                  <Text category="p2" style={styles.aboutText}>
                    {doctor.about_me}
                  </Text>
                </View>
    
                <Button 
                  style={styles.button} 
                  accessoryRight={<Icon name="calendar-outline" fill="white"/>}
                  onPress={() => navigation.navigate('Doctor Availability', { id: doctor.id })}
                >
                  VIEW AVAILABILITY
                </Button>
              </Card>
            </ScrollView>

            <ImageViewing images={currentImage} imageIndex={0} visible={visible} onRequestClose={() => setVisible(false)} />

          </KeyboardAvoidingView>
        </Layout>
      )
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        // backgroundColor: '#f8f9fa',
      },
      scrollContainer: {
        padding: 16,
      },
      loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      card: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      header: {
        alignItems: 'center',
        marginBottom: 24,
      },
      imageContainer: {
        backgroundColor: '#ccc',
        borderRadius: 65,
        padding: 2,
        shadowColor: '#6200ea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 16,
      },
      doctorImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
      },
      name: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#fff',
      },
      specialization: {
        color: '#6200ea',
        fontWeight: '600',
      },
      detailsContainer: {
        marginVertical: 16,
      },
      detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        paddingVertical: 8,
      },
      icon: {
        width: 24,
        height: 24,
        marginRight: 16,
      },
      aboutContainer: {
        backgroundColor: '#f3e9fe',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
      },
      aboutTitle: {
        color: '#6200ea',
        fontWeight: 'bold',
        marginBottom: 8,
      },
      aboutText: {
        lineHeight: 22,
        color: '#4a4a4a',
      },
      button: {
        marginTop: 24,
        borderRadius: 12,
        backgroundColor: '#6200ea',
        borderColor: 'transparent',
        paddingVertical: 16,
      },
    });