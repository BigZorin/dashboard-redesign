import { supabase } from './supabase';

// Types
export interface GroupConversation {
  id: string;
  coachId: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed
  memberCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastReadAt: string | null;
  isMuted: boolean;
  // Joined
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'voice' | 'image';
  mediaUrl: string | null;
  mediaDuration: number | null;
  sentAt: string;
  // Joined
  senderName?: string;
  senderAvatar?: string;
}

function transformGroup(raw: any): GroupConversation {
  return {
    id: raw.id,
    coachId: raw.coach_id,
    name: raw.name,
    description: raw.description,
    avatarUrl: raw.avatar_url,
    isActive: raw.is_active,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function transformGroupMessage(raw: any): GroupMessage {
  return {
    id: raw.id,
    groupId: raw.group_id,
    senderId: raw.sender_id,
    content: raw.content,
    messageType: raw.message_type || 'text',
    mediaUrl: raw.media_url,
    mediaDuration: raw.media_duration,
    sentAt: raw.sent_at,
  };
}

function transformMember(raw: any): GroupMember {
  return {
    id: raw.id,
    groupId: raw.group_id,
    userId: raw.user_id,
    role: raw.role,
    joinedAt: raw.joined_at,
    lastReadAt: raw.last_read_at,
    isMuted: raw.is_muted,
  };
}

/**
 * Fetch all groups the current user is a member of.
 */
export async function fetchGroups(): Promise<GroupConversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get groups where user is a member
  const { data: memberships, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;
  if (!memberships?.length) return [];

  const groupIds = memberships.map((m: any) => m.group_id);

  const { data, error } = await supabase
    .from('group_conversations')
    .select('*')
    .in('id', groupIds)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const groups = (data || []).map(transformGroup);

  // Enrich with last message and member count
  for (const group of groups) {
    // Get member count
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);
    group.memberCount = count || 0;

    // Get last message
    const { data: lastMsg } = await supabase
      .from('group_messages')
      .select('content, sent_at')
      .eq('group_id', group.id)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMsg) {
      group.lastMessage = lastMsg.content;
      group.lastMessageAt = lastMsg.sent_at;
    }

    // Get unread count
    const membership = memberships.find((m: any) => m.group_id === group.id);
    if (membership) {
      const { data: memberData } = await supabase
        .from('group_members')
        .select('last_read_at')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberData?.last_read_at) {
        const { count: unread } = await supabase
          .from('group_messages')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
          .gt('sent_at', memberData.last_read_at);
        group.unreadCount = unread || 0;
      } else {
        // Never read — all messages are unread
        const { count: allCount } = await supabase
          .from('group_messages')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
        group.unreadCount = allCount || 0;
      }
    }
  }

  return groups;
}

/**
 * Fetch messages for a group.
 */
export async function fetchGroupMessages(
  groupId: string,
  limit: number = 50
): Promise<GroupMessage[]> {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const messages = (data || []).map(transformGroupMessage).reverse();

  // Enrich with sender names
  const senderIds = [...new Set(messages.map((m) => m.senderId))];
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', senderIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [
        p.user_id,
        {
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Gebruiker',
          avatar: p.avatar_url,
        },
      ])
    );

    for (const msg of messages) {
      const profile = profileMap.get(msg.senderId);
      if (profile) {
        msg.senderName = profile.name;
        msg.senderAvatar = profile.avatar;
      }
    }
  }

  return messages;
}

/**
 * Send a text message to a group.
 */
export async function sendGroupTextMessage(
  groupId: string,
  content: string
): Promise<GroupMessage> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: user.id,
      content,
      message_type: 'text',
    })
    .select()
    .single();

  if (error) throw error;

  // Update group updated_at
  await supabase
    .from('group_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', groupId);

  return transformGroupMessage(data);
}

/**
 * Send a voice message to a group.
 */
export async function sendGroupVoiceMessage(
  groupId: string,
  audioUri: string,
  durationSeconds: number
): Promise<GroupMessage> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileName = `groups/${groupId}/${user.id}/${Date.now()}.m4a`;
  const response = await fetch(audioUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('voice-notes')
    .upload(fileName, blob, { contentType: 'audio/m4a' });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('voice-notes')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: user.id,
      content: '🎤 Spraakbericht',
      message_type: 'voice',
      media_url: urlData.publicUrl,
      media_duration: durationSeconds,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('group_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', groupId);

  return transformGroupMessage(data);
}

/**
 * Mark group messages as read (update last_read_at on membership).
 */
export async function markGroupAsRead(groupId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('group_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', user.id);
}

/**
 * Fetch group members with profile data.
 */
export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('role', { ascending: true });

  if (error) throw error;

  const members = (data || []).map(transformMember);

  // Enrich with profile data
  const userIds = members.map((m) => m.userId);
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p])
    );

    for (const member of members) {
      const p = profileMap.get(member.userId);
      if (p) {
        member.firstName = p.first_name;
        member.lastName = p.last_name;
        member.avatarUrl = p.avatar_url;
      }
    }
  }

  return members;
}

/**
 * Toggle mute for a group.
 */
export async function toggleGroupMute(groupId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: member } = await supabase
    .from('group_members')
    .select('is_muted')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (!member) throw new Error('Not a member');

  const newMuted = !member.is_muted;

  await supabase
    .from('group_members')
    .update({ is_muted: newMuted })
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  return newMuted;
}
