import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { Post } from '../../types/post';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: (postId: number, comment: string) => void;
  onViewComments?: (postId: number) => void;
  onToggleComment?: (postId: number) => void;
  showCommentInput?: boolean;
}

export function PostCard({ post, onPress, onLike, onComment, onViewComments, onToggleComment, showCommentInput = false }: PostCardProps) {
  const iconColor = useSafeThemeColor({}, 'text');
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };
  
  return (
    <View>
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
          <TouchableOpacity onPress={onPress}>
            <Image
              source={{ uri: post.image }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <IconSymbol 
              name={isLiked ? "heart.fill" : "heart"} 
              size={24} 
              color={isLiked ? "#FF3B30" : iconColor} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onToggleComment ? () => onToggleComment(post.id) : onPress}
          >
            <IconSymbol name="bubble.right" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="square.and.arrow.up" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <View style={styles.content}>
            <ThemedText style={styles.likes}>{post.likesCount} likes</ThemedText>
            <ThemedText style={styles.caption}>{post.caption}</ThemedText>
            
            {post.commentsCount > 0 && (
              <TouchableOpacity 
                onPress={onViewComments ? () => onViewComments(post.id) : onPress}
              >
                <ThemedText style={styles.viewComments}>
                  View all {post.commentsCount} comments
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <ThemedText style={styles.timestamp}>
              {new Date(post.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </TouchableOpacity>
        
        {showCommentInput && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Comment"
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={() => {
                if (onComment && newComment.trim()) {
                  onComment(post.id, newComment);
                  setNewComment('');
                }
              }}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={styles.commentButton}
              onPress={() => {
                if (onComment && newComment.trim()) {
                  onComment(post.id, newComment);
                  setNewComment('');
                }
              }}
            >
              <IconSymbol name="arrow.up.circle.fill" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </View>
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
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 14,
    marginRight: 8,
  },
  commentButton: {
    padding: 4,
  },
});
