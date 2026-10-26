import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Listing } from "@/types";

interface EventCardProps {
  event: Listing;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryGradient = (slug: string) => {
    switch (slug) {
      case "concerts":
        return "from-purple-900/60 via-indigo-900/40 to-slate-900";
      case "sports":
        return "from-red-900/60 via-amber-900/40 to-slate-900";
      case "comedy":
        return "from-amber-900/60 via-yellow-900/40 to-slate-900";
      case "movies":
        return "from-blue-900/60 via-slate-900/40 to-slate-900";
      case "buses":
        return "from-emerald-900/60 via-teal-900/40 to-slate-900";
      case "conferences":
        return "from-cyan-900/60 via-blue-900/40 to-slate-900";
      default:
        return "from-indigo-900/60 via-slate-900/40 to-slate-900";
    }
  };

  return (
    <Link
      to={`/events/${event.slug || event.id}`}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      {/* Image / Banner Container */}
      <div className={`relative w-full overflow-hidden ${featured ? "h-64 sm:h-72" : "h-48"}`}>
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(
              event.category?.slug
            )} flex flex-col justify-end p-5 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />
            <div className="text-4xl opacity-20 font-black tracking-tighter uppercase font-display">
              {event.category?.name || "LIVE EVENT"}
            </div>
          </div>
        )}

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Pill & Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
            {event.category?.name || "Event"}
          </span>
          {event.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-glow-amber">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              Featured
            </span>
          )}
        </div>

        {/* Date Tag Floating on Image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formatDate(event.start_date)}</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Venue & Location */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {event.venue_name ? `${event.venue_name}, ` : ""}
              {event.venue_city || "Multiple Venues"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {event.short_description || "Experience top tier entertainment with Beyond Tickets."}
          </p>
        </div>

        {/* Pricing & CTA footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium block">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-lg text-white">
                ₹{Number(event.min_price).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400">onwards</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all">
            <span>Book</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
