import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }: any) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const NotificationItem = ({ title, description, enabled, onToggle }: any) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{title}</Text>
        {description && <Text style={styles.notificationDescription}>{description}</Text>}
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaties</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>ALGEMEEN</Text>
        <View style={styles.card}>
          <NotificationItem
            title="Push notificaties"
            description="Ontvang meldingen op je telefoon"
            enabled={pushEnabled}
            onToggle={setPushEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>HERINNERINGEN</Text>
        <View style={styles.card}>
          <NotificationItem
            title="Trainingsherinneringen"
            description="Ontvang notificaties voor geplande workouts"
            enabled={workoutReminders}
            onToggle={setWorkoutReminders}
          />
          <View style={styles.divider} />
          <NotificationItem
            title="Maaltijdherinneringen"
            description="Herinneringen voor je voedingsschema"
            enabled={mealReminders}
            onToggle={setMealReminders}
          />
        </View>

        <Text style={styles.sectionTitle}>ACTIVITEIT</Text>
        <View style={styles.card}>
          <NotificationItem
            title="Chatberichten"
            description="Notificaties van je coach"
            enabled={chatMessages}
            onToggle={setChatMessages}
          />
          <View style={styles.divider} />
          <NotificationItem
            title="Cursus updates"
            description="Nieuwe lessen en materiaal"
            enabled={courseUpdates}
            onToggle={setCourseUpdates}
          />
        </View>

        <Text style={styles.sectionTitle}>E-MAIL</Text>
        <View style={styles.card}>
          <NotificationItem
            title="E-mail notificaties"
            description="Ontvang updates per e-mail"
            enabled={emailNotifications}
            onToggle={setEmailNotifications}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 16,
  },
});
