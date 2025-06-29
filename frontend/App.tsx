import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import EventDetailScreen from "./src/screens/EventDetailScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HostDashboardScreen from "./src/screens/HostDashboardScreen";
import { Event, User } from "./src/types";
import { theme } from "./src/constants/theme";
import { apiService } from "./src/services/api";
import { LanguageProvider, useLanguage } from "./src/contexts/LanguageContext";

type AuthScreen = "login" | "register" | "forgotPassword";
type MainScreen = "home" | "explore" | "bookings" | "profile" | "host";
type Screen = AuthScreen | MainScreen | "eventDetail";

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const { t } = useLanguage();

  // Check for existing auth token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasToken = await apiService.hasAuthToken();
      if (hasToken) {
        // Try to get user profile to verify token is still valid
        const user = await apiService.getUserProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
        setCurrentScreen("home");
      }
    } catch (error) {
      console.log("No valid auth token found");
      // Token is invalid or expired, stay on login screen
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting login...");
      const response = await apiService.login(email, password);
      console.log("Login successful, getting user profile...");

      try {
        const user = await apiService.getUserProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
        setCurrentScreen("home");
        console.log("Login and profile fetch successful");
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Still consider login successful if we have the token
        // but couldn't fetch the profile for some reason
        setIsAuthenticated(true);
        setCurrentScreen("home");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to let LoginScreen handle the error
    }
  };

  const handleRegister = async (userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    try {
      const response = await apiService.register({
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      });
      const user = await apiService.getUserProfile();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentScreen("home");
      console.log("Registration successful");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-throw to let RegisterScreen handle the error
    }
  };

  const handleResetPassword = (email: string) => {
    console.log("Reset password for:", email);
    // TODO: Implement password reset logic
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setCurrentScreen("eventDetail");
  };

  const handleBackFromEventDetail = () => {
    setCurrentScreen("home");
    setSelectedEvent(null);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsAuthenticated(false);
    setCurrentScreen("login");
    setSelectedEvent(null);
    setCurrentUser(null);
  };

  const handleBookingSuccess = () => {
    setCurrentScreen("bookings");
  };

  const handleToggleSave = (eventId: string) => {
    const existingIndex = savedEvents.findIndex((e) => e.id === eventId);

    if (existingIndex >= 0) {
      // Remove from saved events
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    } else {
      // Add to saved events (find the event from somewhere)
      if (selectedEvent && selectedEvent.id === eventId) {
        setSavedEvents((prev) => [...prev, selectedEvent]);
      }
    }
  };

  const isEventSaved = (eventId: string): boolean => {
    return savedEvents.some((e) => e.id === eventId);
  };

  const renderBottomNavigation = () => {
    if (!isAuthenticated || currentScreen === "eventDetail") return null;

    const navItems = [
      { key: "home", label: t("nav.home"), icon: "🏠" },
      { key: "explore", label: t("nav.explore"), icon: "🔍" },
      { key: "bookings", label: t("nav.bookings"), icon: "📅" },
      { key: "profile", label: t("nav.profile"), icon: "👤" },
    ];

    // Add Host Dashboard for HOST/ADMIN users
    if (currentUser?.role === "HOST" || currentUser?.role === "ADMIN") {
      navItems.splice(3, 0, { key: "host", label: t("nav.host"), icon: "🎯" });
    }

    return (
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              currentScreen === item.key && styles.navItemActive,
            ]}
            onPress={() => setCurrentScreen(item.key as MainScreen)}
          >
            <Text
              style={[
                styles.navIcon,
                currentScreen === item.key && styles.navIconActive,
              ]}
            >
              {item.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                currentScreen === item.key && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAuthScreens = () => {
    switch (currentScreen) {
      case "register":
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onBackToLogin={() => setCurrentScreen("login")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen
            onResetPassword={handleResetPassword}
            onBackToLogin={() => setCurrentScreen("login")}
          />
        );
      default:
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentScreen("register")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgotPassword")
            }
          />
        );
    }
  };

  const renderMainScreens = () => {
    if (!currentUser) return null; // Safety check

    switch (currentScreen) {
      case "explore":
        return <ExploreScreen onEventPress={handleEventPress} />;
      case "bookings":
        return (
          <BookingsScreen
            currentUserId={currentUser.id}
            onEventPress={handleEventPress}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            currentUser={currentUser}
            savedEvents={savedEvents}
            onEventPress={(eventId) => {
              const event = savedEvents.find((e) => e.id === eventId);
              if (event) {
                handleEventPress(event);
              }
            }}
            onToggleSave={handleToggleSave}
            onLogout={handleLogout}
          />
        );
      case "host":
        return <HostDashboardScreen currentUser={currentUser} />;
      case "eventDetail":
        return selectedEvent ? (
          <EventDetailScreen
            event={selectedEvent}
            currentUserId={currentUser.id}
            onBack={handleBackFromEventDetail}
            onBookingSuccess={handleBookingSuccess}
            onToggleSave={handleToggleSave}
            isSaved={isEventSaved(selectedEvent.id)}
          />
        ) : null;
      default:
        return (
          <HomeScreen
            currentUserId={currentUser.id}
            onEventPress={handleEventPress}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return renderAuthScreens();
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderMainScreens()}</View>
      {renderBottomNavigation()}
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 20, // For safe area
    ...theme.shadows.lg,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  navItemActive: {
    // Active state styling handled by text colors
  },
  navIcon: {
    fontSize: theme.fontSize.xl,
    marginBottom: theme.spacing.xs,
  },
  navIconActive: {
    // Active icon color handled by default emoji
  },
  navLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  comingSoonText: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  comingSoonSubtext: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
});
