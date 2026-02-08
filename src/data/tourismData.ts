import { Destination, Category, Profile, NotificationItem, Trip, PopularSearch, RecentSearch } from '../types';

export const destinations: Destination[] = [
  {
    id: 1,
    name: "París",
    location: "París, Francia",
    image:
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NzQ4NzczMHww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    reviews: 1248,
    price: 899,
    category: "Cultural",
    description:
      "Descubre la Ciudad de la Luz con sus icónicos monumentos, museos de clase mundial y la exquisita gastronomía francesa.",
    durationDays: 7,
    groupSize: "2-8 personas",
    availability: "Todo el año",
    includes: [
      "Alojamiento 5 estrellas",
      "Desayuno incluido",
      "Paseo por el Sena",
      "Traslados aeropuerto",
    ],
    itinerary: [
      {
        day: 1,
        title: "Torre Eiffel y Campos de Marte",
        description:
          "Recorre la Torre Eiffel, pasea por el Sena y disfruta de un picnic en los Campos de Marte.",
      },
      {
        day: 2,
        title: "Museo del Louvre y Marais",
        description:
          "Explora el Louvre y la historia del barrio Marais con paradas gastronómicas.",
      },
      {
        day: 3,
        title: "Montmartre y Sacré-Cœur",
        description:
          "Visita Montmartre, artistas locales y la basílica de Sacré-Cœur al atardecer.",
      },
    ],
    reviewsDetail: [
      {
        id: 1,
        name: "María G.",
        rating: 5,
        comment: "Todo salió perfecto, el tour por el Sena fue inolvidable.",
        date: "10 Ene 2026",
      },
      {
        id: 2,
        name: "Carlos A.",
        rating: 4.8,
        comment: "Excelente organización y hoteles muy cómodos.",
        date: "22 Dic 2025",
      },
      {
        id: 3,
        name: "Lucía R.",
        rating: 4.9,
        comment: "Guías muy atentos y buena planificación de tiempos.",
        date: "05 Nov 2025",
      },
    ],
  },
];

export const categories: Category[] = [
  {
    id: 1,
    title: "Playas",
    count: 120,
    image:
      "https://images.unsplash.com/photo-1717501787981-d5f28eb2df5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiYWxpJTIwYmVhY2glMjBzdW5zZXR8ZW58MXx8fHwxNzY3NDc0MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    title: "Aventura",
    count: 85,
    image:
      "https://images.unsplash.com/photo-1610123598147-f632aa18b275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxpY2VsYW5kJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2NzQ0ODc4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export const profiles: Profile[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    initials: "JD",
    stats: {
      trips: 3,
      countries: 3,
      favorites: 3,
    },
    favoriteDestinationIds: [1, 3, 6],
    upcomingTripIds: [1, 2],
    pastTripIds: [3],
  },
  {
    id: 2,
    name: "Valeria Gómez",
    email: "valeria.gomez@email.com",
    initials: "VG",
    stats: {
      trips: 2,
      countries: 2,
      favorites: 3,
    },
    favoriteDestinationIds: [2, 4, 5],
    upcomingTripIds: [4],
    pastTripIds: [5],
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 1,
    icon: "airplane",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    title: "¡Tu viaje a París está confirmado!",
    description: "Salida el 15 de marzo de 2026",
    time: "Hace 2 horas",
    unread: true,
  },
  {
    id: 2,
    icon: "gift-outline",
    iconBg: "#f3e8ff",
    iconColor: "#a855f7",
    title: "Oferta especial: 20% de descuento",
    description: "En viajes a destinos de playa este verano",
    time: "Hace 5 horas",
    unread: true,
  },
  {
    id: 3,
    icon: "map-marker-outline",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    title: "Nuevos destinos disponibles",
    description: "Descubre nuestras nuevas rutas en Asia",
    time: "Ayer",
    unread: false,
  },
  {
    id: 4,
    icon: "credit-card-outline",
    iconBg: "#ffedd5",
    iconColor: "#f97316",
    title: "Pago procesado exitosamente",
    description: "Tu reserva WW-2026-1234 ha sido pagada",
    time: "Hace 2 días",
    unread: false,
  },
];

export const trips: Trip[] = [
  {
    id: 1,
    name: "París",
    country: "Francia",
    image:
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NzQ4NzczMHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "15 Mar 2026",
    travelers: "2 adultos",
    status: "Confirmado",
    bookingNumber: "WW-2026-1234",
    destinationId: 1,
  },
  {
    id: 2,
    name: "Tokio",
    country: "Japón",
    image:
      "https://images.unsplash.com/photo-1648871647634-0c99b483cb63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2NzQ2OTYwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "10 Jun 2026",
    travelers: "1 adulto",
    status: "Pendiente",
    bookingNumber: "WW-2026-5678",
    destinationId: 2,
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1717501787981-d5f28eb2df5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiYWxpJTIwYmVhY2glMjBzdW5zZXR8ZW58MXx8fHwxNzY3NDc0MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "20 Dic 2025",
    travelers: "2 adultos, 1 niño",
    status: "Completado",
    bookingNumber: "WW-2025-9012",
    destinationId: 3,
  },
];

export const popularSearches: PopularSearch[] = ["París", "Tokio", "Bali", "Nueva York", "Roma", "Santorini"];

export const recentSearches: RecentSearch[] = [
  {
    name: "París",
    country: "Francia",
    image:
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NzQ4NzczMHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1717501787981-d5f28eb2df5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiYWxpJTIwYmVhY2glMjBzdW5zZXR8ZW58MXx8fHwxNzY3NDc0MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];