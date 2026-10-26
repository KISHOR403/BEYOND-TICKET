import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Music,
  Trophy,
  Drama,
  Film,
  Bus,
  Presentation,
  Compass,
  Palette,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { EventCard } from "@/components/shared/EventCard";

const CATEGORY_META: Record<string, any> = {
  concerts: {
    title: "Concerts & Live Music",
    desc: "From stadium tours to intimate acoustic sets. Live vocals, electrifying crowds, and verified access.",
    icon: Music,
    gradient: "from-purple-900/80 via-indigo-950 to-slate-950",
    pillColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  sports: {
    title: "Sports Fixtures & Arena Matches",
    desc: "Cricket championships, football derbies, and motorsport grand prix passes.",
    icon: Trophy,
    gradient: "from-red-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  comedy: {
    title: "Standup Comedy & Theatre",
    desc: "Unfiltered laughter, headlining comics, Broadway plays, and live comedy tours.",
    icon: Drama,
    gradient: "from-amber-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  movies: {
    title: "Cinema & Movie Premieres",
    desc: "IMAX 3D, 4DX, and luxury recliner theatres. Select your preferred cinema and showtime.",
    icon: Film,
    gradient: "from-blue-950/80 via-indigo-950 to-slate-950",
    pillColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  buses: {
    title: "Intercity Luxury Buses",
    desc: "AC Sleepers, Multi-axle Volvos, and verified private bus operators with visual seat selection.",
    icon: Bus,
    gradient: "from-emerald-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  conferences: {
    title: "Conferences & Tech Summits",
    desc: "Developer summits, executive keynotes, hands-on masterclasses, and networking galas.",
    icon: Presentation,
    gradient: "from-indigo-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  activities: {
    title: "Theme Parks & Attractions",
    desc: "Adventures, weekend amusement park tickets, water sports, and guided experiences.",
    icon: Compass,
    gradient: "from-teal-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  cultural: {
    title: "Cultural & Heritage Festivals",
    desc: "Folk music traditions, art biennials, literature festivals, and regional celebrations.",
    icon: Palette,
    gradient: "from-pink-950/80 via-slate-900 to-slate-950",
    pillColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
};

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const meta = CATEGORY_META[slug || ""] || {
    title: "Live Events",
    desc: "Browse hand-picked listings with transparent pricing and zero hidden fees.",
    icon: Sparkles,
    gradient: "from-indigo-950 via-slate-900 to-slate-950",
    pillColor: "bg-indigo-500/20 text-indigo-300",
  };
  const Icon = meta.icon;

  useEffect(() => {
    const fetchCategoryListings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/listings/", {
          params: { category__slug: slug },
        });
        setListings(res.data.results || []);
      } catch (err) {
        console.error("Error loading category listings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryListings();
  }, [slug]);

  return (
    <div className="space-y-12 pb-20">
      {/* Category Hero Banner */}
      <section className={`relative py-16 bg-gradient-to-b ${meta.gradient} border-b border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${meta.pillColor}`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="capitalize">{slug} Category</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white">
              {meta.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {meta.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Main Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">
            Available {meta.title} ({listings.length})
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-3">
            <Icon className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-white font-bold">No active listings in this category right now</h3>
            <p className="text-xs text-slate-400">Check back soon as new sessions and shows are added daily.</p>
            <Link
              to="/explore"
              className="inline-block mt-2 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl"
            >
              Explore Other Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
