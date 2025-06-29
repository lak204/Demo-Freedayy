import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Booking, Event } from "../types";
import { theme } from "../constants/theme";
import { apiService } from "../services/api";

interface BookingsScreenProps {
  currentUserId: string;
  onEventPress: (event: Event) => void;
}

interface TimeSlot {
  title: string;
  time: string;
  events: (Booking & { event: Event })[];
}

export default function BookingsScreen({
  currentUserId,
  onEventPress,
}: BookingsScreenProps) {
  const [bookings, setBookings] = useState<(Booking & { event: Event })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);
  const loadBookings = async () => {
    try {
      const bookingsData = await apiService.getUserBookings();
      // Filter only confirmed bookings for upcoming weekend
      const upcomingBookings = bookingsData
        .filter(
          (booking) =>
            booking.status === "CONFIRMED" &&
            booking.event &&
            new Date(booking.event.startTime) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.event!.startTime).getTime() -
            new Date(b.event!.startTime).getTime()
        );

      setBookings(upcomingBookings as (Booking & { event: Event })[]);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getTimeSlots = (): TimeSlot[] => {
    const weekendBookings = bookings.filter((booking) => {
      const eventDate = new Date(booking.event.startTime);
      const dayOfWeek = eventDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    });

    const groupedByTimeSlot: { [key: string]: (Booking & { event: Event })[] } =
      {};

    weekendBookings.forEach((booking) => {
      const eventDate = new Date(booking.event.startTime);
      const hour = eventDate.getHours();

      let timeSlot: string;
      if (hour < 12) {
        timeSlot = "morning";
      } else if (hour < 18) {
        timeSlot = "afternoon";
      } else {
        timeSlot = "evening";
      }

      if (!groupedByTimeSlot[timeSlot]) {
        groupedByTimeSlot[timeSlot] = [];
      }
      groupedByTimeSlot[timeSlot].push(booking);
    });

    const timeSlots: TimeSlot[] = [];

    if (groupedByTimeSlot.morning) {
      timeSlots.push({
        title: "🌅 Buổi sáng",
        time: "6:00 - 12:00",
        events: groupedByTimeSlot.morning,
      });
    }

    if (groupedByTimeSlot.afternoon) {
      timeSlots.push({
        title: "☀️ Buổi chiều",
        time: "12:00 - 18:00",
        events: groupedByTimeSlot.afternoon,
      });
    }

    if (groupedByTimeSlot.evening) {
      timeSlots.push({
        title: "🌙 Buổi tối",
        time: "18:00 - 24:00",
        events: groupedByTimeSlot.evening,
      });
    }

    return timeSlots;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderBookingCard = (booking: Booking & { event: Event }) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => onEventPress(booking.event)}
    >
      <Image
        source={{
          uri:
            booking.event.imageUrl ||
            "https://via.placeholder.com/80x80?text=Event",
        }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {booking.event.title}
        </Text>
        <Text style={styles.eventTime}>
          {formatTime(booking.event.startTime)} -
          {formatTime(booking.event.endTime)}
        </Text>
        <Text style={styles.eventLocation}>
          📍 {booking.event.location.address}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Đã xác nhận</Text>
        </View>
      </View>

      <View style={styles.eventMeta}>
        <Text style={styles.eventDate}>
          {formatDate(booking.event.startTime)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => (
    <View style={styles.timeSlotContainer}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.timeSlotTitle}>{item.title}</Text>
        <Text style={styles.timeSlotTime}>{item.time}</Text>
      </View>

      <View style={styles.timeSlotEvents}>
        {item.events.map((booking) => renderBookingCard(booking))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>Cuối tuần này trống trải quá!</Text>
      <Text style={styles.emptyStateSubtitle}>
        Hãy khám phá và đăng ký những hoạt động thú vị để làm đầy cuối tuần của
        bạn
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>💡 Gợi ý cho bạn:</Text>
        <Text style={styles.suggestionItem}>🎨 Tham gia workshop sáng tạo</Text>
        <Text style={styles.suggestionItem}>🌿 Khám phá thiên nhiên</Text>
        <Text style={styles.suggestionItem}>🍕 Thử món ăn mới</Text>
        <Text style={styles.suggestionItem}>🎵 Tham dự sự kiện âm nhạc</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải lịch trình...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeSlots = getTimeSlots();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuối tuần của tôi</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length > 0
            ? `${timeSlots.length} khoảng thời gian, ${bookings.length} hoạt động`
            : "Chưa có hoạt động nào được lên lịch"}
        </Text>
      </View>

      {timeSlots.length > 0 ? (
        <FlatList
          data={timeSlots}
          renderItem={renderTimeSlot}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.emptyContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  emptyContentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  timeSlotContainer: {
    marginBottom: theme.spacing.lg,
  },
  timeSlotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  timeSlotTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  timeSlotTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  timeSlotEvents: {
    gap: theme.spacing.sm,
  },
  bookingCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  eventInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  eventMeta: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: theme.spacing.sm,
  },
  eventDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
    textAlign: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  emptyStateSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  suggestionsContainer: {
    alignSelf: "stretch",
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  suggestionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  suggestionItem: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
});
