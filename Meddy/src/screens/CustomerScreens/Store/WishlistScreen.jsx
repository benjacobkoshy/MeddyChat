import { StyleSheet, View, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import Icon from 'react-native-vector-icons/Ionicons';
import { Layout, Text, Spinner } from '@ui-kitten/components';

export default function WishListScreen({ navigation }) {
  const { fetchWithAuth, API_BASE_URL } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [wishlistChanged, setWishlistChanged] = useState(false);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const response = await fetchWithAuth(`product/list-wishlist-products/`, {
          method: 'GET',
        });

        if (response.ok) {
          const result = await response.json();
          setData(result.cart_products);
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistChanged]);

  const removeFromWishlist = async (productId) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `product/add-to-wishlist/${productId}/`,
        {
          method: 'DELETE',
        }
      );
      if (response.ok) {
        const result = await response.json();
        setData((prevData) => prevData.filter((item) => item.id !== productId));
        setWishlistChanged(!wishlistChanged);

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
      console.error('Error removing product from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('Product Details', { id: item.product_id })}
      style={styles.itemContainer}
    >
      <Image
        style={styles.productImage}
        source={{ uri: `${API_BASE_URL}${item.product_image}` }}
        // defaultSource={require('../../../assets/placeholder-image.png')} // Add a placeholder image
      />
      <View style={styles.textContainer}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>₹{item.product_price}</Text>
      </View>
      <Icon
        name="close-circle"
        size={24}
        color="#FF6B6B"
        style={styles.removeIcon}
        onPress={() => removeFromWishlist(item.product_id)}
      />
    </Pressable>
  );

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  if (data.length === 0) {
    return (
      <Layout style={styles.emptyContainer}>
        <Icon name="heart-dislike-outline" size={50} color="#888" />
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme background
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    // backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF', // White text for dark theme
  },
  productPrice: {
    fontSize: 14,
    color: '#888', // Light gray for secondary text
    marginTop: 4,
  },
  removeIcon: {
    marginLeft: 16,
  },
});