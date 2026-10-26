// Image assets and category fallback mappings
export const CATEGORY_IMAGES: Record<string, string> = {
  concerts: "/images/hero_concert.jpg",
  sports: "/images/sports_cricket.jpg",
  comedy: "/images/comedy_theatre.jpg",
  movies: "/images/cinema_movies.jpg",
  buses: "/images/luxury_bus.jpg",
  activities: "/images/theme_park.jpg",
  cultural: "/images/cultural_festival.jpg",
  conferences: "/images/tech_conference.jpg",
};

export const DEFAULT_FALLBACK_IMAGE = "/images/hero_concert.jpg";

/**
 * Returns a reliable image URL for a given event and category.
 */
export function getEventCoverImage(event?: { cover_image?: string; category?: { slug?: string } } | null): string {
  if (!event) return DEFAULT_FALLBACK_IMAGE;

  if (event.cover_image && event.cover_image.trim()) {
    // If it's already an absolute or valid public path
    return event.cover_image;
  }

  const categorySlug = event.category?.slug?.toLowerCase() || "";
  return CATEGORY_IMAGES[categorySlug] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Image fallback handler for <img> onError events.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categorySlug?: string
) {
  const target = e.currentTarget;
  const fallback = (categorySlug && CATEGORY_IMAGES[categorySlug]) || DEFAULT_FALLBACK_IMAGE;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
