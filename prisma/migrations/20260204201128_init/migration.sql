-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Sections" (
    "section_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "description_en" TEXT,
    "image_url" VARCHAR(255),
    "icon_url" VARCHAR(255),

    CONSTRAINT "Sections_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "Business" (
    "business_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "description_en" TEXT,
    "days_attention" VARCHAR(255),
    "logo_url" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "website_url" VARCHAR(255),
    "mail" VARCHAR(255),
    "address" VARCHAR(255),
    "coordinates" point NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT false,
    "section_id" INTEGER,
    "owner_full_name" VARCHAR(255),
    "owner_email" VARCHAR(255),
    "owner_password_hash" VARCHAR(255),
    "subscription_started_at" TIMESTAMP(3),
    "subscription_ends_at" TIMESTAMP(3),
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "license_number" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "EstablishmentAdmin" (
    "admin_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "business_id" INTEGER,

    CONSTRAINT "EstablishmentAdmin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Social_Networks" (
    "social_networks_id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "facebook_url" VARCHAR(255),
    "instagram_url" VARCHAR(255),
    "twitter_url" VARCHAR(255),
    "tiktok_url" VARCHAR(255),
    "whatsapp_number" VARCHAR(20),

    CONSTRAINT "Social_Networks_pkey" PRIMARY KEY ("social_networks_id")
);

-- CreateTable
CREATE TABLE "Promotions" (
    "promotion_id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "promotion_details" TEXT,
    "promotion_details_en" TEXT,
    "price" TEXT,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("promotion_id")
);

-- CreateTable
CREATE TABLE "Products" (
    "product_id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "product_details" TEXT,
    "product_details_en" TEXT,
    "price" TEXT,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "OpeningHours" (
    "opening_id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "weekend" VARCHAR(255),
    "morning_hours" VARCHAR(255)[],
    "afternoon_hours" VARCHAR(255)[],

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("opening_id")
);

-- CreateTable
CREATE TABLE "Images" (
    "image_id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255),

    CONSTRAINT "Images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" VARCHAR(255),

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destinations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(1024) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "groupSize" VARCHAR(50) NOT NULL,
    "availability" VARCHAR(100) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination_Includes" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "item" VARCHAR(255) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Destination_Includes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination_Itinerary" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Destination_Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination_Reviews" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "reviewerName" VARCHAR(255) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "initials" VARCHAR(10),
    "avatarUrl" VARCHAR(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Stats" (
    "user_id" INTEGER NOT NULL,
    "trips" INTEGER NOT NULL DEFAULT 0,
    "countries" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_Stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Trips" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(1024) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "travelers" VARCHAR(100) NOT NULL,
    "status" "TripStatus" NOT NULL,
    "bookingNumber" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "icon_bg" VARCHAR(20) NOT NULL,
    "icon_color" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_label" VARCHAR(50),
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite_Destinations" (
    "user_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_Destinations_pkey" PRIMARY KEY ("user_id","destination_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_license_number_key" ON "Business"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "EstablishmentAdmin_username_key" ON "EstablishmentAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trips_bookingNumber_key" ON "Trips"("bookingNumber");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Sections"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablishmentAdmin" ADD CONSTRAINT "EstablishmentAdmin_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social_Networks" ADD CONSTRAINT "Social_Networks_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotions" ADD CONSTRAINT "Promotions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningHours" ADD CONSTRAINT "OpeningHours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destinations" ADD CONSTRAINT "Destinations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destinations" ADD CONSTRAINT "Destinations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination_Includes" ADD CONSTRAINT "Destination_Includes_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination_Itinerary" ADD CONSTRAINT "Destination_Itinerary_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination_Reviews" ADD CONSTRAINT "Destination_Reviews_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Stats" ADD CONSTRAINT "User_Stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trips" ADD CONSTRAINT "Trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trips" ADD CONSTRAINT "Trips_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite_Destinations" ADD CONSTRAINT "Favorite_Destinations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite_Destinations" ADD CONSTRAINT "Favorite_Destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
