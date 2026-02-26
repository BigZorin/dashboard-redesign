import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '../screens/More/MoreScreen';
import EditProfileScreen from '../screens/Settings/EditProfileScreen';
import WearablesScreen from '../screens/Settings/WearablesScreen';
import NotificationsScreen from '../screens/Settings/NotificationsScreen';
import PrivacyScreen from '../screens/Settings/PrivacyScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import GroupChatScreen from '../screens/Chat/GroupChatScreen';
import GroupInfoScreen from '../screens/Chat/GroupInfoScreen';

const Stack = createNativeStackNavigator();

export default function MoreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Wearables" component={WearablesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
    </Stack.Navigator>
  );
}
