import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import { Layout, Text, Card, Divider, Icon, Spinner, useTheme } from "@ui-kitten/components";
import Snackbar from "react-native-snackbar";
import { AuthContext } from "../../../context/AuthContext";
import moment from "moment"; // Add moment for date formatting

const MedicalRecordItem = ({ record }) => {
  const theme = useTheme();

  return (
    <View style={[styles.recordContainer, { backgroundColor: theme['background-basic-color-2'] }]}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Icon name="calendar" fill={theme['color-primary-500']} style={styles.icon} />
        <Text category="s2" style={styles.dateText}>
          {moment(record.slot.date).format('DD MMM YYYY')} • {moment(record.slot.time, 'HH:mm:ss').format('hh:mm A')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: record.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{record.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Diagnosis Highlight */}
      {record.diagnosis && (
        <View style={styles.diagnosisContainer}>
          <Icon name="activity" fill={theme['color-danger-500']} style={styles.icon} />
          <Text category="s1" style={[styles.diagnosisText, { color: theme['color-danger-500'] }]}>
            Diagnosis: {record.diagnosis}
          </Text>
        </View>
      )}

      {/* Clinical Details */}
      <View style={styles.detailSection}>
        <DetailItem icon="thermometer" title="Symptoms" value={record.symptoms} />
        <DetailItem icon="file-text" title="Reason for Visit" value={record.reason} />
        <DetailItem icon="edit-2" title="Prescription" value={record.prescription} />
      </View>

      {/* Doctor Details */}
      <View style={styles.doctorContainer}>
        <Icon name="person" fill={theme['color-primary-500']} style={styles.icon} />
        <View>
          <Text category="label">Consulted Doctor:</Text>
          <Text category="s2">{record.doctor.name}</Text>
          <Text appearance="hint" category="c1">{record.doctor.specialization}</Text>
        </View>
      </View>
    </View>
  );
};

const DetailItem = ({ icon, title, value }) => {
  const theme = useTheme();
  
  return value ? (
    <View style={styles.detailRow}>
      <Icon name={icon} fill={theme['color-primary-500']} style={styles.smallIcon} />
      <View style={styles.detailText}>
        <Text category="label" appearance="hint">{title}:</Text>
        <Text category="s2">{value}</Text>
      </View>
    </View>
  ) : null;
};

export default function PatientMedicalHistory({ route, navigation }) {
    const {fetchWithAuth} = useContext(AuthContext);
    const { appointment } = route.params;
    console.log("Appointment data",appointment)
    const [isLoading, setIsLoading] = useState(true);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const theme = useTheme();


    useEffect(() => {
        fetchMedicalHistory();
    }, []);

    const fetchMedicalHistory = async () => {
        try {
            const response = await fetchWithAuth(
                `doctor/patient-medical-history/${appointment.patient.id}/`, 
                { method: "GET" }
            );

            if (response.ok) {
                const result = await response.json();
                setMedicalHistory(result);  // Store the entire result
                console.log("Patient medical history",result);
            } else {
                throw new Error("Failed to fetch");
            }
        } catch (error) {
            console.error("Error fetching medical history:", error);
            Snackbar.show({
                text: "An error occurred. Please try again later.",
                duration: Snackbar.LENGTH_SHORT,
                textColor: "#FFFFFF",
                backgroundColor: "#F44336",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

    if(medicalHistory.length===0){
        return(
            <Layout style={styles.container}>
                <Text>No medical history found.</Text>
            </Layout>
        )
    }


  const sortedHistory = [...medicalHistory].sort((a, b) => 
    new Date(b.slot.date) - new Date(a.slot.date)
  );

  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Patient Summary Header */}
        <Card style={styles.patientSummary}>
          <Text category="h6" style={styles.summaryHeader}>Patient Summary</Text>
          <View style={styles.summaryRow}>
            <Text category="s2">Name: {appointment.patient.name}</Text>
            <Text category="s2">Age: {appointment.patient_age || 'N/A'}</Text>
            <Text category="s2">Blood Group: {appointment.patient.blood_group || 'N/A'}</Text>
          </View>
        </Card>

        {/* Medical Records */}
        {sortedHistory.map((record, index) => (
          <MedicalRecordItem key={index} record={record} />
        ))}

        {medicalHistory.length === 0 && (
          <Card style={styles.emptyState}>
            <Icon name="file-remove" fill="#BDBDBD" style={styles.emptyIcon} />
            <Text category="s1" appearance="hint">No medical records found</Text>
          </Card>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16, gap: 12 },
  patientSummary: {
    borderRadius: 8,
    marginBottom: 16
  },
  summaryHeader: {
    marginBottom: 8,
    color: '#3366FF',
    fontWeight: 'bold'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  recordContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  diagnosisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12
  },
  diagnosisText: {
    fontWeight: 'bold',
    marginLeft: 8
  },
  detailSection: {
    gap: 8,
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  detailText: {
    flex: 1
  },
  doctorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  icon: {
    width: 20,
    height: 20
  },
  smallIcon: {
    width: 16,
    height: 16,
    marginTop: 2
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto'
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 16
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});