import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Layout, Text, Card, Divider, Icon, Button, Spinner } from '@ui-kitten/components';
import Snackbar from "react-native-snackbar";
import { AuthContext } from '../../../context/AuthContext';

export default function BuyPrescribedMedicine({ navigation, route }) {
    const {fetchWithAuth} = useContext(AuthContext);
    const { appointment } = route.params;
    // const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [availableProducts, setAvailableProducts] = useState([]);

useEffect(() => {
    const fetchAvailableProducts = async () => {
        try {
            const response = await fetchWithAuth("appointment/available_products/");
            const data = await response.json();
            if (response.ok) {
                setAvailableProducts(data.products.map(p => p.id)); // Store only product IDs
            } else {
                throw new Error("Failed to fetch available products.");
            }
        } catch (error) {
            console.error("Error fetching available products:", error);
        }finally{
            setIsLoading(false);
        }
    };

    fetchAvailableProducts();
}, []);

const isAvailable = (productID) => availableProducts.includes(productID);

    // Add a single medicine to cart
    const addToCart = async (medicine_id,medicine_quantity) => {
        console.log(medicine_id,medicine_quantity);
        try {
            const response = await fetchWithAuth(`product/add-to-cart/${medicine_id}/${medicine_quantity}/`, {
              method: 'POST',
              body: JSON.stringify({ medicine_quantity }),
              headers: { 'Content-Type': 'application/json' },
            });
      
            const result = await response.json();
      
            if (response.ok) {
              Snackbar.show({
                text: result.message,
                duration: Snackbar.LENGTH_SHORT,
                textColor: '#FFFFFF',
                backgroundColor: '#4CAF50',
              });
            } else {
              throw new Error(result.error || 'Failed to add to cart');
            }
          } catch (error) {
            console.error('Error in adding to cart:', error);
            Snackbar.show({
              text: 'Failed to add product to cart.',
              duration: Snackbar.LENGTH_SHORT,
              textColor: '#FFFFFF',
              backgroundColor: '#F44336',
            });
          }
    };

    // Add all available medicines to cart
    const addAllToCart = async () => {
        const availableMedicines = appointment.prescriptions.filter(p => isAvailable(p.product));
    
        if (availableMedicines.length === 0) {
            Snackbar.show({
                text: "No available medicines to add.",
                duration: Snackbar.LENGTH_SHORT,
                textColor: '#FFFFFF',
                backgroundColor: '#F44336',
            });
            return;
        }
    
        try {
            // Use Promise.all to send all requests in parallel
            await Promise.all(availableMedicines.map(med => addToCart(med.product, med.quantity)));
    
            Snackbar.show({
                text: "All available medicines added to cart!",
                duration: Snackbar.LENGTH_SHORT,
                textColor: '#FFFFFF',
                backgroundColor: '#4CAF50',
            });
        } catch (error) {
            console.error("Error adding all products to cart:", error);
            Snackbar.show({
                text: "Failed to add all products to cart.",
                duration: Snackbar.LENGTH_SHORT,
                textColor: '#FFFFFF',
                backgroundColor: '#F44336',
            });
        }
    };
    

    
    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

    return (
        <Layout style={styles.container}>
            <Text category="h5" style={styles.header}>Prescribed Medicines</Text>
            <ScrollView>
                {appointment.prescriptions.map((medicine, index) => (
                    <Card key={index} style={styles.card}>
                        <View style={styles.row}>
                            <Text category="s1">{medicine.product_name}</Text>
                            <Text category="label">Quantity: {medicine.quantity}</Text>
                            <Text category="label">Dosage: {medicine.dosage || "N/A"}</Text>
                            {isAvailable(medicine.product) ? (
                                <Button 
                                    size="small" 
                                    onPress={() => addToCart(medicine.product,medicine.quantity)}
                                    accessoryLeft={<Icon name="shopping-cart" fill="white" />}
                                >
                                    Add to Cart
                                </Button>
                            ) : (
                                <Text style={styles.unavailableText}>Not Available</Text>
                            )}
                        </View>
                    </Card>
                ))}
            </ScrollView>

            {/* Buy All Button */}
            <TouchableOpacity style={styles.buyAllButton} onPress={addAllToCart}>
                <Text style={styles.buyAllText}>Buy All Available Medicines</Text>
                <Icon name="shopping-cart" fill="white" style={styles.icon} />
            </TouchableOpacity>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
    },
    card: {
        marginVertical: 8,
        padding: 10,
    },
    row: {
        flexDirection: "column",
        justifyContent: "space-between",
    },
    unavailableText: {
        color: "red",
        fontSize: 14,
    },
    buyAllButton: {
        flexDirection: "row",
        backgroundColor: "#6200ea",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        margin: 16,
    },
    buyAllText: {
        color: "white",
        fontSize: 16,
        marginRight: 8,
    },
    icon: {
        width: 24,
        height: 24,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
  
});

