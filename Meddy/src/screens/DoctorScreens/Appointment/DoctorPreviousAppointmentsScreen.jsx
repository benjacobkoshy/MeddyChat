import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Layout, Text, Card, Divider, Icon, Spinner } from "@ui-kitten/components";
import { AuthContext } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Badge } from "react-native-paper";
import Snackbar from "react-native-snackbar";
import moment from "moment";


export default function DoctorPreviousAppointmentsScreen({ navigation }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useFocusEffect(
    useCallback(() => {
      const fetchPreviousAppointments = async () => {
        try {
          const response = await fetchWithAuth("doctor/previous-appointments/", {
            method: "GET",
          });
  
          if (response.ok) {
            const appointmentsData = await response.json();
            console.log("Previous appointments ",appointmentsData);
            setAppointments(appointmentsData);
          } else {
            Snackbar.show({
              text: 'Failed to fetch previous appointments.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: '#FFFFFF',
              backgroundColor: '#F44336',
            });
          }
        } catch (error) {
          Snackbar.show({
            text: 'Error fetching previous appointments.',
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#F44336',
          });
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchPreviousAppointments();
    },[])
  );
  

  const handleCardPress = (appointment) => {
    navigation.navigate("Appointment Details", { appointment });
  };


  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Card key={appointment.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text category="h6" style={styles.patientName}>
                      {appointment.patient.name}
                    </Text>
                    <Badge
                      status={appointment.status === "completed" ? "success" : "warning"}
                      style={[styles.badge,{backgroundColor: appointment.status==='completed'?'green':'red'}]}
                    >
                      {appointment.status.toUpperCase()}
                    </Badge>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <Icon name="calendar-outline" fill="#3366FF" style={styles.icon} />
                      <Text category="s2" appearance="hint">
                      {moment(appointment.slot.date).format('DD MMM YYYY')} | {moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="thermometer-outline" fill="#3366FF" style={styles.icon} />
                      <Text category="s2" appearance="hint">
                        Symptoms: {appointment.symptoms || "Not specified"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate("Previous Appointment Details", { appointment })}
                  >
                    <Text style={styles.bookButtonText}>View Details</Text>
                  </TouchableOpacity>
                </Card>
              ))
            ) : (
              <Text style={styles.noAppointments}>No upcoming appointments</Text>
            )}
          </ScrollView>
        </Layout>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
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
        marginVertical: 8,
        borderRadius: 12,
        // backgroundColor: "white",
        // shadowColor: "#fff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: .2,
        borderColor: "#fff"
      },
      cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      },
      patientName: {
        fontWeight: "bold",
        color: "#3366FF",
      },
      badge: {
        paddingHorizontal: 8,
        // paddingVertical: 4,
        borderRadius: 12,
      },
      divider: {
        marginVertical: 8,
        backgroundColor: "#E0E0E0",
      },
      cardBody: {
        marginTop: 8,
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
      noAppointments: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666",
      },
      bookButton: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#3366FF",
        borderRadius: 8,
        alignItems: "center",
      },
      bookButtonText: {
        color: "white",
        fontWeight: "bold",
      },
    });