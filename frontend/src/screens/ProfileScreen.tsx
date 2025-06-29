import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  TextInput,
  Modal,
  Platform,
  ActionSheetIOS,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { User, Booking, Review, Event } from "../types";
import { theme } from "../constants/theme";
import { apiService } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProfileScreenProps {
  currentUser: User;
  onEventPress?: (eventId: string) => void;
  onLogout?: () => void;
  savedEvents?: Event[];
  onToggleSave?: (eventId: string) => void;
}

const THEME_STORAGE_KEY = "@freeday_theme";

export default function ProfileScreen({
  currentUser,
  onEventPress,
  onLogout,
  savedEvents = [],
  onToggleSave,
}: ProfileScreenProps) {
  const [user, setUser] = useState<User>(currentUser);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<
    "saved" | "history" | "reviews" | "preferences"
  >("saved");
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "auto">(
    "light"
  );
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone || "",
    avatarUrl: currentUser.avatarUrl || "",
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    eventUpdates: true,
    marketingEmails: false,
  });

  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    loadUserData();
    loadThemePreference();
  }, []);

  const loadUserData = async () => {
    try {
      const bookings = await apiService.getUserBookings();
      setBookingHistory(bookings);

      // Load user reviews
      const reviews = await apiService.getUserReviews();
      setUserReviews(reviews);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ["light", "dark", "auto"].includes(savedTheme)) {
        setCurrentTheme(savedTheme as "light" | "dark" | "auto");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const saveThemePreference = async (theme: "light" | "dark" | "auto") => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        onPress: async () => {
          try {
            await apiService.logout();
            onLogout?.();
          } catch (error) {
            console.error("Logout error:", error);
            onLogout?.();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await apiService.updateUserProfile({
        name: editForm.name,
        phone: editForm.phone,
        avatarUrl: editForm.avatarUrl,
      });
      setUser(updatedUser);
      setEditModalVisible(false);
      Alert.alert(t("common.success"), t("profile.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.error"), t("profile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common.cancel"),
            t("profile.takePhoto"),
            t("profile.chooseFromGallery"),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          }
        }
      );
    } else {
      Alert.alert(t("profile.changeAvatar"), t("profile.selectAvatarSource"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("profile.takePhoto"), onPress: openCamera },
        { text: t("profile.chooseFromGallery"), onPress: openGallery },
      ]);
    }
  };

  const openCamera = async () => {
    // Camera implementation would go here
    // For now, just set a placeholder
    setEditForm((prev) => ({
      ...prev,
      avatarUrl: "https://via.placeholder.com/120",
    }));
  };

  const openGallery = async () => {
    // Gallery implementation would go here
    // For now, just set a placeholder
    setEditForm((prev) => ({
      ...prev,
      avatarUrl: "https://via.placeholder.com/120",
    }));
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "ADMIN":
        return `👑 ${t("role.ADMIN")}`;
      case "HOST":
        return `🎯 ${t("role.HOST")}`;
      case "USER":
      default:
        return `👤 ${t("role.USER")}`;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "#FF6B35";
      case "HOST":
        return "#6366F1";
      case "USER":
      default:
        return "#6B7280";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return theme.colors.success;
      case "PENDING":
        return theme.colors.warning;
      case "CANCELLED":
        return theme.colors.error;
      case "ATTENDED":
        return theme.colors.primary;
      default:
        return theme.colors.textTertiary;
    }
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return t("bookings.confirmed");
      case "PENDING":
        return t("bookings.pending");
      case "CANCELLED":
        return t("bookings.cancelled");
      case "ATTENDED":
        return t("bookings.attended");
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "saved":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{t("profile.savedEvents")}</Text>
            {savedEvents.length > 0 ? (
              savedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.savedEventItem}
                  onPress={() => onEventPress?.(event.id)}
                >
                  <Image
                    source={{
                      uri: event.imageUrl || "https://via.placeholder.com/60",
                    }}
                    style={styles.savedEventImage}
                  />
                  <View style={styles.savedEventInfo}>
                    <Text style={styles.savedEventTitle}>{event.title}</Text>
                    <Text style={styles.savedEventSubtitle}>
                      {formatDate(event.startTime)}
                    </Text>
                    <Text style={styles.savedEventLocation}>
                      📍 {event.location.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => onToggleSave?.(event.id)}
                  >
                    <Text style={styles.saveButtonText}>❤️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💾</Text>
                <Text style={styles.emptyStateText}>
                  {t("profile.noSavedEvents")}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {t("profile.saveEventsHint")}
                </Text>
              </View>
            )}
          </View>
        );

      case "history":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{t("profile.bookingHistory")}</Text>
            {bookingHistory.length > 0 ? (
              bookingHistory.map((booking) => (
                <View key={booking.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyItemTitle}>
                      {booking.event?.title || t("profile.unknownEvent")}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getBookingStatusColor(
                            booking.status
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getBookingStatusText(booking.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyItemDate}>
                    {`${t("profile.registeredOn")}: ${formatDate(
                      booking.createdAt
                    )}`}
                  </Text>
                  {booking.event && (
                    <Text style={styles.historyItemEventDate}>
                      {`${t("profile.eventDate")}: ${formatDate(
                        booking.event.startTime
                      )}`}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📚</Text>
                <Text style={styles.emptyStateText}>
                  {t("profile.noBookingHistory")}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {t("profile.bookingHistoryHint")}
                </Text>
              </View>
            )}
          </View>
        );

      case "reviews":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{t("profile.reviews")}</Text>
            {userReviews.length > 0 ? (
              userReviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewEventTitle}>
                      {review.event?.title || t("profile.unknownEvent")}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={[
                          styles.reviewStar,
                          star <= review.rating && styles.reviewStarFilled,
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>⭐</Text>
                <Text style={styles.emptyStateText}>
                  {t("profile.noReviews")}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {t("profile.writeFirstReview")}
                </Text>
              </View>
            )}
          </View>
        );

      case "preferences":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{t("profile.preferences")}</Text>

            {/* Categories */}
            <TouchableOpacity style={styles.preferenceItem}>
              <Text style={styles.preferenceIcon}>🏷️</Text>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>
                  {t("profile.categories")}
                </Text>
                <Text style={styles.preferenceSubtitle}>
                  {t("profile.updateFavoriteCategories")}
                </Text>
              </View>
              <Text style={styles.preferenceArrow}>→</Text>
            </TouchableOpacity>

            {/* Budget */}
            <TouchableOpacity style={styles.preferenceItem}>
              <Text style={styles.preferenceIcon}>💰</Text>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>
                  {t("profile.budget")}
                </Text>
                <Text style={styles.preferenceSubtitle}>
                  {t("profile.setPriceRange")}
                </Text>
              </View>
              <Text style={styles.preferenceArrow}>→</Text>
            </TouchableOpacity>

            {/* Notifications */}
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceSectionTitle}>
                {t("profile.notifications")}
              </Text>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>🔔</Text>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>
                    {t("profile.pushNotifications")}
                  </Text>
                  <Text style={styles.preferenceSubtitle}>
                    {t("profile.receiveAppNotifications")}
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.pushNotifications}
                  onValueChange={(value) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      pushNotifications: value,
                    }))
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                />
              </View>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📧</Text>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>
                    {t("profile.emailNotifications")}
                  </Text>
                  <Text style={styles.preferenceSubtitle}>
                    {t("profile.receiveEmailUpdates")}
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.emailNotifications}
                  onValueChange={(value) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      emailNotifications: value,
                    }))
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                />
              </View>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📅</Text>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>
                    {t("profile.eventUpdates")}
                  </Text>
                  <Text style={styles.preferenceSubtitle}>
                    {t("profile.notifyEventChanges")}
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.eventUpdates}
                  onValueChange={(value) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      eventUpdates: value,
                    }))
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                />
              </View>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📢</Text>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>
                    {t("profile.marketingEmails")}
                  </Text>
                  <Text style={styles.preferenceSubtitle}>
                    {t("profile.receivePromotions")}
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.marketingEmails}
                  onValueChange={(value) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      marketingEmails: value,
                    }))
                  }
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                />
              </View>
            </View>

            {/* Privacy */}
            <TouchableOpacity style={styles.preferenceItem}>
              <Text style={styles.preferenceIcon}>🔒</Text>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>
                  {t("profile.privacy")}
                </Text>
                <Text style={styles.preferenceSubtitle}>
                  {t("profile.privacySettings")}
                </Text>
              </View>
              <Text style={styles.preferenceArrow}>→</Text>
            </TouchableOpacity>

            {/* Theme */}
            <TouchableOpacity
              style={styles.preferenceItem}
              onPress={() => setThemeModalVisible(true)}
            >
              <Text style={styles.preferenceIcon}>🎨</Text>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>{t("profile.theme")}</Text>
                <Text style={styles.preferenceSubtitle}>
                  {currentTheme === "light"
                    ? t("profile.lightMode")
                    : currentTheme === "dark"
                    ? t("profile.darkMode")
                    : t("profile.autoMode")}
                </Text>
              </View>
              <Text style={styles.preferenceArrow}>→</Text>
            </TouchableOpacity>

            {/* Role-based additional options */}
            {(user.role === "HOST" || user.role === "ADMIN") && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>
                  {t("profile.hostManagement")}
                </Text>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>🎯</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.myEvents")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.manageCreatedEvents")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>💼</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.hostInfo")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.updateHostProfile")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>📊</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.statistics")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.viewReportsAnalytics")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>
                  {t("profile.systemManagement")}
                </Text>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>👥</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.manageUsers")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.viewManageAccounts")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>🛡️</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.contentModeration")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.moderateEventsReviews")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.preferenceItem}>
                  <Text style={styles.preferenceIcon}>⚙️</Text>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceTitle}>
                      {t("profile.systemSettings")}
                    </Text>
                    <Text style={styles.preferenceSubtitle}>
                      {t("profile.configureApplication")}
                    </Text>
                  </View>
                  <Text style={styles.preferenceArrow}>→</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Switcher */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguageModalVisible(true)}
        >
          <Text style={styles.languageButtonText}>
            🌐 {language === "en" ? "EN" : "VI"}
          </Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=6366F1&color=fff&size=120`,
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {!!user.phone && <Text style={styles.phone}>{user.phone}</Text>}
          </View>

          {/* Role Badge */}
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(user.role) },
            ]}
          >
            <Text style={styles.roleText}>{getRoleDisplay(user.role)}</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>
              ✏️ {t("profile.editProfile")}
            </Text>
          </TouchableOpacity>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bookingHistory.length}</Text>
              <Text style={styles.statLabel}>{t("profile.events")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{savedEvents.length}</Text>
              <Text style={styles.statLabel}>{t("profile.saved")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userReviews.length}</Text>
              <Text style={styles.statLabel}>{t("profile.reviews")}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: "saved", label: t("profile.saved"), icon: "💾" },
            { key: "history", label: t("profile.bookings"), icon: "📚" },
            { key: "reviews", label: t("profile.reviews"), icon: "⭐" },
            { key: "preferences", label: t("profile.preferences"), icon: "⚙️" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>
              🚪 {t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t("profile.editProfile")}</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSaveText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Avatar Section */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("profile.avatar")}</Text>
              <View style={styles.avatarEditContainer}>
                <Image
                  source={{
                    uri:
                      editForm.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${editForm.name}&background=6366F1&color=fff&size=80`,
                  }}
                  style={styles.avatarEditImage}
                />
                <TouchableOpacity
                  style={styles.avatarEditButton}
                  onPress={handleChangeAvatar}
                >
                  <Text style={styles.avatarEditButtonText}>
                    {t("profile.changeAvatar")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("profile.name")}</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, name: text }))
                }
                placeholder={t("profile.enterName")}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("profile.email")}</Text>
              <TextInput
                style={[styles.formInput, styles.formInputDisabled]}
                value={user.email}
                editable={false}
                placeholder="Email"
                placeholderTextColor={theme.colors.textTertiary}
              />
              <Text style={styles.formHint}>
                {t("profile.emailNotEditable")}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("profile.phone")}</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.phone}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, phone: text }))
                }
                placeholder={t("profile.enterPhone")}
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("profile.role")}</Text>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: getRoleColor(user.role),
                    alignSelf: "flex-start",
                  },
                ]}
              >
                <Text style={styles.roleText}>{getRoleDisplay(user.role)}</Text>
              </View>
              <Text style={styles.formHint}>{t("profile.roleManaged")}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <Text style={styles.languageModalTitle}>
              {t("common.language")}
            </Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "en" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage("en");
                setLanguageModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "en" && styles.languageOptionTextSelected,
                ]}
              >
                {t("common.english")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "vi" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage("vi");
                setLanguageModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "vi" && styles.languageOptionTextSelected,
                ]}
              >
                {t("common.vietnamese")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t("common.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <Text style={styles.languageModalTitle}>{t("profile.theme")}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                currentTheme === "light" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                saveThemePreference("light");
                setThemeModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  currentTheme === "light" && styles.languageOptionTextSelected,
                ]}
              >
                ☀️ {t("profile.lightMode")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                currentTheme === "dark" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                saveThemePreference("dark");
                setThemeModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  currentTheme === "dark" && styles.languageOptionTextSelected,
                ]}
              >
                🌙 {t("profile.darkMode")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                currentTheme === "auto" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                saveThemePreference("auto");
                setThemeModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  currentTheme === "auto" && styles.languageOptionTextSelected,
                ]}
              >
                🔄 {t("profile.autoMode")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t("common.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  profileHeader: {
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  profileImageContainer: {
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  headerText: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  phone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabIcon: {
    fontSize: theme.fontSize.base,
    marginRight: theme.spacing.xs,
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  tabContent: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tabTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  savedEventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  savedEventImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  savedEventInfo: {
    flex: 1,
  },
  savedEventTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  savedEventSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  savedEventLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  saveButton: {
    padding: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: theme.fontSize.lg,
  },
  historyItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  historyItemTitle: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  historyItemDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  historyItemEventDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  reviewItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  reviewEventTitle: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  reviewDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
  },
  reviewStar: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.borderLight,
    marginRight: theme.spacing.xs,
  },
  reviewStarFilled: {
    color: theme.colors.warning,
  },
  reviewComment: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  preferenceIcon: {
    fontSize: theme.fontSize.xl,
    marginRight: theme.spacing.md,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  preferenceSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  preferenceArrow: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textTertiary,
  },
  preferenceSection: {
    marginVertical: theme.spacing.md,
  },
  preferenceSectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: "center",
  },
  logoutContainer: {
    padding: theme.spacing.md,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
  // Role-based UI styles
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginVertical: theme.spacing.sm,
  },
  roleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginVertical: theme.spacing.sm,
  },
  editButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalCancelText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  modalSaveText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  formInputDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textSecondary,
  },
  formHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  avatarEditContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarEditImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  avatarEditButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  avatarEditButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  // Language switcher styles
  languageButton: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  // Language modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageModalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.text,
  },
  languageOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  languageOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  languageOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: theme.colors.text,
  },
  languageOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
});
