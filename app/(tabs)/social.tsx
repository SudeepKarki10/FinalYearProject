import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
});

export default function SocialScreen() {
  const { posts, isLoading, fetchPosts, likePost } = useSocialStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>No posts yet</ThemedText>
      <ThemedText style={{ textAlign: 'center', color: themeColor as string }}>
        Be the first one to share something with the community!
      </ThemedText>
    </View>
  );

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: backgroundSecondary as string }]}> 
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Community</ThemedText>
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
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => router.push(`../posts/${item.id}`)}
              onLike={() => handleLikePost(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchPosts} />
          }
          ListEmptyComponent={EmptyComponent}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Floating action button to create post */}
        <CreatePostButton onPress={() => setShowCreateModal(true)} />
      </SafeAreaView>
    </ThemedView>
  );
}
