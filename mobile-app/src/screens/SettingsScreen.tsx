import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your account information',
      icon: 'person-outline',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Configure notification preferences',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      subtitle: 'Export data and privacy settings',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Coming Soon', 'Data management will be available soon'),
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('Project Manager', 'Version 1.0.0\nBuilt with React Native and Expo'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.section}>
          {settingsItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemContent}>
                <View style={styles.settingsItemIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#3B82F6" />
                </View>
                <View style={styles.settingsItemText}>
                  <Text style={styles.settingsItemTitle}>{item.title}</Text>
                  <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});