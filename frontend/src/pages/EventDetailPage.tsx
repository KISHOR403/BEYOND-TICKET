import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  Ticket,
  Plus,
  Minus,
  Info,
  ArrowRight,
  CheckCircle2,
  Lock,
  Share2,
  Heart,
} from "lucide-react";
import { api } from "@/lib/api";
import { Listing, Session, TicketType } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, demoLogin } = useAuth();

  const [event, setEvent] = useState<Listing | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        // Initialize ticket quantities
        const initialQty: Record<string, number> = {};
        if (data.ticket_types && data.ticket_types.length > 0) {
          data.ticket_types.forEach((tt) => {
            initialQty[tt.id] = 0;
          });
        }
        setTicketQuantities(initialQty);
      } catch (err) {
        console.error("Error loading event detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

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

  // 5% platform fee + 18% GST on platform fee
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round(platformFee * 0.18 * 100) / 100;
  const grandTotal = subtotal + platformFee + tax;

  const handleHoldAndProceed = async () => {
    setErrorMessage("");
    if (totalTicketCount === 0) {
      setErrorMessage("Please select at least 1 ticket to proceed.");
      return;
    }

    if (!isAuthenticated) {
      // Auto login with demo customer for seamless experience
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
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Event not found</h2>
        <Link to="/explore" className="text-indigo-400 hover:underline">
          Return to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-10">
      {/* Event Header Banner */}
      <div className="relative bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {event.category?.name}
                </span>
                {event.organization?.is_verified && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Organizer
                  </span>
                )}
                {event.is_featured && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Fast Filling
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {event.venue?.name ? `${event.venue.name}, ` : ""}
                    {event.venue?.city || event.venue_city || "Main Venue"}
                  </span>
                </div>
              </div>

              {event.organization && (
                <div className="text-xs text-slate-400 flex items-center gap-2 pt-2">
                  <span>Presented by</span>
                  <span className="font-semibold text-slate-200">{event.organization.name}</span>
                </div>
              )}
            </div>

            {/* Right Visual Image Card */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-[4/3] flex items-center justify-center">
              {event.cover_image ? (
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-900/60 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center p-6 text-center">
                  <Ticket className="w-12 h-12 text-indigo-400 mb-2 opacity-80" />
                  <span className="font-display font-bold text-white text-lg">{event.title}</span>
                  <span className="text-xs text-slate-400 mt-1">Official Digital Entry Pass</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Booking & Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Sessions, Ticket Selection, About */}
          <div className="lg:col-span-2 space-y-8">
            {/* Session Picker */}
            {event.sessions && event.sessions.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Select Date & Showtime</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.sessions.map((sess) => {
                    const isSelected = selectedSession?.id === sess.id;
                    const dateObj = new Date(sess.start_time);
                    return (
                      <button
                        key={sess.id}
                        onClick={() => setSelectedSession(sess)}
                        className={`text-left p-3.5 rounded-xl border transition ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-white shadow-glow"
                            : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <p className="font-semibold text-sm">{sess.title || "Standard Session"}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
                          {dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ticket Tier Selector */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Select Your Tickets
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose quantity per category. 100% price transparency.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Instant Confirmation
                </span>
              </div>

              {event.ticket_types && event.ticket_types.length > 0 ? (
                <div className="space-y-4">
                  {event.ticket_types.map((ticket) => {
                    const qty = ticketQuantities[ticket.id] || 0;
                    return (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          qty > 0
                            ? "bg-indigo-600/10 border-indigo-500/60"
                            : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base text-white">{ticket.name}</h4>
                            <span className="text-xs text-indigo-400 font-mono">
                              ₹{Number(ticket.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 max-w-md">
                            {ticket.description || "General event admission with guaranteed entry."}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            Max {ticket.max_per_order || 10} tickets per booking
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <button
                            onClick={() => updateQuantity(ticket.id, -1, ticket.max_per_order)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-display font-bold text-white text-base">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(ticket.id, 1, ticket.max_per_order)}
                            disabled={qty >= (ticket.max_per_order || 10)}
                            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-glow transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Standard General Admission passes available at checkout.
                </div>
              )}
            </div>

            {/* About & Policies */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-5">
              <h3 className="font-display font-bold text-lg text-white">About the Event</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description || event.short_description || "Join us for an unforgettable live experience."}
              </p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                <div>
                  <h5 className="font-semibold text-white mb-1">Age Restriction</h5>
                  <p>{event.age_restriction || "Open to all ages. Children below 5 enter free."}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-1">Cancellation Policy</h5>
                  <p>{event.cancellation_policy || "Cancellations allowed up to 24 hours prior to showtime."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Order Summary */}
          <div className="sticky top-24 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-display font-bold text-base text-white">Booking Summary</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                  {totalTicketCount} {totalTicketCount === 1 ? "Ticket" : "Tickets"}
                </span>
              </div>

              {/* Selected Tickets Roster */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No tickets selected yet. Add tickets to proceed.
                  </p>
                ) : (
                  selectedTickets.map((tt) => {
                    const qty = ticketQuantities[tt.id] || 0;
                    return (
                      <div key={tt.id} className="flex justify-between text-xs text-slate-300">
                        <span>
                          {tt.name} × {qty}
                        </span>
                        <span className="font-mono text-white">
                          ₹{(Number(tt.price) * qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Transparent Price Breakdown */}
              {totalTicketCount > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Ticket Subtotal</span>
                    <span className="font-mono text-slate-200">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1" title="Transparent 5% booking fee">
                      <span>Platform Fee (5%)</span>
                      <Info className="w-3 h-3 text-slate-500" />
                    </span>
                    <span className="font-mono text-slate-200">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% on fee)</span>
                    <span className="font-mono text-slate-200">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-display font-bold text-base text-white">Total Amount</span>
                    <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-300">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleHoldAndProceed}
                disabled={isSubmitting || totalTicketCount === 0}
                className="w-full py-4 rounded-xl font-display font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
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

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Locks seats for 10 minutes at current price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
