import React, { useContext, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SectionList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { Layout, Text, Button, Icon, Spinner } from '@ui-kitten/components';
import moment from 'moment';
// import Snackbar from "react-native-snackbar";

// Map backend day codes to full day names
const DAY_MAP = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday'
};

export default function DoctorAvailabilityScreen({ navigation, route }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const { id } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(null);
  const [day, setDay] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth > 600 ? 4 : 3; // Responsive columns

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetchWithAuth(`appointment/doctor-availability/${id}/`);
        const availabilityData = await response.json();

        // Filter and group available slots by day
        const groupedData = Object.entries(
          availabilityData
            .filter(slot => slot.is_available)
            .reduce((acc, slot) => {
              const day = slot.day;
              if (!acc[day]) acc[day] = [];
              acc[day].push(slot);
              return acc;
            }, {})
        ).map(([day, data]) => ({
          title: DAY_MAP[day], // Convert day code to full name
          data
        }));

        setAvailability(groupedData);
        // console.log(groupedData)
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [id]);

  const handleSlotSelect = async (slotId, day) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
    setDay(day);

    try {
      const response = await fetchWithAuth(`appointment/get_available_slots/${id}/${day}/`);
      const data = await response.json();
      setDate(data.date);

      if (data?.available_slots) {
        const formattedSlots = data.available_slots.map((time, index) => ({
          id: index.toString(),
          time: time,
        }));
        setTimeSlots(formattedSlots);
        console.log(formattedSlots);
      } else {
        setTimeSlots([]);
      }
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const SlotSelectionModal = () => (
    <Modal transparent={true} visible={modalVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text category="h6" style={styles.modalTitle}>Available Slots</Text>
          {timeSlots.length > 0 ? (
            <FlatList
              data={timeSlots}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.slotListContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.slotCard,
                    item.id === selectedSlot && styles.selectedSlotCard
                  ]}
                  onPress={() => {navigation.navigate('Appointment Confirmation', { id, day, date, time: item.time }); setModalVisible(false)}}
                >
                  <Text category="s1" style={[
                    styles.slotTime,
                    item.id === selectedSlot && styles.selectedSlotText
                  ]}>
                    {item.time}
                  </Text>
                  
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text category="s1" style={styles.noSlotsText}>No available slots</Text>
          )}
          <Button style={styles.closeButton} onPress={() => setModalVisible(false)}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text category="s2" style={styles.sectionHeaderText}>
        {title}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.slotItem,
        item.id === selectedSlot && styles.selectedSlot,
        !item.is_available && styles.disabledSlot
      ]}
      onPress={() => item.is_available && handleSlotSelect(item.id, item.day)}
      disabled={!item.is_available}
    >
      <View style={styles.timeContainer}>
        <Text category="p1" style={[
          styles.slotText,
          item.id === selectedSlot && styles.selectedSlotText
        ]}>
          {moment(item.start_time, 'HH:mm:ss').format('h:mm A')} - 
          {moment(item.end_time, 'HH:mm:ss').format('h:mm A')}
        </Text>
        {!item.is_available && (
          <Text category="c1" style={styles.occupiedText}>Occupied</Text>
        )}
      </View>
      {item.is_available && (
        <Icon 
          name={item.id === selectedSlot ? "checkmark-circle-2" : "checkmark-circle-2-outline"}  
          fill={item.id === selectedSlot ? "#4F46E5" : "#94A3B8"}  
          style={styles.checkIcon}  
        />
      )}
    </TouchableOpacity>
  );

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SlotSelectionModal />
        <SectionList
          sections={availability}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text category="s1" style={styles.emptyText}>No available slots for this doctor</Text>
          }
        />
        
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2138', // Dark theme background
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: '#2D3748', // Darker header background
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionHeaderText: {
    color: '#4F46E5', // UI Kitten primary color
    fontWeight: 'bold',
  },
  slotItem: {
    backgroundColor: '#2D3748', // Dark card background
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5568', // Subtle border
  },
  selectedSlot: {
    backgroundColor: '#4F46E5', // Selected slot highlight
    borderColor: '#4338CA',
  },
  slotText: {
    color: '#E2E8F0', // Light text
  },
  selectedSlotText: {
    color: '#FFFFFF', // White text for selected slot
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
  
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94A3B8', // Light gray text
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledSlot: {
    backgroundColor: '#2D3748', // Disabled slot background
    borderColor: '#4A5568',
  },
  occupiedText: {
    color: '#E53E3E', // Red for occupied slots
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#2D3748', // Dark modal background
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    color: '#E2E8F0', // Light text
    marginBottom: 15,
  },
  slotListContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  slotCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#4A5568', // Neutral card background
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5', // Subtle border
  },
  selectedSlotCard: {
    backgroundColor: '#4F46E5', // Selected slot highlight
    borderColor: '#4338CA',
  },
  slotTime: {
    color: '#E2E8F0', // Light text
  },
  noSlotsText: {
    marginVertical: 10,
    color: '#94A3B8', // Light gray text
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4F46E5', // Primary button color
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});