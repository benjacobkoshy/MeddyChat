import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  StatusBar
} from 'react-native';
import { Layout, Icon } from '@ui-kitten/components';
import { AuthContext } from '../../../context/AuthContext';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';

const ChatScreen = ({ route, navigation }) => {
  const { appointment, role } = route.params;
  if (!navigation) {
    console.error("Navigation prop is undefined!");
  }
  
  const appointmentId = appointment.id;
  const { fetchWithAuth, userToken, API_BASE_URL } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef();
  const typingTimeoutRef = useRef();

  const isDoctor = role === 'doctor';
  const currentUserId = isDoctor ? appointment.doctor.id : appointment.patient.id;
  const senderId = isDoctor ? appointment.doctor.id : appointment.patient.id;
  const receiverId = isDoctor ? appointment.patient.id : appointment.doctor.id;

  const counterpartName = isDoctor ? appointment.patient.name : appointment.doctor.name;
  const counterpartTitle = isDoctor ? 'Patient' : 'Dr.';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetchWithAuth(`appointment/chats/${appointmentId}/`, { method: 'GET' });
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await fetchWithAuth(`appointment/chats/send/`, {
        method: "POST",
        body: JSON.stringify({ 
          doctor: appointment.doctor.id, 
          patient: appointment.patient.id, 
          appointment: appointmentId, 
          message,
          sender: role,
        }),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  const handleTyping = (text) => {
    setMessage(text);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing indicator
    if (text.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
    
    // Set timeout to hide typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      );
      return result === RESULTS.GRANTED;
    }
    return true;
  };
  
  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to send images.',
        [{ text: 'OK' }]
      );
      return;
    }
  
    launchImageLibrary({ 
      mediaType: 'photo', 
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
        sendImage(response.assets[0]);
      }
    });
  };
  
  const sendImage = async (imageData) => {
    if (!imageData) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('doctor', appointment.doctor.id);
    formData.append('patient', appointment.patient.id);
    formData.append('appointment', appointmentId);
    formData.append('sender', role);
    formData.append('image', {
      uri: imageData.uri,
      type: imageData.type || 'image/jpeg',
      name: imageData.fileName || `chat_image_${Date.now()}.jpg`,
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/appointment/chats/send/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (response.ok) {
        setSelectedImage(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to send image:', errorData);
        Alert.alert("Error", "Failed to send image. Please try again.");
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.sender === role;
    const senderName = msg.sender === 'doctor' ? appointment.doctor.name : appointment.patient.name;
    const senderInitials = senderName ? senderName.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2) : "U";
    const imageUrl = msg.image ? `${API_BASE_URL}${msg.image}` : null;
    
    // Check if previous message was from the same sender
    const previousMessage = messages[index - 1];
    const showAvatar = !previousMessage || previousMessage.sender !== msg.sender;
    
    // Check if this is a video call link
    const videoCallUrl = (msg.message && msg.message.includes("daily.co")) 
      ? msg.message.match(/https?:\/\/[^\s]+/)?.[0] 
      : null;

    return (
      <View 
        key={msg.id} 
        style={[
          styles.messageContainer, 
          isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
          { marginTop: showAvatar ? 12 : 4 }
        ]}
      >
        {!isCurrentUser && showAvatar && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{senderInitials}</Text>
          </View>
        )}

        <View style={[styles.bubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          {imageUrl ? (
            <TouchableOpacity 
              onPress={() => { 
                setCurrentImage([{ uri: imageUrl }]); 
                setVisible(true); 
              }}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.chatImage} 
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                {/* <Icon name="image-outline" style={styles.imageIcon} fill="#fff" /> */}
              </View>
            </TouchableOpacity>
          ) : videoCallUrl ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Video Call', { url: videoCallUrl })} 
              style={styles.videoCallButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#4A90E2', '#6A5ACD']}
                style={styles.videoCallGradient}
              >
                <Icon name="video-outline" style={styles.videoCallIcon} fill="#fff" />
                <Text style={styles.videoCallText}>Join Video Consultation</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
              {msg.message}
            </Text>
          )}
          <Text style={[styles.timeStamp, isCurrentUser ? styles.currentUserTime : styles.otherUserTime]}>
            {moment(msg.timestamp).format('h:mm A')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Layout style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View 
          // colors={['#2C3E50', '#4CA1AF']} 
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-back" style={styles.backIcon} fill="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{counterpartTitle} {counterpartName}</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'Typing...' : moment().format('h:mm A')}
            </Text>
          </View>
          
          {/* <View style={styles.headerRight}>
            <Icon name="more-vertical" style={styles.menuIcon} fill="#fff" />
          </View> */}
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="message-square-outline" style={styles.emptyIcon} fill="#BDC3C7" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation with {counterpartName}</Text>
            </View>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}
        </ScrollView>

        {/* Image Viewer */}
        <ImageViewing 
          images={currentImage} 
          imageIndex={0} 
          visible={visible} 
          onRequestClose={() => setVisible(false)} 
          backgroundColor="#000"
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />

        {/* Input Area */}
        <View 
          // colors={['#f8f9fa', '#e9ecef']} 
          style={styles.inputWrapper}
        >
          
          
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#95a5a6"
            value={message}
            onChangeText={handleTyping}
            multiline
            editable={!loading}
            underlineColorAndroid="transparent"
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!message.trim() && !selectedImage) && styles.disabledButton
            ]} 
            onPress={sendMessage}
            disabled={loading || (!message.trim() && !selectedImage)}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon
                name={message.trim() || selectedImage ? "paper-plane-outline" : "paper-plane-outline"}
                style={styles.sendIcon}
                fill="#fff"
              />
            )}
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.attachmentButton} 
            onPress={pickImage}
            disabled={loading}
          >
            <Icon 
              name="image-outline" 
              style={[styles.attachmentIcon, loading && styles.disabledIcon]} 
            />
          </TouchableOpacity>


        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    // elevation: 4,
    // backgroundColor: '#1E1E1E', // Dark header
    borderBottomWidth: .3,
    borderBottomColor: '#ccc',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFF', // White icons
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF', // White text
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)', // Semi-transparent white
    marginTop: 2,
  },
  headerRight: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 80,
    
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
    tintColor: '#555', // Gray icon
  },
  emptyText: {
    fontSize: 18,
    color: '#AAA', // Light gray
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#777', // Darker gray
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    maxWidth: '85%',
  },
  currentUserContainer: {
    marginLeft: 'auto',
  },
  otherUserContainer: {
    marginRight: 'auto',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3366FF', // Vibrant blue for contrast
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bubble: {
    maxWidth: '100%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: '#3366FF', // Vibrant blue
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  currentUserText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
  },
  otherUserText: {
    color: '#2c3e50', 
    fontSize: 16,
    lineHeight: 22,
  },
  timeStamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  currentUserTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#7f8c8d',
    textAlign: 'left',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    // paddingHorizontal: 16,
    borderTopWidth: .3,
    borderTopColor: '#ccc',
    marginBottom: 10
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderColor: '#fff',
    borderWidth: .3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // backgroundColor: '#2D2D2D', // Dark input background
    color: '#FFF', // White text
    fontSize: 16,
    marginHorizontal: 8,
    marginTop: 4
  },
  attachmentButton: {
    width: 40,              // Fixed width like send button
    height: 40,             // Fixed height like send button
    padding: 8,             // Internal padding
    backgroundColor: '#3366FF', // Matching blue color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,       // Fully rounded corners
    marginLeft: 6,         // Space between attachment and input
  },
  attachmentIcon: {
    width: 24,              // Slightly larger icon
    height: 24,
    tintColor: '#FFFFFF',   // Pure white for consistency
  },
  disabledIcon: {
    opacity: 0.5,           // Dimmed appearance when disabled
    tintColor: '#FFFFFF',   // Keep white but faded
  },
  sendButton: {
    width: 40,              // Matches attachment button
    height: 40,             // Matches attachment button
    borderRadius: 20,       // Fully rounded corners
    backgroundColor: '#3366FF', // Matching blue color
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,          // Space between input and send
  },
  disabledButton: {
    backgroundColor: 'rgba(51, 102, 255, 0.5)', // Semi-transparent blue
  },
  sendIcon: {
    width: 20,              // Slightly smaller than attachment
    height: 20,
    tintColor: '#FFFFFF',   // Pure white
  },
  chatImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#2D2D2D', // Dark placeholder
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Darker overlay
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFF',
  },
  videoCallButton: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#3366FF', // Solid blue background
  },
  videoCallGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCallIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FFF',
  },
  videoCallText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
export default ChatScreen;