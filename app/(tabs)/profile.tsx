import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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
import { useTrekStore } from "../../store/trek-store";

export default function ProfileScreen() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchFavorites, getFavoriteCount } = useTrekStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  const handleActivityPress = (activity: string) => {
    switch (activity) {
      case 'favorites':
        router.push('/favorites');
        break;
      default:
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCenter}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/images/icon.png')}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>Guest</Text>
          <Text style={styles.email}>Sign in to access your profile</Text>

          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCenter}>
        <View style={styles.avatarContainer}>
          <Image 
            source={
              user?.photo_url
                ? { uri: user.photo_url }
                : require('../../assets/images/icon.png')
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>
          {isAuthenticated ? user?.display_name || 'User' : 'Guest'}
        </Text>
        <Text style={styles.email}>
          {isAuthenticated ? user?.email || 'No email provided' : 'Sign in to access your profile'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getFavoriteCount()}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.activityGrid}>
          <View style={styles.activityRow}>
            <TouchableOpacity 
              style={styles.activityItemGrid}
              onPress={() => handleActivityPress('favorites')}
            >
              <Ionicons name="heart-outline" size={24} color={colors.text} style={styles.activityIcon} />
              <Text style={styles.activityIconText}>Favorites</Text>
            </TouchableOpacity>
            <View style={styles.activityItemGrid}>
              <Ionicons name="flag-outline" size={24} color={colors.text} style={styles.activityIcon} />
              <Text style={styles.activityIconText}>Completed</Text>
            </View>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityItemGrid}>
              <Ionicons name="star-outline" size={24} color={colors.text} style={styles.activityIcon} />
              <Text style={styles.activityIconText}>Reviews</Text>
            </View>
            <View style={styles.activityItemGrid}>
              <Ionicons name="bookmark-outline" size={24} color={colors.text} style={styles.activityIcon} />
              <Text style={styles.activityIconText}>Saved</Text>
            </View>
          </View>
        </View>

        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("/");
            }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    opacity: 0.8,
  },
  profileCenter: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityGrid: {
    width: '100%',
    paddingHorizontal: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activityItemGrid: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activityIcon: {
    marginBottom: 8,
  },
  activityIconText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 'auto',
    marginBottom: 32,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '80%',
    alignSelf: 'center',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '80%',
    marginTop: 24,
    alignSelf: 'center',
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});