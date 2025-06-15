import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserCheck,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image, View as ImageView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from "../../constants/Colors";
import { useAuthStore } from "../../store/auth-store";

export default function RegisterScreen() {
  const router = useRouter();
  const {
    register,
    isLoading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
    isAuthenticated,
  } = useAuthStore();

  const cloudinaryUrl = "cloudinary://234184888518959:NVwEgAfpVLl-ZgXcJHE-DdqMr9w@ddykuhurr";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    clearSuccessMessage();
  }, []);

  // Update local error state when store error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  // Handle success message and redirect
  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);

      // Redirect after a short delay
      const timer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateInputs = () => {
    if (!username.trim()) {
      setLocalError("Username is required");
      return false;
    }
    if (username.length < 3) {
      setLocalError("Username must be at least 3 characters");
      return false;
    }
    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    if (!displayName.trim()) {
      setLocalError("Display name is required");
      return false;
    }
    if (!password) {
      setLocalError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
  setUploading(true);
  setImageUploadSuccess(false);
  
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImage(asset.uri);
      
      // Create base64 string with proper format
      let base64Img = `data:image/jpg;base64,${asset.base64}`;

      // Correct Cloudinary upload URL structure
      const cloudName = "ddykuhurr"; // Your cloud name
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      // Create form data
      const formData = new FormData();
      formData.append('file', base64Img);
      formData.append('upload_preset', 'finalProject'); // Replace with your actual preset

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const json = await response.json();
      
      if (response.ok && json.secure_url) {
        setImageUrl(json.secure_url);
        setImage(json.secure_url); // Show uploaded image
        setImageUploadSuccess(true);
        
        setTimeout(() => {
          setImageUploadSuccess(false);
        }, 2000);
      } else {
        throw new Error(json.error?.message || 'Failed to upload image');
      }
    }
  } catch (err: any) {
    console.log('Image upload error:', err);
    setLocalError('Failed to upload image. Please try again.');
  } finally {
    setUploading(false);
  }
};

  const handleRegister = async () => {
    setLocalError("");
    setShowSuccess(false);

    if (!validateInputs()) return;

    try {
      await register(username, email, password, displayName, imageUrl);
      // Success handling and redirect is done in the useEffect
    } catch (err: any) {
      // Show error in an alert for better visibility
      Alert.alert(
        "Registration Failed",
        err.message || "Failed to create account. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to start your trekking journey
            </Text>

            <TouchableOpacity 
              onPress={pickImage}
              style={styles.imageUploadContainer}
              disabled={uploading}
            >
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.profileImage} 
                />
              ) : (
                <ImageView style={styles.profileImagePlaceholder}>
                  <User size={32} color={colors.textSecondary} />
                </ImageView>
              )}
            </TouchableOpacity>
            
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            )}

            {imageUploadSuccess && (
              <View style={styles.successContainer}>
                <CheckCircle
                  size={20}
                  color={colors.success}
                  style={styles.messageIcon}
                />
                <Text style={styles.successText}>Profile image uploaded successfully!</Text>
              </View>
            )}

            {localError ? (
              <View style={styles.errorContainer}>
                <AlertCircle
                  size={20}
                  color={colors.error}
                  style={styles.messageIcon}
                />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            ) : null}

            {showSuccess ? (
              <View style={styles.successContainer}>
                <CheckCircle
                  size={20}
                  color={colors.success}
                  style={styles.messageIcon}
                />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <User
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <UserCheck
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </Text>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: `${colors.error}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  successContainer: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  messageIcon: {
    marginRight: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    flex: 1,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  imageUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
});