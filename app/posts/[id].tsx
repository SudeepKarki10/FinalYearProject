import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '../../components/ThemedText';
import { PostCard } from '../../components/social/PostCard';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { API_BASE_URL } from '../../constants/config';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { getAuthHeaders } from '../../store/auth-store';

interface Comment {
  id: number;
  user: {
    id: number;
    displayName: string;
    photoUrl?: string;
  };
  content: string;
  createdAt: string;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const textColor = useSafeThemeColor({}, 'text');
  const primaryColor = useSafeThemeColor({}, 'primary');

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}posts/${id}/`, {
        headers,
      });
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to load post');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load post';
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        console.log('No authentication token found');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}posts/${id}/comments/`, {
        headers,
      });
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to load comments');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      Alert.alert('Error', errorMessage);
      console.error(error);
    }
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      // Prepare comment data according to API docs
      const commentData = {
        post: id,
        content: newComment,
        parent: null // Include parent field as per API docs
      };
      
      console.log('Sending comment data:', commentData);
      
      const response = await fetch(`${API_BASE_URL}comments/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(commentData),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
      } else {
        Alert.alert('Error', data.error || 'Failed to post comment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment';
      Alert.alert('Error', errorMessage);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  if (!post) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <PostCard post={post} />
        
        <View style={styles.commentsSection}>
          <ThemedText style={styles.commentsTitle}>Comments</ThemedText>
          
          {comments.map((comment) => (
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
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
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
