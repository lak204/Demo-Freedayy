import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

const translations: Translations = {
  // Auth screens
  "auth.login": { en: "Login", vi: "Đăng nhập" },
  "auth.register": { en: "Register", vi: "Đăng ký" },
  "auth.email": { en: "Email", vi: "Email" },
  "auth.password": { en: "Password", vi: "Mật khẩu" },
  "auth.name": { en: "Full Name", vi: "Họ và tên" },
  "auth.phone": { en: "Phone Number", vi: "Số điện thoại" },
  "auth.confirmPassword": { en: "Confirm Password", vi: "Xác nhận mật khẩu" },
  "auth.loginButton": { en: "Sign In", vi: "Đăng nhập" },
  "auth.registerButton": { en: "Create Account", vi: "Tạo tài khoản" },
  "auth.switchToRegister": {
    en: "Don't have an account? Sign up",
    vi: "Chưa có tài khoản? Đăng ký",
  },
  "auth.switchToLogin": {
    en: "Already have an account? Sign in",
    vi: "Đã có tài khoản? Đăng nhập",
  },
  "auth.loginError": {
    en: "Login failed. Please check your credentials.",
    vi: "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.",
  },
  "auth.registerError": {
    en: "Registration failed. Please try again.",
    vi: "Đăng ký thất bại. Vui lòng thử lại.",
  },
  "auth.passwordsDontMatch": {
    en: "Passwords do not match",
    vi: "Mật khẩu không khớp",
  },
  "auth.fillAllFields": {
    en: "Please fill in all fields",
    vi: "Vui lòng điền tất cả các trường",
  },
  "auth.forgotPassword": { en: "Forgot Password?", vi: "Quên mật khẩu?" },
  "auth.signingIn": { en: "Signing in...", vi: "Đang đăng nhập..." },
  "auth.invalidEmail": {
    en: "Invalid email address",
    vi: "Email không hợp lệ",
  },
  "auth.loginFailed": {
    en: "Login failed. Please try again.",
    vi: "Không thể thực hiện đăng nhập. Vui lòng thử lại.",
  },
  "auth.wrongCredentials": {
    en: "Email or password is incorrect.",
    vi: "Email hoặc mật khẩu không đúng.",
  },
  "auth.networkError": {
    en: "Cannot connect to server. Please check your network connection.",
    vi: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
  },

  // Profile screen
  "profile.title": { en: "Profile", vi: "Hồ sơ" },
  "profile.editProfile": { en: "Edit Profile", vi: "Chỉnh sửa hồ sơ" },
  "profile.saveChanges": { en: "Save Changes", vi: "Lưu thay đổi" },
  "profile.cancel": { en: "Cancel", vi: "Hủy" },
  "profile.logout": { en: "Logout", vi: "Đăng xuất" },
  "profile.name": { en: "Name", vi: "Tên" },
  "profile.email": { en: "Email", vi: "Email" },
  "profile.phone": { en: "Phone", vi: "Điện thoại" },
  "profile.role": { en: "Role", vi: "Vai trò" },
  "profile.joinedDate": { en: "Joined", vi: "Tham gia" },
  "profile.updateSuccess": {
    en: "Profile updated successfully!",
    vi: "Cập nhật hồ sơ thành công!",
  },
  "profile.updateError": {
    en: "Failed to update profile",
    vi: "Cập nhật hồ sơ thất bại",
  },
  "profile.language": { en: "Language", vi: "Ngôn ngữ" },
  "profile.logoutConfirm": {
    en: "Are you sure you want to logout?",
    vi: "Bạn có chắc chắn muốn đăng xuất?",
  },
  "profile.roleManaged": {
    en: "Role is managed by the system",
    vi: "Vai trò được quản lý bởi hệ thống",
  },
  "profile.savedEvents": { en: "Saved Events", vi: "Sự kiện đã lưu" },
  "profile.bookingHistory": { en: "Booking History", vi: "Lịch sử đặt chỗ" },
  "profile.preferences": { en: "Preferences", vi: "Tùy chọn" },
  "profile.saved": { en: "Saved", vi: "Đã lưu" },
  "profile.bookings": { en: "Bookings", vi: "Đặt chỗ" },
  "profile.reviews": { en: "Reviews", vi: "Đánh giá" },
  "profile.noSavedEvents": {
    en: "No saved events yet",
    vi: "Chưa có sự kiện nào được lưu",
  },
  "profile.noBookingHistory": {
    en: "No booking history yet",
    vi: "Chưa có lịch sử đặt chỗ nào",
  },
  "profile.eventSaved": { en: "Saved Event", vi: "Sự kiện đã lưu" },
  "profile.avatar": { en: "Avatar", vi: "Ảnh đại diện" },
  "profile.changeAvatar": { en: "Change Avatar", vi: "Đổi ảnh đại diện" },
  "profile.events": { en: "Events", vi: "Sự kiện" },
  "profile.noReviews": { en: "No reviews yet", vi: "Chưa có đánh giá nào" },
  "profile.writeFirstReview": {
    en: "Write your first review after attending an event",
    vi: "Viết đánh giá đầu tiên sau khi tham gia sự kiện",
  },
  "profile.notifications": { en: "Notifications", vi: "Thông báo" },
  "profile.privacy": { en: "Privacy", vi: "Riêng tư" },
  "profile.theme": { en: "Theme", vi: "Giao diện" },
  "profile.lightMode": { en: "Light Mode", vi: "Giao diện sáng" },
  "profile.darkMode": { en: "Dark Mode", vi: "Giao diện tối" },
  "profile.autoMode": { en: "Auto (System)", vi: "Tự động (Hệ thống)" },
  "profile.pushNotifications": {
    en: "Push Notifications",
    vi: "Thông báo đẩy",
  },
  "profile.emailNotifications": {
    en: "Email Notifications",
    vi: "Thông báo email",
  },
  "profile.eventUpdates": { en: "Event Updates", vi: "Cập nhật sự kiện" },
  "profile.marketingEmails": { en: "Marketing Emails", vi: "Email quảng cáo" },
  "profile.categories": { en: "Categories", vi: "Danh mục" },
  "profile.updateFavoriteCategories": {
    en: "Update favorite categories",
    vi: "Cập nhật danh mục yêu thích",
  },
  "profile.budget": { en: "Budget", vi: "Ngân sách" },
  "profile.setPriceRange": {
    en: "Set desired price range",
    vi: "Thiết lập khoảng giá mong muốn",
  },
  "profile.manageNotifications": {
    en: "Manage notification settings",
    vi: "Quản lý cài đặt thông báo",
  },
  "profile.privacySettings": {
    en: "Privacy and security settings",
    vi: "Cài đặt riêng tư và bảo mật",
  },
  "profile.receiveAppNotifications": {
    en: "Receive push notifications",
    vi: "Nhận thông báo đẩy",
  },
  "profile.receiveEmailUpdates": {
    en: "Receive email updates",
    vi: "Nhận cập nhật qua email",
  },
  "profile.notifyEventChanges": {
    en: "Notify about event changes",
    vi: "Thông báo khi sự kiện thay đổi",
  },
  "profile.receivePromotions": {
    en: "Receive promotional emails",
    vi: "Nhận email khuyến mãi",
  },
  "profile.hostManagement": { en: "Host Management", vi: "Quản lý Host" },
  "profile.myEvents": { en: "My Events", vi: "Sự kiện của tôi" },
  "profile.manageCreatedEvents": {
    en: "Manage created events",
    vi: "Quản lý sự kiện đã tạo",
  },
  "profile.hostInfo": { en: "Host Information", vi: "Thông tin Host" },
  "profile.updateHostProfile": {
    en: "Update host profile",
    vi: "Cập nhật hồ sơ host",
  },
  "profile.statistics": { en: "Statistics", vi: "Thống kê" },
  "profile.viewReportsAnalytics": {
    en: "View reports and analytics",
    vi: "Xem báo cáo và phân tích",
  },
  "profile.systemManagement": {
    en: "System Management",
    vi: "Quản lý hệ thống",
  },
  "profile.manageUsers": { en: "Manage Users", vi: "Quản lý người dùng" },
  "profile.viewManageAccounts": {
    en: "View and manage accounts",
    vi: "Xem và quản lý tài khoản",
  },
  "profile.contentModeration": {
    en: "Content Moderation",
    vi: "Kiểm duyệt nội dung",
  },
  "profile.moderateEventsReviews": {
    en: "Moderate events and reviews",
    vi: "Kiểm duyệt sự kiện và đánh giá",
  },
  "profile.systemSettings": { en: "System Settings", vi: "Cài đặt hệ thống" },
  "profile.configureApplication": {
    en: "Configure application",
    vi: "Cấu hình ứng dụng",
  },
  "profile.saveEventsHint": {
    en: "Tap the heart icon on events to save them here",
    vi: "Nhấn vào biểu tượng trái tim trên sự kiện để lưu chúng ở đây",
  },
  "profile.unknownEvent": { en: "Unknown Event", vi: "Sự kiện không xác định" },
  "profile.registeredOn": { en: "Registered on", vi: "Đăng ký vào" },
  "profile.eventDate": { en: "Event date", vi: "Ngày sự kiện" },
  "profile.bookingHistoryHint": {
    en: "Your booking history will appear here",
    vi: "Lịch sử đặt chỗ của bạn sẽ xuất hiện ở đây",
  },
  "profile.enterName": { en: "Enter your full name", vi: "Nhập họ và tên" },
  "profile.emailNotEditable": {
    en: "Email cannot be changed",
    vi: "Email không thể thay đổi",
  },
  "profile.enterPhone": { en: "Enter phone number", vi: "Nhập số điện thoại" },
  "profile.takePhoto": { en: "Take Photo", vi: "Chụp ảnh" },
  "profile.chooseFromGallery": {
    en: "Choose from Gallery",
    vi: "Chọn từ thư viện",
  },
  "profile.selectAvatarSource": {
    en: "Select avatar source",
    vi: "Chọn nguồn ảnh đại diện",
  },
  // Booking statuses
  "bookings.confirmed": { en: "✅ Confirmed", vi: "✅ Đã xác nhận" },
  "bookings.pending": { en: "⏳ Pending", vi: "⏳ Chờ xác nhận" },
  "bookings.attended": { en: "🎉 Attended", vi: "🎉 Đã tham gia" },

  // Common
  "common.loading": { en: "Loading...", vi: "Đang tải..." },
  "common.english": { en: "English", vi: "Tiếng Anh" },
  "common.vietnamese": { en: "Vietnamese", vi: "Tiếng Việt" },
  "common.language": { en: "Language", vi: "Ngôn ngữ" },
  "common.close": { en: "Close", vi: "Đóng" },
  "common.save": { en: "Save", vi: "Lưu" },
  "common.cancel": { en: "Cancel", vi: "Hủy" },
  "common.ok": { en: "OK", vi: "OK" },
  "common.error": { en: "Error", vi: "Lỗi" },
  "common.success": { en: "Success", vi: "Thành công" },

  // Navigation
  "nav.home": { en: "Home", vi: "Trang chủ" },
  "nav.explore": { en: "Explore", vi: "Khám phá" },
  "nav.bookings": { en: "Bookings", vi: "Đặt chỗ" },
  "nav.profile": { en: "Profile", vi: "Hồ sơ" },
  "nav.host": { en: "Host", vi: "Tổ chức" },
  // Home Screen
  "home.welcome": { en: "Welcome back", vi: "Chào mừng trở lại" },
  "home.findEvents": {
    en: "Discover exciting weekend activities",
    vi: "Hãy khám phá những hoạt động thú vị cuối tuần này",
  },
  "home.featuredEvents": { en: "Featured Events", vi: "Sự kiện nổi bật" },
  "home.popularCategories": {
    en: "Popular Categories",
    vi: "Danh mục phổ biến",
  },
  "home.seeAll": { en: "See All", vi: "Xem tất cả" },
  "home.upcomingEvents": { en: "Upcoming Events", vi: "Sự kiện sắp tới" },
  "home.trendingEvents": { en: "Trending Events", vi: "Sự kiện thịnh hành" },
  "home.recommendedEvents": {
    en: "Recommended for You",
    vi: "Đề xuất cho bạn",
  },
  "home.noEvents": { en: "No events available", vi: "Không có sự kiện nào" },
  "home.checkBackLater": {
    en: "Check back later for exciting activities!",
    vi: "Hãy quay lại sau để khám phá những hoạt động thú vị!",
  },

  // Explore Screen
  "explore.title": { en: "Explore Events", vi: "Khám phá sự kiện" },
  "explore.search": { en: "Search events...", vi: "Tìm kiếm sự kiện..." },
  "explore.filters": { en: "Filters", vi: "Bộ lọc" },
  "explore.categories": { en: "Categories", vi: "Danh mục" },
  "explore.dateRange": { en: "Date Range", vi: "Khoảng thời gian" },
  "explore.priceRange": { en: "Price Range", vi: "Khoảng giá" },
  "explore.location": { en: "Location", vi: "Địa điểm" },
  "explore.noEvents": {
    en: "No events found",
    vi: "Không tìm thấy sự kiện nào",
  },
  "explore.tryDifferentFilters": {
    en: "Try adjusting your filters",
    vi: "Thử điều chỉnh bộ lọc của bạn",
  },

  // Event Detail
  "event.details": { en: "Event Details", vi: "Chi tiết sự kiện" },
  "event.dateTime": { en: "Date & Time", vi: "Ngày & Giờ" },
  "event.location": { en: "Location", vi: "Địa điểm" },
  "event.price": { en: "Price", vi: "Giá" },
  "event.description": { en: "Description", vi: "Mô tả" },
  "event.host": { en: "Host", vi: "Người tổ chức" },
  "event.attendees": { en: "Attendees", vi: "Người tham gia" },
  "event.bookNow": { en: "Book Now", vi: "Đặt ngay" },
  "event.free": { en: "Free", vi: "Miễn phí" },
  "event.soldOut": { en: "Sold Out", vi: "Hết vé" },
  "event.bookingSuccess": {
    en: "Booking successful!",
    vi: "Đặt chỗ thành công!",
  },
  "event.bookingError": {
    en: "Booking failed. Please try again.",
    vi: "Đặt chỗ thất bại. Vui lòng thử lại.",
  },

  // Bookings Screen
  "bookings.title": { en: "My Bookings", vi: "Đặt chỗ của tôi" },
  "bookings.upcoming": { en: "Upcoming", vi: "Sắp tới" },
  "bookings.past": { en: "Past", vi: "Đã qua" },
  "bookings.cancelled": { en: "Cancelled", vi: "Đã hủy" },
  "bookings.noBookings": { en: "No bookings yet", vi: "Chưa có đặt chỗ nào" },
  "bookings.exploreEvents": {
    en: "Explore events to make your first booking",
    vi: "Khám phá sự kiện để đặt chỗ đầu tiên",
  },
  "bookings.viewDetails": { en: "View Details", vi: "Xem chi tiết" },
  "bookings.cancelBooking": { en: "Cancel Booking", vi: "Hủy đặt chỗ" },
  "bookings.confirmCancel": {
    en: "Are you sure you want to cancel this booking?",
    vi: "Bạn có chắc chắn muốn hủy đặt chỗ này?",
  },

  // Coming Soon
  "comingSoon.title": { en: "Coming Soon", vi: "Sắp ra mắt" },
  "comingSoon.subtitle": {
    en: "This feature is under development",
    vi: "Tính năng này đang được phát triển",
  },

  // Roles
  "role.USER": { en: "User", vi: "Người dùng" },
  "role.HOST": { en: "Host", vi: "Chủ tổ chức" },
  "role.ADMIN": { en: "Admin", vi: "Quản trị viên" },

  // Profile screen translations that might be missing
  "profile.location": { en: "Location", vi: "Vị trí" },
  "profile.searchRadius": { en: "Search radius", vi: "Khoảng cách tìm kiếm" },

  // Additional missing translations for profile functionality
  "profile.accountSettings": {
    en: "Account Settings",
    vi: "Cài đặt tài khoản",
  },
  "profile.helpSupport": { en: "Help & Support", vi: "Trợ giúp & Hỗ trợ" },
  "profile.aboutApp": { en: "About Freeday", vi: "Về Freeday" },
  "profile.version": { en: "Version", vi: "Phiên bản" },
  "profile.termsConditions": {
    en: "Terms & Conditions",
    vi: "Điều khoản & Điều kiện",
  },
  "profile.privacyPolicy": { en: "Privacy Policy", vi: "Chính sách bảo mật" },

  // Theme preferences
  "profile.themePreferences": {
    en: "Theme Preferences",
    vi: "Tùy chọn giao diện",
  },
  "profile.selectTheme": {
    en: "Select your preferred theme",
    vi: "Chọn giao diện ưa thích",
  },

  // Notification details
  "profile.notificationDetails": {
    en: "Notification Details",
    vi: "Chi tiết thông báo",
  },
  "profile.eventReminders": { en: "Event reminders", vi: "Nhắc nhở sự kiện" },
  "profile.newEventAlerts": {
    en: "New event alerts",
    vi: "Thông báo sự kiện mới",
  },
  "profile.bookingConfirmations": {
    en: "Booking confirmations",
    vi: "Xác nhận đặt chỗ",
  },
  "profile.eventCancellations": {
    en: "Event cancellations",
    vi: "Hủy sự kiện",
  },

  // Event interactions
  "event.saved": { en: "Event saved!", vi: "Đã lưu sự kiện!" },
  "event.unsaved": {
    en: "Event removed from saved",
    vi: "Đã xóa khỏi danh sách lưu",
  },
  "event.saveEvent": { en: "Save Event", vi: "Lưu sự kiện" },
  "event.unsaveEvent": { en: "Remove from Saved", vi: "Bỏ lưu sự kiện" },

  // Demo screen
  "demo.subtitle": {
    en: "Complete language switching and profile features demo",
    vi: "Demo đầy đủ tính năng chuyển đổi ngôn ngữ và hồ sơ cá nhân",
  },
  "demo.language": { en: "Language Switching", vi: "Chuyển đổi ngôn ngữ" },
  "demo.features": { en: "Key Features", vi: "Tính năng chính" },
  "demo.exploreEvents": { en: "Explore Events", vi: "Khám phá sự kiện" },
  "demo.exploreEventsDesc": {
    en: "Browse and discover events, tap heart to save favorites",
    vi: "Duyệt và khám phá sự kiện, nhấn trái tim để lưu yêu thích",
  },
  "demo.profileFeatures": {
    en: "Enhanced Profile",
    vi: "Hồ sơ cá nhân nâng cao",
  },
  "demo.profileFeaturesDesc": {
    en: "Avatar editing, saved events, reviews, and preferences",
    vi: "Chỉnh sửa ảnh đại diện, sự kiện đã lưu, đánh giá và tùy chọn",
  },
  "demo.saveEvents": { en: "Save Events", vi: "Lưu sự kiện" },
  "demo.saveEventsDesc": {
    en: "Heart icon on events to save them to your profile",
    vi: "Biểu tượng trái tim trên sự kiện để lưu vào hồ sơ",
  },
  "demo.themeMode": { en: "Theme Selection", vi: "Chọn giao diện" },
  "demo.themeModeDesc": {
    en: "Light, dark, or auto mode in preferences",
    vi: "Chế độ sáng, tối hoặc tự động trong tùy chọn",
  },
  "demo.notifications": {
    en: "Notification Settings",
    vi: "Cài đặt thông báo",
  },
  "demo.notificationsDesc": {
    en: "Granular control over push and email notifications",
    vi: "Kiểm soát chi tiết thông báo đẩy và email",
  },
  "demo.instructions": { en: "How to Test", vi: "Cách thử nghiệm" },
  "demo.step1": {
    en: "Use the language switcher above to test translations",
    vi: "Sử dụng nút chuyển ngôn ngữ ở trên để test dịch thuật",
  },
  "demo.step2": {
    en: "Navigate to Profile to see saved events and preferences",
    vi: "Chuyển đến Hồ sơ để xem sự kiện đã lưu và tùy chọn",
  },
  "demo.step3": {
    en: "Go to Events and tap heart icons to save events",
    vi: "Chuyển đến Sự kiện và nhấn biểu tượng trái tim để lưu",
  },
  "demo.step4": {
    en: "Try theme switching and notification toggles in preferences",
    vi: "Thử đổi giao diện và bật/tắt thông báo trong tùy chọn",
  },

  // Dashboard screen
  "dashboard.loading": { en: "Loading...", vi: "Đang tải..." },
  "dashboard.adminTitle": { en: "Admin Dashboard", vi: "Quản trị viên" },
  "dashboard.hostTitle": { en: "Host Dashboard", vi: "Quản lý sự kiện" },
  "dashboard.welcome": { en: "Welcome", vi: "Xin chào" },
  "dashboard.events": { en: "Events", vi: "Sự kiện" },
  "dashboard.bookings": { en: "Bookings", vi: "Đặt chỗ" },
  "dashboard.statistics": { en: "Statistics", vi: "Thống kê" },
  "dashboard.yourEvents": { en: "Your Events", vi: "Sự kiện của bạn" },
  "dashboard.createEvent": { en: "Create Event", vi: "Tạo sự kiện" },
  "dashboard.noEvents": { en: "No Events Yet", vi: "Chưa có sự kiện" },
  "dashboard.noEventsSubtitle": {
    en: "You haven't created any events yet",
    vi: "Bạn chưa tạo sự kiện nào",
  },
  "dashboard.createEventNow": {
    en: "Create Event Now",
    vi: "Tạo sự kiện ngay",
  },
  "dashboard.manageBookings": { en: "Manage Bookings", vi: "Quản lý đặt chỗ" },
  "dashboard.noBookings": { en: "No Bookings Yet", vi: "Chưa có đặt chỗ" },
  "dashboard.noBookingsSubtitle": {
    en: "You don't have any bookings yet",
    vi: "Bạn chưa có đặt chỗ nào",
  },
  "dashboard.statsOverview": {
    en: "Statistics Overview",
    vi: "Tổng quan thống kê",
  },
  "dashboard.totalEvents": { en: "Total Events", vi: "Tổng số sự kiện" },
  "dashboard.totalBookings": { en: "Total Bookings", vi: "Tổng số đặt chỗ" },
  "dashboard.revenue": { en: "Revenue", vi: "Doanh thu" },
  "dashboard.upcoming": { en: "Upcoming", vi: "Sắp diễn ra" },
  "dashboard.statsChart": { en: "Statistics Chart", vi: "Biểu đồ thống kê" },
  "dashboard.chartPlaceholder": {
    en: "Chart data will appear here",
    vi: "Dữ liệu biểu đồ sẽ hiển thị ở đây",
  },
  "dashboard.adminFeatures": { en: "Admin Features", vi: "Tính năng quản trị" },
  "dashboard.manageUsers": { en: "Manage Users", vi: "Quản lý người dùng" },
  "dashboard.manageCategories": {
    en: "Manage Categories",
    vi: "Quản lý danh mục",
  },
  "dashboard.systemReports": { en: "System Reports", vi: "Báo cáo hệ thống" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "@freeday_language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en"); // Default to English

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
