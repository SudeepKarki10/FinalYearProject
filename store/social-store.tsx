import { Alert } from 'react-native';
import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { Comment, Post } from '../types/post';
import { getAuthHeaders } from './auth-store';

interface SocialStore {
  posts: Post[];
  isLoading: boolean;
  userPost: string;
  replyingTo: Comment | null;
  fetchPosts: () => Promise<void>;
  setUserPost: (text: string) => void;
  createPost: (caption: string, image?: string, trekId?: number | null) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string, parentCommentId?: number | null) => Promise<void>;
  fetchComments: (postId: number) => Promise<Comment[]>;
  likeComment: (commentId: number) => Promise<void>;
  setReplyingTo: (comment: Comment | null) => void;
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  posts: [],
  isLoading: false,
  userPost: '',
  replyingTo: null,

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
      
      console.log('Fetching social posts from:', `${API_BASE_URL}posts/`);
      
      const response = await fetch(`${API_BASE_URL}posts/`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Social posts API response:', responseData);
      
      // Check if the response is an array directly (not wrapped in data/success properties)
      const postsArray = Array.isArray(responseData) ? responseData : 
        responseData.success && responseData.data ? responseData.data : [];
      
      if (postsArray && postsArray.length > 0) {
        // Format posts to match the Post interface
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
        
        console.log('Formatted posts:', formattedPosts.length);
        set({ posts: formattedPosts });
      } else {
        console.log('No posts found in API response');
        set({ posts: [] });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Don't show an alert for network errors to avoid disrupting the user experience
      set({ posts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (caption: string, image?: string, trekId?: number | null) => {
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
        // Use trekId if provided, otherwise null
        trek: trekId || null,
        // Use caption as content
        content: caption,
        // Convert single image to array if present
        images: image ? [image] : []
      };
      
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
      
      // Find the post to determine if it's already liked
      const posts = get().posts;
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        console.log(`Post with ID ${postId} not found in state`);
        return;
      }
      
      const isCurrentlyLiked = post.isLiked;
      console.log(`Toggling like for post ${postId}. Currently liked: ${isCurrentlyLiked}`);
      
      const response = await fetch(`${API_BASE_URL}posts/${postId}/like/`, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        // Update the post in the local state
        const updatedPosts = posts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                isLiked: !isCurrentlyLiked,
                likesCount: isCurrentlyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1
              }
            : post
        );
        set({ posts: updatedPosts });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Don't show an alert for like failures to avoid disrupting UX
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
  
  addComment: async (postId: number, content: string, parentCommentId?: number | null) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      if (!content.trim()) {
        console.log('Comment content is empty');
        return;
      }
      
      console.log(`Adding comment to post ${postId}: ${content}`);
      
      // Based on backend code, the correct endpoint is /api/comments/
      const url = `${API_BASE_URL}comments/`;
      console.log('Calling API endpoint:', url);
      
      // Send the payload with post ID included
      const payload = {
        content,
        post: postId,
        ...(parentCommentId && { parent: parentCommentId })
      };
      console.log('With payload:', payload);
      
      // Use the correct endpoint for adding comments
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Log more details about the error
        console.log(`Error response status: ${response.status}`);
        console.log(`Error response URL: ${response.url}`);
        try {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
        } catch {
          console.log('Could not read error response body');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Comment added response:', data);
      
      // Update comment count in the local state
      const posts = get().posts;
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      );
      set({ posts: updatedPosts });
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error; // Re-throw to allow the UI to handle the error
    }
  },
  
  fetchComments: async (postId: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return [];
      }
      
      console.log(`Fetching comments for post ${postId}`);
      
      // Fetch the complete post data which includes comments
      const response = await fetch(`${API_BASE_URL}posts/${postId}/`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Post data with comments:', responseData);
      
      // Extract comments array from the post data
      const commentsArray = responseData.comments || [];
      
      // Format comments to match the Comment interface, including replies
      const formattedComments: Comment[] = commentsArray.map((comment: any) => ({
        id: comment.id,
        user: {
          id: comment.user?.id || 0,
          displayName: comment.user?.display_name || 'Unknown User',
          photoUrl: comment.user?.photo_url
        },
        content: comment.content || '',
        createdAt: comment.created_at || new Date().toISOString(),
        isLiked: comment.is_liked || false,
        likesCount: comment.likes_count || 0,
        // Format replies if they exist
        replies: comment.replies?.map((reply: any) => ({
          id: reply.id,
          user: {
            id: reply.user?.id || 0,
            displayName: reply.user?.display_name || 'Unknown User',
            photoUrl: reply.user?.photo_url
          },
          content: reply.content || '',
          createdAt: reply.created_at || new Date().toISOString(),
          parent: reply.parent,
          isLiked: reply.is_liked || false,
          likesCount: reply.likes_count || 0
        })) || []
      }));
      
      console.log('Formatted comments:', formattedComments.length);
      return formattedComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },
  
  likeComment: async (commentId: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.log('No authentication token found');
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      console.log(`Toggling like for comment ${commentId}`);
      
      const response = await fetch(`${API_BASE_URL}comments/${commentId}/like/`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Like comment response:', data);
      
      return data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },
  
  setReplyingTo: (comment: Comment | null) => {
    set({ replyingTo: comment });
  }
}));
