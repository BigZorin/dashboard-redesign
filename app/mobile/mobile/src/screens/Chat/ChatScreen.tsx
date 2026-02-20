import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { theme } from '../../constants/theme';
import { useClientConversation } from '../../hooks/useConversation';
import {
  useMessages,
  useSendTextMessage,
  useSendVoiceMessage,
  useSendMediaMessage,
  useMarkAsRead,
  messageKeys,
} from '../../hooks/useMessages';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { useUser } from '../../hooks/useUser';
import MessageBubble from '../../components/Chat/MessageBubble';
import ChatInput from '../../components/Chat/ChatInput';
import type { MessageRecord } from '../../lib/messageApi';

export default function ChatScreen() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { data: conversation, isLoading: convLoading, error: convError } = useClientConversation();
  const conversationId = conversation?.id || null;
  const { data: messages = [], isLoading: msgsLoading } = useMessages(conversationId);
  const sendText = useSendTextMessage();
  const sendVoice = useSendVoiceMessage();
  const sendMedia = useSendMediaMessage();
  const markAsRead = useMarkAsRead();
  const flatListRef = useRef<FlatList>(null);

  // Enable realtime subscription
  useRealtimeMessages(conversationId);

  // Refetch messages + mark as read when screen gets focus
  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.conversation(conversationId),
        });
        markAsRead.mutate(conversationId);
      }
    }, [conversationId])
  );

  const handleSendText = useCallback(
    (text: string) => {
      if (!conversation || !user) return;
      const receiverId =
        user.id === conversation.coachId
          ? conversation.clientId
          : conversation.coachId;

      sendText.mutate({
        conversationId: conversation.id,
        receiverId,
        content: text,
      });
    },
    [conversation, user]
  );

  const handleSendVoice = useCallback(
    (uri: string, durationSeconds: number) => {
      if (!conversation || !user) return;
      const receiverId =
        user.id === conversation.coachId
          ? conversation.clientId
          : conversation.coachId;

      sendVoice.mutate(
        {
          conversationId: conversation.id,
          receiverId,
          audioUri: uri,
          durationSeconds,
        },
        {
          onError: (err: any) => {
            Alert.alert('Spraakbericht mislukt', err?.message || 'Onbekende fout');
          },
        }
      );
    },
    [conversation, user]
  );

  const handleSendMedia = useCallback(
    (uri: string, type: 'image' | 'video' | 'document', fileName?: string) => {
      if (!conversation || !user) return;
      const receiverId =
        user.id === conversation.coachId
          ? conversation.clientId
          : conversation.coachId;

      sendMedia.mutate(
        {
          conversationId: conversation.id,
          receiverId,
          fileUri: uri,
          messageType: type,
          fileName,
        },
        {
          onError: (err: any) => {
            Alert.alert('Bestand versturen mislukt', err?.message || 'Onbekende fout');
          },
        }
      );
    },
    [conversation, user]
  );

  const coachAvatarUrl = conversation?.coachAvatarUrl;
  const coachName = conversation?.coachName;

  const renderMessage = useCallback(
    ({ item }: { item: MessageRecord }) => {
      const isOwn = item.senderId === user?.id || item.senderId === 'me';
      return (
        <MessageBubble
          message={item}
          isOwn={isOwn}
          senderAvatarUrl={!isOwn ? coachAvatarUrl : undefined}
          senderName={!isOwn ? coachName : undefined}
        />
      );
    },
    [user?.id, coachAvatarUrl, coachName]
  );

  // Loading state
  if (convLoading || msgsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chat laden...</Text>
        </View>
      </View>
    );
  }

  // Error state (no coach assigned)
  if (convError) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Geen coach gekoppeld</Text>
          <Text style={styles.emptyText}>
            Je kunt chatten zodra een coach aan je account is gekoppeld.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Coach header */}
      {conversation && (
        <View style={styles.chatHeader}>
          {coachAvatarUrl ? (
            <Image source={{ uri: coachAvatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarLetter}>
                {(coachName?.[0] || 'C').toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.headerName}>{coachName || 'Coach'}</Text>
            <Text style={styles.headerSubtitle}>Je coach</Text>
          </View>
        </View>
      )}

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Start een gesprek</Text>
          <Text style={styles.emptyText}>
            Stuur een bericht of spraakbericht naar je coach.
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
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />
      )}

      <ChatInput
        onSendText={handleSendText}
        onSendVoice={handleSendVoice}
        onSendMedia={handleSendMedia}
        isSending={sendText.isPending || sendVoice.isPending || sendMedia.isPending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerDark,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarLetter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  loadingContainer: {
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
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
});
