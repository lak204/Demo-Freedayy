import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.event.deleteMany();
  await prisma.host.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Âm nhạc',
        icon: '🎵',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Thể thao',
        icon: '⚽',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Ẩm thực',
        icon: '🍜',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Nghệ thuật',
        icon: '🎨',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Công nghệ',
        icon: '💻',
      },
    }),
  ]);

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nguyễn Văn An',
        email: 'an@example.com',
        password: hashedPassword,
        phone: '0901234567',
        role: 'HOST',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Trần Thị Bình',
        email: 'binh@example.com',
        password: hashedPassword,
        phone: '0902345678',
        role: 'USER',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=100&h=100&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Lê Văn Cường',
        email: 'cuong@example.com',
        password: hashedPassword,
        phone: '0903456789',
        role: 'HOST',
        avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Phạm Thị Dung',
        email: 'dung@example.com',
        password: hashedPassword,
        phone: '0904567890',
        role: 'USER',
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      },
    }),
  ]);

  // Create Hosts
  const hosts = await Promise.all([
    prisma.host.create({
      data: {
        userId: users[0].id,
        bio: 'Chuyên tổ chức các sự kiện âm nhạc và entertainment cho giới trẻ',
        businessName: 'An Music Events',
        businessAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
        businessPhone: '0281234567',
        verified: true,
      },
    }),
    prisma.host.create({
      data: {
        userId: users[2].id,
        bio: 'Tổ chức các hoạt động thể thao và outdoor activities',
        businessName: 'Cường Sports Club',
        businessAddress: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        businessPhone: '0282345678',
        verified: true,
      },
    }),
  ]);

  // Create Events
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Đêm nhạc Indie tại Sài Gòn',
        description:
          'Một đêm nhạc indie tuyệt vời với các nghệ sĩ underground hàng đầu Việt Nam. Không gian ấm cúng, âm nhạc chất lượng.',
        categoryId: categories[0].id, // Âm nhạc
        hostId: hosts[0].id,
        imageUrl:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        price: 150000,
        capacity: 100,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
        location: {
          address: '123 Đường Bùi Viện, Quận 1, TP.HCM',
          lat: 10.7769,
          lng: 106.7009,
          city: 'TP. Hồ Chí Minh',
        },
        tags: ['indie', 'underground', 'live-music'],
        featured: true,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Giải bóng đá mini 5vs5',
        description:
          'Giải đấu bóng đá mini hấp dẫn dành cho các bạn trẻ yêu thích thể thao. Có giải thưởng hấp dẫn!',
        categoryId: categories[1].id, // Thể thao
        hostId: hosts[1].id,
        imageUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        price: 50000,
        capacity: 32,
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000),
        location: {
          address: '789 Đường Võ Văn Kiệt, Quận 5, TP.HCM',
          lat: 10.7589,
          lng: 106.6838,
          city: 'TP. Hồ Chí Minh',
        },
        tags: ['football', 'sport', 'tournament'],
        featured: false,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Workshop nấu ăn Việt Nam',
        description:
          'Học cách nấu những món ăn truyền thống Việt Nam với đầu bếp chuyên nghiệp. Bao gồm nguyên liệu và dụng cụ.',
        categoryId: categories[2].id, // Ẩm thực
        hostId: hosts[0].id,
        imageUrl:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        price: 200000,
        capacity: 20,
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
        ),
        location: {
          address: '321 Đường Pasteur, Quận 3, TP.HCM',
          lat: 10.7886,
          lng: 106.6947,
          city: 'TP. Hồ Chí Minh',
        },
        tags: ['cooking', 'vietnamese-food', 'workshop'],
        featured: true,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Tech Talk: AI và Tương lai',
        description:
          'Buổi chia sẻ về xu hướng AI và tác động đến tương lai công nghệ với các chuyên gia hàng đầu.',
        categoryId: categories[4].id, // Công nghệ
        hostId: hosts[1].id,
        imageUrl:
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        price: 0,
        capacity: 200,
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        ),
        location: {
          address: '654 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
          lat: 10.8012,
          lng: 106.7148,
          city: 'TP. Hồ Chí Minh',
        },
        tags: ['tech', 'ai', 'free'],
        featured: false,
      },
    }),
  ]);

  // Create Preferences
  await Promise.all([
    prisma.preference.create({
      data: {
        userId: users[1].id,
        favoredTags: ['indie', 'live-music', 'art'],
        maxBudget: 300000,
        radiusKm: 10,
        weekendOnly: true,
      },
    }),
    prisma.preference.create({
      data: {
        userId: users[3].id,
        favoredTags: ['sport', 'football', 'outdoor'],
        maxBudget: 100000,
        radiusKm: 15,
        weekendOnly: false,
      },
    }),
  ]);

  // Create Bookings
  await Promise.all([
    prisma.booking.create({
      data: {
        eventId: events[0].id,
        userId: users[1].id,
        status: 'CONFIRMED',
      },
    }),
    prisma.booking.create({
      data: {
        eventId: events[0].id,
        userId: users[3].id,
        status: 'PENDING',
      },
    }),
    prisma.booking.create({
      data: {
        eventId: events[1].id,
        userId: users[1].id,
        status: 'CONFIRMED',
      },
    }),
  ]);

  // Create Reviews
  await Promise.all([
    prisma.review.create({
      data: {
        eventId: events[0].id,
        userId: users[1].id,
        rating: 5,
        comment:
          'Sự kiện tuyệt vời! Âm nhạc chất lượng và không gian rất ấm cúng.',
      },
    }),
    prisma.review.create({
      data: {
        eventId: events[1].id,
        userId: users[3].id,
        rating: 4,
        comment:
          'Giải đấu được tổ chức rất chuyên nghiệp. Sẽ tham gia lần sau.',
      },
    }),
  ]);

  console.log('Seeding finished.');
  console.log('Created:');
  console.log('- Categories:', categories.length);
  console.log('- Users:', users.length);
  console.log('- Hosts:', hosts.length);
  console.log('- Events:', events.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
