import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useSocialStore } from '../../store/social-store';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
}

export function CreatePostModal({ visible, onClose, onPostSuccess }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { createPost } = useSocialStore();
  const { user } = useAuthStore();
  const themeColor = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');

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
          setMedia(imageUrl); // Update preview with uploaded image
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
      // Convert image to base64
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

      // Cloudinary upload configuration
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

  const handlePost = async () => {
    setError('');
    setUploading(true);
    try {
      await createPost(caption, media || '', 1); // Using trek ID 1 as default
      setCaption('');
      setMedia(null);
      onPostSuccess();
    } catch (error: any) {
      console.log('Create post error:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
                <ThemedText style={styles.title}>Post</ThemedText>
                <TouchableOpacity onPress={handlePost} disabled={uploading || (!caption && !media)}>
                  <ThemedText style={[styles.publish, { opacity: uploading || (!caption && !media) ? 0.5 : 1 }]}>Post</ThemedText>
                </TouchableOpacity>
              </View>

              {/* User Info (from auth store) */}
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

              {/* Content Container with scrollable caption area */}
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
                  <Image source={{ uri: media }} style={styles.mediaPreview} />
                )}

                {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
                {uploading && <ActivityIndicator style={{ marginTop: 12 }} />}
              </View>

              {/* Fixed Media Picker */}
              <View style={[styles.mediaRow, { backgroundColor: cardBackground as string }]}>
                <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
                  <IconSymbol name="photo" size={24} color={themeColor as string} />
                </TouchableOpacity>
                {/* Add more icons for video, camera, etc. if needed */}
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
  scrollContent: {
    flex: 1,
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
  mediaPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
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
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
});
