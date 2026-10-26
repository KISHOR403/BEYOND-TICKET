import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      await register({
        ...formData,
        username: formData.email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
      });
      navigate("/");
    } catch (err: any) {
      const errDetail = err.response?.data;
      if (typeof errDetail === "object") {
        const firstKey = Object.keys(errDetail)[0];
        setErrorMessage(`${firstKey}: ${errDetail[firstKey]}`);
      } else {
        setErrorMessage("Registration failed. Please check your information and retry.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F26336] text-white flex items-center justify-center shadow-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-2xl text-[#172033]">
              BEYOND<span className="text-[#F26336]">TICKETS</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-xl text-[#172033]">Create Your Account</h2>
          <p className="text-xs text-[#647084]">
            One account for concerts, sports matches, movies, and intercity travel.
          </p>
        </div>

        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 sm:p-8 space-y-5 shadow-card">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Aarav"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Sharma"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="aarav@example.com"
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl px-3 py-2.5 text-xs text-[#172033] focus:bg-white focus:outline-none focus:border-[#F26336]"
              >
                <option value="customer">Event Attendee / Customer</option>
                <option value="organizer">Event Organizer & Promoter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-display font-bold text-xs sm:text-sm text-white bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] disabled:opacity-40 shadow-sm transition flex items-center justify-center gap-2 pt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-[#647084] text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-[#F26336] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
