import { TouchableOpacity, StyleSheet, View, FlatList, TextInput, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Layout, Text, Spinner } from '@ui-kitten/components';
import Snackbar from "react-native-snackbar";

export default function NewsScreen({navigation}) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNews();
  }, [searchTerm]);

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${searchTerm || 'health'}&language=en&from=2025-03-10&sortBy=publishedAt&apiKey=4e8cd2fd7e454d338e4fd1e345fc3517`
      );
      
      if (response.data?.articles) {
        setArticles(response.data.articles);
        console.log(articles)
      } else {
        throw new Error('No articles found');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
      Snackbar.show({
        text: 'Failed to fetch news',
        duration: Snackbar.LENGTH_SHORT,
        textColor: '#FFFFFF',
        backgroundColor: '#FF3D71',
      });
    }
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity 
      style={styles.articleContainer} 
      onPress={() => navigation.navigate('News Details', { article: item })}
    >

      {console.log(item.id)}
      {item.urlToImage && (
        <Image 
          source={{ uri: item.urlToImage }} 
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.articleContent}>
        <Text category='s1' style={styles.articleTitle}>{item.title}</Text>
        <Text 
          category='p2' 
          appearance='hint'
          style={styles.articleDescription}
        >
          {item.description?.slice(0, 120) || 'No description available'}...
        </Text>
        <View style={styles.sourceContainer}>
          <Icon name="newspaper-o" size={14} color="#636977" />
          <Text category='c2' appearance='hint' style={styles.articleSource}>
            {item.source?.name || 'Unknown source'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) return (
    <Layout style={styles.loader}>
      <Spinner size='giant' status='primary' />
    </Layout>
  );

  if (articles.length === 0) {
    return (
      <Layout style={styles.emptyContainer}>
        <Icon name="newspaper-o" size={50} color="#636977" />
        <Text category='h6' appearance='hint' style={styles.emptyText}>
          No articles found
        </Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Icon name="heartbeat" size={24} color="#8F9BB3" />
        <Text category='h5' style={styles.headerText}>
          Health News
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search health news..."
          placeholderTextColor="#8F9BB3"
          value={searchTerm}
          onChangeText={setSearchTerm}
          selectionColor="#3366FF"
        />
        <Icon name="search" size={18} color="#8F9BB3" style={styles.searchIcon} />
      </View>

      <FlatList
        data={articles}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderArticle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2138',
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#222B45',
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    color: '#E4E9F2',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#222B45',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
  },
  list: {
    paddingHorizontal: 16,
  },
  articleContainer: {
    backgroundColor: '#222B45',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1A2138',
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    color: '#E4E9F2',
    marginBottom: 8,
    lineHeight: 22,
  },
  articleDescription: {
    color: '#8F9BB3',
    marginBottom: 12,
    lineHeight: 20,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleSource: {
    color: '#636977',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A2138',
  },
  emptyText: {
    marginTop: 16,
  },
});  