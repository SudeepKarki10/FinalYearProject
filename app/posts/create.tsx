import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useSafeThemeColor } from '../../hooks/useSafeThemeColor';
import { useSocialStore } from '../../store/social-store';

export default function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createPost } = useSocialStore();
  
  const buttonBackground = useSafeThemeColor({}, 'primary');
  const textColor = useSafeThemeColor({}, 'text');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
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
      throw error;
    }
  };

  const handlePost = async () => {
    if (!caption.trim() && !image) {
      Alert.alert('Error', 'Please add a caption or image');
      return;
    }

    try {
      setIsLoading(true);
      
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }
      
      await createPost(caption, imageUrl);
      router.back();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      Alert.alert('Error', errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Create Post</ThemedText>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={isLoading}
          style={[styles.postButton, { backgroundColor: buttonBackground }]}
        >
          <ThemedText style={styles.postButtonText}>
            {isLoading ? 'Posting...' : 'Post'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {image ? (
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: image }} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={pickImage}
            style={styles.imagePicker}
          >
            <IconSymbol name="photo" size={48} color={textColor} />
            <ThemedText>Tap to add a photo</ThemedText>
          </TouchableOpacity>
        )}

        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          style={[styles.input, { color: textColor }]}
        />
      </View>
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
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
  },
});
