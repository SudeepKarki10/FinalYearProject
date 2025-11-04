import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { PostCard } from '../../components/social/PostCard';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { API_BASE_URL } from '../../constants/config';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { getAuthHeaders } from '../../store/auth-store';
import { useSocialStore } from '../../store/social-store';
import { Comment, Post } from '../../types/post';

// Helper function to format API comment data into our Comment interface
const processComments = (commentsData: any[]): Comment[] => {
  return commentsData.map(comment => ({
    id: comment.id,
    user: {
      id: comment.user?.id || 0,
      displayName: comment.user?.display_name || 'Unknown User',
      photoUrl: comment.user?.photo_url
    },
    content: comment.content || '',
    createdAt: new Date(comment.created_at || Date.now()).toLocaleDateString(),
    // If there are replies, process them recursively
    replies: comment.replies && Array.isArray(comment.replies) 
      ? processComments(comment.replies) 
      : []
  }));
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { addComment, fetchComments: fetchCommentsStore } = useSocialStore();
  const commentInputRef = React.useRef<TextInput>(null);
  
  const textColor = useSafeThemeColor({}, 'text');
  const primaryColor = useSafeThemeColor({}, 'primary');

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      console.log(`Fetching post details for ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}posts/${id}/`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Post detail response:', responseData);
      
      // Check if response is a success/data object or direct data
      const postData = responseData.success && responseData.data ? responseData.data : responseData;
      
      // Format the post to match the Post interface
      const formattedPost = {
        id: postData.id,
        user: {
          id: postData.user?.id || 0,
          displayName: postData.user?.display_name || 'Unknown User',
          photoUrl: postData.user?.photo_url
        },
        caption: postData.content || '',
        image: postData.images && postData.images.length > 0 ? postData.images[0] : undefined,
        location: postData.location ? {
          placeName: postData.location.place_name || '',
          latitude: postData.location.latitude || 0,
          longitude: postData.location.longitude || 0
        } : undefined,
        likesCount: postData.likes_count || 0,
        commentsCount: postData.comments_count || 0,
        isLiked: postData.is_liked || false,
        createdAt: postData.created_at || new Date().toISOString()
      };
      
      setPost(formattedPost);
      
      // If the API response includes comments, process them directly
      if (postData.comments && Array.isArray(postData.comments)) {
        const formattedComments = processComments(postData.comments);
        setComments(formattedComments);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load post';
      console.error('Error fetching post:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      // We'll only try to fetch comments separately if they're not included in the post response
      if (comments.length === 0) {
        console.log(`Fetching comments for post ID: ${id}`);
        const postId = typeof id === 'string' ? parseInt(id, 10) : 0;
        if (isNaN(postId) || postId <= 0) {
          console.error('Invalid post ID');
          return;
        }
        
        try {
          const fetchedComments = await fetchCommentsStore(postId);
          if (fetchedComments && fetchedComments.length > 0) {
            setComments(fetchedComments);
          } else {
            // Empty array means no comments - which is valid, not an error
            console.log('No comments found for this post');
          }
        } catch (error) {
          console.log('Comment fetch failed, but this is handled gracefully:', error);
          // We'll show the "No comments" message instead of an error
        }
      }
    } catch (error) {
      console.log('Error in fetchComments, showing empty comments state:', error);
      // Don't show an alert for comment fetching failures
    }
  }, [id, fetchCommentsStore, comments.length]);

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const postId = typeof id === 'string' ? parseInt(id, 10) : 0;
      if (isNaN(postId) || postId <= 0) {
        console.error('Invalid post ID');
        return;
      }
      
      await addComment(postId, newComment);
      setNewComment('');
      
      // Update the post comment count if successful
      if (post) {
        setPost({
          ...post,
          commentsCount: post.commentsCount + 1
        });
      }
      
      // Fetch the post again to get updated comments
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPost}
            colors={[primaryColor as string]}
          />
        }>
        <PostCard post={post} />
        
        <View style={styles.commentsSection}>
          <ThemedText style={styles.commentsTitle}>Comments</ThemedText>
          
          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <ThemedText style={styles.commentUser}>
                  {comment.user.displayName}
                </ThemedText>
                <ThemedText style={styles.commentContent}>
                  {comment.content}
                </ThemedText>
                <ThemedText style={styles.commentTime}>
                  {comment.createdAt}
                </ThemedText>
                
                {/* Show nested replies if available */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {comment.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyComment}>
                        <ThemedText style={styles.commentUser}>
                          {reply.user.displayName}
                        </ThemedText>
                        <ThemedText style={styles.commentContent}>
                          {reply.content}
                        </ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {reply.createdAt}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noCommentsContainer}>
              <ThemedText style={styles.noCommentsText}>
                No comments yet.
              </ThemedText>
              <TouchableOpacity 
                onPress={() => {
                  // Focus the comment input when the user taps on this
                  if (commentInputRef.current) {
                    commentInputRef.current.focus();
                  }
                }}
              >
                <ThemedText style={[styles.noCommentsText, styles.commentPrompt]}>
                  Be the first one to comment!
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          ref={commentInputRef}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#666"
          style={[styles.input, { color: textColor }]}
        />
        <TouchableOpacity 
          onPress={handleComment}
          style={[styles.sendButton, { backgroundColor: primaryColor }]}
        >
          <IconSymbol name="arrow.right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  comment: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  commentUser: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 8,
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 12,
  },
  replyComment: {
    marginBottom: 12,
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  commentPrompt: {
    color: '#007AFF',
    fontWeight: '600',
    opacity: 1,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
