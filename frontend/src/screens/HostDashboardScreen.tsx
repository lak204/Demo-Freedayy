import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { User, Event, Booking } from "../types";
import { theme } from "../constants/theme";
import { useLanguage } from "../contexts/LanguageContext";

interface HostDashboardScreenProps {
  currentUser: User;
}

const HostDashboardScreen: React.FC<HostDashboardScreenProps> = ({
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<"events" | "bookings" | "stats">(
    "events"
  );
  const [hostEvents, setHostEvents] = useState<Event[]>([]);
  const [eventBookings, setEventBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const { t } = useLanguage();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Note: These APIs would need to be implemented in backend
      // For now, using mock data

      // Mock host events
      setHostEvents([]);
      setEventBookings([]);
      setStats({
        totalEvents: 0,
        totalBookings: 0,
        totalRevenue: 0,
        upcomingEvents: 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabHeader = () => {
    const tabs = [
      { key: "events", label: t("dashboard.events"), icon: "🎯" },
      { key: "bookings", label: t("dashboard.bookings"), icon: "📅" },
      { key: "stats", label: t("dashboard.statistics"), icon: "📊" },
    ];

    return (
      <View style={styles.tabHeader}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStatsCard = (
    title: string,
    value: string | number,
    icon: string
  ) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsIcon}>{icon}</Text>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );
  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("dashboard.yourEvents")}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>{t("dashboard.createEvent")}</Text>
        </TouchableOpacity>
      </View>
      {hostEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>{t("dashboard.noEvents")}</Text>
          <Text style={styles.emptySubtitle}>
            {t("dashboard.noEventsSubtitle")}
          </Text>
          <TouchableOpacity style={styles.createEventButton}>
            <Text style={styles.createEventButtonText}>
              {t("dashboard.createEventNow")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.eventsList}>
          {/* Event items would go here */}
        </ScrollView>
      )}
    </View>
  );
  const renderBookingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{t("dashboard.manageBookings")}</Text>
      {eventBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>{t("dashboard.noBookings")}</Text>
          <Text style={styles.emptySubtitle}>
            {t("dashboard.noBookingsSubtitle")}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.bookingsList}>
          {/* Booking items would go here */}
        </ScrollView>
      )}
    </View>
  );
  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{t("dashboard.statsOverview")}</Text>
      <View style={styles.statsGrid}>
        {renderStatsCard(t("dashboard.totalEvents"), stats.totalEvents, "🎯")}
        {renderStatsCard(
          t("dashboard.totalBookings"),
          stats.totalBookings,
          "👥"
        )}
        {renderStatsCard(
          t("dashboard.revenue"),
          `$${stats.totalRevenue.toLocaleString()}`,
          "💰"
        )}
        {renderStatsCard(t("dashboard.upcoming"), stats.upcomingEvents, "⏰")}
      </View>
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>{t("dashboard.statsChart")}</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            {t("dashboard.chartPlaceholder")}
          </Text>
        </View>
      </View>
    </View>
  );
  const renderAdminFeatures = () => {
    if (currentUser.role !== "ADMIN") return null;

    return (
      <View style={styles.adminSection}>
        <Text style={styles.adminTitle}>{t("dashboard.adminFeatures")}</Text>
        <TouchableOpacity style={styles.adminButton}>
          <Text style={styles.adminButtonText}>
            {t("dashboard.manageUsers")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adminButton}>
          <Text style={styles.adminButtonText}>
            {t("dashboard.manageCategories")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adminButton}>
          <Text style={styles.adminButtonText}>
            {t("dashboard.systemReports")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "events":
        return renderEventsTab();
      case "bookings":
        return renderBookingsTab();
      case "stats":
        return renderStatsTab();
      default:
        return renderEventsTab();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("dashboard.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentUser.role === "ADMIN"
            ? t("dashboard.adminTitle")
            : t("dashboard.hostTitle")}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("dashboard.welcome")}, {currentUser.name}
        </Text>
      </View>
      {renderTabHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        {renderAdminFeatures()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  tabHeader: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabIcon: {
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing.xs,
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  createEventButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createEventButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  eventsList: {
    flex: 1,
  },
  bookingsList: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  statsCard: {
    width: "48%",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statsIcon: {
    fontSize: theme.fontSize["2xl"],
    marginBottom: theme.spacing.sm,
  },
  statsValue: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statsTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  chartSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  chartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.base,
  },
  adminSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: "#FF6B35",
    ...theme.shadows.sm,
  },
  adminTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: "#FF6B35",
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  adminButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  adminButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    textAlign: "center",
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
});

export default HostDashboardScreen;
