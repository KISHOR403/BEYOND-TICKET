import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Heart, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { Listing } from "@/types";
import { getEventCoverImage, handleImageError } from "@/lib/images";

interface EventCardProps {
  event: Listing;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem("beyond_favorites") || "[]");
      setIsFavorite(favorites.includes(event.id || event.slug));
    } catch {
      // ignore
    }
  }, [event.id, event.slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const key = event.id || event.slug;
      const favorites = JSON.parse(localStorage.getItem("beyond_favorites") || "[]");
      let updated: string[];
      if (favorites.includes(key)) {
        updated = favorites.filter((id: string) => id !== key);
        setIsFavorite(false);
      } else {
        updated = [...favorites, key];
        setIsFavorite(true);
      }
      localStorage.setItem("beyond_favorites", JSON.stringify(updated));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const imageSrc = getEventCoverImage(event);
  const minPrice = Number(event.min_price) || 0;

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border border-[#E6E9EF] hover:border-[#D4D9E2] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <Link to={`/events/${event.slug || event.id}`} className="flex flex-col h-full">
        {/* Image Container with Consistent Aspect Ratio */}
        <div className={`relative w-full overflow-hidden bg-[#F7F8FA] ${featured ? "aspect-[16/9] sm:aspect-[2/1]" : "aspect-[16/10]"}`}>
          <img
            src={imageSrc}
            alt={event.title}
            onError={(e) => handleImageError(e, event.category?.slug)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />

          {/* Top Overlay: Category Badge & Favorite Button */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#172033] shadow-sm backdrop-blur-sm border border-[#E6E9EF]/80">
              {event.category?.name || "Live Event"}
            </span>

            <button
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 text-[#172033] hover:text-[#F26336] shadow-sm flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? "fill-[#F26336] text-[#F26336]" : "text-[#647084]"
                }`}
              />
            </button>
          </div>

          {/* Bottom Floating Pill: Availability / Fast Filling */}
          {event.is_featured && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#172033]/90 text-white backdrop-blur-sm">
              <Flame className="w-3 h-3 text-[#F26336]" />
              <span>Fast Filling</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Date & Location Line */}
            <div className="flex items-center gap-3 text-xs text-[#647084]">
              <div className="flex items-center gap-1.5 shrink-0 font-medium text-[#172033]">
                <Calendar className="w-3.5 h-3.5 text-[#F26336]" />
                <span>{formatDate(event.start_date)}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#D4D9E2]" />
              <div className="flex items-center gap-1 truncate" title={event.venue_city || "Multiple Venues"}>
                <MapPin className="w-3.5 h-3.5 text-[#8E98A8] shrink-0" />
                <span className="truncate">{event.venue_name || event.venue_city || "Venue Announced Soon"}</span>
              </div>
            </div>

            {/* Event Title */}
            <h3 className="font-display font-bold text-base text-[#172033] group-hover:text-[#F26336] transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-[#647084] line-clamp-2 leading-relaxed">
              {event.short_description || "Book confirmed passes with instant digital QR entry and zero hidden fees."}
            </p>
          </div>

          {/* Bottom Pricing & CTA */}
          <div className="pt-4 mt-4 border-t border-[#E6E9EF] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#647084] font-medium block">
                Starting From
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-lg text-[#172033]">
                  ₹{minPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#647084]">onwards</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF0E9] text-[#F26336] group-hover:bg-[#F26336] group-hover:text-white transition-all duration-150 flex items-center gap-1">
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
