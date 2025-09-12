import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { useSocialStore } from '../../store/social-store';
import { Comment } from '../../types/post';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

export interface CommentsModalRef {
  open: (postId: number) => void;
  close: () => void;
}

interface CommentsModalProps {
  onClose?: () => void;
}

const CommentsModal = forwardRef<CommentsModalRef, CommentsModalProps>(({ onClose }, ref) => {
  const [postId, setPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  // We don't need post state since we're only displaying comments
  
  const textColor = useSafeThemeColor({}, 'text');
  const primaryColor = useSafeThemeColor({}, 'primary');
  const modalizeRef = React.useRef<Modalize>(null);
  const inputRef = React.useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  
  const { addComment, fetchComments } = useSocialStore();
  
  const fetchCommentsData = useCallback(async (id: number) => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log(`Attempting to fetch comments for post ${id}`);
      const fetchedComments = await fetchComments(id);
      console.log(`Received ${fetchedComments?.length || 0} comments with details:`, fetchedComments);
      
      if (fetchedComments && fetchedComments.length > 0) {
        // Deep log of the first comment to debug structure
        console.log('First comment details:', JSON.stringify(fetchedComments[0], null, 2));
      }
      
      setComments(fetchedComments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array on error to avoid undefined state
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [fetchComments]);

  const handleOpen = useCallback((id: number) => {
    setPostId(id);
    modalizeRef.current?.open();
  }, []);

  const handleClose = useCallback(() => {
    modalizeRef.current?.close();
    if (onClose) onClose();
  }, [onClose]);

  const handleAddComment = useCallback(async () => {
    if (!postId || !newComment.trim()) return;

    try {
      setLoading(true);
      console.log(`Attempting to add comment to post ${postId}`);
      const result = await addComment(postId, newComment);
      console.log('Comment add result:', result);
      setNewComment('');
      Keyboard.dismiss();
      
      // Refresh comments after adding a new one
      fetchCommentsData(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
      setLoading(false);
      
      // Show an alert with the error message if the comment fails
      Alert.alert(
        'Comment Error',
        'Unable to add your comment. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }, [postId, newComment, addComment, fetchCommentsData]);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  useEffect(() => {
    if (postId) {
      fetchCommentsData(postId);
    }
  }, [postId, fetchCommentsData]);

  const renderComment = (comment: Comment, isReply = false) => {
    return (
      <View key={comment.id} style={[styles.comment, isReply && styles.replyContainer]}>
        <View style={styles.commentHeader}>
          <Image 
            source={{ uri: comment.user.photoUrl || 'https://via.placeholder.com/40' }}
            style={styles.avatar} 
          />
          <View style={styles.commentTextContainer}>
            <View style={styles.commentMeta}>
              <ThemedText style={styles.username}>{comment.user.displayName}</ThemedText>
              <ThemedText style={styles.timestamp}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
            <ThemedText>{comment.content}</ThemedText>
          </View>
        </View>
        
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Portal>
      <Modalize
        ref={modalizeRef}
        handleStyle={styles.modalHandle}
        modalStyle={[styles.modalContainer, { paddingBottom: insets.bottom }]}
        withHandle={true}
        modalHeight={500}
        disableScrollIfPossible={false}
        modalTopOffset={60}
        HeaderComponent={
          <SafeAreaView style={{ paddingTop: insets.top > 0 ? 0 : 10 }}>
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>Comments</ThemedText>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        }
        FooterComponent={
          <SafeAreaView>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              style={styles.footer}
            >
              <View style={styles.commentInputContainer}>
                <TextInput 
                  ref={inputRef}
                  style={[styles.commentInput, { color: textColor }]}
                  placeholder="Add a comment..."
                  placeholderTextColor="#999"
                  value={newComment}
                  onChangeText={setNewComment}
                  returnKeyType="send"
                  onSubmitEditing={handleAddComment}
                />
                <TouchableOpacity 
                  style={styles.sendButton} 
                  onPress={handleAddComment}
                >
                  <IconSymbol 
                    name="arrow.up.circle.fill" 
                    size={30} 
                    color={primaryColor as string} 
                  />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        }
        flatListProps={{
          data: comments,
          renderItem: ({ item }: { item: Comment }) => renderComment(item),
          keyExtractor: (item: Comment) => item.id.toString(),
          ListEmptyComponent: loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No comments yet.
              </ThemedText>
              <TouchableOpacity onPress={() => inputRef.current?.focus()}>
                <ThemedText style={styles.commentPrompt}>
                  Be the first one to comment!
                </ThemedText>
              </TouchableOpacity>
            </View>
          ),
          contentContainerStyle: styles.commentsList,
          showsVerticalScrollIndicator: false,
        }}
        onClosed={() => setPostId(null)}
      />
    </Portal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: Platform.OS === 'ios' ? '90%' : '80%',
  },
  modalHandle: {
    backgroundColor: '#ddd',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  comment: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
  repliesContainer: {
    marginLeft: 46,
    marginTop: 8,
  },
  replyContainer: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    paddingVertical: 8,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    padding: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  sendButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  commentPrompt: {
    color: '#007AFF',
    fontWeight: '600',
  }
});

CommentsModal.displayName = 'CommentsModal';

export default CommentsModal;
