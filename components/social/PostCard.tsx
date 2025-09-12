import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { Post } from '../../types/post';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
}

export function PostCard({ post, onPress, onLike }: PostCardProps) {
  const iconColor = useSafeThemeColor({}, 'text');

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: post.user.photoUrl || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <View>
              <ThemedText style={styles.username}>{post.user.displayName}</ThemedText>
              {post.location && (
                <ThemedText style={styles.location}>{post.location.placeName}</ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity>
            <IconSymbol name="ellipsis" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <IconSymbol 
              name={post.isLiked ? "heart.fill" : "heart"} 
              size={24} 
              color={post.isLiked ? "#FF3B30" : iconColor} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="bubble.right" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="square.and.arrow.up" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.likes}>{post.likesCount} likes</ThemedText>
          <ThemedText style={styles.caption}>{post.caption}</ThemedText>
          {post.commentsCount > 0 && (
            <TouchableOpacity>
              <ThemedText style={styles.viewComments}>
                View all {post.commentsCount} comments
              </ThemedText>
            </TouchableOpacity>
          )}
          <ThemedText style={styles.timestamp}>{post.createdAt}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    fontSize: 12,
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 300,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
  },
  actionButton: {
    marginRight: 16,
  },
  content: {
    padding: 12,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 4,
  },
  caption: {
    marginBottom: 8,
  },
  viewComments: {
    opacity: 0.7,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
});
