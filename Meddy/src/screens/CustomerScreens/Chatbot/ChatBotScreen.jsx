import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Layout, Text } from '@ui-kitten/components';
import Snackbar from 'react-native-snackbar';
import Clipboard from '@react-native-clipboard/clipboard';
import Tts from 'react-native-tts';

export default function ChatBotScreen({ navigation }) {
  const { fetchWithAuth } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDucking(true);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() !== '') {
      setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
      setLoading(true);

      try {
        const response = await fetchWithAuth('chatBot/chatBot/', {
          method: 'POST',
          body: JSON.stringify({ message: message }),
        });

        const data = await response.json();

        console.log(data.response)
        
        if (response.ok) {
          simulateTyping(data.response, data.buttons || []);
        } else {
          showErrorSnackbar();
        }
      } catch (error) {
        showErrorSnackbar();
      } finally {
        setMessage('');
        setLoading(false);
      }
    }
  };

  const simulateTyping = (text, buttons = []) => {
    const words = text.split(' ');
    let currentText = '';
    
    setMessages((prev) => [...prev, { text: '', sender: 'bot', isTyping: true }]);

    const interval = setInterval(() => {
      if (words.length > 0) {
        currentText += (currentText ? ' ' : '') + words.shift();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            text: currentText, 
            sender: 'bot', 
            isTyping: true 
          };
          return updated;
        });
      } else {
        clearInterval(interval);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            text: currentText, 
            sender: 'bot', 
            buttons: buttons.length ? buttons : undefined 
          };
          return updated;
        });
      }
    }, 100);
  };

  const handleDoctorClick = (doctorId) => {
    navigation.navigate("AppointmentsStack", {
      screen: "Book Appointment",
      params: { screen: "New Appointment", params: { id: doctorId } },
    });
  };

  const speak = (text) => Tts.speak(text);
  
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Snackbar.show({
      text: 'Copied to clipboard!',
      duration: Snackbar.LENGTH_SHORT,
      textColor: '#FFFFFF',
      backgroundColor: '#3366FF',
    });
  };

  const showErrorSnackbar = () => {
    Snackbar.show({
      text: 'Unable to connect to chatbot!',
      duration: Snackbar.LENGTH_SHORT,
      textColor: '#FFFFFF',
      backgroundColor: '#FF3D71',
    });
  };

  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="comments-o" size={24} color="#8F9BB3" />
          <Text category="h6" style={styles.headerText}>
            Meddy Assistant
          </Text>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>

              {msg.sender === 'bot' && !msg.isTyping && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(msg.text)}
                    style={styles.actionButton}
                  >
                    <Icon name="copy" size={16} color="#8F9BB3" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => speak(msg.text)}
                    style={styles.actionButton}
                  >
                    <Icon name="volume-up" size={16} color="#8F9BB3" />
                  </TouchableOpacity>
                </View>
              )}

              {msg.buttons?.map((button, btnIndex) => {
                try {
                  const payload = JSON.parse(button.payload.replace('/select_doctor', ''));
                  return (
                    <TouchableOpacity
                      key={btnIndex}
                      style={styles.doctorButton}
                      onPress={() => handleDoctorClick(payload.doctor_id)}
                    >
                      <Text style={styles.doctorText}>
                        {payload.doctor_name}
                      </Text>
                    </TouchableOpacity>
                  );
                } catch (error) {
                  return null;
                }
              })}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#8F9BB3"
            value={message}
            onChangeText={setMessage}
            editable={!loading}
            onSubmitEditing={handleSendMessage}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabledButton]}
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#8F9BB3" />
            ) : (
              <Icon name="send" size={20} color="#8F9BB3" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2138',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222B45',
  },
  headerText: {
    marginLeft: 12,
    color: '#E4E9F2',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3366FF',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#222B45',
  },
  messageText: {
    color: '#E4E9F2',
    fontSize: 16,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222B45',
  },
  input: {
    flex: 1,
    backgroundColor: '#222B45',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E4E9F2',
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222B45',
  },
  disabledButton: {
    opacity: 0.7,
  },
  doctorButton: {
    backgroundColor: '#3366FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  doctorText: {
    color: '#E4E9F2',
    fontWeight: 'bold',
  },
});