import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Project Manager</Text>
        <Text style={styles.headerSubtitle}>Organize & Track</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Project Manager</Text>
          <Text style={styles.welcomeText}>
            Your personal project management solution built with React Native and Expo.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureTitle}>Projects</Text>
            <Text style={styles.featureDescription}>Organize your work into manageable projects</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureTitle}>Tasks</Text>
            <Text style={styles.featureDescription}>Track todos with priorities and due dates</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>Notes</Text>
            <Text style={styles.featureDescription}>Capture ideas and important information</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔗</Text>
            <Text style={styles.featureTitle}>Links</Text>
            <Text style={styles.featureDescription}>Store important links and credentials</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});