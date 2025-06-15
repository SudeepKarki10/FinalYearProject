import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/Colors";
import { useAuthStore } from "../../store/auth-store";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  //   React.useEffect(() => {
  //   console.log('ProfileScreen User Data:', user?.user?.email);
  //   console.log('Is Authenticated:', isAuthenticated);
  // }, []);

  
  // Get first character for avatar placeholder
  const getAvatarText = () => {
    if (!isAuthenticated) return 'G';
    return user?.display_name?.[0] || user?.username?.[0] || 'U';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileHeader}>
        {isAuthenticated && user?.photo_url ? (
          <Image 
            source={{ uri: user.photo_url }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getAvatarText()}</Text>
          </View>
        )}
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
            {isAuthenticated ? user?.display_name || user?.username : 'Guest'}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1} ellipsizeMode="tail">
            {isAuthenticated ? user?.user?.email || 'No email provided' : 'Sign in to access your profile'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Activities</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Favorite Treks</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Trip Plans</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Achievements</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Visited Places</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Permit History</Text>
          </View>

          {!isAuthenticated ? (
            <>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                  <Text style={styles.primaryButtonText}>Login</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/auth/register" asChild>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                </TouchableOpacity>
              </Link>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8}
              onPress={async () => {
                await logout();
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: colors.card,
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
    maxWidth: '90%',
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    maxWidth: '90%',
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  activityText: {
    color: colors.text,
  },
});