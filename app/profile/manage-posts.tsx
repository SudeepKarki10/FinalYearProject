import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EditPostModal } from '../../components/social/EditPostModal';
import { PostCard } from '../../components/social/PostCard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { API_BASE_URL } from '../../constants/config';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { useAuthStore } from '../../store/auth-store';
import { Post } from '../../types/post';

export default function ManagePostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const textColor = useSafeThemeColor({}, 'text');
  const { token } = useAuthStore();

  const fetchUserPosts = useCallback(async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in again');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}posts/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Fetched posts response:', responseData);
      
      // Handle the same response format as the social store
      const postsArray = Array.isArray(responseData) ? responseData : 
        responseData.success && responseData.data ? responseData.data : [];
      
      if (postsArray && postsArray.length > 0) {
        // Format posts to match the Post interface (same as social store)
        const formattedPosts: Post[] = postsArray.map((post: any) => ({
          id: post.id,
          user: {
            id: post.user?.id || 0,
            displayName: post.user?.display_name || 'Unknown User',
            photoUrl: post.user?.photo_url
          },
          caption: post.content || '',
          image: post.images && post.images.length > 0 ? post.images[0] : undefined,
          location: post.location ? {
            placeName: post.location.place_name || '',
            latitude: post.location.latitude || 0,
            longitude: post.location.longitude || 0
          } : undefined,
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          isLiked: post.is_liked || false,
          createdAt: post.created_at || new Date().toISOString()
        }));
        
        // Filter to show only current user's posts
        const { user } = useAuthStore.getState();
        const currentUserId = user?.id || user?.user?.id;
        const userPosts = formattedPosts.filter(post => post.user.id === currentUserId);
        
        console.log('Formatted posts:', formattedPosts.length);
        console.log('User posts filtered:', userPosts.length);
        setPosts(userPosts);
      } else {
        console.log('No posts found in API response');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleDelete = async (postId: number) => {
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in again');
      return;
    }

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}posts/${postId}/`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                // Remove the deleted post from the local state
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                Alert.alert('Success', 'Post deleted successfully');
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete post');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
              Alert.alert('Error', errorMessage);
              console.error('Error deleting post:', error);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Refresh posts after successful edit
    fetchUserPosts();
    setShowEditModal(false);
    setEditingPost(null);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postItem}>
      <PostCard
        post={item}
        onPress={() => router.push(`../posts/${item.id}`)}
        onLike={() => {
          // Optional: Handle like functionality if needed
          console.log('Liked post:', item.id);
        }}
        onComment={() => {
          // Optional: Handle comment functionality if needed
          console.log('Comment on post:', item.id);
        }}
      />
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <IconSymbol name="pencil" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="photo.on.rectangle" size={48} color={textColor} />
      <ThemedText style={styles.emptyTitle}>No posts yet</ThemedText>
      <ThemedText style={styles.emptyMessage}>
        Your posts will appear here once you start sharing
      </ThemedText>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Manage Posts</ThemedText>
          <View style={styles.placeholder} />
        </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchUserPosts} />
        }
        ListEmptyComponent={!isLoading ? EmptyComponent : null}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        visible={showEditModal}
        post={editingPost}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        onEditSuccess={handleEditSuccess}
      />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  list: {
    padding: 8,
    flexGrow: 1,
  },
  postItem: {
    position: 'relative',
    marginBottom: 16,
  },
  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
