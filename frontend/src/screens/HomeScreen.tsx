import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Event } from "../types";
import { theme } from "../constants/theme";
import { apiService } from "../services/api";
import EventCard from "../components/EventCard";
import { useLanguage } from "../contexts/LanguageContext";

interface HomeScreenProps {
  onEventPress: (event: Event) => void;
  currentUserId: string;
}

export default function HomeScreen({
  onEventPress,
  currentUserId,
}: HomeScreenProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();
  const loadData = async () => {
    try {
      setLoading(true);

      // Load real data from API
      const [upcoming, trending, recommended] = await Promise.all([
        apiService.getUpcomingEvents(),
        apiService.getTrendingEvents(),
        apiService.getRecommendedEvents(currentUserId),
      ]);

      setUpcomingEvents(upcoming);
      setTrendingEvents(trending);
      setRecommendedEvents(recommended);
    } catch (error) {
      console.error("Error loading home data:", error);

      // Reset arrays to empty if the API fails
      setUpcomingEvents([]);
      setTrendingEvents([]);
      setRecommendedEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderEventList = (events: Event[], title: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={onEventPress}
            style={styles.eventCard}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventList}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t("home.welcome")} 👋</Text>
          <Text style={styles.subtitleText}>{t("home.findEvents")}</Text>
        </View>
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 &&
          renderEventList(upcomingEvents, `🔥 ${t("home.upcomingEvents")}`)}
        {/* Trending Events */}
        {trendingEvents.length > 0 &&
          renderEventList(trendingEvents, `📈 ${t("home.trendingEvents")}`)}
        {/* Recommended for You */}
        {recommendedEvents.length > 0 &&
          renderEventList(
            recommendedEvents,
            `✨ ${t("home.recommendedEvents")}`
          )}
        {/* Empty State */}
        {upcomingEvents.length === 0 &&
          trendingEvents.length === 0 &&
          recommendedEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {t("home.noEvents")} 🎉
              </Text>
              <Text style={styles.emptyStateText}>
                {t("home.checkBackLater")}
              </Text>
            </View>
          )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitleText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  eventList: {
    paddingLeft: theme.spacing.md,
  },
  eventCard: {
    width: 280,
    marginRight: theme.spacing.md,
    marginHorizontal: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});
