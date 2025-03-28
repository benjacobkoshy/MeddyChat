import React, { useContext, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Layout, Text, Card, Divider, Icon, useTheme, Spinner } from '@ui-kitten/components';
import { AuthContext } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Snackbar from "react-native-snackbar";


export default function OrderScreen() {
  const { fetchWithAuth } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme(); // Access the current theme

  useFocusEffect(
    useCallback(() => {
      const fetchOrderData = async () => {
        try {
          const response = await fetchWithAuth('product/list-order/', {
            method: "GET",
          });

          if (response.ok) {
            const orderData = await response.json();
            setOrders(orderData);
            console.log(orderData);
          } else {
            console.error("Failed to fetch orders");
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderData();
    }, [])
  );

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  
  if(orders.length===0){
    return (
        <Layout style={styles.emptyContainer}>
            <Icon name="shopping-bag-outline" size={50} color="#888" />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </Layout>
        );
  }

  const renderOrderItem = (order) => (
    <Card key={order.id} style={[styles.card, { backgroundColor: theme['color-basic-800'] }]}> 
      <View style={styles.orderHeader}>
        {/* <Text category="h6" style={{ color: theme['color-basic-100'] }}>Order #{order.id}</Text> */}
        <Text category="s2" appearance="hint" style={{ color: theme['color-basic-300'] }}>
          {new Date(order.created_at).toDateString()}
        </Text>
      </View>
      <Divider style={[styles.divider, { backgroundColor: theme['color-basic-600'] }]} />
      <View style={styles.orderDetails}>
        <View style={styles.row}>
          <Icon name="shopping-bag-outline" fill={theme['color-basic-100']} style={styles.icon} />
          <Text category="s1" style={{ color: theme['color-basic-100'] }}>Status:</Text>
          <Text category="s2" style={{ color: theme['color-basic-300'] }}>{order.status}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="credit-card-outline" fill={theme['color-basic-100']} style={styles.icon} />
          <Text category="s1" style={{ color: theme['color-basic-100'] }}>Total Price:</Text>
          <Text category="s2" style={{ color: theme['color-basic-300'] }}>₹{order.total_price}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="cube-outline" fill={theme['color-basic-100']} style={styles.icon} />
          <Text category="s1" style={{ color: theme['color-basic-100'] }}>Products:</Text>
          <Text category="s2" style={{ color: theme['color-basic-300'] }}>
            {order.products.length} items
          </Text>
        </View>
        {order.products.map((product) => (
          <View key={product.id} style={styles.productItem}>
            <Image source={{ uri: product.product_image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text category="s1" style={{ color: theme['color-basic-100'] }}>{product.product_name}</Text>
              <Text category="s2" style={{ color: theme['color-basic-300'] }}>₹{product.product_price}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

 
  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {orders.length > 0 ? (
          orders.map(renderOrderItem)
        ) : (
          <Text category="h6" style={[styles.noOrders, { color: theme['color-basic-300'] }]}>No orders found</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#121212',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  orderDetails: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  noOrders: {
    textAlign: 'center',
    marginTop: 20,
  },
});
