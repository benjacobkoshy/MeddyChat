import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Snackbar from 'react-native-snackbar';
import { Layout, Text, useTheme, Spinner } from '@ui-kitten/components';

export default function ProductDetailScreen({ route }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const { id } = route.params;
  const [productDetails, setProductDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishList, setWishList] = useState(false);
  const [quantity, setQuantity] = useState(1); // State for product quantity
  const theme = useTheme(); // Access the current theme

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetchWithAuth(`product/products/${id}/`, {
          method: 'GET',
        });
        const data = await response.json();
        setProductDetails(data);
        setWishList(data.is_wishlist); // Set wishlist state based on API response
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, wishList]);

  const addToCart = async (productId) => {
    try {
      const response = await fetchWithAuth(`product/add-to-cart/${productId}/${quantity}/`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
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

  const addToWishlist = async (productId) => {
    try {
      const response = await fetchWithAuth(`product/add-to-wishlist/${productId}/`, {
        method: wishList ? 'DELETE' : 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setWishList(!wishList); // Toggle the wishlist state
        Snackbar.show({
          text: result.message,
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
      } else {
        throw new Error(result.error || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error in updating wishlist:', error);
      Snackbar.show({
        text: 'Failed to update wishlist.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    }
  };

  const adjustQuantity = (type) => {
    if (type === 'increment') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  if (!productDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching product details.</Text>
      </View>
    );
  }

  return (
    <Layout style={[styles.container, { backgroundColor: theme['color-basic-900'] }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={[styles.card, { backgroundColor: theme['color-basic-800'] }]}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: productDetails.main_image }}
              style={styles.productImage}
            />
          </View>
        </View>

        {/* Product Title and Price */}
        <View style={[styles.card, { backgroundColor: theme['color-basic-800'] }]}>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme['color-basic-100'] }]}>
              {productDetails.name}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, { color: theme['color-primary-500'] }]}>
                ₹{productDetails.offer_price * quantity}
              </Text>
              <Text style={[styles.originalPrice, { color: theme['color-basic-500'] }]}>
                ₹{productDetails.price * quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={[styles.card, styles.quantityCard, { backgroundColor: theme['color-basic-800'] }]}>
          <Text style={[styles.quantityLabel, { color: theme['color-basic-100'] }]}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: theme['color-basic-700'] }]}
              onPress={() => adjustQuantity('decrement')}
            >
              <Text style={[styles.quantityButtonText, { color: theme['color-basic-100'] }]}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.quantityInput, { color: theme['color-basic-100'] }]}
              value={String(quantity)}
              editable={false}
            />
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: theme['color-basic-700'] }]}
              onPress={() => adjustQuantity('increment')}
            >
              <Text style={[styles.quantityButtonText, { color: theme['color-basic-100'] }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.card, styles.actionCard, { backgroundColor: theme['color-basic-800'] }]}>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => addToWishlist(productDetails.id)}
          >
            <AntDesign
              name={wishList ? 'heart' : 'hearto'}
              size={24}
              color="#e63946"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: theme['color-primary-500'] }]}
            onPress={() => addToCart(productDetails.id)}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#fff" />
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buyNowButton, { backgroundColor: theme['color-danger-500'] }]}>
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={[styles.detailCard, { backgroundColor: theme['color-basic-800'] }]}>
          <Text style={[styles.cardTitle, { color: theme['color-basic-100'] }]}>Product Details</Text>
          <Text style={[styles.cardContent, { color: theme['color-basic-300'] }]}>
            {productDetails.description}
          </Text>
        </View>

        {/* Product Category */}
        <View style={[styles.detailCard, { backgroundColor: theme['color-basic-800'] }]}>
          <Text style={[styles.cardTitle, { color: theme['color-basic-100'] }]}>Product Category</Text>
          <Text style={[styles.cardContent, { color: theme['color-basic-300'] }]}>
            {productDetails.category}
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  quantityCard: {
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 18,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    borderBottomWidth: 1,
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistButton: {
    padding: 10,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
  },
});