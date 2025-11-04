import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface Post {
  id: number;
  user: {
    id: number;
    displayName: string;
    photoUrl?: string;
  };
  caption: string;
  image?: string;
  location?: {
    placeName: string;
    latitude: number;
    longitude: number;
  };
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('YOUR_API_URL/api/posts/');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to load posts');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load posts');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPosts = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    refreshPosts,
  };
}
