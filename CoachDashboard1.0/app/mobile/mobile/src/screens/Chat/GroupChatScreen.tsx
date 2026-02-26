import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import {
  useGroupMessages,
  useSendGroupText,
  useSendGroupVoice,
  useMarkGroupRead,
  useRealtimeGroupMessages,
} from '../../hooks/useGroupChat';
import { useUser } from '../../hooks/useUser';
import ChatInput from '../../components/Chat/ChatInput';
import VoiceNotePlayer from '../../components/Chat/VoiceNotePlayer';
import type { GroupMessage } from '../../lib/groupApi';

export default function GroupChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId, groupName } = route.params;

  const { data: user } = useUser();
  const { data: messages = [], isLoading } = useGroupMessages(groupId);
  const sendText = useSendGroupText();
  const sendVoice = useSendGroupVoice();
  const markRead = useMarkGroupRead();
  const flatListRef = useRef<FlatList>(null);

  // Realtime subscription
  useRealtimeGroupMessages(groupId);

  // Mark as read when entering
  useEffect(() => {
    if (groupId) {
      markRead.mutate(groupId);
    }
  }, [groupId, messages.length]);

  // Set header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: groupName || 'Groep',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('GroupInfo', { groupId, groupName })}
          style={{ marginRight: 4 }}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, groupId, groupName]);

  const handleSendText = useCallback(
    (text: string) => {
      if (!groupId) return;
      sendText.mutate({ groupId, content: text });
    },
    [groupId]
  );

  const handleSendVoice = useCallback(
    (uri: string, durationSeconds: number) => {
      if (!groupId) return;
      sendVoice.mutate({ groupId, audioUri: uri, durationSeconds });
    },
    [groupId]
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: GroupMessage; index: number }) => {
      const isOwn = item.senderId === user?.id;
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const showSender = !isOwn && (!prevMsg || prevMsg.senderId !== item.senderId);

      const time = new Date(item.sentAt).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return (
        <View style={[styles.messageRow, isOwn ? styles.messageOwn : styles.messageOther]}>
          {showSender && (
            <Text style={styles.senderName}>{item.senderName || 'Gebruiker'}</Text>
          )}
          <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
            {item.messageType === 'voice' && item.mediaUrl ? (
              <VoiceNotePlayer
                uri={item.mediaUrl}
                duration={item.mediaDuration || 0}
                isOwn={isOwn}
              />
            ) : (
              <Text style={[styles.messageText, isOwn ? styles.textOwn : styles.textOther]}>
                {item.content}
              </Text>
            )}
            <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
              {time}
            </Text>
          </View>
        </View>
      );
    },
    [user?.id, messages]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Berichten laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Groepschat</Text>
            <Text style={styles.emptyText}>
              Stuur het eerste bericht in deze groep!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <ChatInput
          onSendText={handleSendText}
          onSendVoice={handleSendVoice}
          isSending={sendText.isPending || sendVoice.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageList: {
    paddingVertical: 16,
  },
  messageRow: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  messageOwn: {
    alignItems: 'flex-end',
  },
  messageOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textOwn: {
    color: '#fff',
  },
  textOther: {
    color: theme.colors.text,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.6)',
  },
  timeOther: {
    color: theme.colors.textTertiary,
  },
});
