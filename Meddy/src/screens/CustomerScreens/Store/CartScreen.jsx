import { StyleSheet, View, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import Icon from 'react-native-vector-icons/Ionicons';
import { Layout, Text, Button, useTheme, Spinner } from '@ui-kitten/components';

export default function CartScreen({ navigation }) {
  const { fetchWithAuth, API_BASE_URL } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [cartChanged, setCartChanged] = useState(false); // State to track cart changes
  const theme = useTheme(); // Access the current theme

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const response = await fetchWithAuth(`product/list-cart-products/`, {
          method: 'GET',
        });

        if (response.ok) {
          const result = await response.json();
          setData(result.cart_products);

          // Calculate total price
          const total = result.cart_products.reduce(
            (sum, item) => sum + parseFloat(item.product_price) * item.quantity,
            0
          );
          setTotalPrice(total);

          // Calculate original price
          const orginal_price = result.cart_products.reduce(
            (sum, item) => sum + parseFloat(item.product_original_price) * item.quantity,
            0
          );
          setOriginalPrice(orginal_price);
        }
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartProducts();
  }, [cartChanged]); // Re-fetch when cart changes

  const removeFromCart = async (productId, quantity) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`product/add-to-cart/${productId}/${quantity}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        setCartChanged(!cartChanged); // Toggle the state to trigger re-fetching

        Snackbar.show({
          text: result.message,
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
      } else {
        const errorData = await response.json();
        Snackbar.show({
          text: errorData.error || 'An error occurred.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#F44336',
        });
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (data.length === 0) {
      return (
        <Layout style={styles.emptyContainer}>
          <Icon name="cart-outline" size={50} color="#888" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          
        </Layout>
      );
    }

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: theme['color-basic-800'] }]}>
      <Pressable onPress={() => navigation.navigate('Product Details', { id: item.product_id })}>
        <Image
          style={styles.productImage}
          source={{ uri: `${API_BASE_URL}${item.product_image}` }}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.productName, { color: theme['color-basic-100'] }]}>
            {item.product_name}
          </Text>
          <Text style={[styles.productDetails, { color: theme['color-basic-300'] }]}>
            Price: ₹{item.product_price} | Quantity: {item.quantity}
          </Text>
        </View>
      </Pressable>
      <Icon
        name="close-circle"
        size={24}
        color={theme['color-basic-300']}
        style={styles.removeIcon}
        onPress={() => removeFromCart(item.product_id, item.quantity)}
      />
    </View>
  );

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={[styles.container, { backgroundColor: theme['color-basic-900'] }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <View style={[styles.footer, { backgroundColor: theme['color-basic-800'] }]}>
        <View>
          <Text style={[styles.originalPrice, { color: theme['color-basic-300'] }]}>
            ₹{originalPrice}
          </Text>
          <Text style={[styles.totalText, { color: theme['color-basic-100'] }]}>
            Total: ₹{totalPrice}
          </Text>
          <Text style={[styles.savedText, { color: theme['color-success-500'] }]}>
            Saved: ₹{originalPrice - totalPrice}
          </Text>
        </View>
        <Button
          style={styles.buyNowButton}
          onPress={() =>
            navigation.navigate('Order Summary', {
              totalAmount: totalPrice,
              methodOfOrdering: 'cart',
            })
          }
        >
          Buy Now
        </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 14,
  },
  removeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  savedText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyNowButton: {
    borderRadius: 8,
  },
});