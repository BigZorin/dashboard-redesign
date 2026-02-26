import { useQuery } from '@tanstack/react-query';
import { getOrCreateConversation, fetchConversations } from '../lib/messageApi';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
  current: () => [...conversationKeys.all, 'current'] as const,
};

/**
 * Get or create the client's conversation with their coach.
 */
export function useClientConversation() {
  return useQuery({
    queryKey: conversationKeys.current(),
    queryFn: getOrCreateConversation,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  });
}

/**
 * Get all conversations (for coaches with multiple clients).
 */
export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: fetchConversations,
    staleTime: 60 * 1000, // 1 min
  });
}
