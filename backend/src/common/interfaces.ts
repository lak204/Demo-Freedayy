import { BookingStatus } from '@prisma/client';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface BookingQuery {
  status?: BookingStatus;
  after?: string;
  before?: string;
}

export interface CreateBookingRequest {
  userId: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  userId: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface PreferenceRequest {
  favoredTags?: string[];
  maxBudget?: number;
  radiusKm?: number;
  weekendOnly?: boolean;
}

export interface EventWhereCondition {
  categoryId?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  startTime?: {
    gte?: Date;
    lte?: Date;
  };
  location?: {
    city?: {
      contains?: string;
      mode?: 'insensitive';
    };
  };
  tags?: {
    hasSome?: string[];
  };
  title?: {
    contains?: string;
    mode?: 'insensitive';
  };
  description?: {
    contains?: string;
    mode?: 'insensitive';
  };
}

export interface LocationUpdate {
  address: string;
  lat: number;
  lng: number;
  city: string;
}

export interface ReviewData {
  userId: string;
  rating: number;
  comment?: string;
}
