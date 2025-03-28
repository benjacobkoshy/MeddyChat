import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import { Layout, Text, Card, Divider, Icon, Spinner } from "@ui-kitten/components";
import moment from "moment";
import Snackbar from "react-native-snackbar";

export default function PreviousAppointmentDetailsScreen({navigation, route}) {
    const { appointment } = route.params;

    console.log("Appointment details",appointment);
  
  
  
    const formatDate = (dateString) => new Date(dateString).toDateString();
    const formatTime = (timeString) => timeString.slice(0, 5); // Remove seconds
  
    
    
  
    return (
      <Layout style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card style={styles.card}>
            <Text category="h5" style={styles.header}>Appointment Details</Text>
            <Divider style={styles.divider} />
  
            {/* Patient Information */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Patient Information</Text>
              <View style={styles.row}>
                <Icon name="person-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s1">{appointment.patient.name}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="phone-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{appointment.patient.phone_number}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="book-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{appointment.patient.medical_history|| 'No previous medical history'}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="droplet-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{appointment.patient.blood_group.toUpperCase()}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="people-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{appointment.patient.gender.toUpperCase()}</Text>
              </View>
            </View>
  
            <Divider style={styles.divider} />
  
            {/* Appointment Details */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Appointment Details</Text>
              <View style={styles.row}>
                <Icon name="calendar-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{formatDate(appointment.slot.date)}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="clock-outline" fill="#3366FF" style={styles.icon} />
                <Text category="s2" appearance="hint">{moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}
                </Text>
              </View>
            </View>
  
            <Divider style={styles.divider} />
  
            {/* Symptoms */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Symptoms</Text>
              <Text category="s2" appearance="hint">{appointment.symptoms || "Not specified"}</Text>
            </View>
  
            <Divider style={styles.divider} />
  
            {/* Reason */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Reason</Text>
              <Text category="s2" appearance="hint">{appointment.reason || "Not specified"}</Text>
            </View>

            <Divider style={styles.divider} />
  
            {/* Diadnosis */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Diagnosis</Text>
              <Text category="s2" appearance="hint">{appointment.diagnosis || "Not specified"}</Text>
            </View>

            <Divider style={styles.divider} />
  
            {/* Prescription */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>Prescription</Text>
              {appointment.prescriptions && appointment.prescriptions.length > 0 ? (
                appointment.prescriptions.map((prescription, index) => (
                  <Text key={index} category="s2" appearance="hint">
                    {prescription.product_name} - {prescription.dosage || "No dosage specified"}
                  </Text>
                ))
              ) : (
                <Text category="s2" appearance="hint">Not specified</Text>
              )}
            </View>

            
  
            <Divider style={styles.divider} />
  
            {/* Medical history */}
            <View style={styles.section}>
              <Text category="h6" style={styles.sectionHeader}>See previous medical history</Text>
              <TouchableOpacity 
                    onPress={() => { 
                        navigation.navigate('Upcoming Appointments', {
                            screen: 'Patient Medical History', 
                            params: { appointment }
                        }) 
                    }}
                >
                    <Text category="s2" appearance="hint" style={{color: "green"}}>Click here to see previous medical history</Text>
                </TouchableOpacity>

            </View>
  

  
          </Card>
        </ScrollView>
      </Layout>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: "#F5F5F5",
    },
    scrollContainer: {
      padding: 16,
    },
    card: {
      borderRadius: 12,
      // backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderColor: "#fff",
      borderWidth: .2,
    },
    header: {
      marginBottom: 8,
      textAlign: "center",
      color: "#3366FF",
    },
    section: {
      marginVertical: 12,
    },
    sectionHeader: {
      marginBottom: 8,
      color: "#3366FF",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    icon: {
      width: 20,
      height: 20,
      marginRight: 8,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: "#E0E0E0",
    },
    consultButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    
  });