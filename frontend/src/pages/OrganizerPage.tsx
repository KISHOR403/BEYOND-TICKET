import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  IndianRupee,
  Ticket,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const OrganizerPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "attendees">("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerData = async () => {
      setIsLoading(true);
      try {
        if (!isAuthenticated) {
          await demoLogin("organizer");
        }
        const [metricRes, attendeeRes] = await Promise.all([
          api.get("/organizer/dashboard/metrics/"),
          api.get("/organizer/dashboard/attendees/"),
        ]);
        setMetrics(metricRes.data);
        setAttendees(attendeeRes.data);
      } catch (err) {
        console.error("Error loading organizer dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganizerData();
  }, [isAuthenticated]);

  const filteredAttendees = attendees.filter((a) => {
    if (!attendeeSearch.trim()) return true;
    const q = attendeeSearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.order_number.toLowerCase().includes(q) ||
      a.event_title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0E9] text-[#F26336]">
              Organizer Operations Portal
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033] mt-1">
            Dashboard & Real-Time Analytics
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/scanner"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E6E9EF] text-[#172033] hover:bg-[#F7F8FA] transition shadow-sm flex items-center gap-1.5"
          >
            <span>Launch Gate Scanner</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#647084]" />
          </Link>
          <Link
            to="/explore"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F26336] hover:bg-[#DF4E27] text-white shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-5 space-y-3 shadow-card">
          <div className="flex justify-between items-center text-[#647084]">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E9] text-[#F26336] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#172033]">
            ₹{Number(metrics?.total_revenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#168566] font-medium">100% verified payouts</p>
        </div>

        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-5 space-y-3 shadow-card">
          <div className="flex justify-between items-center text-[#647084]">
            <span className="text-xs font-bold uppercase tracking-wider">Tickets Issued</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4263EB] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#172033]">
            {metrics?.total_tickets_issued || 0}
          </div>
          <p className="text-[11px] text-[#647084] font-medium">Across active listings</p>
        </div>

        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-5 space-y-3 shadow-card">
          <div className="flex justify-between items-center text-[#647084]">
            <span className="text-xs font-bold uppercase tracking-wider">Gate Check-In Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F1] text-[#168566] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#172033]">
            {metrics?.check_in_rate || 0}%
          </div>
          <p className="text-[11px] text-[#647084] font-medium">
            {metrics?.total_tickets_used || 0} of {metrics?.total_tickets_issued || 0} scanned
          </p>
        </div>

        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-5 space-y-3 shadow-card">
          <div className="flex justify-between items-center text-[#647084]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Published Events</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF7EB] text-[#D99116] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-[#172033]">
            {metrics?.active_listings_count || metrics?.listings?.length || 0}
          </div>
          <p className="text-[11px] text-[#647084] font-medium">Live on marketplace</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E9EF] pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "overview"
              ? "bg-[#172033] text-white shadow-sm"
              : "text-[#647084] hover:text-[#172033]"
          }`}
        >
          Event Breakdown
        </button>
        <button
          onClick={() => setActiveTab("attendees")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "attendees"
              ? "bg-[#172033] text-white shadow-sm"
              : "text-[#647084] hover:text-[#172033]"
          }`}
        >
          Attendee Roster ({attendees.length})
        </button>
      </div>

      {/* Tab 1: Event Breakdown Table */}
      {activeTab === "overview" && (
        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 space-y-6 shadow-card">
          <h3 className="font-display font-bold text-base text-[#172033]">Listing Performance</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="bg-[#F7F8FA] uppercase text-[10px] text-[#647084] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Event Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tickets Sold</th>
                  <th className="px-4 py-3">Gross Revenue</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E9EF]">
                {(metrics?.listings || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-[#F7F8FA]/60 transition">
                    <td className="px-4 py-3.5 font-semibold text-[#172033]">{l.title}</td>
                    <td className="px-4 py-3.5 text-[#647084]">{l.category}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5F1] text-[#168566] capitalize">
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">{l.tickets_sold}</td>
                    <td className="px-4 py-3.5 font-mono text-[#172033] font-bold">
                      ₹{Number(l.revenue).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/events/${l.id}`}
                        className="text-xs font-semibold text-[#F26336] hover:text-[#DF4E27]"
                      >
                        View Public Page →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendee Roster Table */}
      {activeTab === "attendees" && (
        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-display font-bold text-base text-[#172033]">
              Attendee Check-In Roster
            </h3>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search attendee, order #, or event..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
              />
              <Search className="w-3.5 h-3.5 text-[#8E98A8] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="bg-[#F7F8FA] uppercase text-[10px] text-[#647084] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Attendee Name</th>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Event Title</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E9EF]">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#8E98A8]">
                      No attendees found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((a: any) => (
                    <tr key={a.id} className="hover:bg-[#F7F8FA]/60 transition">
                      <td className="px-4 py-3.5 font-semibold text-[#172033]">
                        {a.name || "Guest Attendee"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#F26336]">{a.order_number}</td>
                      <td className="px-4 py-3.5 truncate max-w-xs">{a.event_title}</td>
                      <td className="px-4 py-3.5 text-[#647084]">{a.email}</td>
                      <td className="px-4 py-3.5 text-[#8E98A8]">
                        {new Date(a.order_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
