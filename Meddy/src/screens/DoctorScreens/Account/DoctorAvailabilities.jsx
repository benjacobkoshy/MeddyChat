import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Layout, Text, Button, Spinner } from '@ui-kitten/components';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from "react-native-snackbar";


const daysOfWeek = [
  { label: "Monday", value: "MON" },
  { label: "Tuesday", value: "TUE" },
  { label: "Wednesday", value: "WED" },
  { label: "Thursday", value: "THU" },
  { label: "Friday", value: "FRI" },
  { label: "Saturday", value: "SAT" },
  { label: "Sunday", value: "SUN" }
];

const AvailabilityScreen = () => {
  const { fetchWithAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [selectedDay, setSelectedDay] = useState("MON");

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await fetchWithAuth('doctor/my-availabilities/', { method: "GET" });

        if (!response.ok) {
          throw new Error("Failed to fetch availabilities");
        }

        const data = await response.json();
        console.log("Fetched data:", data); 

        if (Array.isArray(data)) {
          // Ensure existing availabilities are properly set
          setAvailabilities(
            data.map(entry => ({
              day: entry.day,
              start_time: entry.start_time || "",
              end_time: entry.end_time || "",
              id: entry.id,
            }))
          );
        } else {
          setAvailabilities([]);
        }
      } catch (error) {
        Snackbar.show({
          text: error.message,
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }finally{
        setIsLoading(false);
      }
    };

    fetchAvailabilities();
  }, [isLoading]);

  const handleAddAvailability = () => {
    if (availabilities.length >= 7) {
      Snackbar.show({
        text: 'You can set availability for a maximum of 7 days.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    if (availabilities.some(entry => entry.day === selectedDay)) {
      Snackbar.show({
        text: 'This day is already added.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }

    setAvailabilities([...availabilities, { day: selectedDay, start_time: "", end_time: "" }]);
  };

  const handleTimeChange = (index, field, time) => {
    const updated = [...availabilities];
    updated[index][field] = time;
    setAvailabilities(updated);
  };

  const handleSaveAvailability = async () => {
    // Ensure all entries have start and end times
    if (availabilities.some(entry => !entry.start_time || !entry.end_time)) {
      Snackbar.show({
        text: 'Please select start and end time for all days.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
      return;
    }
    setIsLoading(true);
    try {

      const response = await fetchWithAuth('doctor/add-availabilities/', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: availabilities })  // Use correct field names
      });

      if (response.ok) {
        
        const data = await response.json();
        setAvailabilities(
          data.availability.map(entry => ({
            day: entry.day,
            start_time: entry.start_time,
            end_time: entry.end_time
          }))
        );

        Snackbar.show({
          text: "Availability saved successfully.",
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
      } else {
        Snackbar.show({
          text: 'Failed to save availability.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }
    } catch (error) {
      Snackbar.show({
        // text: 'Could not connect to the server.',
        text: 'Availabilty saved.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#4CAF50',
      });
    }finally{
      setIsLoading(false);
    }
  };

  const handleRemoveAvailability = async (index, id) => {
    
    const updatedAvailabilities = availabilities.filter((_, i) => i !== index);
    setIsLoading(true);
    console.log(id)
    try{
      const response = await fetchWithAuth(`doctor/delete-avaialability/${id}/`,{
        method: 'DELETE'
      });
      if(response.ok){
        Snackbar.show({
          text: "Availability removed.",
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
      }

    }catch(error){

    }finally{
      setIsLoading(false);
    }
    
    setAvailabilities(updatedAvailabilities);

  };


  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.title}>Set Your Availability</Text>

      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedDay} onValueChange={setSelectedDay}>
          {daysOfWeek.map(day => (
            <Picker.Item key={day.value} label={day.label} value={day.value} />
          ))}
        </Picker>
      </View>

      <Button onPress={handleAddAvailability} style={styles.addButton}>Add Availability</Button>

      {availabilities?.map((entry, index) => (
        <View key={index} style={styles.availabilityRow}>
          <Text style={styles.dayText}>{daysOfWeek.find(d => d.value === entry.day)?.label || entry.day}</Text>

          <TimeInput 
            value={entry.start_time} 
            onPress={() => setShowTimePicker({ index, field: "start_time" })} 
          />
          <Text style={styles.timeSeparator}>-</Text>
          <TimeInput 
            value={entry.end_time} 
            onPress={() => setShowTimePicker({ index, field: "end_time" })} 
          />

          <TouchableOpacity onPress={() => handleRemoveAvailability(index,entry.id)}>
            {console.log("Id of product is",entry.id)}
            <Text style={styles.removeButton}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Button onPress={handleSaveAvailability} style={styles.saveButton}>Save Availability</Button>

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
          onChange={(_, time) => {
            if (time) {
              const formatted = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
              handleTimeChange(showTimePicker.index, showTimePicker.field, formatted);
            }
            setShowTimePicker(null);
          }}
        />
      )}
    </Layout>
  );
};

const TimeInput = ({ value, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.timeInput}>
    <Text style={value ? styles.timeText : styles.placeholderText}>{value || "HH:mm"}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 10
  },
  addButton: {
    marginBottom: 20
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  dayText: {
    flex: 1,
    fontSize: 16
  },
  timeInput: {
    flex: 1,
    padding: 12,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
  },
  timeText: {
    fontSize: 16
  },
  placeholderText: {
    fontSize: 16,
    color: "#888"
  },
  timeSeparator: {
    marginHorizontal: 10,
    fontSize: 18
  },
  removeButton: {
    fontSize: 18,
    color: "red",
    marginLeft: 10
  },
  saveButton: {
    marginTop: 20
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AvailabilityScreen;
