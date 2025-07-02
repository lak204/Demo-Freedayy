# 🎉 Freeday - Event Discovery & Booking Platform

A comprehensive event discovery and booking platform built with React Native (Expo) and NestJS, designed to connect event organizers with attendees for weekend activities and social events.

## 🌟 Features

### **Authentication & User Management**
- ✅ **User Registration** - Create new user accounts with email verification
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Password Reset** - Forgot password functionality with email recovery
- ✅ **User Profiles** - Complete profile management with avatar upload
- ✅ **Role-Based Access Control** - Support for USER, HOST, and ADMIN roles
- ✅ **Multi-language Support** - English and Vietnamese language switching

### **Event Management**
- ✅ **Event Creation** - Hosts can create and publish events
- ✅ **Event Categories** - Organize events by categories with icons
- ✅ **Event Search & Discovery** - Advanced search with multiple filters
- ✅ **Event Details** - Comprehensive event information display
- ✅ **Featured Events** - Highlight promoted events
- ✅ **Trending Events** - Show popular events based on engagement
- ✅ **Upcoming Events** - Display chronologically ordered future events
- ✅ **Event Recommendations** - Personalized event suggestions for users
- ✅ **Event Capacity Management** - Track available slots and bookings
- ✅ **Event Reviews & Ratings** - User feedback system with 1-5 star ratings
- ✅ **Event Sharing** - Social sharing functionality
- ✅ **Save/Favorite Events** - Bookmark events for later viewing

### **Booking System**
- ✅ **Event Registration** - Users can book events with confirmation
- ✅ **Booking Status Tracking** - PENDING, CONFIRMED, CANCELLED, ATTENDED statuses
- ✅ **Booking History** - Complete history of user's event registrations
- ✅ **Weekend Schedule View** - Organized weekend event schedule by time slots
- ✅ **Booking Confirmation** - Email notifications for successful bookings
- 🔄 **Payment Integration** - Ready for payment gateway integration

### **Host Dashboard**
- ✅ **Host Profile Management** - Business information and verification
- ✅ **Event Management Dashboard** - Create, edit, and manage hosted events
- ✅ **Attendee Management** - View and manage event participants
- ✅ **Host Statistics** - Event performance metrics and analytics
- ✅ **Business Verification** - ID verification system for hosts

### **Search & Filtering**
- ✅ **Text Search** - Search by event title, description, or tags
- ✅ **Category Filtering** - Filter events by specific categories
- ✅ **Price Range Filtering** - Set minimum and maximum price filters
- ✅ **Date Range Filtering** - Filter events by date periods
- ✅ **Location Filtering** - Search events by city/location
- ✅ **Advanced Filter Modal** - Comprehensive filtering interface

### **Admin Features**
- ✅ **User Management** - Admin tools for managing user accounts
- ✅ **Content Moderation** - Tools for moderating events and reviews
- ✅ **System Configuration** - Application settings management
- ✅ **Category Management** - Create and manage event categories
- ✅ **Host Verification** - Approve and verify host accounts

## 🏗️ Technical Architecture

### **Frontend (React Native + Expo)**
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Components**: Custom components built on React Native
- **State Management**: React Hooks & Context API
- **Navigation**: Custom screen management
- **Internationalization**: Multi-language support (EN/VI)
- **Storage**: AsyncStorage for local data persistence
- **Styling**: Custom theme system with consistent design tokens

### **Backend (NestJS)**
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API design
- **File Upload**: Support for image uploads (avatars, event images)
- **Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error management

### **Database Schema**
- **Users**: Complete user profiles with roles and preferences
- **Events**: Event details with location, capacity, and metadata
- **Bookings**: Booking status tracking and history
- **Reviews**: Rating and review system
- **Categories**: Event categorization system
- **Hosts**: Host profile and business information
- **Preferences**: User preferences and notification settings

## 📱 Mobile App Screens

### **Authentication Flow**
- Login Screen with language selection
- Registration Screen with form validation
- Forgot Password Screen with email recovery

### **Main Application**
- **Home Screen**: Featured, trending, and recommended events
- **Explore Screen**: Search and filter events with categories
- **Event Detail Screen**: Complete event information with booking
- **Bookings Screen**: Weekend schedule and booking history
- **Profile Screen**: User settings, preferences, and statistics
- **Host Dashboard**: Event management for hosts and admins

### **Additional Features**
- **Demo Screen**: Application walkthrough and feature showcase
- **Language Settings**: Dynamic language switching
- **Theme Settings**: Light, dark, and auto theme modes
- **Notification Preferences**: Customizable notification settings

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- MongoDB instance
- Android Studio / Xcode (for device testing)

### **Backend Setup**

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd freeday/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="mongodb://localhost:27017/freeday"
   JWT_SECRET="your-jwt-secret-key"
   PORT=3000
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the backend server**
   ```bash
   npm run start:dev
   ```

### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in `src/services/api.ts` if needed:
   ```typescript
   const BASE_URL = 'http://localhost:3000'; // or your backend URL
   ```

4. **Start the Expo development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 📁 Project Structure

```
freeday/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── users/      # User management
│   │   │   ├── events/     # Event management
│   │   │   ├── bookings/   # Booking system
│   │   │   ├── reviews/    # Review system
│   │   │   └── ...
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Database module
│   ├── prisma/             # Database schema and migrations
│   └── test/               # Test files
├── frontend/               # React Native Frontend
│   ├── src/
│   │   ├── screens/        # Application screens
│   │   │   ├── auth/       # Authentication screens
│   │   │   └── ...
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── constants/      # App constants and themes
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── assets/             # Images and static assets
│   └── web/                # Web build output
└── README.md               # This file
```

## 🔧 API Endpoints

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### **Events**
- `GET /events` - List events with filters
- `GET /events/featured` - Get featured events
- `GET /events/trending` - Get trending events
- `GET /events/upcoming` - Get upcoming events
- `GET /events/recommended/:userId` - Get personalized recommendations
- `POST /events` - Create new event (Host/Admin)
- `PUT /events/:id` - Update event (Host/Admin)
- `DELETE /events/:id` - Delete event (Host/Admin)
- `GET /events/:id/reviews` - Get event reviews
- `POST /events/:id/reviews` - Add event review

### **Bookings**
- `GET /bookings` - Get user bookings
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id` - Update booking status
- `DELETE /bookings/:id` - Cancel booking

### **Users**
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/reviews` - Get user reviews

## 🎨 Design System

### **Color Palette**
- Primary: `#6366F1` (Indigo)
- Secondary: `#8B5CF6` (Purple)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Background: `#F9FAFB` (Gray 50)
- Text: `#111827` (Gray 900)

### **Typography**
- Font Family: System default (SF Pro on iOS, Roboto on Android)
- Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Font Sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px)

### **Spacing**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

### **Border Radius**
- sm: 4px, md: 8px, lg: 12px, xl: 16px

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

### **Frontend Testing**
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### **Backend Deployment**
1. **Production Build**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   Set production environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`

3. **Start Production Server**
   ```bash
   npm run start:prod
   ```

### **Frontend Deployment**

#### **Mobile App Store**
```bash
npx expo build:android
npx expo build:ios
```

#### **Web Deployment**
```bash
npx expo export:web
```

## 🔮 Future Enhancements

### **Planned Features**
- 💳 **Payment Integration** - Stripe/PayPal payment processing
- 📱 **Push Notifications** - Real-time event updates
- 🗺️ **Map Integration** - Interactive event location maps
- 📊 **Advanced Analytics** - Detailed event and user analytics
- 🤖 **AI Recommendations** - Machine learning-based suggestions
- 💬 **Chat System** - Event-based messaging
- 📸 **Photo Sharing** - Event photo gallery
- 🎫 **QR Code Tickets** - Digital ticket management
- 🔗 **Social Media Integration** - Enhanced sharing capabilities
- 📧 **Email Marketing** - Automated email campaigns

### **Technical Improvements**
- 🔄 **Real-time Updates** - WebSocket integration
- 📱 **Offline Support** - Offline-first architecture
- 🔍 **Advanced Search** - Elasticsearch integration
- 🛡️ **Enhanced Security** - Advanced authentication methods
- 📈 **Performance Optimization** - Caching and optimization
- 🧪 **Test Coverage** - Comprehensive test suite
- 📚 **API Documentation** - Swagger/OpenAPI documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React Native + TypeScript
- **Backend Development**: NestJS + MongoDB
- **UI/UX Design**: Mobile-first responsive design
- **Database Design**: MongoDB with Prisma ORM

## 📞 Support

For support, email support@freeday.app or join our community Discord server.

---

**Built with ❤️ by the Freeday Team**

*Making weekend event discovery effortless and enjoyable for everyone.*