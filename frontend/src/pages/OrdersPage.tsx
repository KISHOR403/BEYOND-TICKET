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
      // refresh
      const res = await api.get("/orders/");
      setOrders(res.data.results || res.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not cancel order.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Order History & Receipts
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your past and upcoming bookings with itemized tax invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-white font-bold text-lg">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't booked any tickets yet. Explore our live events to get started.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="font-mono font-bold text-base text-indigo-400">
                    {o.order_number}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      o.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : o.status === "cancelled"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Event & Item Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="sm:col-span-2 space-y-1">
                  <h4 className="font-display font-bold text-base text-white">{o.listing_title}</h4>
                  <p className="text-slate-400">
                    {o.items?.map((it) => `${it.ticket_type_name} × ${it.quantity}`).join(", ") || "General Admission"}
                  </p>
                  <p className="text-slate-500">{o.contact_email}</p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Grand Total Paid</span>
                  <span className="font-display font-black text-xl text-white">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </span>
                  <p className="text-[10px] text-slate-500">Includes transparent booking fee</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/tickets"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Issued Passes</span>
                </Link>

                {o.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(o.id)}
                    className="text-xs font-medium text-slate-400 hover:text-rose-400 transition"
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
