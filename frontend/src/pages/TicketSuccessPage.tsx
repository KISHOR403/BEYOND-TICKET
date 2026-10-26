import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Ticket,
  QrCode,
  Download,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { IssuedTicket } from "@/types";

export const TicketSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order_number");

  const [tickets, setTickets] = useState<IssuedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets/");
        const allTickets: IssuedTicket[] = res.data.results || res.data || [];
        if (orderNumber) {
          setTickets(allTickets.filter((t) => t.order_number === orderNumber));
        } else {
          setTickets(allTickets.slice(0, 2));
        }
      } catch (err) {
        console.error("Error loading tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [orderNumber]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Top Success Badge */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-glow">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Booking Confirmed & Guaranteed
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white">
            You're Going Live!
          </h1>
          <p className="text-sm text-slate-300">
            Order Reference: <span className="font-mono font-bold text-white">{orderNumber}</span>
          </p>
        </div>
      </div>

      {/* Digital Tickets Pass (Apple Wallet style) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <span>Digital Passes Issued ({tickets.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Scan at entrance gate</span>
        </div>

        {isLoading ? (
          <div className="h-64 rounded-3xl bg-slate-900 animate-pulse border border-slate-800" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 space-y-6"
              >
                {/* Event Title & Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {t.ticket_type_name}
                    </span>
                    <h3 className="font-display font-bold text-lg text-white mt-1.5 line-clamp-1">
                      {t.event_title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Pass #</span>
                    <span className="font-mono font-bold text-xs text-slate-300">{t.reference}</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Date & Time</span>
                    <span className="font-semibold text-slate-200">
                      {t.event_date ? new Date(t.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Event Date"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Venue</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {t.venue_name || "Main Arena"}
                    </span>
                  </div>
                  {t.seat_info && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Seat Assignment</span>
                      <span className="font-semibold text-amber-400">{t.seat_info}</span>
                    </div>
                  )}
                </div>

                {/* QR Code Container */}
                <div className="pt-2 flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-slate-950 text-center space-y-2 shadow-md">
                  {t.qr_code_url ? (
                    <img src={t.qr_code_url} alt="Ticket QR" className="w-36 h-36 object-contain" />
                  ) : (
                    <div className="w-36 h-36 bg-slate-100 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-800" />
                    </div>
                  )}
                  <span className="font-mono text-[10px] tracking-widest text-slate-600 font-bold">
                    {t.reference}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Genuine
                  </span>
                  <Link
                    to={`/scanner?token=${t.token}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Simulate Gate Scan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/tickets"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span>Go to My Digital Wallet</span>
        </Link>
        <Link
          to="/explore"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center justify-center gap-2"
        >
          <span>Book More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
