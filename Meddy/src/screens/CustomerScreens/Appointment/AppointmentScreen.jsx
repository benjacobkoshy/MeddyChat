import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { Layout, Text, Input, Spinner, useTheme } from "@ui-kitten/components";
import { AuthContext } from "../../../context/AuthContext";
import ImageViewing from 'react-native-image-viewing';
import Snackbar from "react-native-snackbar";

export default function AppointmentScreen({navigation}) {
  const theme = useTheme();
  const { fetchWithAuth } = useContext(AuthContext);

  const [currentImage, setCurrentImage] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetchWithAuth(`appointment/doctors/?name=${searchQuery}`, {
          method: "GET",
        });
    
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          throw new Error(`Unexpected response format: ${errorText}`);
        }
    
        const doctorData = await response.json();
        setDoctors(doctorData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, [searchQuery]);

  const SearchIcon = (props) => (
    <Icon {...props} name="search" size={20} color={theme['text-hint-color']} />
  );

  if (isLoading) return (
    <Layout style={[styles.loader, {backgroundColor: theme['background-basic-color-1']}]}>
      <Spinner size='giant'/>
    </Layout>
  );

  return (
    <Layout style={{ flex: 1, backgroundColor: theme['background-basic-color-1'] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          style={[styles.container, {backgroundColor: theme['background-basic-color-1']}]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search doctors by name or specialization..."
              accessoryLeft={SearchIcon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              appearance="ghost"
            />
          </View>

          {searchQuery && (
            <View style={styles.filterContainer}>
              <Text category="s1" appearance="hint">{doctors.length} Doctors Found</Text>
              <TouchableOpacity style={[styles.filterButton, {backgroundColor: theme['color-primary-500']}]}>
                <Icon name="sliders" size={20} color={theme['text-control-color']} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.doctorContainer}>
            {doctors.map((doctor, index) => (
              <View 
                key={index} 
                style={[
                  styles.doctorCard,
                  {backgroundColor: theme['background-basic-color-2'], 
                  borderColor: theme['border-basic-color-3']}
                ]}
              >
                <View style={styles.doctorDetailsContainer}>
                  {console.log("Doctor image:",doctor.image)}
                  {doctor.image ? (
                    <TouchableOpacity onPress={() => { 
                      setCurrentImage([{ uri: doctor.image }]); 
                      setVisible(true); 
                    }}>
                      <Image
                        source={{ uri: doctor.image }}
                        style={styles.doctorImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Icon 
                      name="user-circle" 
                      size={80} 
                      color={theme['text-hint-color']} 
                      style={styles.doctorImage} 
                    />
                  )}
                  <View style={styles.doctorDetails}>
                    <Text category="h6">Dr. {doctor.name}</Text>
                    <Text category="s2" appearance="hint">{doctor.specialization}</Text>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={16} color={theme['color-warning-500']} />
                      <Text category="s2" style={{marginLeft: 5}}>4.5</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.bookingContainer, {borderColor: theme['border-basic-color-3']}]}>
                  <View>
                    <Text category="s2">Available</Text>
                    <Text category="label" appearance="hint">Video Consultation</Text>
                  </View>
                  <View style={[styles.divider, {backgroundColor: theme['border-basic-color-3']}]}></View>
                  <View>
                    <Text category="s2">Consultation Fee</Text>
                    <Text category="h6">₹{doctor.consultation_fee}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.bookButton, {backgroundColor: theme['color-success-500']}]}
                  onPress={() => navigation.navigate('New Appointment', {id: doctor.id})}
                >
                  <Text category="label" status="control">make an appointment</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <ImageViewing 
          images={currentImage} 
          imageIndex={0} 
          visible={visible} 
          onRequestClose={() => setVisible(false)}
          backgroundColor={theme['background-basic-color-1']}
        />
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
  searchContainer: {
    marginVertical: 8,
  },
  searchInput: {
    borderRadius: 24,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  filterButton: {
    borderRadius: 24,
    padding: 10,
  },
  doctorContainer: {
    marginTop: 8,
  },
  doctorCard: {
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
    marginTop: 4,
  },
  bookingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
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
    marginTop: 12,
  },
});