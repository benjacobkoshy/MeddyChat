import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Layout, Text, Spinner, Button } from '@ui-kitten/components';
import Snackbar from "react-native-snackbar";
import { useFocusEffect } from '@react-navigation/native';

const AccountScreen = ({ navigation }) => {
  const { logout, userToken, refreshAccessToken, fetchWithAuth } = useContext(AuthContext);
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // let token = userToken;
          // if (!token) {
          //   token = await refreshAccessToken();
          //   if (!token) throw new Error("Unable to refresh token");
          // }
          const response = await fetchWithAuth("home/home/", {
            method: "GET",
          });
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          const data = await response.json();
          setHomeData(data);
          
          const modalShown = await AsyncStorage.getItem("modalShown");
          if (!modalShown) {
            setIsModalVisible(true);
            await AsyncStorage.setItem("modalShown", "true");
          }
        } catch (error) {
          console.error("Error fetching home data:", error);
          Snackbar.show({
            text: "Failed to fetch data. Please try again.",
            duration: Snackbar.LENGTH_SHORT,
            textColor: '#FFFFFF',
            backgroundColor: '#FF3D71',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }, [userToken])
  );
  

  const handleModalClose = () => setIsModalVisible(false);

  if (isLoading) {
    return (
      <Layout style={styles.loader}>
        <Spinner size='giant' status='primary' />
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        {console.log(homeData)}
        <View style={styles.header}>
          <Text category='h4' style={styles.headerText}>
            Account Center
          </Text>
          <Icon name="user-circle" size={28} color="#3366FF" />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text category='h6' style={styles.welcomeText}>
            Welcome, {homeData?.user}!
          </Text>
          <Text category='p2' appearance='hint' style={styles.subtitle}>
            {homeData?.message}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            style={styles.actionButton}
            accessoryLeft={(props) => <Icon {...props} name="edit" size={16} color="#3366FF" />}
            onPress={() => navigation.navigate('Edit Profile')}
          >
            Edit Profile
          </Button>

          <Button
            style={styles.actionButton}
            accessoryLeft={(props) => <Icon {...props} name="book" size={16} color="#3366FF" />}
            onPress={() => navigation.navigate('Report Stack')}
          >
            View Medical Report
          </Button>

          <Button
            style={styles.actionButton}
            accessoryLeft={(props) => (
              <View>
                <Icon {...props} name="bell" size={16} color="#3366FF" />
                {homeData.notification_count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{homeData.notification_count}</Text>
                  </View>
                )}
              </View>
            )}
            onPress={() => navigation.navigate('Notification')}
          >
            Notifications
          </Button>

          <Button
            style={styles.actionButton}
            accessoryLeft={(props) => <Icon {...props} name="question" size={16} color="#3366FF" />}
            onPress={() => navigation.navigate('Help')}
          >
            Help & Support
          </Button>

          <Button
            style={styles.actionButton}
            accessoryLeft={(props) => <Icon {...props} name="cog" size={16} color="#3366FF" />}
            onPress={() => navigation.navigate('Settings Stack')}
          >
            Settings
          </Button>
        </View>

        {/* Logout Button */}
        <Button
          style={styles.logoutButton}
          status='danger'
          accessoryLeft={(props) => <Icon {...props} name="sign-out" size={16} color="#FFFFFF" />}
          onPress={logout}
        >
          Logout
        </Button>

        {/* Welcome Modal */}
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalOverlay}>
            <Layout style={styles.modalContent}>
              <Text category='h5' style={styles.modalTitle}>
                Welcome, {homeData?.user}!
              </Text>
              <Text category='p2' appearance='hint' style={styles.modalMessage}>
                {homeData?.message}
              </Text>
              <Button
                style={styles.modalButton}
                onPress={handleModalClose}
              >
                Get Started
              </Button>
            </Layout>
          </View>
        </Modal>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2138',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222B45',
  },
  headerText: {
    color: '#E4E9F2',
  },
  welcomeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#E4E9F2',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  actionButton: {
    marginBottom: 12,
    backgroundColor: '#222B45',
    borderColor: '#3366FF',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 12,
    color: '#E4E9F2',
  },
  modalMessage: {
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AccountScreen;