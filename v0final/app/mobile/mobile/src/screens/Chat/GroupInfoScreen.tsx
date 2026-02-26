import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { useGroupMembers, useToggleGroupMute, useGroups } from '../../hooks/useGroupChat';
import { useUser } from '../../hooks/useUser';
import type { GroupMember } from '../../lib/groupApi';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Beheerder',
  moderator: 'Moderator',
  member: 'Lid',
};

export default function GroupInfoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId, groupName } = route.params;

  const { data: user } = useUser();
  const { data: members = [], isLoading } = useGroupMembers(groupId);
  const { data: groups = [] } = useGroups();
  const toggleMute = useToggleGroupMute();

  const group = groups.find((g) => g.id === groupId);
  const myMembership = members.find((m) => m.userId === user?.id);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Groep Info',
    });
  }, [navigation]);

  const handleToggleMute = () => {
    toggleMute.mutate(groupId, {
      onSuccess: (isMuted) => {
        Alert.alert(
          isMuted ? 'Gedempt' : 'Dempen opgeheven',
          isMuted
            ? 'Je ontvangt geen meldingen meer van deze groep.'
            : 'Je ontvangt weer meldingen van deze groep.'
        );
      },
    });
  };

  const renderMember = ({ item }: { item: GroupMember }) => {
    const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Gebruiker';
    const isMe = item.userId === user?.id;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {(item.firstName?.[0] || name[0] || 'U').toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {name} {isMe ? '(jij)' : ''}
          </Text>
          <Text style={styles.memberRole}>{ROLE_LABELS[item.role] || item.role}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Group header */}
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <Ionicons name="people" size={32} color="#fff" />
        </View>
        <Text style={styles.groupName}>{groupName}</Text>
        {group?.description ? (
          <Text style={styles.groupDescription}>{group.description}</Text>
        ) : null}
        <Text style={styles.groupMeta}>
          {members.length} {members.length === 1 ? 'lid' : 'leden'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleToggleMute}>
          <Ionicons
            name={myMembership?.isMuted ? 'notifications-off' : 'notifications'}
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.actionText}>
            {myMembership?.isMuted ? 'Dempen opheffen' : 'Groep dempen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Members list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leden</Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
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
  },
  groupHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groupIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  actions: {
    backgroundColor: theme.colors.surface,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  section: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  memberRole: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
});
