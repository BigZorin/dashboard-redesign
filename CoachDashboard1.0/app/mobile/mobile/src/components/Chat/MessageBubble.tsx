import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import VoiceNotePlayer from './VoiceNotePlayer';
import type { MessageRecord } from '../../lib/messageApi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_MAX_WIDTH = SCREEN_WIDTH * 0.65;

type Props = {
  message: MessageRecord;
  isOwn: boolean;
  senderAvatarUrl?: string | null;
  senderName?: string;
};

export default function MessageBubble({ message, isOwn, senderAvatarUrl, senderName }: Props) {
  const time = new Date(message.sentAt).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderContent = () => {
    if (message.messageType === 'voice' && message.mediaUrl) {
      return (
        <VoiceNotePlayer
          uri={message.mediaUrl}
          duration={message.mediaDuration || 0}
          isOwn={isOwn}
        />
      );
    }

    if (message.messageType === 'image' && message.mediaUrl) {
      return (
        <Image
          source={{ uri: message.mediaUrl }}
          style={styles.imageMedia}
          resizeMode="cover"
        />
      );
    }

    if (message.messageType === 'video' && message.mediaUrl) {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(message.mediaUrl!)}
          style={styles.videoContainer}
        >
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
            <Text style={styles.videoLabel}>Video</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (message.messageType === 'document' && message.mediaUrl) {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(message.mediaUrl!)}
          style={styles.documentContainer}
        >
          <Ionicons
            name="document-text"
            size={28}
            color={isOwn ? 'rgba(255,255,255,0.9)' : theme.colors.primary}
          />
          <Text
            style={[styles.documentText, isOwn ? styles.textOwn : styles.textOther]}
            numberOfLines={2}
          >
            {message.content || 'Document'}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
        {message.content}
      </Text>
    );
  };

  const isMedia = message.messageType === 'image' || message.messageType === 'video';

  return (
    <View style={[styles.container, isOwn ? styles.containerOwn : styles.containerOther]}>
      <View style={styles.row}>
        {!isOwn && (
          senderAvatarUrl ? (
            <Image source={{ uri: senderAvatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {(senderName?.[0] || 'C').toUpperCase()}
              </Text>
            </View>
          )
        )}
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
            isMedia && styles.bubbleMedia,
          ]}
        >
          {renderContent()}
          <View style={[styles.meta, isMedia && styles.metaOverlay]}>
            <Text
              style={[
                styles.time,
                isOwn || isMedia ? styles.timeOwn : styles.timeOther,
              ]}
            >
              {time}
            </Text>
            {isOwn && (
              <Text style={[styles.readStatus, isMedia && { color: 'rgba(255,255,255,0.8)' }]}>
                ✓
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  containerOwn: {
    alignItems: 'flex-end',
  },
  containerOther: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
  bubbleMedia: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textOwn: {
    color: '#fff',
  },
  textOther: {
    color: theme.colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  metaOverlay: {
    paddingHorizontal: 10,
  },
  time: {
    fontSize: 11,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.6)',
  },
  timeOther: {
    color: theme.colors.textTertiary,
  },
  readStatus: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  imageMedia: {
    width: IMAGE_MAX_WIDTH,
    height: IMAGE_MAX_WIDTH * 0.75,
    borderRadius: 14,
  },
  videoContainer: {
    width: IMAGE_MAX_WIDTH,
    height: IMAGE_MAX_WIDTH * 0.56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  videoLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 160,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
});
