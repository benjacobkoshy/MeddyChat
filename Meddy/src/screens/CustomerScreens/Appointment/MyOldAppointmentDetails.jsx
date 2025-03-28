import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { Layout, Text, Card, Divider, Spinner, Icon } from '@ui-kitten/components';
import { Badge } from 'react-native-paper';
import Snackbar from "react-native-snackbar";
import moment from 'moment';


export default function MyOldAppointmentDetails({ navigation, route }) {
    const { appointment } = route.params;
    console.log(appointment);
    const { fetchWithAuth } = useContext(AuthContext);
    // const [appointment, setappointment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // setappointment(appointment);
    
    const [isConsultationActive, setIsConsultationActive] = useState(false);
    const [remainingTime, setRemainingTime] = useState("");
  

    const renderBadge = (status, type) => {
      let color = 'gray';
      if (type === 'status') color = status === 'completed' ? 'green' : 'orange';
      if (type === 'payment') color = status === 'paid' ? 'green' : 'red';
  
      return (
        <Badge style={[styles.badge, { backgroundColor: color }]}> 
          <Text style={{ color: 'white' }}>{status.toUpperCase()}</Text>
        </Badge>
      );
    };
  
    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;
    if (error) return <Layout style={styles.container}><Text status='danger'>{error}</Text></Layout>;
    if (!appointment) return <Layout style={styles.container}><Text>No appointment data found</Text></Layout>;
  
    return (
      <Layout style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card style={styles.card}>
            <Text category='h5' style={styles.header}>Appointment Details</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <View style={styles.row}><Text category='s1'>Appointment ID:</Text><Text category='s2'>{appointment.id}</Text></View>
              <View style={styles.row}><Text category='s1'>Booked On:</Text><Text category='s2'>{new Date(appointment.created_at).toDateString()}</Text></View>
              <View style={styles.row}><Text category='s1'>Status:</Text>{renderBadge(appointment.status, 'status')}</View>
              <View style={styles.row}><Text category='s1'>Payment Status:</Text>{renderBadge(appointment.payment_status, 'payment')}</View>
            </View>
            
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text category='h6' style={styles.subHeader}>Doctor Information</Text>
              <Text category='s1'>{appointment.doctor.name}</Text>
              <Text category='s2' appearance='hint'>{appointment.doctor.specialization}</Text>
              <View style={styles.row}><Text category='s2'>Experience: {appointment.doctor.experience_years} years</Text><Text category='s2'>Fee: ₹{appointment.doctor.consultation_fee}</Text></View>
            </View>
            
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text category='h6' style={styles.subHeader}>Appointment Slot</Text>
              <View style={styles.row}><Text category='s1'>Date:</Text><Text category='s2'>{moment(appointment.slot.date).format('DD MMM YYYY')}</Text></View>
              <View style={styles.row}><Text category='s1'>Time:</Text><Text category='s2'>{moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}</Text></View>
            </View>
            
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text category='h6' style={styles.subHeader}>Patient Information</Text>
              <View style={styles.row}><Text category='s1'>Name:</Text><Text category='s2'>{appointment.patient.name}</Text></View>
              <View style={styles.row}><Text category='s1'>Contact:</Text><Text category='s2'>{appointment.patient.phone_number}</Text></View>
            </View>

            <Divider style={styles.divider} />
            <View style={styles.section}>
                <Text category='h6' style={styles.subHeader}>Symptoms</Text>
                <View style={styles.row}><Text category='s1'>Symptoms:</Text><Text category='s2'>{appointment.symptoms}</Text></View>
                <View style={styles.row}><Text category='s1'>Reason:</Text><Text category='s2'>{appointment.reason}</Text></View>
                <View style={styles.row}><Text category='s1'>Diagnosis:</Text><Text category='s2'>{appointment.diagnosis}</Text></View>
            </View>

            <Divider style={styles.divider} />
            <View>
              <TouchableOpacity style={styles.buyButton} onPress={()=>{navigation.navigate("Buy Medicine",{'appointment':appointment})}}>
                <Text style={styles.buyButtonText}>Buy prescribed medicine</Text>
                <Icon name='shopping-cart' style={styles.icon} fill="white" />
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />
            <View style={styles.prescriptionContainer}>
                {/* {console.log("Appintment data passing to pdf",appointment)} */}
                <TouchableOpacity onPress={() => navigation.navigate("Generate PDF", { "appointmentData":appointment })} disabled={appointment.status !== 'completed'}>
                    <Text style={appointment.status === 'completed' ? styles.prescriptionText : styles.disabledText}>Download Prescription</Text>
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
      // backgroundColor: '#F5F5F5',
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
      margin: 8,
      borderRadius: 12,
      // backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      marginBottom: 8,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#3366FF',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionIcon: {
      width: 24,
      height: 24,
      marginRight: 8,
    },
    sectionTitle: {
      fontWeight: 'bold',
      color: '#3366FF',
    },
    doctorName: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    section: {
      marginVertical: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 6,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: '#E0E0E0',
    },
    badge: {
      paddingHorizontal: 8,
      // paddingVertical: 4,
      borderRadius: 12,
      // height: 30
    },
    // prescriptionContainer: {
  
    // },
    prescriptionText: {
      color: "green",
    },
    buyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      marginTop: 30,
      // shadowColor: "#000",
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.2,
      // shadowRadius: 4,
      // elevation: 3,
      backgroundColor: "green",
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 10,
    },
    buyButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    
  });