import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { Layout, Text, Card, Icon, Spinner, useTheme } from "@ui-kitten/components";
import Snackbar from "react-native-snackbar";
import { AuthContext } from "../../../context/AuthContext";
import moment from "moment";

const MedicalRecordItem = ({ record }) => {
  const theme = useTheme();

  return (
    <View style={[styles.recordContainer, { backgroundColor: theme['background-basic-color-2'] }]}>      
      <View style={styles.headerRow}>
        <Icon name="calendar" fill={theme['color-primary-500']} style={styles.icon} />
        <Text category="s2" style={styles.dateText}>
          {moment(record.slot.date).format('DD MMM YYYY')} • {moment(record.slot.time, 'HH:mm:ss').format('hh:mm A')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: record.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{record.status.toUpperCase()}</Text>
        </View>
      </View>
      
      {record.diagnosis && (
        <View style={styles.diagnosisContainer}>
          <Icon name="activity" fill={theme['color-danger-500']} style={styles.icon} />
          <Text category="s1" style={[styles.diagnosisText, { color: theme['color-danger-500'] }]}>Diagnosis: {record.diagnosis}</Text>
        </View>
      )}
      
      <View style={styles.detailSection}>
        <DetailItem icon="thermometer" title="Symptoms" value={record.symptoms} />
        <DetailItem icon="file-text" title="Reason for Visit" value={record.reason} />
        <DetailItem icon="edit-2" title="Prescription" value={record.prescription} />
      </View>
      
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

export default function MedicalReportScreen() {
  const { fetchWithAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      const response = await fetchWithAuth("home/customer-medical-report/", { method: "GET" });
      if (response.ok) {
        const result = await response.json();
        setMedicalHistory(result);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      Snackbar.show({ text: "Error fetching medical history", duration: Snackbar.LENGTH_SHORT, backgroundColor: "#F44336" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;
  if (medicalHistory.length === 0) return <Layout style={styles.container}><Text>No medical history found.</Text></Layout>;

  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {medicalHistory.map((record, index) => <MedicalRecordItem key={index} record={record} />)}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16, gap: 12 },
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  diagnosisContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 8, borderRadius: 4, marginBottom: 12 },
  diagnosisText: { fontWeight: 'bold', marginLeft: 8 },
  detailSection: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailText: { flex: 1 },
  doctorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  icon: { width: 20, height: 20 },
  smallIcon: { width: 16, height: 16, marginTop: 2 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 'auto' },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});