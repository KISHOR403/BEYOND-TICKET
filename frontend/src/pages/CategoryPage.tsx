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
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Ticket,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { EventCard } from "@/components/shared/EventCard";
import { CATEGORY_IMAGES } from "@/lib/images";

interface CategoryMeta {
  title: string;
  desc: string;
  icon: any;
  image: string;
  tagline: string;
  workflowTip: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  concerts: {
    title: "Concerts & Live Music",
    desc: "Stadium tours, intimate acoustic sets, indie festivals, and world-class live vocals.",
    icon: Music,
    image: "/images/hero_concert.jpg",
    tagline: "Front Row & General Admission Passes",
    workflowTip: "Select event date, reserved seats, or standing floor tiers with instant QR entry.",
  },
  sports: {
    title: "Sports Fixtures & Stadium Matches",
    desc: "Cricket championships, football derbies, grand prix passes, and arena tournaments.",
    icon: Trophy,
    image: "/images/sports_cricket.jpg",
    tagline: "Official Stadium Seating",
    workflowTip: "Pick stand categories: East/West stands, North Pavilion, or VIP corporate boxes.",
  },
  comedy: {
    title: "Standup Comedy & Theatre",
    desc: "Headlining comedians, intimate improv shows, Broadway musicals, and regional theatre.",
    icon: Drama,
    image: "/images/comedy_theatre.jpg",
    tagline: "Live Stage Performances",
    workflowTip: "Reserved tiered seating with stage visibility and upfront pricing.",
  },
  movies: {
    title: "Cinema & Movie Premieres",
    desc: "IMAX 3D, 4DX, Dolby Atmos, and luxury recliner theatres across premium multiplexes.",
    icon: Film,
    image: "/images/cinema_movies.jpg",
    tagline: "Multiplex & Luxury Screens",
    workflowTip: "Check cinema showtimes, auditorium formats, and instant digital seat reservations.",
  },
  buses: {
    title: "Intercity Luxury Buses",
    desc: "AC Sleepers, Multi-axle Volvos, and verified private bus operators with transparent stops.",
    icon: Bus,
    image: "/images/luxury_bus.jpg",
    tagline: "Comfortable Intercity Travel",
    workflowTip: "View origin, destination, boarding points, and sleeper vs semi-sleeper availability.",
  },
  activities: {
    title: "Activities & Theme Parks",
    desc: "Amusement parks, water rides, outdoor adventure treks, and guided cultural tours.",
    icon: Compass,
    image: "/images/theme_park.jpg",
    tagline: "Weekend Experiences & Attractions",
    workflowTip: "Choose visit dates, adult vs child passes, and skip-the-line express add-ons.",
  },
  cultural: {
    title: "Cultural & Local Events",
    desc: "Heritage festivals, art biennials, folk music fairs, and community celebrations.",
    icon: Palette,
    image: "/images/cultural_festival.jpg",
    tagline: "Arts, Heritage & Community",
    workflowTip: "Full festival season passes, single day admission, and workshop registrations.",
  },
  conferences: {
    title: "Conferences & Workshops",
    desc: "Developer summits, executive keynotes, masterclasses, and corporate networking galas.",
    icon: Presentation,
    image: "/images/tech_conference.jpg",
    tagline: "Professional Learning & Networking",
    workflowTip: "Conference passes, hands-on workshop add-ons, and verifiable attendee badges.",
  },
};

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categorySlug = slug || "concerts";
  const meta: CategoryMeta = CATEGORY_META[categorySlug] || {
    title: "Live Events",
    desc: "Browse verified listings with transparent pricing and zero hidden fees.",
    icon: Sparkles,
    image: "/images/hero_concert.jpg",
    tagline: "Verified Passes",
    workflowTip: "Instant digital entry with transparent checkout.",
  };

  const Icon = meta.icon;

  useEffect(() => {
    const fetchCategoryListings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/listings/", {
          params: { category__slug: categorySlug },
        });
        const results: Listing[] = res.data.results || res.data || [];
        setListings(results);
      } catch (err) {
        console.error("Error loading category listings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryListings();
  }, [categorySlug]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* Category Editorial Hero Banner */}
      <section className="relative bg-[#F7F8FA] border-b border-[#E6E9EF] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#E6E9EF] text-[#F26336] shadow-sm">
                <Icon className="w-3.5 h-3.5 text-[#F26336]" />
                <span className="capitalize">{meta.tagline}</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl text-[#172033] tracking-tight">
                {meta.title}
              </h1>

              <p className="text-sm sm:text-base text-[#647084] max-w-xl leading-relaxed">
                {meta.desc}
              </p>

              {/* Workflow Guidance Pill */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E6E9EF] shadow-card flex items-start gap-3 text-xs text-[#647084] max-w-lg">
                <CheckCircle2 className="w-4 h-4 text-[#168566] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#172033] font-semibold">Booking Workflow: </strong>
                  {meta.workflowTip}
                </span>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E6E9EF] shadow-card aspect-[16/10]">
                <img
                  src={meta.image}
                  alt={meta.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E9EF]">
          <div>
            <h2 className="font-display font-extrabold text-xl text-[#172033]">
              Available Listings ({listings.length})
            </h2>
            <p className="text-xs text-[#647084]">
              All tickets include verified digital entry and upfront pricing
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-[#F26336] hover:text-[#DF4E27] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-[#F7F8FA] animate-pulse border border-[#E6E9EF]"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-[#E6E9EF] bg-[#F7F8FA] p-12 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E9EF] text-[#647084] flex items-center justify-center mx-auto shadow-sm">
              <Icon className="w-6 h-6 text-[#F26336]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-[#172033]">
                No active listings currently published in {meta.title}
              </h3>
              <p className="text-xs text-[#647084]">
                New sessions and tours are posted daily. In the meantime, browse other upcoming experiences.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-block px-4 py-2 text-xs font-semibold bg-[#F26336] text-white rounded-xl hover:bg-[#DF4E27] transition shadow-sm"
            >
              Browse All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
