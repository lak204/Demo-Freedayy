export const formatPrice = (price: number): string => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ`;
};

export const formatDate = (
  dateString: string,
  options?: {
    includeTime?: boolean;
    includeWeekday?: boolean;
    short?: boolean;
  }
): string => {
  const date = new Date(dateString);
  const {
    includeTime = false,
    includeWeekday = false,
    short = false,
  } = options || {};

  let formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: short ? "short" : "long",
    year: "numeric",
  };

  if (includeWeekday) {
    formatOptions.weekday = short ? "short" : "long";
  }

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
  }

  return date.toLocaleDateString("vi-VN", formatOptions);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return `${formatDate(startDate, { includeWeekday: true })} • ${formatTime(
      startDate
    )} - ${formatTime(endDate)}`;
  } else {
    return `${formatDate(startDate, { short: true })} - ${formatDate(endDate, {
      short: true,
    })}`;
  }
};

export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  } else {
    return `${distanceInKm.toFixed(1)}km`;
  }
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMs < 0) {
    return "Đã qua";
  } else if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} phút nữa`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ nữa`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày nữa`;
  } else {
    return formatDate(dateString, { includeWeekday: true, short: true });
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const formatPhoneNumber = (phone: string): string => {
  // Format Vietnamese phone numbers
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (cleaned.length === 11 && cleaned.startsWith("84")) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "+$1 $2 $3 $4");
  }

  return phone;
};

export const generateAvatarUrl = (name: string, size: number = 120): string => {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366F1&color=fff&size=${size}`;
};

export const formatReviewCount = (count: number): string => {
  if (count === 0) return "Chưa có đánh giá";
  if (count === 1) return "1 đánh giá";
  return `${count} đánh giá`;
};

export const formatCapacity = (current: number, max?: number): string => {
  if (!max) return `${current} người tham gia`;

  const remaining = max - current;
  if (remaining <= 0) return "Đã đầy";
  if (remaining === 1) return "Còn 1 chỗ";
  return `Còn ${remaining} chỗ`;
};
