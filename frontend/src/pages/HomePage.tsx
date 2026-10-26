import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Music,
  Trophy,
  Drama,
  Film,
  Bus,
  Presentation,
  Compass,
  Palette,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing, Category } from "@/types";
import { EventCard } from "@/components/shared/EventCard";

const CATEGORY_ITEMS = [
  { name: "Concerts", slug: "concerts", icon: Music, color: "from-purple-600 to-indigo-600", desc: "Live gigs & arenas" },
  { name: "Sports", slug: "sports", icon: Trophy, color: "from-red-600 to-orange-600", desc: "Cricket, football & races" },
  { name: "Comedy", slug: "comedy", icon: Drama, color: "from-amber-500 to-yellow-600", desc: "Standup & improv" },
  { name: "Movies", slug: "movies", icon: Film, color: "from-blue-600 to-cyan-600", desc: "IMAX, 4DX & screens" },
  { name: "Luxury Buses", slug: "buses", icon: Bus, color: "from-emerald-600 to-teal-600", desc: "Intercity sleeper routes" },
  { name: "Conferences", slug: "conferences", icon: Presentation, color: "from-indigo-600 to-violet-600", desc: "Tech summits & talks" },
  { name: "Activities", slug: "activities", icon: Compass, color: "from-teal-600 to-emerald-600", desc: "Parks & experiences" },
  { name: "Cultural", slug: "cultural", icon: Palette, color: "from-pink-600 to-rose-600", desc: "Festivals & exhibits" },
];

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Listing[]>([]);
  const [allEvents, setAllEvents] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/listings/");
        const results = res.data.results || [];
        setAllEvents(results);
        setFeaturedEvents(results.filter((e: Listing) => e.is_featured));
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-16 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow backdrop blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Multi-Category Ticketing</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-slate-400">Zero Hidden Booking Fees</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08]">
              Discover, Book & Experience{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
                Beyond Tickets.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Your single platform for stadium concerts, IPL matches, stand-up comedy, movies, intercity buses, and conferences. Guaranteed seats, transparent checkout, instant QR entry.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-glow transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              <span>Explore Live Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/category/movies"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center justify-center gap-2 text-base"
            >
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Book Movies</span>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Genuine Digital Passes</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>10-Minute Cart Price Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>All Taxes & Fees Upfront</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your entertainment style or travel necessity
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group relative rounded-2xl p-5 bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow flex flex-col justify-between"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured / Trending Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Featured & Trending Events
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top curated picks across music, comedy, sports, and festivals
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>See more</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Zero Hidden Fees Pledge Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-12">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
              Our Industry Promise
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
              Tired of surprise ₹250 booking fees on the final checkout screen?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Beyond Tickets shows exact, transparent pricing from the first click. Every platform fee and tax is disclosed upfront with zero inflated add-ons. What you see is what you pay.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-white">
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent Itemized Invoices</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Ticket Transfer & Apple Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
