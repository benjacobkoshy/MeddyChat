import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Layout, Text, Spinner } from '@ui-kitten/components';

const CustomerVideoCallScreen = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const url = route?.params?.url || null; // URL from params, or null if not provided
  console.log("Customer video url:", url);

  const handleWebViewError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (!url) {
    return (
      <Layout style={styles.messageContainer}>
        <Text category="h6" style={styles.messageText}>
          You can only join after the doctor creates a room for you.
        </Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      {isLoading && !hasError && (
        <View style={styles.loader}>
          <Spinner size="giant" />
          <Text style={styles.loadingText}>Connecting to the video call...</Text>
        </View>
      )}

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text category="h6" style={styles.errorText}>
            Error loading the video call. Please try again later.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          onLoad={() => setIsLoading(false)}
          onError={handleWebViewError}
          style={styles.webView}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  messageText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    color: "red",
  },
  webView: {
    flex: 1,
  },
});

export default CustomerVideoCallScreen;
