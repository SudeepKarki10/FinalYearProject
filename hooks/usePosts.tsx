import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import { getAuthHeaders } from '../store/auth-store';
import { Post } from '../types/post';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found in usePosts');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      console.log('Fetching user posts from:', `${API_BASE_URL}posts/user/`);
      
      // This endpoint should return only the current user's posts
      const response = await fetch(`${API_BASE_URL}posts/user/`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User posts API response:', data);
      
      if (data.success) {
        // Make sure all posts have the required fields from Post interface
        const formattedPosts: Post[] = data.data.map((post: any) => ({
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
        
        setPosts(formattedPosts);
      } else {
        Alert.alert('Error', data.error || 'Failed to load posts');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      console.error('Error in usePosts:', error);
      
      // Set empty posts array instead of showing alert to prevent UI disruption
      setPosts([]);
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
