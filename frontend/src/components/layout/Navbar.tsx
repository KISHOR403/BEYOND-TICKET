import React, { useState, useRef, useEffect } from "react";
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
  Menu,
  X,
  Compass,
  Home,
  Check,
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
  "Kolkata",
  "Ahmedabad",
];

const CATEGORIES = [
  { name: "All Events", slug: "all", path: "/explore" },
  { name: "Concerts", slug: "concerts", path: "/category/concerts" },
  { name: "Sports", slug: "sports", path: "/category/sports" },
  { name: "Comedy & Theatre", slug: "comedy", path: "/category/comedy" },
  { name: "Activities", slug: "activities", path: "/category/activities" },
  { name: "Cultural Events", slug: "cultural", path: "/category/cultural" },
  { name: "Movies", slug: "movies", path: "/category/movies" },
  { name: "Bus Tickets", slug: "buses", path: "/category/buses" },
  { name: "Conferences", slug: "conferences", path: "/category/conferences" },
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

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
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
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E6E9EF]">
        {/* Primary Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Left: Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#F26336] text-white flex items-center justify-center shadow-sm group-hover:bg-[#DF4E27] transition-colors">
                <Ticket className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg tracking-tight text-[#172033] leading-none">
                  BEYOND<span className="text-[#F26336]">TICKETS</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#647084] font-medium mt-0.5">
                  Transparent Pricing
                </span>
              </div>
            </Link>

            {/* Location Selector Dropdown */}
            <div className="relative hidden md:block" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA] border border-[#E6E9EF] transition-colors"
                aria-expanded={isCityOpen}
                aria-haspopup="listbox"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F26336]" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-[#647084]" />
              </button>

              {isCityOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl bg-white border border-[#E6E9EF] shadow-dropdown py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#8E98A8] tracking-wider">
                    Select Your City
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        selectedCity === city
                          ? "bg-[#FFF0E9] text-[#F26336] font-semibold"
                          : "text-[#172033] hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <Check className="w-3.5 h-3.5 text-[#F26336]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Universal Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events, movies, concerts, artists, or bus routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-full pl-10 pr-4 py-2 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] focus:ring-1 focus:ring-[#F26336] transition-all"
                />
                <Search className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Right Action Items */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Gate QR Simulator Link */}
              <Link
                to="/scanner"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6E9EF] bg-[#F7F8FA] hover:bg-white hover:border-[#D4D9E2] text-[#647084] hover:text-[#172033] transition-colors"
                title="Venue Staff Gate Scanner Simulation"
              >
                <QrCode className="w-3.5 h-3.5 text-[#F26336]" />
                <span>Gate Scanner</span>
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F7F8FA] border border-[#E6E9EF] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFF0E9] text-[#F26336] border border-[#F26336]/20 flex items-center justify-center font-bold text-xs">
                      {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#647084] mr-1 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E6E9EF] shadow-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-[#E6E9EF] mb-1">
                        <p className="text-xs font-bold text-[#172033]">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-[11px] text-[#647084] truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] rounded-full bg-[#FFF0E9] text-[#F26336] font-semibold uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/tickets"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-[#F7F8FA] rounded-lg transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#F26336]" />
                        <span>My Digital Passes</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-[#F7F8FA] rounded-lg transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#4263EB]" />
                        <span>Order Receipts</span>
                      </Link>

                      {(user?.role === "organizer" || user?.role === "admin") && (
                        <Link
                          to="/organizer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F26336] hover:bg-[#FFF0E9] rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Organizer Operations</span>
                        </Link>
                      )}

                      <div className="border-t border-[#E6E9EF] my-1 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                            navigate("/");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
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
                    className="px-3 py-1.5 text-xs font-semibold text-[#172033] hover:text-[#F26336] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] text-white shadow-sm transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#647084] hover:text-[#172033] hover:bg-[#F7F8FA]"
                aria-label="Toggle navigation drawer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Category Subnavigation (Desktop/Tablet) */}
        <div className="border-t border-[#E6E9EF] bg-[#F7F8FA]/60 hidden sm:block overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 py-1.5 min-w-max" aria-label="Category navigation">
              {CATEGORIES.map((cat) => {
                const isActive =
                  cat.slug === "all"
                    ? location.pathname === "/explore" && !location.search
                    : location.pathname.includes(`/category/${cat.slug}`);

                return (
                  <Link
                    key={cat.slug}
                    to={cat.path}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white text-[#F26336] font-semibold shadow-sm border border-[#E6E9EF]"
                        : "text-[#647084] hover:text-[#172033] hover:bg-white/60"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Search & Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E6E9EF] bg-white px-4 py-4 space-y-4 shadow-dropdown animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events, cinema, buses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] placeholder-[#8E98A8]"
                />
                <Search className="w-4 h-4 text-[#8E98A8] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* City Selector in mobile */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8E98A8] tracking-wider block">
                Selected City
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.slice(0, 6).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      handleCitySelect(city);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      selectedCity === city
                        ? "bg-[#FFF0E9] border-[#F26336] text-[#F26336]"
                        : "bg-white border-[#E6E9EF] text-[#647084]"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Links */}
            <div className="pt-2 border-t border-[#E6E9EF]">
              <span className="text-[10px] uppercase font-bold text-[#8E98A8] tracking-wider block mb-2">
                Browse Categories
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={cat.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs text-[#172033] hover:text-[#F26336] py-1 px-2 rounded-lg hover:bg-[#F7F8FA]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6E9EF] flex items-center justify-between text-xs">
              <Link
                to="/scanner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#F26336] font-semibold flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Gate Scanner</span>
              </Link>
              <Link
                to="/organizer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#4263EB] font-semibold"
              >
                Organizer Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E6E9EF] shadow-lg flex items-center justify-around py-2 px-1">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            location.pathname === "/" ? "text-[#F26336]" : "text-[#647084]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          to="/explore"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            location.pathname.startsWith("/explore") || location.pathname.startsWith("/category")
              ? "text-[#F26336]"
              : "text-[#647084]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </Link>
        <Link
          to="/tickets"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            location.pathname.startsWith("/tickets") ? "text-[#F26336]" : "text-[#647084]"
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span>Passes</span>
        </Link>
        <Link
          to="/scanner"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            location.pathname.startsWith("/scanner") ? "text-[#F26336]" : "text-[#647084]"
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>Scanner</span>
        </Link>
        <Link
          to={isAuthenticated ? "/orders" : "/login"}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            location.pathname.startsWith("/login") || location.pathname.startsWith("/orders")
              ? "text-[#F26336]"
              : "text-[#647084]"
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>{isAuthenticated ? "Account" : "Sign In"}</span>
        </Link>
      </nav>
    </>
  );
};
