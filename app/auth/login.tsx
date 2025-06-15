import { Link, useRouter } from "expo-router";
import {
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Lock,
    User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../constants/Colors";
import { useAuthStore } from "../../store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const {
    login,
    isLoading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
    isAuthenticated,
  } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    clearSuccessMessage();
  }, [clearError, clearSuccessMessage]);

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
    if (!password) {
      setLocalError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setLocalError("");
    setShowSuccess(false);

    if (!validateInputs()) return;

    try {
      await login(username, password);
      // Success handling and redirect is done in the useEffect
    } catch (err) {
      // Show error in an alert for better visibility
      Alert.alert(
        "Login Failed",
        (err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined) ||
          "Failed to login. Please check your credentials and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen if you have one
    // router.push("/auth/forgot-password");
    Alert.alert(
      "Forgot Password",
      "Please contact support to reset your password.",
      [{ text: "OK" }]
    );
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your trekking journey
            </Text>

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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don&apos;t have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.registerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});