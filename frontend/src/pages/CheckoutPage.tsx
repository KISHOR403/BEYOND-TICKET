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
      setErrorMessage("Your 10-minute reservation hold has expired. Please select tickets again.");
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
      await api.post("/payments/verify/", {
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
        <div className="w-10 h-10 border-4 border-[#F26336] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#D99116] mx-auto" />
        <h2 className="text-xl font-bold text-[#172033]">Reservation expired or not found</h2>
        <p className="text-xs text-[#647084]">
          Ticket holds are held exclusively for 10 minutes. Please select your seats or passes again.
        </p>
        <Link
          to="/explore"
          className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-[#F26336] text-white hover:bg-[#DF4E27] transition shadow-sm"
        >
          Return to Events
        </Link>
      </div>
    );
  }

  const isUrgent = timeLeftSeconds < 120;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 10-Minute Cart Hold Countdown Bar */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isUrgent
            ? "bg-red-50 border-red-200 text-[#DC2626]"
            : "bg-[#FFF0E9] border-[#FFC2A8] text-[#172033]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isUrgent ? "text-[#DC2626] animate-pulse" : "text-[#F26336]"}`} />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-[#647084]">
              Exclusive Cart Hold Expiring In
            </span>
            <span className="font-display font-black text-2xl text-[#172033]">
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>
        </div>
        <div className="text-xs text-[#647084] max-w-sm sm:text-right">
          <span>Your seats are locked exclusively for you. Complete payment before the timer reaches 0:00.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact & Attendee Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-bold text-base text-[#172033] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F26336]" />
              <span>Contact Information (For Passes & Tax Invoices)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Attendee Details Card */}
          <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-bold text-base text-[#172033] flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#4263EB]" />
              <span>Attendee Details</span>
            </h3>
            <p className="text-xs text-[#647084]">
              Names will be printed on the digital passes for entry badge identification at venue gates.
            </p>

            <div className="space-y-3">
              {attendees.map((att, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E6E9EF] space-y-2"
                >
                  <span className="text-[11px] font-bold text-[#F26336] uppercase tracking-wider">
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
                      className="bg-white border border-[#E6E9EF] rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#F26336]"
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
                      className="bg-white border border-[#E6E9EF] rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#F26336]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-bold text-base text-[#172033] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#168566]" />
              <span>Select Payment Method</span>
            </h3>

            <div className="p-4 rounded-xl border border-[#BDE3D7] bg-[#E8F5F1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#168566] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172033] flex items-center gap-2">
                    <span>Instant Verified Sandbox / Razorpay</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#168566] border border-[#BDE3D7]">
                      Atomic Verification
                    </span>
                  </h4>
                  <p className="text-xs text-[#647084]">
                    Simulate full two-phase checkout capture with immediate digital ticket QR issuance.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#168566] ring-4 ring-[#168566]/20 shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay */}
        <div className="lg:col-span-5 sticky top-24 bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-5">
          <div className="pb-3 border-b border-[#E6E9EF]">
            <h4 className="font-display font-bold text-base text-[#172033]">
              {reservation.listing_title}
            </h4>
            <span className="text-xs text-[#647084]">Hold Ref #{reservation.id.slice(0, 8)}</span>
          </div>

          {/* Itemized summary */}
          <div className="space-y-3 text-xs">
            {reservation.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[#172033]">
                <span className="font-medium">
                  {item.ticket_type_name} × {item.quantity}
                </span>
                <span className="font-semibold">
                  ₹{Number(item.total_price).toLocaleString("en-IN")}
                </span>
              </div>
            ))}

            <div className="pt-3 border-t border-[#E6E9EF] space-y-2">
              <div className="flex justify-between text-[#647084]">
                <span>Ticket Subtotal</span>
                <span className="font-semibold text-[#172033]">
                  ₹{Number(reservation.subtotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[#647084]">
                <span>Transparent Platform Fee</span>
                <span className="font-semibold text-[#172033]">
                  ₹{Number(reservation.platform_fee).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#647084]">
                <span>GST (18% on fee)</span>
                <span className="font-semibold text-[#172033]">
                  ₹{Number(reservation.tax).toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E6E9EF] flex justify-between items-baseline">
                <span className="font-display font-bold text-sm text-[#172033]">Grand Total</span>
                <span className="font-display font-black text-2xl text-[#172033]">
                  ₹{Number(reservation.total).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs">
              {errorMessage}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || timeLeftSeconds <= 0}
            className="w-full py-3.5 rounded-xl font-display font-bold text-sm text-white bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2"
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

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#647084] text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#168566]" />
            <span>256-Bit Encrypted Payment with Instant QR Issuance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
