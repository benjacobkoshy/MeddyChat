import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Image, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';
import { Layout, Text, useTheme, Spinner } from '@ui-kitten/components';

export default function StoreScreen({ navigation }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme(); // Access the current theme

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetchWithAuth(`product/products/?name=${searchQuery}`, {
          method: "GET",
        });

        const productData = await productResponse.json();
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const addToCart = async (productId) => {
    let quantity = 1;

    try {
      const response = await fetchWithAuth(`product/add-to-cart/${productId}/${quantity}/`, {
        method: 'POST',
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

  return (
    <Layout style={[styles.container, { backgroundColor: theme['color-basic-900'] }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.headerContainer, { backgroundColor: theme['color-basic-800'] }]}>
          <Icon name='cart-plus' size={24} color={theme['color-basic-100']} />
          <Text style={[styles.headerText, { color: theme['color-basic-100'] }]} category='h4'>
            Meddy Store
          </Text>

          <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Cart Details')}>
            <Icon name="shopping-cart" size={24} color={theme['color-basic-100']} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Wishlist Details')}>
            <Icon name="heart-o" size={24} color={theme['color-basic-100']} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Order Details')}>
            <Icon name="archive" size={24} color={theme['color-basic-100']} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme['color-basic-800'] }]}>
          <TextInput
            style={[styles.searchBar, { color: theme['color-basic-100'] }]}
            placeholder="Search for medicines, health products..."
            placeholderTextColor={theme['color-basic-500']}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="sliders" size={20} color={theme['color-basic-100']} />
          </TouchableOpacity>
        </View>

        {/* Show sections only when searchQuery is empty */}
        {searchQuery === "" && (
          <>
            {/* Banner Section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sliderContainer}>
              {isLoading ? (
                <Layout style={[styles.loader,{justifyContent:"center", alignItems:"center"}]}><Spinner size='giant' /></Layout>
              ) : (
                products
                  .filter((product) => product.is_featured)
                  .map((product, index) => (
                    <Pressable
                      key={index}
                      onPress={() => navigation.navigate('Product Details', { id: product.id })}
                      style={styles.bannerWrapper}
                    >
                      <Image source={{ uri: product.main_image }} style={styles.banner} />
                      <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerText}>{product.name}</Text>
                      </View>
                    </Pressable>
                  ))
              )}
            </ScrollView>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <Text style={[styles.sectionTitle, { color: theme['color-basic-100'] }]}>Shop by Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Pain Relievers', 'Vitamins', 'First Aid', 'Cold & Flu'].map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.categoryCard, { backgroundColor: theme['color-basic-800'] }]}
                  >
                    <Icon name="heartbeat" size={20} color={theme['color-basic-100']} />
                    <Text style={[styles.categoryText, { color: theme['color-basic-100'] }]}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Product List (only searched products if searchQuery is not empty) */}
        <View style={styles.productsContainer}>
          <Text style={[styles.sectionTitle, { color: theme['color-basic-100'] }]}>
            {searchQuery === "" ? "Popular Products" : "Search Results"}
          </Text>
          {isLoading ? (
            <Layout style={styles.loader}><Spinner size='giant' /></Layout>
          ) : products.length > 0 ? (
            products.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => navigation.navigate('Product Details', { id: product.id })}
                style={[styles.productCard, { backgroundColor: theme['color-basic-800'] }]}
              >
                <Image source={{ uri: product.main_image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={[styles.productName, { color: theme['color-basic-100'] }]}>{product.name}</Text>
                  <Text style={[styles.productPrice, { color: theme['color-basic-300'] }]}>₹{product.price}</Text>
                  <TouchableOpacity
                    onPress={() => addToCart(product.id)}
                    style={[styles.addToCartButton, { backgroundColor: theme['color-primary-500'] }]}
                  >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noResultsText, { color: theme['color-basic-300'] }]}>No products found.</Text>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.3,
  },
  headerText: {
    marginLeft: 10,
  },
  cartIcon: {
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 0.5,
  },
  searchBar: {
    flex: 1,
    fontSize: 13,
  },
  filterButton: {
    marginLeft: 10,
    borderRadius: 25,
    padding: 10,
  },
  sliderContainer: {
    marginVertical: 15,
  },
  bannerWrapper: {
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  banner: {
    width: 340,
    height: 180,
    borderRadius: 15,
  },
  bannerTextContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    width: '47%',
    marginRight: '3%',
    borderWidth: 0.5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  productsContainer: {
    padding: 20,
  },
  productCard: {
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    marginVertical: 10,
  },
  addToCartButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
  },
});