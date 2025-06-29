export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role: "USER" | "HOST" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Host {
  id: string;
  userId: string;
  bio?: string;
  verified: boolean;
  user: User;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
  city: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  imageUrl?: string;
  price: number;
  capacity?: number;
  startTime: string;
  endTime: string;
  location: Location;
  tags: string[];
  featured: boolean;
  host: Host;
  hostId: string;
  bookings?: Booking[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "ATTENDED";
  paymentId?: string;
  createdAt: string;
  event?: Event;
  user?: User;
}

export interface Preference {
  id: string;
  userId: string;
  favoredTags: string[];
  maxBudget?: number;
  radiusKm?: number;
  weekendOnly: boolean;
  updatedAt: string;
}

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  event?: Event;
  user?: User;
}

export interface EventFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  city?: string;
  maxDistance?: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  categoryId: string;
  imageUrl?: string;
  price: number;
  capacity?: number;
  startTime: string;
  endTime: string;
  location: Location;
  tags: string[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}
