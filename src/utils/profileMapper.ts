import { Profile } from '../types';

export type UserWithDetails = {
  id: number;
  name: string;
  email: string;
  initials: string | null;
  stats: { trips: number; countries: number; favorites: number } | null;
  favorites: { destinationId: number }[];
  trips: { id: number; date: Date; status: string; country: string }[];
};

export function mapUserToProfile(user: UserWithDetails): Profile {
  const now = new Date();
  const favoriteDestinationIds = user.favorites.map(f => f.destinationId);
  const upcomingTripIds = user.trips
    .filter(
      trip =>
        (trip.status === 'PENDING' || trip.status === 'CONFIRMED') &&
        trip.date >= now,
    )
    .map(trip => trip.id);
  const pastTripIds = user.trips
    .filter(
      trip =>
        trip.status === 'COMPLETED' ||
        trip.status === 'CANCELED' ||
        trip.date < now,
    )
    .map(trip => trip.id);
  const countries = new Set(user.trips.map(trip => trip.country));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials ?? '',
    stats: user.stats
      ? {
          trips: user.stats.trips,
          countries: user.stats.countries,
          favorites: user.stats.favorites,
        }
      : {
          trips: user.trips.length,
          countries: countries.size,
          favorites: favoriteDestinationIds.length,
        },
    favoriteDestinationIds,
    upcomingTripIds,
    pastTripIds,
  };
}
