import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMessages,
  sendTextMessage,
  sendVoiceMessage,
  sendMediaMessage,
  markMessagesAsRead,
  getUnreadCount,
} from '../lib/messageApi';
import type { MessageRecord } from '../lib/messageApi';

export const messageKeys = {
  all: ['messages'] as const,
  conversation: (conversationId: string) =>
    [...messageKeys.all, 'conversation', conversationId] as const,
  unreadCount: () => [...messageKeys.all, 'unreadCount'] as const,
};

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: messageKeys.conversation(conversationId || ''),
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 min — realtime handles new messages
  });
}

export function useSendTextMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      receiverId,
      content,
    }: {
      conversationId: string;
      receiverId: string;
      content: string;
    }) => sendTextMessage(conversationId, receiverId, content),
    onMutate: async (variables) => {
      const queryKey = messageKeys.conversation(variables.conversationId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MessageRecord[]>(queryKey);

      // Optimistic: show message instantly
      const optimistic: MessageRecord = {
        id: `sending-${Date.now()}`,
        senderId: 'me',
        receiverId: variables.receiverId,
        conversationId: variables.conversationId,
        content: variables.content,
        messageType: 'text',
        mediaUrl: null,
        mediaDuration: null,
        read: false,
        sentAt: new Date().toISOString(),
        readAt: null,
      };

      queryClient.setQueryData<MessageRecord[]>(queryKey, (old = []) => [
        ...old,
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.conversation(variables.conversationId),
          context.previous
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messageKeys.unreadCount(),
      });
    },
  });
}

export function useSendVoiceMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      receiverId,
      audioUri,
      durationSeconds,
    }: {
      conversationId: string;
      receiverId: string;
      audioUri: string;
      durationSeconds: number;
    }) => sendVoiceMessage(conversationId, receiverId, audioUri, durationSeconds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.conversationId),
      });
    },
  });
}

export function useSendMediaMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      receiverId,
      fileUri,
      messageType,
      fileName,
    }: {
      conversationId: string;
      receiverId: string;
      fileUri: string;
      messageType: 'image' | 'video' | 'document';
      fileName?: string;
    }) => sendMediaMessage(conversationId, receiverId, fileUri, messageType, fileName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.conversationId),
      });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => markMessagesAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.unreadCount(),
      });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 60 * 1000, // 1 min
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    retry: false,
  });
}
