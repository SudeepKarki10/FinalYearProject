import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { API_BASE_URL } from '../../constants/config';
import { usePosts } from '../../hooks/usePosts';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { getAuthHeaders } from '../../store/auth-store';
import { Post } from '../../types/post';

export default function ManagePostsScreen() {
  const { posts, isLoading, refreshPosts } = usePosts();
  const textColor = useSafeThemeColor({}, 'text');

  const handleDelete = async (postId: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}posts/${postId}/`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        refreshPosts();
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
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postItem}>
      <TouchableOpacity 
        style={styles.postContent}
        onPress={() => router.push(`../posts/${item.id}`)}
      >
        <View>
          <ThemedText style={styles.caption} numberOfLines={2}>
            {item.caption}
          </ThemedText>
          <ThemedText style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <IconSymbol 
              name={item.isLiked ? "heart.fill" : "heart"} 
              size={16} 
              color={item.isLiked ? "#ff2d55" : textColor} 
            />
            <ThemedText style={styles.statText}>{item.likesCount}</ThemedText>
          </View>
          <View style={styles.stat}>
            <IconSymbol name="bubble.right" size={16} color={textColor} />
            <ThemedText style={styles.statText}>{item.commentsCount}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <IconSymbol name="trash.fill" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Manage Posts</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={posts as Post[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={refreshPosts}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
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
    padding: 16,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postContent: {
    flex: 1,
    marginRight: 16,
  },
  caption: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
});
