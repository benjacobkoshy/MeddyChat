import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StoreScreen from '../../../screens/CustomerScreens/Store/StoreScreen';
import ProductDetailScreen from '../../../screens/CustomerScreens/Store/ProductDetailScreen';
import CartScreen from '../../../screens/CustomerScreens/Store/CartScreen';
import WishListScreen from '../../../screens/CustomerScreens/Store/WishlistScreen';
import AddressConfirmationScreen from '../../../screens/CustomerScreens/Store/AddressConfirmationScreen';
import PaymentScreen from '../../../screens/CustomerScreens/Store/Stripe Payment/PaymentScreen';
import PaymentStatusScreen from '../../../screens/CustomerScreens/Store/Stripe Payment/PaymentStatusScreen';
import OrderScreen from '../../../screens/CustomerScreens/Store/OrderScreen';

const Stack = createStackNavigator();
export default function StoreNavigation() {
  return (
    <Stack.Navigator>
        <Stack.Screen name="Store" component={StoreScreen}
            options={{
                headerShown: false,
            }}
        />
        <Stack.Screen name="Product Details" component={ProductDetailScreen}
            options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#222B45",
                },
                headerTintColor: "#fff"
            }}
        />
        <Stack.Screen name="Cart Details" component={CartScreen}
            options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#222B45",
                },
                headerTintColor: "#fff"
            }}
        />
        <Stack.Screen name="Wishlist Details" component={WishListScreen}
            options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#222B45",
                },
                headerTintColor: "#fff"
            }}
        />

        <Stack.Screen name="Order Details" component={OrderScreen}
            options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#222B45",
                },
                headerTintColor: "#fff"
            }}
        />

        <Stack.Screen name="Order Summary" component={AddressConfirmationScreen}
                    options={{
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: "#222B45",
                        },
                        headerTintColor: "#fff"
                    }}
        />

        <Stack.Screen name="Payment Summary" component={PaymentScreen}
                    options={{
                        headerShown: false,
                        headerStyle: {
                            backgroundColor: "#222B45",
                        },
                        headerTintColor: "#fff"
                    }}
        />

        <Stack.Screen name="PaymentStatusScreen" component={PaymentStatusScreen}
                    options={{
                        headerShown: false,
                        headerStyle: {
                            backgroundColor: "#222B45",
                        },
                        headerTintColor: "#fff"
                    }}
        />

    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})