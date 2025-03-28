import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { Layout, Text, Card, Divider, Spinner, Icon } from '@ui-kitten/components';
import { Badge } from 'react-native-paper';
import moment from 'moment';
// import Snackbar from "react-native-snackbar";


export default function MyAppointmentDetailsScreen({ route, navigation }) {
  const { appointment } = route.params;

  const formatDate = (dateString) => new Date(dateString).toDateString();
  const formatTime = (timeString) => timeString.slice(0, 5); // Remove seconds

  const { fetchWithAuth } = useContext(AuthContext);
  // const [appointment, setappointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {

      if(!isLoading){
          checkConsultationStatus();
        const interval = setInterval(() => {
          checkConsultationStatus();
        }, 1000); // Update every second
    
        return () => clearInterval(interval);
      }
      
    }, []);
  
    const checkConsultationStatus = () => {
      const now = moment();
      const appointmentDateTime = moment(
        `${appointment.slot.date} ${appointment.slot.time}`,
        "YYYY-MM-DD HH:mm:ss"
      );
    
      const startTime = moment(appointment.slot.time, "HH:mm:ss");
      const endTime = startTime.clone().add(
        appointment.doctor.consultation_duration,
        "minutes"
      );
    
      if (now.isBetween(startTime, endTime)) {
        setIsConsultationActive(true);
        setRemainingTime("Consultation is Active");
      } else {
        setIsConsultationActive(true);
        if (now.isBefore(appointmentDateTime)) {
          const diff = moment.duration(appointmentDateTime.diff(now));
          setRemainingTime(
            `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s remaining`
          );
        } else {
          setRemainingTime("Consultation has ended");
        }
      }
    };

  const renderBadge = (status, type) => {
    let color = 'gray';
    if (type === 'status') color = status === 'pending' ? 'orange' : 'green';
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
            <View style={styles.row}><Text category='s1'>Date:</Text><Text category='s2'>{formatDate(appointment.slot.date)}</Text></View>
            <View style={styles.row}><Text category='s1'>Time:</Text><Text category='s2'>{moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}</Text></View>
          </View>
          
          <Divider style={styles.divider} />
          <View style={styles.section}>
            <Text category='h6' style={styles.subHeader}>Patient Information</Text>
            <View style={styles.row}><Text category='s1'>Name:</Text><Text category='s2'>{appointment.patient.name}</Text></View>
            <View style={styles.row}><Text category='s1'>Contact:</Text><Text category='s2'>{appointment.patient.phone_number}</Text></View>
          </View>

          <Divider style={styles.divider} />
          <View style={styles.prescriptionContainer}>
            {/* {console.log("Appintment data passing to pdf",appointment)} */}
            <TouchableOpacity onPress={() => navigation.navigate("Generate PDF", { appointment })} disabled={appointment.status==='completed'? false : true}>
              <Text style={appointment.status==='completed'?{color: "#green"}: {color: "#ccc"}}>Download Prescription</Text>
            </TouchableOpacity>
            
          </View>

          <TouchableOpacity
            style={[
              styles.consultButton,
              { backgroundColor: isConsultationActive ? "#28A745" : "#A0A0A0" },
            ]}
            disabled={!isConsultationActive}
            onPress={() => {navigation.navigate('Consultation',{appointment, 'role':'user'})}}
          >
            <View style={styles.consultButtonContent}>
              <Icon name="video-outline" fill="white" style={styles.icon} />
              <View>
                <Text style={styles.consultButtonText}>
                  {isConsultationActive ? "Start Consultation" : "Consultation Inactive"}
                </Text>
                {!isConsultationActive && (
                  <Text style={styles.consultButtonSubText}>{remainingTime}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>


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
    backgroundColor: "#222B45"
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
  consultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  consultButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  consultButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  consultButtonSubText: {
    color: "white",
    fontSize: 12,
  },
  
});

