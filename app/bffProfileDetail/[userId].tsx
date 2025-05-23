// Placeholder for app/bffProfileDetail/[userId].tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useUserProfileDetail } from '@/hooks/api/useUserProfileDetail';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// Simple Badge Component (can be moved to components later)
const Badge = ({ label }: { label: string }) => (
  <View style={styles.badge}>
    <Ionicons name={label === 'Pro' ? 'star' : 'shield-checkmark'} size={16} color={palette.primary} style={{ marginRight: spacing.xs }} />
    <ThemedText style={styles.badgeText}>{label}</ThemedText>
  </View>
);

// Simple Social Button Component
const SocialButton = ({ type, isSet }: { type: 'instagram' | 'tiktok'; isSet: boolean }) => (
  <TouchableOpacity style={styles.socialButton} disabled={!isSet}>
    <Ionicons name={type === 'instagram' ? 'logo-instagram' : 'logo-tiktok'} size={20} color={isSet ? palette.text : palette.textSecondary} style={{ marginRight: spacing.sm }} />
    <ThemedText style={[styles.socialText, !isSet && styles.socialTextDisabled]}>
      {isSet ? (type === 'instagram' ? 'Instagram' : 'TikTok') : 'Not Set'}
    </ThemedText>
  </TouchableOpacity>
);

// Simple Interest Chip Component
const InterestChip = ({ interest }: { interest: string }) => (
  <View style={styles.interestChip}>
    <ThemedText style={styles.interestText}>{interest}</ThemedText>
  </View>
);

export default function BffProfileDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading, error } = useUserProfileDetail(userId || '');

  const handleGoBack = () => navigation.goBack();
  // Placeholder for options menu action
  // const handleOptionsPress = () => console.log('Options pressed for user:', userId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom', 'left', 'right']}>
        <TouchableOpacity 
          style={[styles.overlayButton, styles.backButton, {top: insets.top + spacing.sm}]} 
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.errorContent}>
          <ThemedText>Error loading profile.</ThemedText>
          <ThemedText>{error?.message || 'Profile data not found.'}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {profile.profileImageUrls.length > 0 && (
            <Image source={{ uri: profile.profileImageUrls[0] }} style={styles.profileImage} resizeMode='cover' />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
            style={styles.imageOverlay}
          />
          <View style={styles.profileInfoOverlay}>
            <View style={styles.nameAgeContainer}>
              <ThemedText style={styles.nameText}>{profile.name}, {profile.age}</ThemedText>
              {profile.isVerified && (
                <Ionicons name="checkmark-circle" size={24} color={palette.primary} style={{ marginLeft: spacing.sm }} />
              )}
            </View>
            <View style={styles.locationContainer}>
              <Text style={{ fontSize: 18 }}>{profile.countryFlag}</Text>
              <ThemedText style={styles.locationText}>{profile.location}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="person-add-outline" size={20} color={palette.text} style={{ marginRight: spacing.sm }} />
            <ThemedText style={styles.actionButtonText}>Add Friend</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={palette.text} style={{ marginRight: spacing.sm }} />
            <ThemedText style={styles.actionButtonText}>Message</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSectionsContainer}>
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>About Me</ThemedText>
            <ThemedText style={styles.sectionContent}>{profile.aboutMe}</ThemedText>
          </View>

          {profile.badges.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Badges</ThemedText>
              <View style={styles.badgesContainer}>
                {profile.badges.map((badge, index) => (
                  <Badge key={index} label={badge} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Socials</ThemedText>
            <View style={styles.socialsContainer}>
              {profile.socials.map((social, index) => (
                <SocialButton key={index} type={social.type} isSet={social.isSet} />
              ))}
            </View>
          </View>

          {profile.interests.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Interests</ThemedText>
              <View style={styles.interestsContainer}>
                {profile.interests.map((interest, index) => (
                  <InterestChip key={index} interest={interest} />
                ))}
              </View>
            </View>
          )}
          
          {profile.languages.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Languages</ThemedText>
              <View style={styles.interestsContainer}> 
                {profile.languages.map((language, index) => (
                  <InterestChip key={index} interest={language} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.overlayButton, styles.backButton, {top: insets.top + spacing.sm}]} 
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.overlayButton, styles.optionsButton, {top: insets.top + spacing.sm}]} 
        onPress={handleGoBack}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: spacing.lg, 
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: palette.background, 
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    height: Platform.OS === 'ios' ? 450 : 400,
    width: '100%',
    backgroundColor: palette.cardBackground,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  profileInfoOverlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  overlayButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    left: spacing.md,
  },
  optionsButton: {
    right: spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.background,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cardBackground,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  contentSectionsContainer: {
    padding: spacing.lg,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: palette.text,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.textSecondary,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.cardBackground,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.text,
  },
  socialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.text,
  },
  socialTextDisabled: {
    color: palette.textSecondary,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {
    backgroundColor: palette.cardBackground,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.border,
  },
  interestText: {
    fontSize: 14,
    color: palette.text,
  },
}); 