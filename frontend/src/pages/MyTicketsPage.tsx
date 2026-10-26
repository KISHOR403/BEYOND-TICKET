import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, QrCode, Calendar, MapPin, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033]">
            My Digital Passes
          </h1>
          <p className="text-xs sm:text-sm text-[#647084] mt-1">
            Access your verified QR tickets for entrance check-in at venue gates.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F7F8FA] border border-[#E6E9EF] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "all"
                ? "bg-white text-[#172033] shadow-sm border border-[#E6E9EF]"
                : "text-[#647084] hover:text-[#172033]"
            }`}
          >
            All Passes ({tickets.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "active"
                ? "bg-white text-[#172033] shadow-sm border border-[#E6E9EF]"
                : "text-[#647084] hover:text-[#172033]"
            }`}
          >
            Active ({tickets.filter((t) => t.status === "active").length})
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "used"
                ? "bg-white text-[#172033] shadow-sm border border-[#E6E9EF]"
                : "text-[#647084] hover:text-[#172033]"
            }`}
          >
            Used ({tickets.filter((t) => t.status === "used").length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-[#F7F8FA] animate-pulse border border-[#E6E9EF]"
            />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-3xl border border-[#E6E9EF] bg-[#F7F8FA] p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E9EF] text-[#647084] flex items-center justify-center mx-auto shadow-sm">
            <Ticket className="w-6 h-6 text-[#F26336]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#172033]">
              No digital passes found
            </h3>
            <p className="text-xs text-[#647084]">
              You don't have any tickets under this filter. Browse our live events to book your next experience.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-block px-4 py-2 rounded-xl bg-[#F26336] hover:bg-[#DF4E27] text-white text-xs font-semibold shadow-sm transition"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-white border border-[#E6E9EF] p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-card hover:border-[#D4D9E2] transition relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF0E9] text-[#F26336]">
                    {t.ticket_type_name}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      t.status === "active"
                        ? "bg-[#E8F5F1] text-[#168566]"
                        : "bg-[#F7F8FA] text-[#8E98A8]"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-[#172033] mt-1 line-clamp-1">
                  {t.event_title}
                </h3>
              </div>

              {/* Event Details */}
              <div className="space-y-1.5 text-xs text-[#647084]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#F26336] shrink-0" />
                  <span className="text-[#172033] font-medium">
                    {t.event_date
                      ? new Date(t.event_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Official Event Date"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8E98A8] shrink-0" />
                  <span className="truncate">{t.venue_name || "Main Venue"}</span>
                </div>
                {t.seat_info && (
                  <div className="pt-1 text-[#F26336] font-semibold">
                    {t.seat_info}
                  </div>
                )}
              </div>

              {/* Perforated Line Effect */}
              <div className="relative border-t border-dashed border-[#E6E9EF] my-1">
                <div className="absolute -left-8 -top-2.5 w-5 h-5 rounded-full bg-[#F7F8FA] border-r border-[#E6E9EF]" />
                <div className="absolute -right-8 -top-2.5 w-5 h-5 rounded-full bg-[#F7F8FA] border-l border-[#E6E9EF]" />
              </div>

              {/* QR Code */}
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E6E9EF] flex flex-col items-center justify-center text-center">
                {t.qr_code_url ? (
                  <img src={t.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain" />
                ) : (
                  <QrCode className="w-32 h-32 text-[#172033]" />
                )}
                <span className="font-mono text-[11px] tracking-widest text-[#172033] font-bold mt-1.5">
                  {t.reference}
                </span>
              </div>

              {/* Card Footer: Scanner Link */}
              <div className="pt-2 border-t border-[#E6E9EF] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#8E98A8]">Order #{t.order_number}</span>
                <Link
                  to={`/scanner?token=${t.token}`}
                  className="font-semibold text-[#F26336] hover:text-[#DF4E27] flex items-center gap-1"
                >
                  <span>Simulate Gate Scan</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
