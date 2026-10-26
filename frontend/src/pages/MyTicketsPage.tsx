import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, QrCode, Calendar, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { IssuedTicket } from "@/types";

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<IssuedTicket[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "used">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets/");
        setTickets(res.data.results || res.data || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
            My Digital Passes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your verified QR tickets for entrance check-in.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "all" ? "bg-indigo-600 text-white shadow-glow" : "text-slate-400 hover:text-white"
            }`}
          >
            All Passes ({tickets.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "active" ? "bg-indigo-600 text-white shadow-glow" : "text-slate-400 hover:text-white"
            }`}
          >
            Active ({tickets.filter((t) => t.status === "active").length})
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "used" ? "bg-indigo-600 text-white shadow-glow" : "text-slate-400 hover:text-white"
            }`}
          >
            Used ({tickets.filter((t) => t.status === "used").length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-white font-bold text-lg">No digital passes found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any tickets under this filter. Browse our events to book your next experience.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t.ticket_type_name}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      t.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mt-1 line-clamp-1">
                  {t.event_title}
                </h3>
              </div>

              {/* Event Info */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {t.event_date ? new Date(t.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Event Date"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{t.venue_name || "Main Venue"}</span>
                </div>
                {t.seat_info && (
                  <div className="pt-1 text-amber-400 font-semibold">
                    {t.seat_info}
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center text-center">
                {t.qr_code_url ? (
                  <img src={t.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain" />
                ) : (
                  <QrCode className="w-32 h-32 text-slate-900" />
                )}
                <span className="font-mono text-[10px] tracking-widest text-slate-700 font-bold mt-1">
                  {t.reference}
                </span>
              </div>

              {/* Footer Scanner simulator link */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Order: {t.order_number}</span>
                <Link
                  to={`/scanner?token=${t.token}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Simulate Gate Scan →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
