import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Event } from "../types";
import { theme } from "../constants/theme";

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  style?: any;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - theme.spacing.md * 2;

export default function EventCard({ event, onPress, style }: EventCardProps) {
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

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  const getDistance = () => {
    // Mock distance calculation - in real app, calculate from user location
    return `${Math.floor(Math.random() * 10) + 1}km`;
  };

  // Safe getter for host name
  const getHostName = () => {
    if (!event.host) return "Host";

    // If host has user property with name
    if (event.host.user && event.host.user.name) {
      return event.host.user.name;
    }

    // If host directly has name property
    if ("name" in event.host) {
      return event.host.name as string;
    }

    return "Host";
  };

  // Safe getter for location
  const getLocationDisplay = () => {
    if (!event.location) return "Location";

    if (event.location.city) {
      return event.location.city;
    }

    return event.location.address || "Location";
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(event)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              event.imageUrl ||
              "https://via.placeholder.com/400x200?text=Event+Image",
          }}
          style={styles.image}
          resizeMode="cover"
        />
        {event.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Nổi bật</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(event.price)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>{" "}
        <View style={styles.infoRow}>
          {" "}
          <Text style={styles.infoText}>
            {`📅 ${formatDate(event.startTime)} • ${formatTime(
              event.startTime
            )}`}
          </Text>
        </View>
        <View style={styles.infoRow}>
          {" "}
          <Text style={styles.infoText}>
            {`📍 ${getLocationDisplay()} • ${getDistance()}`}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.hostInfo}>
            <Text style={styles.hostText}>{`👤 ${getHostName()}`}</Text>
          </View>

          {event.capacity && (
            <View style={styles.capacityInfo}>
              <Text style={styles.capacityText}>
                {`${event.bookings?.length || 0}/${event.capacity} người`}
              </Text>
            </View>
          )}
        </View>
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {event.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{event.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadows.md,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.vibrantYellow,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  featuredText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  priceBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  priceText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  hostInfo: {
    flex: 1,
  },
  hostText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  capacityInfo: {
    backgroundColor: theme.colors.backgroundTertiary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  capacityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  moreTagsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },
});
