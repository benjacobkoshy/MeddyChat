import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Layout, Text, Card, Button, Icon, Divider, useTheme, Spinner } from '@ui-kitten/components';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function DietSuggestionScreen() {
  const theme = useTheme();
  const { fetchWithAuth } = useContext(AuthContext);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [activeSections, setActiveSections] = useState([]);

  const GEMINI_API_KEY = 'AIzaSyCo9OcrTk0h53dc115oJpjaJY7A4rUHK_o';

  // Icons for different sections with matching colors
  const sectionIcons = {
    'Recommended Foods': { name: 'heart', color: '#4CAF50' },
    'Foods to Avoid': { name: 'alert-circle', color: '#F44336' },
    'Sample Full-Day Meal Plan': { name: 'clock', color: '#FF9800' },
    'Important Note': { name: 'alert-triangle', color: '#FFC107' }
  };

  useEffect(() => {
    fetchMedicalHistory();
    loadStoredDietPlan();
  }, []);

    const loadStoredDietPlan = async () => {
    try {
      const storedPlan = await AsyncStorage.getItem('dietPlan');
      if (storedPlan) {
        setSections(JSON.parse(storedPlan));
      }
    } catch (error) {
      console.error('Error loading diet plan:', error);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const response = await fetchWithAuth('home/customer-recent-medical-report/', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data);
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }finally{
      setIsLoading(false)
    }
  };

  if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;

  const saveDietPlan = async (dietData) => {
    try {
      await AsyncStorage.setItem('dietPlan', JSON.stringify(dietData));
    } catch (error) {
      console.error('Error saving diet plan:', error);
    }
  };



  const parseResponse = (text) => {
    const sections = [];
    let currentSection = null;
    
    text.split('\n').forEach(line => {
      const sectionMatch = line.match(/\*\*(.*?)\*\*/);
      if (sectionMatch) {
        currentSection = {
          title: sectionMatch[1],
          content: []
        };
        sections.push(currentSection);
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line.replace('*', '•').trim());
      }
    });
    
    return sections;
  };

  const queryGemini = async () => {
    if (!medicalHistory) return;

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Create a detailed diet plan with these sections:
      1. Recommended Foods (bullet points)
      2. Foods to Avoid (bullet points)
      3. Sample Full-Day Meal Plan (with breakfast, lunch, dinner, snacks)
      4. Important Note (highlight in warning style)
      
      For someone with: ${medicalHistory.disease} (Symptoms: ${medicalHistory.symptoms.join(", ")})`;

      const result = await model.generateContent(prompt);
      const dietText = await result.response.text();
      const parsedSections = parseResponse(dietText);
      setSections(parsedSections);
      setActiveSections(parsedSections.map((_, i) => i));

      await saveDietPlan(parsedSections);
    } catch (error) {
      console.error('Error generating diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index) => {
    setActiveSections(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const renderSection = (section, index) => {
    const iconConfig = sectionIcons[section.title] || { name: 'info', color: theme['color-primary-500'] };
    
    return (
      <Card 
        key={index} 
        style={[styles.sectionCard, { backgroundColor: theme['color-basic-800'] }]}
      >
        <TouchableOpacity onPress={() => toggleSection(index)} activeOpacity={0.7}>
          <View style={[styles.sectionHeader, { backgroundColor: theme['color-basic-900'] }]}>
            <Icon 
              name={iconConfig.name} 
              style={[styles.sectionIcon, { tintColor: iconConfig.color }]} 
            />
            <Text category='h6' style={[styles.sectionTitle, { color: iconConfig.color }]}>
              {section.title}
            </Text>
            <Icon 
              name={activeSections.includes(index) ? 'chevron-up' : 'chevron-down'} 
              style={styles.chevron} 
              fill={theme['text-basic-color']} 
            />
          </View>
        </TouchableOpacity>

        <Collapsible collapsed={!activeSections.includes(index)}>
          <Divider style={[styles.divider, { backgroundColor: iconConfig.color }]} />
          <View style={styles.contentContainer}>
            {section.content.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bullet, { color: iconConfig.color }]}>•</Text>
                <Text style={[styles.itemText, { color: theme['text-basic-color'] }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </Collapsible>
      </Card>
    );
  };

  return (
    <Layout style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
        <Icon 
          name="gift-outline" 
          style={[styles.headerIcon, { tintColor: theme['color-primary-500'] }]} 
        />
          <Text category='h3' style={[styles.header, { color: theme['text-basic-color'] }]}>
            Personalized Diet Plan
          </Text>
        </View>
        
        {!medicalHistory && (
          <Card status='danger' style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Icon name='alert-circle' fill={theme['color-danger-500']} style={styles.warningIcon} />
              <Text style={[styles.warningText, { color: theme['color-danger-500'] }]}>
                Please complete your medical profile first!
              </Text>
            </View>
          </Card>
        )}

        {sections.length > 0 ? (
          sections.map(renderSection)
        ) : (
          <Card style={[styles.placeholderCard, { backgroundColor: theme['color-basic-800'] }]}>
            <View style={styles.placeholderContent}>
              <Icon 
                name="shopping-bag-outline" 
                style={[styles.placeholderIcon, { tintColor: theme['text-hint-color'] }]} 
              />
              <Text style={[styles.placeholderText, { color: theme['text-hint-color'] }]}>
                Your personalized diet plan will appear here. 
                Tap the button below to generate suggestions!
              </Text>
            </View>
          </Card>
        )}

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size='large' color={theme['color-primary-500']} />
            <Text style={[styles.loadingText, { color: theme['color-primary-500'] }]}>
              Creating your perfect diet plan...
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          status='success'
          style={styles.generateButton}
          accessoryLeft={<Icon name='refresh' fill={theme['text-control-color']} />}
          onPress={queryGemini}
          disabled={loading || !medicalHistory}
          size='large'
        >
          {loading ? 'Generating...' : 'Generate Diet Plan'}
        </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContainer: { 
    padding: 20,
    paddingBottom: 100 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 10,
    borderRadius: 12,
    marginLeft: 10
  },
  headerIcon: {
    width: 42,
    height: 42,
    marginRight: 12
  },
  header: { 
    fontWeight: 'bold',
  },
  sectionCard: { 
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    // borderColor: "#ccc"
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
  },
  sectionIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 12 
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1
  },
  chevron: { 
    width: 24, 
    height: 24 
  },
  divider: { 
    height: 2,
    opacity: 0.3
  },
  contentContainer: {
    padding: 16
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  bullet: {
    marginRight: 12,
    fontSize: 20,
    lineHeight: 24,
    marginTop: -2
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  generateButton: {
    width: '100%',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  warningCard: {
    marginBottom: 20,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  warningIcon: {
    width: 24,
    height: 24,
    marginRight: 12
  },
  warningText: {
    fontWeight: '600'
  },
  placeholderCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2
  },
  placeholderContent: {
    alignItems: 'center',
    padding: 24
  },
  placeholderIcon: { 
    width: 60, 
    height: 60, 
    marginBottom: 20,
    opacity: 0.6
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  loaderContainer: {
    marginVertical: 30,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontWeight: '500'
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});