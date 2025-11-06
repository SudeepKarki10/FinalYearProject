import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useAuthStore } from '../../store/auth-store';
import { useTrekStore } from '../../store/trek-store';
import { Post } from '../../types/post';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface EditPostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onEditSuccess: () => void;
}

export function EditPostModal({ visible, post, onClose, onEditSuccess }: EditPostModalProps) {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTrek, setSelectedTrek] = useState<{ id: number; name: string } | null>(null);
  const [showTrekSelector, setShowTrekSelector] = useState(false);
  const { user, token } = useAuthStore();
  const { treks, fetchTreks } = useTrekStore();
  const themeColor = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  
  // Initialize form with post data when modal opens
  useEffect(() => {
    if (visible && post) {
      setCaption(post.caption || '');
      setMedia(post.image || null);
      // Reset trek selection - you may want to set this based on post data if available
      setSelectedTrek(null);
      fetchTreks();
    }
  }, [visible, post, fetchTreks]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setCaption('');
      setMedia(null);
      setSelectedTrek(null);
      setError('');
    }
  }, [visible]);

  const pickMedia = async () => {
    setError('');
    setUploading(true);
    
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMedia(asset.uri);
        const imageUrl = await uploadToCloudinary(asset.uri);
        if (imageUrl) {
          setMedia(imageUrl);
        }
      }
    } catch (err: any) {
      console.log('Image picker error:', err);
      setError('Failed to select image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    setUploading(true);
    setError('');
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result;
          resolve(base64);
        };
      });
      
      reader.readAsDataURL(blob);
      const base64Img = await base64Promise;

      const cloudName = "ddykuhurr";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const formData = new FormData();
      formData.append('file', base64Img as string);
      formData.append('upload_preset', 'finalProject');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const json = await uploadResponse.json();
      
      if (uploadResponse.ok && json.secure_url) {
        return json.secure_url;
      } else {
        throw new Error(json.error?.message || 'Failed to upload image');
      }
    } catch (error: any) {
      console.log('Image upload error:', error);
      setError('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!post || !token) {
      setError('Missing post data or authentication');
      return;
    }

    setError('');
    setUploading(true);
    
    try {
      const updateData = {
        content: caption,
        images: media ? [media] : [],
        trek: selectedTrek?.id || null,
      };

      const response = await fetch(`http://192.168.18.4:8000/api/posts/${post.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const data = await response.json();
      console.log('Post updated successfully:', data);
      
      onEditSuccess();
      onClose();
    } catch (error: any) {
      console.error('Edit post error:', error);
      setError(error.message || 'Failed to update post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!post) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={styles.overlay}>
            <View style={[styles.modal, { backgroundColor: background as string }]}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                  <IconSymbol name="chevron.right" size={28} color={themeColor as string} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Edit Post</ThemedText>
                <TouchableOpacity 
                  onPress={handleUpdatePost} 
                  disabled={uploading || !caption.trim()}
                >
                  <ThemedText style={[styles.publish, { opacity: uploading || !caption.trim() ? 0.5 : 1 }]}>
                    {uploading ? 'Updating...' : 'Update'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.userRow}>
                <Image 
                  source={{ 
                    uri: user?.photo_url || 'https://via.placeholder.com/40'
                  }} 
                  style={styles.avatar} 
                />
                <View>
                  <ThemedText style={styles.username}>
                    {user?.display_name || user?.username || 'Your Name'}
                  </ThemedText>
                  <ThemedText style={styles.public}>Public</ThemedText>
                </View>
              </View>

              {/* Content Container */}
              <View style={styles.contentContainer}>
                <ScrollView 
                  style={styles.captionContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextInput
                    style={styles.captionInput}
                    placeholder="What do you want to talk about?"
                    placeholderTextColor={themeColor as string + '80'}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                  />
                </ScrollView>

                {/* Media Preview */}
                {media && (
                  <View style={styles.mediaContainer}>
                    <Image source={{ uri: media }} style={styles.mediaPreview} />
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={() => setMedia(null)}
                    >
                      <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}

                {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
                {uploading && <ActivityIndicator style={{ marginTop: 12 }} />}
              </View>

              {/* Trek Selector Modal */}
              <Modal
                visible={showTrekSelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTrekSelector(false)}
              >
                <View style={[styles.trekSelectorOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <View style={[styles.trekSelectorModal, { backgroundColor: background as string }]}>
                    <View style={styles.trekSelectorHeader}>
                      <ThemedText style={styles.trekSelectorTitle}>Select Trek</ThemedText>
                      <TouchableOpacity onPress={() => setShowTrekSelector(false)}>
                        <IconSymbol name="xmark.circle.fill" size={24} color={themeColor as string} />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.trekItem,
                        selectedTrek === null && { backgroundColor: themeColor + '20' }
                      ]}
                      onPress={() => {
                        setSelectedTrek(null);
                        setShowTrekSelector(false);
                      }}
                    >
                      <ThemedText>None (General Post)</ThemedText>
                      {selectedTrek === null && (
                        <IconSymbol name="checkmark" size={18} color={themeColor as string} />
                      )}
                    </TouchableOpacity>
                    
                    <FlatList
                      data={treks}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.trekItem,
                            selectedTrek?.id === item.id && { backgroundColor: themeColor + '20' }
                          ]}
                          onPress={() => {
                            setSelectedTrek({ id: item.id, name: item.name });
                            setShowTrekSelector(false);
                          }}
                        >
                          <ThemedText>{item.name}</ThemedText>
                          {selectedTrek?.id === item.id && (
                            <IconSymbol name="checkmark" size={18} color={themeColor as string} />
                          )}
                        </TouchableOpacity>
                      )}
                      style={styles.trekList}
                    />
                  </View>
                </View>
              </Modal>
              
              {/* Fixed Media & Trek Picker */}
              <View style={[styles.mediaRow, { backgroundColor: cardBackground as string }]}>
                <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
                  <IconSymbol name="photo" size={24} color={themeColor as string} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setShowTrekSelector(true)} 
                  style={[styles.mediaButton, selectedTrek && styles.selectedMediaButton]}
                >
                  <IconSymbol 
                    name="tag" 
                    size={24} 
                    color={selectedTrek ? '#007AFF' : themeColor as string} 
                  />
                  {selectedTrek && (
                    <View style={styles.trekBadge}>
                      <ThemedText style={styles.trekBadgeText} numberOfLines={1}>
                        {selectedTrek.name}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modal: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    marginTop: 8,
  },
  captionContainer: {
    flex: 1,
    maxHeight: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  publish: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
  },
  public: {
    fontSize: 13,
    color: '#888',
  },
  captionInput: {
    minHeight: 60,
    fontSize: 16,
    marginBottom: 8,
    color: '#222',
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  mediaPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  mediaRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mediaButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedMediaButton: {
    backgroundColor: '#e6f2ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  // Trek selector styles
  trekSelectorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  trekSelectorModal: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trekSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
  },
  trekSelectorTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  trekList: {
    maxHeight: 300,
  },
  trekItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trekBadge: {
    backgroundColor: '#007AFF30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    maxWidth: 120,
  },
  trekBadgeText: {
    fontSize: 12,
    color: '#007AFF',
  },
});