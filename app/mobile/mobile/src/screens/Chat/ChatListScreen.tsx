import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { useClientConversation } from '../../hooks/useConversation';
import { useUnreadCount } from '../../hooks/useMessages';
import { useGroups } from '../../hooks/useGroupChat';
import { Skeleton, SkeletonChatItem } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';
import type { GroupConversation } from '../../lib/groupApi';

type Tab = 'dm' | 'groups';

// ============================================================
// TYPES
// ============================================================
export interface ChatListGroup {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  memberCount?: number;
}

export interface ChatListScreenProps {
  loading?: boolean;
  conversation?: any;
  unreadCount?: number;
  groups?: ChatListGroup[];
  onOpenDM?: () => void;
  onOpenGroup?: (group: ChatListGroup) => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultGroups: ChatListGroup[] = [
  {
    id: 'g1',
    name: 'Team Hypertrofie',
    lastMessage: 'Goedemorgen! Wie gaat er vandaag trainen?',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 3,
    memberCount: 12,
  },
  {
    id: 'g2',
    name: 'Voeding Q&A',
    lastMessage: 'Nieuwe recepten zijn gedeeld',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    memberCount: 8,
  },
];

// ============================================================
// SKELETON STATE
// ============================================================
function ChatListSkeleton() {
  return (
    <View style={{ paddingTop: 4 }}>
      <SkeletonChatItem />
      <SkeletonChatItem />
      <SkeletonChatItem />
    </View>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ChatListScreen(props: ChatListScreenProps = {}) {
  const [activeTab, setActiveTab] = useState<Tab>('dm');
  const navigation = useNavigation<any>();

  const { data: hookConversation, isLoading: hookConvLoading } = useClientConversation();
  const { data: hookUnreadCount = 0 } = useUnreadCount();
  const { data: hookGroups = [], isLoading: hookGroupsLoading } = useGroups();

  const loading = props.loading ?? false;
  const conversation = props.conversation ?? hookConversation;
  const unreadCount = props.unreadCount ?? hookUnreadCount ?? 2;
  const groups = (props.groups ?? hookGroups ?? defaultGroups) as ChatListGroup[];
  const convLoading = loading || hookConvLoading;
  const groupsLoading = loading || hookGroupsLoading;

  const totalGroupUnread = groups.reduce((sum, g) => sum + (g.unreadCount || 0), 0);

  const handleOpenDM = useCallback(() => {
    if (props.onOpenDM) props.onOpenDM();
    else navigation.navigate('Chat');
  }, [navigation, props.onOpenDM]);

  const handleOpenGroup = useCallback(
    (group: ChatListGroup) => {
      if (props.onOpenGroup) props.onOpenGroup(group);
      else navigation.navigate('GroupChat', { groupId: group.id, groupName: group.name });
    },
    [navigation, props.onOpenGroup]
  );

  const renderGroupItem = useCallback(
    ({ item }: { item: ChatListGroup }) => {
      const time = item.lastMessageAt
        ? new Date(item.lastMessageAt).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      return (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => handleOpenGroup(item)}
          activeOpacity={0.7}
        >
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={20} color="#fff" />
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.name}
              </Text>
              {time ? <Text style={styles.chatTime}>{time}</Text> : null}
            </View>
            <View style={styles.chatFooter}>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {item.lastMessage || 'Nog geen berichten'}
              </Text>
              {(item.unreadCount || 0) > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.memberCount}>
              {item.memberCount} {item.memberCount === 1 ? 'lid' : 'leden'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenGroup]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Berichten"
        subtitle={unreadCount > 0 ? `${unreadCount} ongelezen` : 'Alles gelezen'}
      >
        {/* Tab bar inside header */}
        <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dm' && styles.tabActive]}
          onPress={() => setActiveTab('dm')}
        >
          <Text style={[styles.tabText, activeTab === 'dm' && styles.tabTextActive]}>
            Coach
          </Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            Groepen
          </Text>
          {totalGroupUnread > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{totalGroupUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
        </View>
      </ScreenHeader>

      {activeTab === 'dm' ? (
        <View style={styles.content}>
          {convLoading ? (
            <ChatListSkeleton />
          ) : (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={handleOpenDM}
              activeOpacity={0.7}
            >
              <View style={styles.coachAvatar}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>Mijn Coach</Text>
                </View>
                <View style={styles.chatFooter}>
                  <Text style={styles.chatPreview} numberOfLines={1}>
                    {conversation
                      ? 'Tik om te chatten'
                      : 'Nog geen coach gekoppeld'}
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {groupsLoading ? (
            <ChatListSkeleton />
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>Geen groepen</Text>
              <Text style={styles.emptyText}>
                Je coach kan je toevoegen aan groepsgesprekken.
              </Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  tabBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  list: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  memberCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
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
});
