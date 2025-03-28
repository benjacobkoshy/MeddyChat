import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Layout } from '@ui-kitten/components';
import WebView from 'react-native-webview';

export default function NewsDetailsScreen({ route }) {
  const { article } = route.params;
  const [showWebView, setShowWebView] = useState(false);

  if (showWebView) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowWebView(false)}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <WebView source={{ uri: article.url }} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {article.urlToImage && (
          <Image source={{ uri: article.urlToImage }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.title}>{article.title}</Text>

        <Text style={styles.author}>
          By {article.author || 'Unknown'} | {article.source?.name || 'Unknown source'}
        </Text>

        <Text style={styles.source}>{article.description || 'No description available'}</Text>
        <Text style={styles.content}>{article.content?.split("[+")[0] || 'No content available'}</Text>

        {article.url && (
          <TouchableOpacity onPress={() => setShowWebView(true)} style={styles.button}>
            <Text style={styles.buttonText}>Read Full Article</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  author: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
    color: '#fff',
  },
  source: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  backButton: { padding: 10, backgroundColor: '#007AFF', alignItems: 'center' },
  backButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});