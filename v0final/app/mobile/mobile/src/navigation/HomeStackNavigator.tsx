import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import GroupChatScreen from '../screens/Chat/GroupChatScreen';
import GroupInfoScreen from '../screens/Chat/GroupInfoScreen';
import CheckInScreen from '../screens/CheckIn/CheckInScreen';
import DailyCheckInScreen from '../screens/CheckIn/DailyCheckInScreen';
import HabitsScreen from '../screens/Habits/HabitsScreen';
import ProgressPhotosScreen from '../screens/Progress/ProgressPhotosScreen';
import PhotoUploadScreen from '../screens/Progress/PhotoUploadScreen';
import PhotoComparisonScreen from '../screens/Progress/PhotoComparisonScreen';
import ProgressDetailScreen from '../screens/Progress/ProgressDetailScreen';
import WorkoutDetailScreen from '../screens/Workouts/WorkoutDetailScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: true,
          title: 'Chat met Coach',
          headerBackTitle: 'Terug',
        }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={{
          headerShown: true,
          title: 'Groep',
          headerBackTitle: 'Terug',
        }}
      />
      <Stack.Screen
        name="GroupInfo"
        component={GroupInfoScreen}
        options={{
          headerShown: true,
          title: 'Groep Info',
          headerBackTitle: 'Terug',
        }}
      />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
      <Stack.Screen name="Habits" component={HabitsScreen} />
      <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
      <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
      <Stack.Screen name="PhotoComparison" component={PhotoComparisonScreen} />
      <Stack.Screen name="ProgressDetail" component={ProgressDetailScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}
