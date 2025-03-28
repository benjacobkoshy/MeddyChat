import { StyleSheet, PermissionsAndroid, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useState, useEffect, useContext } from 'react'
import {WebView} from 'react-native-webview'
import axios from 'axios'
import { Layout, Text, Spinner } from '@ui-kitten/components'

import { AuthContext } from '../../../context/AuthContext'

const DAILY_API_KEY = 'f3c9584f1c6da2c887ac61570e05fcab84d5fd6e6821c304071f012ac55ea7ed';

export default function DoctorVideoCallScreen({ appointment, role }) {
    const appointmentId = appointment.id;
    const [roomUrl, setRoomUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchWithAuth, API_BASE_URL } = useContext(AuthContext);

    const requestPermissions = async () => {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          return (
            granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } catch (err) {
          console.error(err);
          return false;
        }
      };

      const createRoom = async () => {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
          console.error('Permissions required');
          return;
        }
    
        setIsLoading(true);
        try {
          const response = await axios.post(
            'https://api.daily.co/v1/rooms',
            { properties: { exp: Math.floor(Date.now() / 1000) + 3600 } },
            { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
          );
          
          if (response.data?.url) {
            const videoRoomUrl = response.data.url;
            setRoomUrl(videoRoomUrl);
            console.log("Room URL:", videoRoomUrl);

            // Send the room URL as a chat message
            await sendMessage(videoRoomUrl);
          } else {
            console.error('No room URL in response');
          }
        } catch (error) {
          console.error('API Error:', error.response?.data || error.message);
        }
        setIsLoading(false);
      };

      const sendMessage = async (videoRoomUrl = null) => {
        const textMessage = videoRoomUrl ? `Join the video call: ${videoRoomUrl}` : message.trim();
        if (!textMessage) return;

        setIsLoading(true);
        try {
          await fetchWithAuth(`appointment/chats/send/`, {
            method: "POST",
            body: JSON.stringify({ 
              doctor: appointment.doctor.id, 
              patient: appointment.patient.id, 
              appointment: appointmentId, 
              message: textMessage,
              sender: role,
            }),
          });
        } catch (error) {
          console.error("Error sending message:", error);
        }
        setIsLoading(false);
      };

      const handleCloseVideo = () => setRoomUrl(null);

  return (
    <Layout style={styles.container}>
      {/* <Text style={styles.title}>Consultation Screen</Text> */}
      
      {isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : !roomUrl ? (
        <TouchableOpacity style={styles.button} onPress={createRoom}>
          <Text style={styles.buttonText}>Start Video Call</Text>
        </TouchableOpacity>
      ) : null}

        {console.log(roomUrl)}
      {roomUrl && (
        <View style={styles.videoContainer}>
          <WebView 
            source={{ uri: roomUrl }} 
            style={styles.webView}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
          />
          <TouchableOpacity style={styles.endButton} onPress={handleCloseVideo}>
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </Layout>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: 'blue', padding: 15, borderRadius: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  videoContainer: { 
    width: '100%', 
    height: '100%', // Make the video container full screen
    flex: 1, // Allow it to expand
  },
  webView: { 
    flex: 1, 
    width: '100%', 
    height: '100%', // Ensure it fills the container
  },
  endButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 999,
  },
});
