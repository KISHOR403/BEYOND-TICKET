import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  User as UserIcon,
  Mail,
  Phone,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Reservation } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const CheckoutPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes default
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Contact form
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [attendees, setAttendees] = useState<{ first_name: string; last_name: string }[]>([
    { first_name: user?.first_name || "", last_name: user?.last_name || "" },
  ]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/${reservationId}/`);
        const data: Reservation = res.data;
        setReservation(data);

        // Calculate remaining seconds
        const expiresAt = new Date(data.expires_at).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeftSeconds(diff);

        // Prepare attendee fields based on ticket quantity
        const totalTickets = data.items.reduce((acc, item) => acc + item.quantity, 0);
        const attendeeList = [];
        for (let i = 0; i < totalTickets; i++) {
          attendeeList.push({
            first_name: i === 0 ? user?.first_name || "" : "",
            last_name: i === 0 ? user?.last_name || "" : "",
          });
        }
        setAttendees(attendeeList);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.detail || "Could not load reservation. It may have expired."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservation();
  }, [reservationId, user]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeftSeconds]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePayment = async () => {
    setErrorMessage("");
    if (timeLeftSeconds <= 0) {
      setErrorMessage("Your reservation hold has expired. Please select tickets again.");
      return;
    }

    if (!contactEmail.trim()) {
      setErrorMessage("Please enter a valid contact email for ticket delivery.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order from reservation
      const orderRes = await api.post("/orders/", {
        reservation_id: reservationId,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        attendees: attendees.map((att) => ({
          first_name: att.first_name || "Guest",
          last_name: att.last_name || "",
        })),
      });
      const order = orderRes.data;

      // 2. Create payment intent
      const intentRes = await api.post("/payments/create-intent/", {
        order_id: order.id,
        provider: "sandbox",
      });
      const intent = intentRes.data;

      // 3. Verify & Capture payment instantly
      const verifyRes = await api.post("/payments/verify/", {
        order_id: order.id,
        payment_id: intent.payment_id,
        provider_order_id: intent.provider_order_id,
        is_sandbox: true,
      });

      // 4. Navigate to success page
      navigate(`/tickets/success?order_number=${order.order_number}`);
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(
        err.response?.data?.detail || "Payment processing failed. Please retry."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Reservation expired or not found</h2>
        <p className="text-xs text-slate-400">
          Ticket holds are valid for 10 minutes. Please select your seats or passes again.
        </p>
        <Link
          to="/explore"
          className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Timer Bar */}
      <div
        className={`rounded-2xl p-4 border flex items-center justify-between transition-all ${
          timeLeftSeconds < 120
            ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
            : "bg-indigo-950/40 border-indigo-500/30 text-indigo-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Clock className={`w-5 h-5 ${timeLeftSeconds < 120 ? "animate-bounce text-rose-400" : ""}`} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block">
              Cart Hold Expiring In
            </span>
            <span className="font-display font-black text-2xl text-white">
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 hidden sm:block">
          <span>Tickets are locked exclusively for you. Complete payment before the timer reaches 0:00.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Attendee Form & Contact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Contact Information (For Tickets & Invoices)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Attendee Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>Attendee Details</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide names for entry badge and security check at the gate.
            </p>

            <div className="space-y-3">
              {attendees.map((att, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    Ticket #{index + 1} Attendee
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={att.first_name}
                      onChange={(e) => {
                        const copy = [...attendees];
                        copy[index].first_name = e.target.value;
                        setAttendees(copy);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={att.last_name}
                      onChange={(e) => {
                        const copy = [...attendees];
                        copy[index].last_name = e.target.value;
                        setAttendees(copy);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Select Payment Method</span>
            </h3>

            <div className="p-4 rounded-xl border border-indigo-500/50 bg-indigo-600/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span>Instant Verified Sandbox / Razorpay</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Test full atomic payment verification & ticket issuance without test card entry.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Pay Button */}
        <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h4 className="font-display font-bold text-base text-white">{reservation.listing_title}</h4>
            <span className="text-xs text-slate-400">Hold Reference #{reservation.id.slice(0, 8)}</span>
          </div>

          {/* Itemized summary */}
          <div className="space-y-3 text-xs">
            {reservation.items.map((item) => (
              <div key={item.id} className="flex justify-between text-slate-300">
                <span>
                  {item.ticket_type_name} × {item.quantity}
                </span>
                <span className="font-mono text-white">₹{Number(item.total_price).toLocaleString("en-IN")}</span>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">
                  ₹{Number(reservation.subtotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transparent Platform Fee</span>
                <span className="font-mono text-slate-200">
                  ₹{Number(reservation.platform_fee).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% on fee)</span>
                <span className="font-mono text-slate-200">₹{Number(reservation.tax).toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-display font-bold text-base text-white">Grand Total</span>
                <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-300">
                  ₹{Number(reservation.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || timeLeftSeconds <= 0}
            className="w-full py-4 rounded-xl font-display font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm & Pay ₹{Number(reservation.total).toLocaleString("en-IN")}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Payment with Instant QR Issuance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
