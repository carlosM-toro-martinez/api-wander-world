import { z } from 'zod';

// Destination types
export const DestinationIncludeSchema = z.object({
  item: z.string(),
});

export const DestinationItinerarySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
});

export const DestinationReviewSchema = z.object({
  id: z.number(),
  name: z.string(),
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
});

export const DestinationSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  image: z.string(),
  rating: z.number(),
  reviews: z.number(),
  price: z.number(),
  shareUrl: z.string().optional(),
  category: z.string(),
  business: z.object({
    id: z.number(),
    name: z.string(),
    logoUrl: z.string().nullable().optional(),
  }),
  description: z.string(),
  durationDays: z.number(),
  groupSize: z.string(),
  availability: z.string(),
  includes: z.array(z.string()),
  itinerary: z.array(DestinationItinerarySchema),
  reviewsDetail: z.array(DestinationReviewSchema),
});

export type Destination = z.infer<typeof DestinationSchema>;

// Category types
export const CategorySchema = z.object({
  id: z.number(),
  title: z.string(),
  count: z.number(),
  image: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

// Profile types
export const ProfileStatsSchema = z.object({
  trips: z.number(),
  countries: z.number(),
  favorites: z.number(),
});

export const ProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  initials: z.string(),
  phone: z.string().optional(),
  country: z.string().optional(),
  stats: ProfileStatsSchema,
  favoriteDestinationIds: z.array(z.number()),
  upcomingTripIds: z.array(z.number()),
  pastTripIds: z.array(z.number()),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Notification types
export const NotificationItemSchema = z.object({
  id: z.number(),
  icon: z.string(),
  iconBg: z.string(),
  iconColor: z.string(),
  title: z.string(),
  description: z.string(),
  time: z.string(),
  unread: z.boolean(),
});

export type NotificationItem = z.infer<typeof NotificationItemSchema>;

// Trip types
export const TripSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  image: z.string(),
  date: z.string(),
  travelers: z.string(),
  status: z.string(),
  bookingNumber: z.string(),
  destinationId: z.number(),
});

export type Trip = z.infer<typeof TripSchema>;

// Other types
export const PopularSearchSchema = z.string();
export type PopularSearch = z.infer<typeof PopularSearchSchema>;

export const RecentSearchSchema = z.object({
  name: z.string(),
  country: z.string(),
  image: z.string(),
});

export type RecentSearch = z.infer<typeof RecentSearchSchema>;
