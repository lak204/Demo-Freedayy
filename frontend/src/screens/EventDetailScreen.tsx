import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Event, Booking, Review } from "../types";
import { theme } from "../constants/theme";
import { apiService } from "../services/api";

interface EventDetailScreenProps {
  event: Event;
  currentUserId: string;
  onBack: () => void;
  onBookingSuccess: () => void;
  onToggleSave?: (eventId: string) => void;
  isSaved?: boolean;
}

export default function EventDetailScreen({
  event,
  currentUserId,
  onBack,
  onBookingSuccess,
  onToggleSave,
  isSaved: savedFromProps = false,
}: EventDetailScreenProps) {
  const [userBooking, setUserBooking] = useState<Booking | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(savedFromProps);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [userReview, setUserReview] = useState<Review | null>(null);
  useEffect(() => {
    loadEventDetails();
    setIsSaved(savedFromProps);
  }, [savedFromProps]);
  const loadEventDetails = async () => {
    try {
      const [bookingsData, reviewsData] = await Promise.all([
        apiService.getUserBookings(),
        apiService.getEventReviews(event.id),
      ]);

      const eventBooking = bookingsData.find((b) => b.eventId === event.id);
      setUserBooking(eventBooking || null);
      setReviews(reviewsData);

      // Check if user has already reviewed this event
      const existingReview = reviewsData.find(
        (r) => r.userId === currentUserId
      );
      setUserReview(existingReview || null);
    } catch (error) {
      console.error("Error loading event details:", error);
    }
  };

  const handleRegister = async () => {
    if (userBooking) {
      Alert.alert("Thông báo", "Bạn đã đăng ký sự kiện này rồi!");
      return;
    }

    Alert.alert(
      "Xác nhận đăng ký",
      `Bạn có muốn đăng ký tham gia sự kiện "${event.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng ký", onPress: confirmRegistration },
      ]
    );
  };
  const confirmRegistration = async () => {
    setLoading(true);
    try {
      console.log("📝 Attempting to create booking for event:", event.id);
      const booking = await apiService.createBooking(event.id);
      console.log("✅ Booking created successfully:", booking);
      setUserBooking(booking);
      Alert.alert(
        "Đăng ký thành công! 🎉",
        "Bạn đã đăng ký tham gia sự kiện thành công. Chúng tôi sẽ gửi thông tin chi tiết qua email.",
        [{ text: "OK", onPress: onBookingSuccess }]
      );
    } catch (error) {
      console.error("❌ Booking error:", error);
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveEvent = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onToggleSave?.(event.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tham gia cùng mình sự kiện "${event.title}" nhé! 🎉\n\n${event.description}`,
        title: event.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const openMap = () => {
    const url = `https://maps.google.com/?q=${event.location.lat},${event.location.lng}`;
    Linking.openURL(url);
  };

  const handleAddReview = () => {
    if (!userBooking || userBooking.status !== "ATTENDED") {
      Alert.alert(
        "Không thể đánh giá",
        "Bạn chỉ có thể đánh giá sau khi tham gia sự kiện."
      );
      return;
    }

    if (userReview) {
      Alert.alert(
        "Đã đánh giá",
        "Bạn đã đánh giá sự kiện này rồi. Bạn có muốn chỉnh sửa đánh giá?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Chỉnh sửa", onPress: () => handleEditReview() },
        ]
      );
      return;
    }

    setShowReviewModal(true);
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment || "",
      });
      setShowReviewModal(true);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewForm.comment.trim().length === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setLoading(true);
    try {
      if (userReview) {
        // Update existing review
        const updatedReview = await apiService.updateReview(userReview.id, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        setUserReview(updatedReview);
        // Update in reviews list
        setReviews((prev) =>
          prev.map((r) => (r.id === userReview.id ? updatedReview : r))
        );
      } else {
        // Create new review
        const newReview = await apiService.createReview(event.id, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        setUserReview(newReview);
        setReviews((prev) => [newReview, ...prev]);
      }

      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: "" });
      Alert.alert("Thành công", "Đánh giá của bạn đã được lưu!");
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Lỗi", "Không thể lưu đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (
    rating: number,
    onPress?: (rating: number) => void
  ) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress?.(star)}
            disabled={!onPress}
          >
            <Text style={styles.star}>{star <= rating ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const getBookingStatusText = () => {
    if (!userBooking) return null;

    switch (userBooking.status) {
      case "PENDING":
        return "⏳ Đang chờ xác nhận";
      case "CONFIRMED":
        return "✅ Đã xác nhận";
      case "CANCELLED":
        return "❌ Đã hủy";
      case "ATTENDED":
        return "🎉 Đã tham gia";
      default:
        return null;
    }
  };

  const getRemainingSlots = () => {
    if (!event.capacity) return null;
    const bookedSlots = event.bookings?.length || 0;
    return event.capacity - bookedSlots;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                event.imageUrl ||
                "https://via.placeholder.com/400x300?text=Event+Image",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveEvent}
              >
                <Text style={styles.actionButtonText}>
                  {isSaved ? "❤️" : "🤍"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Text style={styles.actionButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Badge */}
          <View style={styles.priceBadgeContainer}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{formatPrice(event.price)}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Category */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {`${event.category.icon} ${event.category.name}`}
              </Text>
            </View>
          </View>
          {/* Booking Status */}
          {userBooking && (
            <View style={styles.bookingStatus}>
              <Text style={styles.bookingStatusText}>
                {getBookingStatusText()}
              </Text>
            </View>
          )}
          {/* Event Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Thời gian</Text>
                <Text style={styles.infoText}>
                  {formatDate(event.startTime)}
                </Text>
                <Text style={styles.infoText}>
                  {`${formatTime(event.startTime)} - ${formatTime(
                    event.endTime
                  )}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={openMap}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Địa điểm</Text>
                <Text style={styles.infoText}>{event.location.address}</Text>
                <Text style={styles.infoSubtext}>Nhấn để xem bản đồ</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👤</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Người tổ chức</Text>
                <Text style={styles.infoText}>{event.host.user.name}</Text>
                {event.host.verified && (
                  <Text style={styles.verifiedText}>✅ Đã xác thực</Text>
                )}
              </View>
            </View>

            {event.capacity && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👥</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Số lượng</Text>
                  <Text style={styles.infoText}>
                    {`${event.bookings?.length || 0}/${
                      event.capacity
                    } người đã đăng
                    ký`}
                  </Text>
                  <Text style={styles.infoSubtext}>
                    Còn {getRemainingSlots()} chỗ trống
                  </Text>
                </View>
              </View>
            )}
          </View>
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sự kiện</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          {/* Tags */}
          {event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Thẻ</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{`#${tag}`}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              {reviews.length > 0 && (
                <View style={styles.ratingInfo}>
                  <Text style={styles.ratingText}>
                    ⭐ {getAverageRating()} ({reviews.length} đánh giá)
                  </Text>
                </View>
              )}
            </View>

            {/* Add Review Button */}
            {userBooking && userBooking.status === "ATTENDED" && (
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={handleAddReview}
              >
                <Text style={styles.addReviewButtonText}>
                  {userReview ? "✏️ Chỉnh sửa đánh giá" : "➕ Thêm đánh giá"}
                </Text>
              </TouchableOpacity>
            )}

            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.user?.name}</Text>
                    <Text style={styles.reviewRating}>
                      {"⭐".repeat(review.rating)}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>
                Chưa có đánh giá nào cho sự kiện này.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.registerButton,
            userBooking && styles.registerButtonDisabled,
            loading && styles.registerButtonLoading,
          ]}
          onPress={handleRegister}
          disabled={loading || !!userBooking}
        >
          <Text style={styles.registerButtonText}>
            {loading
              ? "Đang xử lý..."
              : userBooking
              ? "Đã đăng ký"
              : "Đăng ký ngay"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {userReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Đánh giá</Text>
              {renderStarRating(reviewForm.rating, (rating) =>
                setReviewForm((prev) => ({ ...prev, rating }))
              )}

              <Text style={styles.inputLabel}>Nhận xét</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                value={reviewForm.comment}
                onChangeText={(comment) =>
                  setReviewForm((prev) => ({ ...prev, comment }))
                }
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Đang lưu..." : "Lưu đánh giá"}
                </Text>
              </TouchableOpacity>
            </View>
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
  imageContainer: {
    position: "relative",
    height: 300,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.white,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSize.lg,
  },
  priceBadgeContainer: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
  priceBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  priceText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  titleSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 36,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.backgroundTertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  bookingStatus: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    alignSelf: "flex-start",
  },
  bookingStatusText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    fontSize: theme.fontSize.xl,
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  infoSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  verifiedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  descriptionSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 26,
  },
  tagsSection: {
    marginBottom: theme.spacing.lg,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  reviewsSection: {
    marginBottom: theme.spacing.xl,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  ratingInfo: {
    backgroundColor: theme.colors.backgroundTertiary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  reviewItem: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  reviewAuthor: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  reviewRating: {
    fontSize: theme.fontSize.sm,
  },
  reviewComment: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  registerButton: {
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  registerButtonLoading: {
    backgroundColor: theme.colors.primaryLight,
  },
  registerButtonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  // Review styles
  addReviewButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    alignSelf: "flex-start",
  },
  addReviewButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  noReviewsText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textTertiary,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
    fontStyle: "italic",
  },
  starContainer: {
    flexDirection: "row",
    marginVertical: theme.spacing.sm,
  },
  star: {
    fontSize: theme.fontSize.xl,
    marginRight: theme.spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  modalBody: {
    flex: 1,
  },
  inputLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
});
