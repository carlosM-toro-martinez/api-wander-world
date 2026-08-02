import { formatDateEsShort } from './formatters';
import { Destination } from '../types';

export type DestinationRecord = {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  price: number;
  description: string;
  durationDays: number;
  groupSize: string;
  availability: string;
  category: { id: number; title: string };
  business: { id: number; name: string; logoUrl: string | null };
  includes: { item: string }[];
  itinerary: { day: number; title: string; description: string }[];
  reviewsDetail: {
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    reviewedAt: Date;
  }[];
};

export function mapDestination(destination: DestinationRecord): Destination {
  const publicBaseUrl = process.env.PUBLIC_APP_URL ?? 'https://kawsay.bo';

  return {
    id: destination.id,
    name: destination.name,
    location: destination.location,
    image: destination.imageUrl,
    rating: destination.rating,
    reviews: destination.reviewsCount,
    price: destination.price,
    shareUrl: `${publicBaseUrl}/destinations/${destination.id}`,
    category: destination.category.title,
    business: {
      id: destination.business.id,
      name: destination.business.name,
      logoUrl: destination.business.logoUrl,
    },
    description: destination.description,
    durationDays: destination.durationDays,
    groupSize: destination.groupSize,
    availability: destination.availability,
    includes: destination.includes.map(i => i.item),
    itinerary: destination.itinerary.map(i => ({
      day: i.day,
      title: i.title,
      description: i.description,
    })),
    reviewsDetail: destination.reviewsDetail.map(r => ({
      id: r.id,
      name: r.reviewerName,
      rating: r.rating,
      comment: r.comment,
      date: formatDateEsShort(r.reviewedAt),
    })),
  };
}
