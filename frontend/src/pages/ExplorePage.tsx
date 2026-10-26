import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, SlidersHorizontal, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { Listing, Category } from "@/types";
import { EventCard } from "@/components/shared/EventCard";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Goa",
];

const CATEGORIES = [
  { name: "All", slug: "all" },
  { name: "Concerts", slug: "concerts" },
  { name: "Sports", slug: "sports" },
  { name: "Comedy", slug: "comedy" },
  { name: "Movies", slug: "movies" },
  { name: "Buses", slug: "buses" },
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
          params.ordering = sortBy === "price_asc" ? "min_price" : sortBy === "price_desc" ? "-min_price" : "-created_at";
        }

        const res = await api.get("/listings/", { params });
        setEvents(res.data.results || []);
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
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("All Cities");
    setSearchQuery("");
    setSortBy("created_at");
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Title */}
      <div className="space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Explore Live Events & Experiences
        </h1>
        <p className="text-slate-400 text-sm">
          Browse verified listings across music, comedy, sports fixtures, cinema, and luxury travel.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by event title, artist, venue or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-3">
            {/* City Dropdown */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="created_at">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {(selectedCategory !== "all" || selectedCity !== "All Cities" || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {events.length} listings</span>
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">No listings match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or clearing active filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
