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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center text-white shadow-glow">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-2xl text-white">
              BEYOND <span className="text-indigo-400">TICKETS</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-xl text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">
            One account for concerts, sports matches, movies, and intercity travel.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Aarav"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="aarav@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="customer">Event Attendee / Customer</option>
                <option value="organizer">Event Organizer & Promoter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 shadow-glow transition flex items-center justify-center gap-2 pt-3"
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

          <p className="text-xs text-slate-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
