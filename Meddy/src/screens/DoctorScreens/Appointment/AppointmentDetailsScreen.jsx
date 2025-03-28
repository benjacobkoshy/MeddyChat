import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import { Layout, Text, Card, Divider, Icon, Spinner } from "@ui-kitten/components";
import moment from "moment";
import Snackbar from "react-native-snackbar";


export default function AppointmentDetailsScreen({ navigation, route }) {
  const { appointment } = route.params;
  // console.log("Appointment details screen",appointment);
  // console.log("Appointment details",appointment);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");

  // const [isLoading, setIsLoading] = useState(true);


  const formatDate = (dateString) => new Date(dateString).toDateString();
  const formatTime = (timeString) => timeString.slice(0, 5); // Remove seconds

  useEffect(() => {
    checkConsultationStatus();
    const interval = setInterval(() => {
      checkConsultationStatus();
    }, 1000); // Update every second

    return () => clearInterval(interval);
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
              <Text category="s2" appearance="hint">{moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}</Text>
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

          {/* Reason */}
          <View style={styles.section}>
            <Text category="h6" style={styles.sectionHeader}>See previous medical history</Text>
            <TouchableOpacity onPress={() => {navigation.navigate('Patient Medical History', { appointment })}}>
              <Text category="s2" appearance="hint" style={{color: "green"}} >Click here to see previous medical history</Text>
            </TouchableOpacity>
          </View>

          {/* Consultation Button */}
          <TouchableOpacity
            style={[
              styles.consultButton,
              { backgroundColor: isConsultationActive ? "#28A745" : "#A0A0A0" },
            ]}
            disabled={!isConsultationActive}
            onPress={() => {navigation.navigate("Consultation",{appointment, 'role':'doctor' })}}
          >
            <Icon name="video-outline" fill="white" style={styles.icon} />
            <View>
              <Text style={{ color: "white", marginLeft: 10 }}>
                {isConsultationActive ? "Start Consultation" : "Consultation Inactive"}
              </Text>
              {!isConsultationActive && (
                <Text style={{ color: "white", fontSize: 12, marginLeft: 10 }}>
                  {remainingTime}
                </Text>
              )}
            </View>
          </TouchableOpacity>


          <View style={styles.section}>
            <Text category="h6" style={styles.sectionHeader}>Prescribe Medicines</Text>
            <TouchableOpacity onPress={() => {navigation.navigate('Prescribe Medicine', { appointment})}}>
              <Text category="s2" appearance="hint">Prescribe Medicine</Text>
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