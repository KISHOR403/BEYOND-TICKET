import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal, MapPin, ArrowUpDown, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { EventCard } from "@/components/shared/EventCard";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Goa",
  "Kolkata",
  "Ahmedabad",
];

const CATEGORIES = [
  { name: "All Categories", slug: "all" },
  { name: "Concerts", slug: "concerts" },
  { name: "Sports", slug: "sports" },
  { name: "Comedy & Theatre", slug: "comedy" },
  { name: "Movies", slug: "movies" },
  { name: "Bus Tickets", slug: "buses" },
  { name: "Activities", slug: "activities" },
  { name: "Cultural", slug: "cultural" },
  { name: "Conferences", slug: "conferences" },
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "All Cities");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("created_at");

  // Keep state synced with URL query params
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const city = searchParams.get("city") || "All Cities";
    const q = searchParams.get("search") || "";
    setSelectedCategory(cat);
    setSelectedCity(city);
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (selectedCategory && selectedCategory !== "all") {
          params.category__slug = selectedCategory;
        }
        if (selectedCity && selectedCity !== "All Cities") {
          params.venue__city = selectedCity;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (sortBy) {
          params.ordering =
            sortBy === "price_asc"
              ? "min_price"
              : sortBy === "price_desc"
              ? "-min_price"
              : "-created_at";
        }

        const res = await api.get("/listings/", { params });
        setEvents(res.data.results || res.data || []);
      } catch (err) {
        console.error("Error fetching explore events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedCity, searchQuery, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchQuery });
  };

  const updateUrlParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "all" || v === "All Cities") {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("All Cities");
    setSearchQuery("");
    setSortBy("created_at");
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== "all" || selectedCity !== "All Cities" || Boolean(searchQuery.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033]">
          Explore Live Events & Experiences
        </h1>
        <p className="text-sm text-[#647084] max-w-2xl">
          Browse verified listings across music concerts, sports matches, comedy specials, cinema showtimes, and luxury travel.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-[#E6E9EF] rounded-2xl p-4 sm:p-5 shadow-card space-y-4">
        {/* Row 1: Search and Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Universal Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search by event title, artist, venue, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] focus:ring-1 focus:ring-[#F26336] transition-all"
            />
            <Search className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* City & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  updateUrlParams({ city: e.target.value });
                }}
                className="bg-[#F7F8FA] border border-[#E6E9EF] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7F8FA] border border-[#E6E9EF] text-[#172033] text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors cursor-pointer"
              >
                <option value="created_at">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded-xl transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[#E6E9EF]">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  updateUrlParams({ category: cat.slug });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#172033] text-white shadow-sm"
                    : "bg-[#F7F8FA] text-[#647084] hover:text-[#172033] hover:bg-[#E6E9EF]/60"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#647084] px-1">
        <span>
          Showing <strong className="text-[#172033]">{events.length}</strong> verified listings
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-[#F26336]">Filters active</span>
        )}
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-[#F7F8FA] animate-pulse border border-[#E6E9EF]"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-[#E6E9EF] bg-[#F7F8FA] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0E9] text-[#F26336] flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-[#172033]">
              No listings match your search criteria
            </h3>
            <p className="text-xs text-[#647084] max-w-sm mx-auto">
              Try adjusting your query, clearing category filters, or selecting "All Cities".
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F26336] text-white hover:bg-[#DF4E27] transition shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
