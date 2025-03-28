import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Snackbar } from 'react-native-paper';
import { Layout, Spinner, Text } from '@ui-kitten/components';
import { AuthContext } from '../../../context/AuthContext';

export default function NotificationScreen() {
  const { fetchWithAuth } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('home/notifications/', { method: 'GET' });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        console.log("Fetched Notifications:", data.notifications);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      Snackbar.show({
        text: 'Failed to fetch notifications.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      const response = await fetchWithAuth(`home/notifications-mark-read/${id}/`, {
        method: 'POST',
      });
  
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
        );
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      Snackbar.show({
        text: 'Failed to mark as read.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    }
  }, [fetchWithAuth]);
  

  const clearNotifications = useCallback(async () => {
    try {
      const response = await fetchWithAuth('home/notifications-mark-all-read/', {
        method: 'POST',
      });
  
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
        Snackbar.show({
          text: 'All notifications cleared.',
          duration: Snackbar.LENGTH_SHORT,
          textColor: '#FFFFFF',
          backgroundColor: '#4CAF50',
        });
      } else {
        throw new Error('Failed to clear notifications');
      }
    } catch (error) {
      Snackbar.show({
        text: 'Failed to clear notifications.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#F44336',
      });
    }
  }, [fetchWithAuth]);
  

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  return (
    <Layout style={styles.container}>
      <Text style={styles.header}>🔔 Notifications</Text>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No new notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, item.read && styles.readNotification]}
              onPress={() => markAsRead(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Notification: ${item.title}. ${item.content}`}
            >
              <Text style={styles.notificationText} category='h4'>{item.title} </Text>
              <Text style={{fontSize: 13,}}>{item.content}</Text>
              <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {notifications.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  readNotification: {
    opacity: 0.5,
  },
  notificationText: {
    fontSize: 16,
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});