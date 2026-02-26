import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { messageKeys } from './useMessages';
import type { MessageRecord } from '../lib/messageApi';

/**
 * Subscribe to realtime messages for a conversation.
 * Adds new messages directly to cache (WhatsApp-style instant updates).
 */
export function useRealtimeMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as any;
          const newMsg: MessageRecord = {
            id: raw.id,
            senderId: raw.sender_id,
            receiverId: raw.receiver_id,
            conversationId: raw.conversation_id,
            content: raw.content,
            messageType: raw.message_type || 'text',
            mediaUrl: raw.media_url,
            mediaDuration: raw.media_duration,
            read: raw.read,
            sentAt: raw.sent_at,
            readAt: raw.read_at,
          };

          const queryKey = messageKeys.conversation(conversationId);
          queryClient.setQueryData<MessageRecord[]>(queryKey, (old = []) => {
            // Avoid duplicates (optimistic messages or double delivery)
            if (old.some((m) => m.id === newMsg.id)) return old;
            // Remove optimistic temp messages for this content
            const filtered = old.filter(
              (m) => !m.id.startsWith('sending-')
            );
            return [...filtered, newMsg];
          });

          queryClient.invalidateQueries({
            queryKey: messageKeys.unreadCount(),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as any;
          const queryKey = messageKeys.conversation(conversationId);
          queryClient.setQueryData<MessageRecord[]>(queryKey, (old = []) =>
            old.map((m) =>
              m.id === raw.id ? { ...m, read: raw.read, readAt: raw.read_at } : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
