import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import React, { useContext, useCallback, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { Layout, Text, Spinner, useTheme } from "@ui-kitten/components";
import { AuthContext } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";

export default function MyOldAppointments({ navigation }) {
  const theme = useTheme();
  const { fetchWithAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchAppointments = async () => {
        try {
          const response = await fetchWithAuth(`appointment/get_old_appointment/`, {
            method: "GET",
          });
  
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            throw new Error(`Unexpected response format: ${errorText}`);
          }
  
          const appointmentData = await response.json();
          setAppointments(appointmentData);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchAppointments();
    }, [])
  );

  if (isLoading) return (
    <Layout style={[styles.loader, { backgroundColor: theme['background-basic-color-1'] }]}>
      <Spinner size='giant' />
    </Layout>
  );

  return (
    <Layout style={{ flex: 1, backgroundColor: theme['background-basic-color-1'] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}
          showsVerticalScrollIndicator={false}
        >
          {appointments.length === 0 ? (
            <View style={styles.noAppointmentsContainer}>
              <Text category="h6" appearance="hint">No old appointments found</Text>
            </View>
          ) : (
            <View style={styles.appointmentContainer}>
              {appointments.map((appointment, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.appointmentCard,
                    { 
                      backgroundColor: theme['background-basic-color-2'],
                      borderColor: theme['border-basic-color-3']
                    }
                  ]}
                >
                  <View style={styles.doctorDetailsContainer}>
                    {appointment.doctor.image ? (
                      <Image
                        source={{ uri: appointment.doctor.image }}
                        style={styles.doctorImage}
                      />
                    ) : (
                      <Icon 
                        name="user-circle" 
                        size={80} 
                        color={theme['text-hint-color']} 
                        style={styles.doctorImage} 
                      />
                    )}
                    <View style={styles.doctorDetails}>
                      <Text category="h6">Dr. {appointment.doctor.name}</Text>
                      <Text category="s2" appearance="hint">
                        {appointment.doctor.specialization}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <Icon name="star" size={16} color={theme['color-warning-500']} />
                        <Text category="s2" style={{ marginLeft: 4 }}>4.5</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.bookingContainer, { borderColor: theme['border-basic-color-3'] }]}>
                    <View>
                      <Text category="s2">Appointment Date</Text>
                      <Text category="label" appearance="hint">
                        {moment(appointment.slot.date).format('DD MMM YYYY')}
                      </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme['border-basic-color-3'] }]} />
                    <View>
                      <Text category="s2">Appointment Time</Text>
                      <Text category="label">
                        {moment(appointment.slot.time, 'HH:mm:ss').format('hh:mm A')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.bookButton,
                      { backgroundColor: theme['color-success-500'] }
                    ]}
                    onPress={() => {
                      navigation.navigate("Appointment Details", { 
                        "hideTabBar": true, 
                        appointment
                      });
                    }}
                  >
                    <Text category="label" status="control">View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentContainer: {
    marginTop: 16,
  },
  appointmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  doctorDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  bookingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  divider: {
    width: 1,
    height: '100%',
    marginHorizontal: 12,
  },
  bookButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});