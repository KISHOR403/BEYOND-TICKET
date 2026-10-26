import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Info,
  ArrowRight,
  CheckCircle2,
  Lock,
  Share2,
  Heart,
  ChevronRight,
  AlertCircle,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing, Session, TicketType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getEventCoverImage, handleImageError } from "@/lib/images";

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();

  const [event, setEvent] = useState<Listing | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/listings/${slug}/`);
        const data: Listing = res.data;
        setEvent(data);

        if (data.sessions && data.sessions.length > 0) {
          setSelectedSession(data.sessions[0]);
        }

        // Initialize quantities
        const initialQty: Record<string, number> = {};
        if (data.ticket_types && data.ticket_types.length > 0) {
          data.ticket_types.forEach((tt) => {
            initialQty[tt.id] = 0;
          });
        }
        setTicketQuantities(initialQty);

        // Store into recently viewed in localStorage
        try {
          const stored = JSON.parse(localStorage.getItem("beyond_recent_events") || "[]");
          const filtered = stored.filter((e: Listing) => e.id !== data.id && e.slug !== data.slug);
          const updated = [data, ...filtered].slice(0, 6);
          localStorage.setItem("beyond_recent_events", JSON.stringify(updated));
        } catch {
          // ignore
        }
      } catch (err) {
        console.error("Error loading event detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();

    try {
      const favorites = JSON.parse(localStorage.getItem("beyond_favorites") || "[]");
      setIsSaved(favorites.includes(slug));
    } catch {
      // ignore
    }
  }, [slug]);

  const toggleSave = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem("beyond_favorites") || "[]");
      let updated: string[];
      if (favorites.includes(slug)) {
        updated = favorites.filter((s: string) => s !== slug);
        setIsSaved(false);
      } else {
        updated = [...favorites, slug || ""];
        setIsSaved(true);
      }
      localStorage.setItem("beyond_favorites", JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const updateQuantity = (ticketId: string, delta: number, maxPerOrder: number) => {
    setTicketQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(maxPerOrder || 10, current + delta));
      return { ...prev, [ticketId]: next };
    });
  };

  // Calculations
  const selectedTickets = (event?.ticket_types || []).filter(
    (tt) => (ticketQuantities[tt.id] || 0) > 0
  );

  const totalTicketCount = selectedTickets.reduce(
    (acc, tt) => acc + (ticketQuantities[tt.id] || 0),
    0
  );

  const subtotal = selectedTickets.reduce((acc, tt) => {
    const qty = ticketQuantities[tt.id] || 0;
    return acc + Number(tt.price) * qty;
  }, 0);

  // Upfront transparent fee calculation (5% fee + 18% GST)
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round(platformFee * 0.18 * 100) / 100;
  const grandTotal = subtotal + platformFee + tax;

  const handleHoldAndProceed = async () => {
    setErrorMessage("");
    if (totalTicketCount === 0) {
      setErrorMessage("Please select at least 1 ticket to proceed to checkout.");
      return;
    }

    if (!isAuthenticated) {
      try {
        await demoLogin("customer");
      } catch (e) {
        navigate("/login");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        listing_id: event?.id,
        session_id: selectedSession?.id || null,
        items: selectedTickets.map((tt) => ({
          ticket_type_id: tt.id,
          quantity: ticketQuantities[tt.id],
        })),
      };

      const res = await api.post("/reservations/", payload);
      const reservationId = res.data.id;
      navigate(`/checkout/${reservationId}`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || "Could not hold tickets. Please check availability and retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-[#F26336] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#647084] mx-auto" />
        <h2 className="text-xl font-bold text-[#172033]">Event not found</h2>
        <p className="text-xs text-[#647084]">The requested listing may have ended or been moved.</p>
        <Link to="/explore" className="inline-block px-4 py-2 text-xs font-semibold bg-[#F26336] text-white rounded-xl">
          Return to Explore
        </Link>
      </div>
    );
  }

  const imageSrc = getEventCoverImage(event);

  return (
    <div className="pb-24 space-y-8">
      {/* Top Breadcrumb Bar */}
      <div className="bg-[#F7F8FA] border-b border-[#E6E9EF] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 text-xs text-[#647084]">
          <Link to="/" className="hover:text-[#172033]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/explore" className="hover:text-[#172033]">Events</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/category/${event.category?.slug}`} className="hover:text-[#172033] capitalize">
            {event.category?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172033] font-medium truncate max-w-xs">{event.title}</span>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E9] text-[#F26336]">
                {event.category?.name}
              </span>
              {event.is_featured && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF7EB] text-[#D99116] border border-[#FCEFD8] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F26336]" />
                  <span>Selling Fast</span>
                </span>
              )}
              {event.organization?.is_verified && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5F1] text-[#168566] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Organizer</span>
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#172033] tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#647084] pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F26336] shrink-0" />
                <span className="font-medium text-[#172033]">
                  {new Date(event.start_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F26336] shrink-0" />
                <span className="truncate">
                  {event.venue?.name ? `${event.venue.name}, ` : ""}
                  {event.venue?.city || event.venue_city || "Main Venue"}
                </span>
              </div>
            </div>

            {event.organization && (
              <div className="text-xs text-[#647084] flex items-center gap-2 pt-1">
                <span>Presented by</span>
                <span className="font-semibold text-[#172033]">{event.organization.name}</span>
              </div>
            )}
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#F7F8FA] border border-[#E6E9EF] shadow-card aspect-[16/10]">
              <img
                src={imageSrc}
                alt={event.title}
                onError={(e) => handleImageError(e, event.category?.slug)}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleSave}
                aria-label="Save event"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#172033] hover:text-[#F26336] shadow-sm flex items-center justify-center transition"
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-[#F26336] text-[#F26336]" : "text-[#647084]"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Booking Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Showtime Picker, Tickets, Description, Policies */}
          <div className="lg:col-span-8 space-y-8">
            {/* Session / Showtime Selector */}
            {event.sessions && event.sessions.length > 0 && (
              <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[#172033] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F26336]" />
                    <span>Select Date & Showtime</span>
                  </h3>
                  <span className="text-xs text-[#647084]">All times in IST</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.sessions.map((sess) => {
                    const isSelected = selectedSession?.id === sess.id;
                    const dateObj = new Date(sess.start_time);
                    return (
                      <button
                        key={sess.id}
                        onClick={() => setSelectedSession(sess)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#FFF0E9] border-[#F26336] text-[#172033] shadow-sm"
                            : "bg-[#F7F8FA] border-[#E6E9EF] text-[#647084] hover:border-[#D4D9E2] hover:bg-white"
                        }`}
                      >
                        <p className="font-semibold text-xs sm:text-sm text-[#172033]">
                          {sess.title || "Standard Session"}
                        </p>
                        <p className="text-xs text-[#647084] mt-0.5">
                          {dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" })} at{" "}
                          {dateObj.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ticket Tier Selector */}
            <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#172033]">
                    Select Your Tickets
                  </h3>
                  <p className="text-xs text-[#647084] mt-0.5">
                    Choose quantity per category. Upfront transparent pricing.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E8F5F1] text-[#168566]">
                  Instant Confirmation
                </span>
              </div>

              {event.ticket_types && event.ticket_types.length > 0 ? (
                <div className="space-y-3">
                  {event.ticket_types.map((ticket) => {
                    const qty = ticketQuantities[ticket.id] || 0;
                    return (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          qty > 0
                            ? "bg-[#FFF0E9]/40 border-[#F26336]"
                            : "bg-white border-[#E6E9EF] hover:border-[#D4D9E2]"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-[#172033]">
                              {ticket.name}
                            </h4>
                            <span className="text-sm font-extrabold text-[#F26336]">
                              ₹{Number(ticket.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-xs text-[#647084] max-w-md">
                            {ticket.description || "General admission ticket with guaranteed entry pass."}
                          </p>
                          <span className="text-[11px] text-[#8E98A8]">
                            Max {ticket.max_per_order || 10} tickets per booking
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <button
                            onClick={() => updateQuantity(ticket.id, -1, ticket.max_per_order)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E6E9EF] hover:bg-[#E6E9EF] text-[#172033] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                            aria-label={`Decrease ${ticket.name} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-[#172033]">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(ticket.id, 1, ticket.max_per_order)}
                            disabled={qty >= (ticket.max_per_order || 10)}
                            className="w-8 h-8 rounded-lg bg-[#F26336] hover:bg-[#DF4E27] text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shadow-sm"
                            aria-label={`Increase ${ticket.name} quantity`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E6E9EF] text-xs text-[#647084]">
                  Standard General Admission passes available directly at checkout.
                </div>
              )}
            </div>

            {/* About the Event & Guidelines */}
            <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-display font-bold text-base text-[#172033]">About the Event</h3>
              <p className="text-xs sm:text-sm text-[#647084] leading-relaxed whitespace-pre-line">
                {event.description || event.short_description || "Join us for an unforgettable live experience."}
              </p>

              <div className="pt-4 border-t border-[#E6E9EF] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#647084]">
                <div>
                  <h5 className="font-bold text-[#172033] mb-1">Age Restriction</h5>
                  <p>{event.age_restriction || "Open to all age groups. Children below 5 enter free."}</p>
                </div>
                <div>
                  <h5 className="font-bold text-[#172033] mb-1">Cancellation Policy</h5>
                  <p>{event.cancellation_policy || "Full cancellation available up to 24 hours before showtime."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Order Summary */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E9EF]">
                <span className="font-display font-bold text-sm text-[#172033]">Booking Summary</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FFF0E9] text-[#F26336]">
                  {totalTicketCount} {totalTicketCount === 1 ? "Ticket" : "Tickets"}
                </span>
              </div>

              {/* Selected Tickets */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTickets.length === 0 ? (
                  <p className="text-xs text-[#8E98A8] text-center py-4">
                    No tickets selected yet. Pick passes above to proceed.
                  </p>
                ) : (
                  selectedTickets.map((tt) => {
                    const qty = ticketQuantities[tt.id] || 0;
                    return (
                      <div key={tt.id} className="flex justify-between text-xs text-[#172033]">
                        <span className="font-medium">
                          {tt.name} × {qty}
                        </span>
                        <span className="font-semibold">
                          ₹{(Number(tt.price) * qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Itemized Transparent Breakdown */}
              {totalTicketCount > 0 && (
                <div className="pt-3 border-t border-[#E6E9EF] space-y-2 text-xs">
                  <div className="flex justify-between text-[#647084]">
                    <span>Ticket Subtotal</span>
                    <span className="font-semibold text-[#172033]">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#647084]">
                    <span className="flex items-center gap-1" title="Transparent 5% platform fee">
                      <span>Platform Fee (5%)</span>
                      <Info className="w-3 h-3 text-[#8E98A8]" />
                    </span>
                    <span className="font-semibold text-[#172033]">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#647084]">
                    <span>GST (18% on fee)</span>
                    <span className="font-semibold text-[#172033]">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-[#E6E9EF] flex justify-between items-baseline">
                    <span className="font-display font-bold text-sm text-[#172033]">Grand Total</span>
                    <span className="font-display font-black text-2xl text-[#172033]">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleHoldAndProceed}
                disabled={isSubmitting || totalTicketCount === 0}
                className="w-full py-3.5 rounded-xl font-display font-bold text-sm text-white bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Hold Tickets & Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#647084] text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#168566]" />
                <span>Locks seats for 10 minutes at current price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
