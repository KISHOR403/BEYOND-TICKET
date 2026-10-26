import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Ticket, IndianRupee, ArrowRight, ShieldCheck, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Order } from "@/types";

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/");
        setOrders(res.data.results || res.data || []);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.post(`/orders/${orderId}/cancel/`, {
        reason: "Customer requested cancellation from web portal",
      });
      const res = await api.get("/orders/");
      setOrders(res.data.results || res.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not cancel order.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033]">
          Order History & Receipts
        </h1>
        <p className="text-xs sm:text-sm text-[#647084] mt-1">
          Review your past and upcoming bookings with itemized transparent tax invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-[#F7F8FA] animate-pulse border border-[#E6E9EF]"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-[#E6E9EF] bg-[#F7F8FA] p-12 text-center space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-[#8E98A8] mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#172033]">No orders found</h3>
            <p className="text-xs text-[#647084]">
              You haven't booked any tickets yet. Explore our live events to get started.
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
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-[#E6E9EF] rounded-2xl p-5 sm:p-6 space-y-4 hover:border-[#D4D9E2] transition shadow-card"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E9EF]">
                <div>
                  <span className="text-[10px] text-[#8E98A8] uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-[#172033]">
                    {o.order_number}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      o.status === "confirmed"
                        ? "bg-[#E8F5F1] text-[#168566]"
                        : o.status === "cancelled"
                        ? "bg-red-50 text-[#DC2626]"
                        : "bg-[#FEF7EB] text-[#D99116]"
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="text-xs text-[#647084]">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Event & Item Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <h4 className="font-display font-bold text-base text-[#172033]">
                    {o.listing_title}
                  </h4>
                  <p className="text-[#647084]">
                    {o.items?.map((it) => `${it.ticket_type_name} × ${it.quantity}`).join(", ") ||
                      "General Admission Pass"}
                  </p>
                  <p className="text-[#8E98A8]">{o.contact_email}</p>
                </div>

                <div className="sm:text-right space-y-0.5">
                  <span className="text-[10px] text-[#8E98A8] uppercase block">Total Paid</span>
                  <span className="font-display font-black text-xl text-[#172033]">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </span>
                  <p className="text-[10px] text-[#8E98A8]">Includes itemized fees</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#E6E9EF] flex items-center justify-between">
                <Link
                  to="/tickets"
                  className="text-xs font-semibold text-[#F26336] hover:text-[#DF4E27] flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Issued Passes</span>
                </Link>

                {o.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(o.id)}
                    className="text-xs font-medium text-[#647084] hover:text-[#DC2626] transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
