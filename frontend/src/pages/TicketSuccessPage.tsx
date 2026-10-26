import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Top Success Celebration Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E8F5F1] text-[#168566] flex items-center justify-center mx-auto border border-[#BDE3D7] shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#168566]">
            Booking Confirmed & Guaranteed
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033]">
            You're Going Live!
          </h1>
          <p className="text-xs sm:text-sm text-[#647084]">
            Order Reference: <span className="font-mono font-bold text-[#172033]">{orderNumber}</span>
          </p>
        </div>
      </div>

      {/* Issued Digital Passes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E6E9EF]">
          <h2 className="font-display font-bold text-lg text-[#172033] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#F26336]" />
            <span>Digital Passes Issued ({tickets.length})</span>
          </h2>
          <span className="text-xs text-[#647084]">Ready for venue gate scan</span>
        </div>

        {isLoading ? (
          <div className="h-64 rounded-2xl bg-[#F7F8FA] animate-pulse border border-[#E6E9EF]" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="relative rounded-2xl bg-white border border-[#E6E9EF] shadow-card p-6 space-y-5"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF0E9] text-[#F26336]">
                      {t.ticket_type_name}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#172033] mt-1.5 line-clamp-1">
                      {t.event_title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8E98A8] block">Pass #</span>
                    <span className="font-mono font-bold text-xs text-[#172033]">{t.reference}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E9EF]">
                  <div>
                    <span className="text-[10px] text-[#8E98A8] block uppercase font-medium">Date</span>
                    <span className="font-semibold text-[#172033]">
                      {t.event_date
                        ? new Date(t.event_date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Event Date"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E98A8] block uppercase font-medium">Venue</span>
                    <span className="font-semibold text-[#172033] truncate block">
                      {t.venue_name || "Main Venue"}
                    </span>
                  </div>
                  {t.seat_info && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-[#8E98A8] block uppercase font-medium">Seat</span>
                      <span className="font-semibold text-[#F26336]">{t.seat_info}</span>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="pt-2 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#E6E9EF] text-center space-y-1.5">
                  {t.qr_code_url ? (
                    <img src={t.qr_code_url} alt="Ticket QR" className="w-36 h-36 object-contain" />
                  ) : (
                    <div className="w-36 h-36 bg-[#F7F8FA] flex items-center justify-center rounded-lg">
                      <QrCode className="w-20 h-20 text-[#172033]" />
                    </div>
                  )}
                  <span className="font-mono text-[10px] tracking-widest text-[#647084] font-bold">
                    {t.reference}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E6E9EF]">
                  <span className="flex items-center gap-1.5 text-[#168566] font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Genuine
                  </span>
                  <Link
                    to={`/scanner?token=${t.token}`}
                    className="text-xs text-[#F26336] hover:text-[#DF4E27] font-semibold"
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
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-bold text-sm bg-[#F26336] hover:bg-[#DF4E27] text-white shadow-sm transition flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span>Go to My Digital Passes</span>
        </Link>
        <Link
          to="/explore"
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-semibold text-sm bg-white hover:bg-[#F7F8FA] text-[#172033] border border-[#E6E9EF] transition flex items-center justify-center gap-2"
        >
          <span>Book More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
