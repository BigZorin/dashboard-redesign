import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchGroups,
  fetchGroupMessages,
  sendGroupTextMessage,
  sendGroupVoiceMessage,
  markGroupAsRead,
  fetchGroupMembers,
  toggleGroupMute,
} from '../lib/groupApi';
import { supabase } from '../lib/supabase';

export const groupKeys = {
  all: ['groups'] as const,
  list: () => [...groupKeys.all, 'list'] as const,
  messages: (groupId: string) => [...groupKeys.all, 'messages', groupId] as const,
  members: (groupId: string) => [...groupKeys.all, 'members', groupId] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: fetchGroups,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useGroupMessages(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.messages(groupId || ''),
    queryFn: () => fetchGroupMessages(groupId!),
    enabled: !!groupId,
    staleTime: 15 * 1000,
    refetchInterval: 10 * 1000,
  });
}

export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.members(groupId || ''),
    queryFn: () => fetchGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendGroupText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, content }: { groupId: string; content: string }) =>
      sendGroupTextMessage(groupId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.messages(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.list(),
      });
    },
  });
}

export function useSendGroupVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      audioUri,
      durationSeconds,
    }: {
      groupId: string;
      audioUri: string;
      durationSeconds: number;
    }) => sendGroupVoiceMessage(groupId, audioUri, durationSeconds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.messages(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.list(),
      });
    },
  });
}

export function useMarkGroupRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => markGroupAsRead(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useToggleGroupMute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => toggleGroupMute(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

/**
 * Realtime subscription for group messages.
 */
export function useRealtimeGroupMessages(groupId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: groupKeys.messages(groupId),
          });
          queryClient.invalidateQueries({
            queryKey: groupKeys.list(),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, queryClient]);
}
