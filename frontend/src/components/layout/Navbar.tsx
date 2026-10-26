import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Ticket,
  Search,
  MapPin,
  QrCode,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

const CATEGORIES = [
  { name: "Concerts", slug: "concerts" },
  { name: "Sports", slug: "sports" },
  { name: "Comedy", slug: "comedy" },
  { name: "Activities", slug: "activities" },
  { name: "Cultural", slug: "cultural" },
  { name: "Movies", slug: "movies" },
  { name: "Buses", slug: "buses" },
  { name: "Conferences", slug: "conferences" },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    if (city === "All Cities") {
      navigate("/explore");
    } else {
      navigate(`/explore?city=${encodeURIComponent(city)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                BEYOND <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-300">TICKETS</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">Zero Hidden Fees</span>
            </div>
          </Link>

          {/* City Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isCityOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3.5 py-2 text-sm transition ${
                      selectedCity === city
                        ? "bg-indigo-600/20 text-indigo-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events, artists, venues, cinema, or buses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Gate Scanner Link */}
            <Link
              to="/scanner"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition"
              title="Venue Gate Scanner Simulation"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Gate Scanner</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-900 border border-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-semibold text-sm">
                    {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-sm font-semibold text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-400 font-medium capitalize">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/tickets"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition"
                    >
                      <Ticket className="w-4 h-4 text-indigo-400" />
                      <span>My Tickets</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition"
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Order History</span>
                    </Link>

                    {(user?.role === "organizer" || user?.role === "admin") && (
                      <Link
                        to="/organizer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 rounded-lg transition font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                        <span>Organizer Portal</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800/80 my-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-glow transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Subnav */}
      <div className="border-t border-slate-800/60 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 min-w-max">
            <Link
              to="/explore"
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition ${
                location.pathname === "/explore" && !location.search
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              All Events
            </Link>
            {CATEGORIES.map((cat) => {
              const isActive = location.pathname.includes(`/category/${cat.slug}`);
              return (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search events, cinema, buses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </form>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm text-slate-300 py-1"
            >
              Explore All Events
            </Link>
            <Link
              to="/tickets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm text-slate-300 py-1"
            >
              My Tickets
            </Link>
            <Link
              to="/scanner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm text-amber-400 py-1 font-medium"
            >
              Gate QR Scanner
            </Link>
            <Link
              to="/organizer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm text-indigo-400 py-1"
            >
              Organizer Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
