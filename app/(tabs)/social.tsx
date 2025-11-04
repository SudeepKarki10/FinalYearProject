import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CommentsModal, { CommentsModalRef } from '../../components/social/CommentsModal';
import { CreatePostButton } from '../../components/social/CreatePostButton';
import { CreatePostModal } from '../../components/social/CreatePostModal';
import { PostCard } from '../../components/social/PostCard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useAuthStore } from '../../store/auth-store';
import { useSocialStore } from '../../store/social-store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createIcon: {
    marginLeft: 'auto',
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContainer: {
    flexGrow: 1,
    padding: 8,
  },
});

export default function SocialScreen() {
  const { posts, isLoading, fetchPosts, likePost, addComment } = useSocialStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const commentsModalRef = useRef<CommentsModalRef>(null);

  const themeColor = useThemeColor({}, 'text');
  const backgroundSecondary = useThemeColor({}, 'secondary');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikePost = useCallback(async (postId: number) => {
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  }, [likePost]);
  
  const handleAddComment = useCallback(async (postId: number, comment: string) => {
    try {
      await addComment(postId, comment);
      setSelectedPostId(null); // Close comment input after submitting
      // Refresh posts to update comment count
      fetchPosts();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [addComment, fetchPosts]);
  
  // Show comments modal when comment icon or "View all comments" is clicked
  const handleOpenCommentsModal = useCallback((postId: number) => {
    commentsModalRef.current?.open(postId);
  }, []);
  
  const handleToggleComment = useCallback((postId: number) => {
    // Show comments modal instead of toggling input visibility
    commentsModalRef.current?.open(postId);
  }, []);

  const EmptyComponent = () => {
    // Only show when we're not loading and there are no posts
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>No posts yet</ThemedText>
        <ThemedText style={{ textAlign: 'center', color: themeColor as string }}>
          Be the first one to share something with the community!
        </ThemedText>
      </View>
    );
  };

  // Check if token is valid when component mounts
  useEffect(() => {
    // Log out auth token value for debugging
    const checkToken = async () => {
      const { token } = useAuthStore.getState();
      if (!token) {
        console.log('No token in auth store state');
      } else {
        console.log('Token exists in auth store state');
      }
    };
    checkToken();
  }, []);
  
  // Add additional debugging for posts
  useEffect(() => {
    console.log('Social tab posts state:', posts);
    console.log('Posts array length:', posts.length);
  }, [posts]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: backgroundSecondary as string }]}> 
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Feeds</ThemedText>
          <TouchableOpacity style={styles.createIcon} onPress={() => setShowCreateModal(true)}>
            <IconSymbol name="plus.circle.fill" size={26} color={themeColor as string} />
          </TouchableOpacity>
        </View>
        
        {/* Create Post Modal */}
        <CreatePostModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostSuccess={() => {
            setShowCreateModal(false);
            fetchPosts();
          }}
        />
        
        <FlatList
          data={posts}
          renderItem={({ item }) => {
            console.log('Rendering post item:', item.id);
            return (
              <PostCard
                post={item}
                onPress={() => handleOpenCommentsModal(item.id)} 
                onLike={() => handleLikePost(item.id)}
                onComment={handleAddComment}
                onToggleComment={handleToggleComment}
                onViewComments={handleOpenCommentsModal}
                showCommentInput={selectedPostId === item.id}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchPosts} />
          }
          ListEmptyComponent={posts.length === 0 ? EmptyComponent : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
        
        {/* Floating action button to create post */}
        <CreatePostButton onPress={() => setShowCreateModal(true)} />
        
        {/* Comments Modal */}
        <CommentsModal 
          ref={commentsModalRef}
          onClose={() => fetchPosts()} // Refresh posts when modal is closed
        />
      </SafeAreaView>
    </ThemedView>
  );
}
