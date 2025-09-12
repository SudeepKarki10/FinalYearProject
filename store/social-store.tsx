import { Alert } from 'react-native';
import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { Post } from '../types/post';
import { getAuthHeaders } from './auth-store';

interface SocialStore {
  posts: Post[];
  isLoading: boolean;
  userPost: string;
  fetchPosts: () => Promise<void>;
  setUserPost: (text: string) => void;
  createPost: (caption: string, image?: string, trekId?: number) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  posts: [],
  isLoading: false,
  userPost: '',

  setUserPost: (text: string) => set({ userPost: text }),

  fetchPosts: async () => {
    try {
      set({ isLoading: true });
      
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}posts/`, {
        headers,
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({ posts: data.data });
      } else {
        Alert.alert('Error', data.error || 'Failed to load posts');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (caption: string, image?: string, trekId: number = 1) => {
    // Using trek ID 1 as the default "General" trek for non-trek-specific posts
    try {
      set({ isLoading: true });
      
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      // Prepare payload according to API documentation
      const postData = {
        // Use provided trekId parameter
        trek: trekId,
        // Use caption as content
        content: caption,
        // Convert single image to array if present
        images: image ? [image] : []
      };
      
      console.log('Sending post data:', JSON.stringify(postData));
      
      console.log('Sending post data:', postData);
      
      const response = await fetch(`${API_BASE_URL}posts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      
      if (data.success) {
        set({ userPost: '' }); // Clear the input
        get().fetchPosts(); // Refresh posts
      } else {
        Alert.alert('Error', data.error || 'Failed to create post');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  likePost: async (postId: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}posts/${postId}/like/`, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        // Update the post in the local state
        const posts = get().posts;
        const updatedPosts = posts.map(post =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + 1 }
            : post
        );
        set({ posts: updatedPosts });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
      Alert.alert('Error', errorMessage);
      console.error(error);
    }
  },

  deletePost: async (postId: number) => {
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
        // Remove the post from local state
        const posts = get().posts;
        set({ posts: posts.filter(post => post.id !== postId) });
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to delete post');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      Alert.alert('Error', errorMessage);
      console.error(error);
    }
  },
}));
