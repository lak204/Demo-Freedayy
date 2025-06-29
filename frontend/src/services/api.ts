import {
  Event,
  EventFilter,
  CreateEventRequest,
  UpdateEventRequest,
  Booking,
  Review,
  Category,
  User,
  Preference,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Change this to your actual backend URL
// 10.0.2.2 is for Android emulator
// 127.0.0.1 or localhost is for iOS simulator/web
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";

console.log("🔗 API_BASE_URL:", API_BASE_URL, "Platform:", Platform.OS);

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("🚀 Making request to:", url);
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear the timeout

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          `API Error: ${response.status} ${response.statusText}`
        );
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
        throw error;
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId); // Clear the timeout

      if (error.name === "AbortError") {
        console.error("Request timeout");
        const timeoutError = new Error("Request timed out");
        (timeoutError as any).message = "Request timed out";
        throw timeoutError;
      }

      if (
        error.name === "TypeError" &&
        error.message === "Network request failed"
      ) {
        // Network error - create a proper error object
        console.error(
          "Network request failed. Please check your connection and server status."
        );
        const networkError = new Error("Network request failed");
        (networkError as any).message = "Network request failed";
        throw networkError;
      }
      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  async hasAuthToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return !!token;
    } catch (error) {
      console.error("Error checking auth token:", error);
      return false;
    }
  }

  // Events API
  async getEvents(filter?: EventFilter): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<Event[]>(`/events${query}`);
  }
  async getEventById(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(event: CreateEventRequest): Promise<Event> {
    const token = await this.getAuthToken();
    return this.request<Event>("/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });
  }

  async updateEvent(
    eventId: string,
    event: UpdateEventRequest
  ): Promise<Event> {
    const token = await this.getAuthToken();
    return this.request<Event>(`/events/${eventId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const token = await this.getAuthToken();
    return this.request<void>(`/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Featured and recommended events
  async getFeaturedEvents(): Promise<Event[]> {
    return this.request<Event[]>("/events/featured");
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.request<Event[]>("/events/upcoming");
  }

  async getTrendingEvents(): Promise<Event[]> {
    return this.request<Event[]>("/events/trending");
  }

  async getRecommendedEvents(userId: string): Promise<Event[]> {
    return this.request<Event[]>(`/events/recommended/${userId}`);
  }
  // Bookings API
  async createBooking(eventId: string): Promise<Booking> {
    console.log("⬆️ Creating booking for event:", eventId);
    const token = await this.getAuthToken();

    if (!token) {
      console.error("🔑 No auth token found when creating booking");
      throw new Error("Authentication required");
    }

    try {
      const booking = await this.request<Booking>("/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      console.log("⬇️ Booking created successfully:", booking);
      return booking;
    } catch (error) {
      console.error("⛔ Booking creation error:", error);
      throw error;
    }
  }

  async getUserBookings(): Promise<Booking[]> {
    const token = await this.getAuthToken();
    return this.request<Booking[]>("/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateBooking(
    bookingId: string,
    data: { status?: string; notes?: string }
  ): Promise<Booking> {
    const token = await this.getAuthToken();
    return this.request<Booking>(`/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(bookingId: string): Promise<void> {
    const token = await this.getAuthToken();
    return this.request<void>(`/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } // Reviews API
  async createReview(
    eventId: string,
    review: { rating: number; comment?: string }
  ): Promise<Review> {
    const token = await this.getAuthToken();
    return this.request<Review>("/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, ...review }),
    });
  }

  async getEventReviews(eventId: string): Promise<Review[]> {
    return this.request<Review[]>(`/reviews/event/${eventId}`);
  }

  async updateReview(
    reviewId: string,
    review: { rating?: number; comment?: string }
  ): Promise<Review> {
    const token = await this.getAuthToken();
    return this.request<Review>(`/reviews/${reviewId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(review),
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    const token = await this.getAuthToken();
    return this.request<void>(`/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }
  // User API
  async getUserProfile(): Promise<User> {
    const token = await this.getAuthToken();
    return this.request<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const token = await this.getAuthToken();
    return this.request<User>("/users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }
  // Preferences API
  async getUserPreferences(): Promise<Preference> {
    const token = await this.getAuthToken();
    return this.request<Preference>("/users/me/preferences", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserPreferences(
    preferences: Partial<Preference>
  ): Promise<Preference> {
    const token = await this.getAuthToken();
    return this.request<Preference>("/users/me/preferences", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  }
  // Host API
  async getEventAttendees(eventId: string): Promise<Booking[]> {
    const token = await this.getAuthToken();
    return this.request<Booking[]>(`/events/${eventId}/attendees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  // Authentication API
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    try {
      console.log(`Attempting login for email: ${email}`);
      const response = await this.request<{ token: string; user: User }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      // Save token for future requests
      await this.setAuthToken(response.token);
      console.log("Login successful, token received");
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      }
    );

    // Save token for future requests
    await this.setAuthToken(response.token);
    return response;
  }
  async logout(): Promise<void> {
    try {
      // Clear the auth token
      await this.removeAuthToken();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still remove token even if there's an error
      await this.removeAuthToken();
    }
  }

  // User Reviews API
  async getUserReviews(): Promise<Review[]> {
    const token = await this.getAuthToken();
    return this.request<Review[]>("/reviews/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
