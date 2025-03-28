import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  Alert
} from "react-native";
import { Layout, Text, Card, Button, Icon, useTheme, Spinner } from "@ui-kitten/components";
import Snackbar from "react-native-snackbar";
import { AuthContext } from "../../../context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";


const MedicineAutocomplete = ({ value, options, onSelect, onChangeText }) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = options.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, options]);

  return (
    <View style={styles.autocompleteContainer}>
      <TextInput
        style={[styles.autocompleteInput, {
          color: theme['text-basic-color'],
          backgroundColor: theme['background-basic-color-2'],
          borderColor: theme['border-basic-color-4'],
        }]}
        placeholder="Search medicine..."
        placeholderTextColor={theme['text-hint-color']}
        value={inputValue}
        onChangeText={(text) => {
          setInputValue(text);
          onChangeText(text);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <View style={[styles.suggestionsContainer, {
          backgroundColor: theme['background-basic-color-2'],
          borderColor: theme['border-basic-color-4'],
        }]}>
          <ScrollView>
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.id.toString()}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, {
                  borderBottomColor: theme['border-basic-color-4'],
                }]}
                onPress={() => {
                  onSelect(item);
                  setInputValue(item.name);
                  setShowSuggestions(false);
                }}
              >
                <Text style={{ color: theme['text-basic-color'] }}>{item.name}</Text>
                <Text style={{ color: theme['text-hint-color'] }}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function PrescriptionScreen({ appointment }) {
  const theme = useTheme();
  // const { appointment } = route.params;
  const { fetchWithAuth } = useContext(AuthContext);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetchWithAuth("appointment/available_products/");
      const data = await response.json();
      if (response.ok) {
        setAvailableProducts(data.products);
      } else {
        throw new Error("Failed to fetch available products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }finally{
        setIsLoading(false);
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { 
      product_id: null, 
      custom_medicine_name: "", 
      dosage: "", 
      quantity: "1" 
    }]);
  };

  const updatePrescription = (index, key, value) => {
    const updated = [...prescriptions];
    updated[index][key] = value;
    
    // Clear complementary field when setting value
    if (key === 'product_id') {
      updated[index].custom_medicine_name = '';
    }
    if (key === 'custom_medicine_name') {
      updated[index].product_id = null;
    }
    
    setPrescriptions(updated);
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const savePrescription = async () => {
    if(prescriptions===''){
        Alert.alert('Complete fields');
        return;
    }
    try {
      const response = await fetchWithAuth(`doctor/save_prescription/${appointment.id}/prescribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: prescriptions }),
      });

      const result = await response.json();
      if (response.ok) {
        Snackbar.show({ text: result.message, duration: Snackbar.LENGTH_SHORT, backgroundColor: "#4CAF50" });
      } else {
        throw new Error(result.error || "Failed to save prescription");
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      Snackbar.show({ text: "Failed to save prescription.", duration: Snackbar.LENGTH_SHORT, backgroundColor: "#F44336" });
    }
  };


  
    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;



  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.flex}
      >
        

        <FlatList
          data={prescriptions}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item, index }) => {
            const displayName = item.product_id 
              ? availableProducts.find(p => p.id === item.product_id)?.name 
              : item.custom_medicine_name;

            return (
              <>
                <Text 
                    category="h5" 
                    style={[styles.header, { color: theme['text-basic-color'] }]}
                >
                    Prescribe Medicines for {appointment.patient.name}
                </Text>
                <Card style={[styles.medicineCard, { 
                backgroundColor: theme['background-basic-color-2'] 
              }]}>
                <View style={styles.medicineRow}>
                  <MedicineAutocomplete
                    style={[styles.input, {
                        color: theme['text-basic-color'],
                        backgroundColor: theme['background-basic-color-2'],
                        borderColor: theme['border-basic-color-4'],
                      }]}
                    value={displayName}
                    options={availableProducts}
                    onSelect={(selectedItem) => {
                      updatePrescription(index, 'product_id', selectedItem.id);
                    }}
                    onChangeText={(text) => {
                      updatePrescription(index, 'custom_medicine_name', text);
                    }}
                  />
                  <TextInput
                    style={[styles.input, {
                      color: theme['text-basic-color'],
                      backgroundColor: theme['background-basic-color-2'],
                      borderColor: theme['border-basic-color-4'],
                    }]}
                    placeholder="Dosage"
                    placeholderTextColor={theme['text-hint-color']}
                    value={item.dosage}
                    onChangeText={(text) => updatePrescription(index, 'dosage', text)}
                  />
                  <TextInput
                    style={[styles.input, {
                      color: theme['text-basic-color'],
                      backgroundColor: theme['background-basic-color-2'],
                      borderColor: theme['border-basic-color-4'],
                    }]}
                    placeholder="Qty"
                    placeholderTextColor={theme['text-hint-color']}
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(text) => updatePrescription(index, 'quantity', text)}
                  />
                  <TouchableOpacity onPress={() => removePrescription(index)}>
                    <Icon name="close" fill={theme['color-danger-500']} style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </Card>
              </>
            )
          }}
        />

        <View style={styles.buttonGroup}>
          <Button
            style={styles.button}
            accessoryLeft={<Icon name="plus-outline"/>}
            onPress={addPrescription}
          >
            Add Medicine
          </Button>
          <Button
            style={styles.button}
            accessoryRight={<Icon name="checkmark-outline"/>}
            onPress={savePrescription}
          >
            Save Prescription
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  flex: { flex: 1 },
  header: { textAlign: "center", marginVertical: 16, fontWeight: "600" },
  medicineCard: { 
    marginBottom: 12, 
    borderRadius: 8,
    padding: 10,
    width: '100%' 
},
  medicineRow: {
    // flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autocompleteContainer: { 
    flex: 1, width: '100%' 
},
  autocompleteInput: { 
    borderWidth: 1, 
    borderRadius: 4,
    padding: 12, 
    fontSize: 16 
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 4,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 9999,
    minWidth: '100%'
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    width: '50%',
  },
  buttonGroup: {
    gap: 8,
    marginTop: 16,
    paddingBottom: 24
  },
  icon: { width: 24, height: 24 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


});