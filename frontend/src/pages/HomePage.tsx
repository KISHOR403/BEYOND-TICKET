import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Music,
  Trophy,
  Drama,
  Film,
  Bus,
  Presentation,
  Compass,
  Palette,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { EventCard } from "@/components/shared/EventCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Goa",
];

const DATE_OPTIONS = [
  { label: "Any Date", value: "" },
  { label: "Today", value: "today" },
  { label: "This Weekend", value: "weekend" },
  { label: "Next 7 Days", value: "week" },
  { label: "This Month", value: "month" },
];

const POPULAR_CATEGORIES = [
  {
    name: "Concerts & Events",
    slug: "concerts",
    icon: Music,
    desc: "Stadium gigs, acoustic nights & arenas",
    count: "12+ Live",
  },
  {
    name: "Movies",
    slug: "movies",
    icon: Film,
    desc: "IMAX, 4DX & luxury recliner theatres",
    count: "40+ Shows",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: Trophy,
    desc: "IPL cricket matches, football & racing",
    count: "8+ Fixtures",
  },
  {
    name: "Bus Tickets",
    slug: "buses",
    icon: Bus,
    desc: "AC Sleeper & Multi-axle Volvo routes",
    count: "120+ Daily",
  },
  {
    name: "Comedy & Theatre",
    slug: "comedy",
    icon: Drama,
    desc: "Standup specials, improv & stage plays",
    count: "15+ Shows",
  },
  {
    name: "Activities & Attractions",
    slug: "activities",
    icon: Compass,
    desc: "Theme parks, adventure treks & passes",
    count: "25+ Parks",
  },
  {
    name: "Cultural & Local Events",
    slug: "cultural",
    icon: Palette,
    desc: "Heritage festivals, fairs & art walks",
    count: "10+ Events",
  },
  {
    name: "Conferences & Workshops",
    slug: "conferences",
    icon: Presentation,
    desc: "Tech summits, masterclasses & expos",
    count: "6+ Summits",
  },
];

const SUGGESTED_SEARCHES = [
  "Arijit Singh Concert",
  "Dune IMAX Experience",
  "IPL 2027 Mumbai vs Chennai",
  "Zakir Khan Live",
  "Wonderla Weekend Pass",
  "Mumbai to Goa Bus",
  "DevConf India",
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search panel state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedDate, setSelectedDate] = useState("");

  // Recently viewed from localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/listings/");
        const results: Listing[] = res.data.results || res.data || [];
        setAllListings(results);
      } catch (err) {
        console.error("Error fetching homepage listings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();

    try {
      const stored = JSON.parse(localStorage.getItem("beyond_recent_events") || "[]");
      setRecentlyViewed(stored.slice(0, 4));
    } catch {
      // ignore
    }
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity && selectedCity !== "All Cities") params.set("city", selectedCity);
    if (selectedDate) params.set("date", selectedDate);
    navigate(`/explore?${params.toString()}`);
  };

  const handleQuickTagSearch = (tag: string) => {
    navigate(`/explore?search=${encodeURIComponent(tag)}`);
  };

  // Filter listings by selected city if any
  const cityFilteredListings = useMemo(() => {
    if (selectedCity === "All Cities") return allListings;
    return allListings.filter(
      (item) =>
        item.venue_city?.toLowerCase() === selectedCity.toLowerCase() ||
        item.venue_name?.toLowerCase().includes(selectedCity.toLowerCase())
    );
  }, [allListings, selectedCity]);

  // Section 4: Trending Near You (Top booked / high engagement events)
  const trendingEvents = useMemo(() => {
    const source = cityFilteredListings.length > 0 ? cityFilteredListings : allListings;
    // Sort by priority/capacity or featured status, take top 4
    return [...source].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)).slice(0, 4);
  }, [cityFilteredListings, allListings]);

  // Section 5: Featured Upcoming Events (Explicitly featured, avoiding direct trending duplicates if possible)
  const featuredEvents = useMemo(() => {
    const featured = allListings.filter((e) => e.is_featured);
    // Prefer items not in the top 2 of trending to prevent repetitive visual rhythm
    const trendingIds = new Set(trendingEvents.slice(0, 2).map((t) => t.id));
    const nonDuplicated = featured.filter((e) => !trendingIds.has(e.id));
    return (nonDuplicated.length > 0 ? nonDuplicated : featured).slice(0, 3);
  }, [allListings, trendingEvents]);

  // Section 6: Movies & Entertainment (Strictly movies & comedy)
  const movieAndComedyListings = useMemo(() => {
    return allListings.filter(
      (e) => e.category?.slug === "movies" || e.category?.slug === "comedy"
    );
  }, [allListings]);

  // Section 7: Experiences & Attractions (Strictly activities)
  const activitiesListings = useMemo(() => {
    return allListings.filter((e) => e.category?.slug === "activities");
  }, [allListings]);

  // Section 8: Sports & Live Performances (Strictly sports & concerts)
  const sportsAndConcertListings = useMemo(() => {
    return allListings.filter(
      (e) => e.category?.slug === "sports" || e.category?.slug === "concerts"
    );
  }, [allListings]);

  // Section 9: Local & Cultural Events (Strictly cultural, conferences, and travel/buses)
  const culturalAndConferencesListings = useMemo(() => {
    return allListings.filter(
      (e) =>
        e.category?.slug === "cultural" ||
        e.category?.slug === "conferences" ||
        e.category?.slug === "buses"
    );
  }, [allListings]);

  return (
    <div className="w-full pb-20">
      {/* 2. Hero and Universal Search Section */}
      <section className="relative bg-white pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-[#E6E9EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Search Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E9] text-[#F26336] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F26336]" />
                  <span>The Unified Experience Marketplace</span>
                </div>

                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#172033] tracking-tight leading-[1.1]">
                  Find what moves you.
                </h1>

                <p className="text-sm sm:text-lg text-[#647084] max-w-xl leading-relaxed">
                  Movies, concerts, sports, buses, attractions, workshops and more — all in one place.
                </p>
              </div>

              {/* Prominent Universal Search Panel */}
              <div className="bg-white rounded-2xl border border-[#E6E9EF] shadow-card p-4 sm:p-5 space-y-4">
                <form onSubmit={handleHeroSearch} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Location Selector */}
                    <div className="sm:col-span-4 relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#647084] block mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors appearance-none cursor-pointer"
                        >
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <MapPin className="w-3.5 h-3.5 text-[#F26336] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div className="sm:col-span-4 relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#647084] block mb-1">
                        When
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-[#172033] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors appearance-none cursor-pointer"
                        >
                          {DATE_OPTIONS.map((d) => (
                            <option key={d.label} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <Calendar className="w-3.5 h-3.5 text-[#647084] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Search CTA */}
                    <div className="sm:col-span-4 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] text-white shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search Events</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Query Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for events, movies, venues, artists, or bus routes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors"
                    />
                    <Search className="w-4 h-4 text-[#8E98A8] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </form>

                {/* Suggested Searches */}
                <div className="pt-2 border-t border-[#E6E9EF] flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-[11px] font-medium text-[#647084]">Popular searches:</span>
                  {SUGGESTED_SEARCHES.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagSearch(tag)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F7F8FA] hover:bg-[#FFF0E9] hover:text-[#F26336] text-[#647084] border border-[#E6E9EF] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#647084]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168566]" />
                  <span>100% Verified Entry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F26336]" />
                  <span>No Surprise Fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#4263EB]" />
                  <span>10-Minute Cart Hold</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Live Event Photograph */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-[#F7F8FA] border border-[#E6E9EF] shadow-card aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
                <img
                  src="/images/hero_concert.jpg"
                  alt="Packed live concert arena with cheering fans"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/85 via-[#172033]/20 to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F26336] text-white uppercase tracking-wider inline-block">
                      Live Entertainment
                    </span>
                    <h3 className="font-display font-bold text-base text-white">
                      Experience Stadium Shows & Arenas
                    </h3>
                    <p className="text-xs text-white/80">
                      Book authentic front row and general admission passes instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Categories Grid (All 8 Categories) */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26336] block mb-1">
              Browse by Category
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#172033] tracking-tight">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#647084] mt-0.5">
              Choose your category to explore verified listings and seating
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-[#F26336] hover:text-[#DF4E27] inline-flex items-center gap-1 group transition-colors"
          >
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {POPULAR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E9EF] hover:border-[#D4D9E2] hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] text-[#172033] group-hover:bg-[#FFF0E9] group-hover:text-[#F26336] flex items-center justify-center transition-colors duration-200 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#172033] group-hover:text-[#F26336] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#647084] mt-1 line-clamp-1">{cat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E6E9EF] flex items-center justify-between text-[11px] font-semibold text-[#8E98A8] group-hover:text-[#F26336] transition-colors">
                  <span>{cat.count}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Trending Near You */}
      <SectionContainer
        id="trending-section"
        icon={Flame}
        iconColor="text-[#F26336]"
        title="Trending Near You"
        subtitle={
          selectedCity !== "All Cities"
            ? `Top booked events with fast filling seats in ${selectedCity}`
            : "Top booked events with fast filling seats across all venues this week"
        }
        viewAllLink="/explore"
        viewAllText="See more"
        isLoading={isLoading}
        itemCount={trendingEvents.length}
        columns={4}
      >
        {trendingEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SectionContainer>

      {/* 5. Featured Upcoming Events */}
      {featuredEvents.length > 0 && (
        <SectionContainer
          id="featured-section"
          badge="Hand-Picked Highlights"
          title="Featured Upcoming Events"
          subtitle="Curated stadium concerts, high-stakes cricket tournaments, and premier cultural festivals"
          viewAllLink="/explore"
          viewAllText="View all featured"
          alternate={true}
          columns={3}
          itemCount={featuredEvents.length}
        >
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}

      {/* 6. Movies and Entertainment */}
      {movieAndComedyListings.length > 0 && (
        <SectionContainer
          id="movies-section"
          icon={Film}
          iconColor="text-[#4263EB]"
          title="Movies & Entertainment"
          subtitle="Blockbuster cinema premieres, IMAX 70mm, and headlining comedy specials"
          viewAllLink="/category/movies"
          viewAllText="Explore Movies & Comedy"
          columns={3}
          itemCount={movieAndComedyListings.length}
        >
          {movieAndComedyListings.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}

      {/* 7. Experiences and Attractions */}
      {activitiesListings.length > 0 && (
        <SectionContainer
          id="activities-section"
          icon={Compass}
          iconColor="text-[#168566]"
          title="Experiences & Attractions"
          subtitle="Theme park weekend passes, outdoor adventures, and family discovery tours"
          viewAllLink="/category/activities"
          viewAllText="View Attractions"
          columns={3}
          itemCount={activitiesListings.length}
        >
          {activitiesListings.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}

      {/* 8. Sports and Live Performances */}
      {sportsAndConcertListings.length > 0 && (
        <SectionContainer
          id="sports-section"
          icon={Trophy}
          iconColor="text-[#F26336]"
          title="Sports & Live Performances"
          subtitle="Stadium atmospheres, cricket tournaments, and arena concert tours"
          viewAllLink="/category/sports"
          viewAllText="View Sports"
          alternate={true}
          columns={3}
          itemCount={sportsAndConcertListings.length}
        >
          {sportsAndConcertListings.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}

      {/* 9. Local and Cultural Events */}
      {culturalAndConferencesListings.length > 0 && (
        <SectionContainer
          id="cultural-section"
          icon={Palette}
          iconColor="text-[#7A240C]"
          title="Local, Cultural & Intercity Travel"
          subtitle="Arts biennials, heritage fairs, developer summits, and verified bus travel routes"
          viewAllLink="/category/cultural"
          viewAllText="View Cultural & Travel"
          columns={3}
          itemCount={culturalAndConferencesListings.length}
        >
          {culturalAndConferencesListings.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}

      {/* 10. Transparent Pricing and Booking Trust Section */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#E6E9EF] p-8 sm:p-12 shadow-card space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF0E9] text-[#F26336] inline-block">
              Our Core Product Guarantee
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-[#172033] tracking-tight">
              No surprises at checkout.
            </h2>
            <p className="text-sm sm:text-base text-[#647084] leading-relaxed">
              See the full price before you pay. Understand every fee, cancellation rule, and refund condition before completing your booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E6E9EF]">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0E9] text-[#F26336] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-display font-bold text-base text-[#172033]">
                Transparent Price Breakdown
              </h3>
              <p className="text-xs text-[#647084] leading-relaxed">
                Platform fees and taxes are itemized on the event page. You won't face hidden surge charges or sudden ₹250 convenience additions on the last payment screen.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#4263EB] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-display font-bold text-base text-[#172033]">
                Secure Payment & Verified Booking
              </h3>
              <p className="text-xs text-[#647084] leading-relaxed">
                Every ticket is backed by official organizers and cryptographic QR codes. Instant digital pass issuance ready for Apple Wallet and Google Wallet.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5F1] text-[#168566] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-display font-bold text-base text-[#172033]">
                Clear Cancellation & Refund Information
              </h3>
              <p className="text-xs text-[#647084] leading-relaxed">
                Every listing explicitly states its age limit, entry window, and organizer cancellation terms upfront so you make informed booking decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Recently Viewed or Personalized Recommendations */}
      {recentlyViewed.length > 0 && (
        <SectionContainer
          id="recently-viewed-section"
          title="Recently Viewed by You"
          subtitle="Pick up where you left off"
          columns={4}
          itemCount={recentlyViewed.length}
        >
          {recentlyViewed.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SectionContainer>
      )}
    </div>
  );
};
