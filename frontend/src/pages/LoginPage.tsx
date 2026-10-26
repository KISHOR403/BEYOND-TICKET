import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid email or password. Try our one-click demo logins below."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role: "customer" | "organizer" | "admin") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await demoLogin(role);
      navigate(role === "organizer" ? "/organizer" : "/");
    } catch (err: any) {
      setErrorMessage("Could not sign in with demo credentials. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center text-white shadow-glow">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-2xl text-white">
              BEYOND <span className="text-indigo-400">TICKETS</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-xl text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your digital passes and manage bookings.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Quick Demo Logins Bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Test: One-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo("customer")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemo("organizer")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleDemo("admin")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 shrink-0">
              Or sign in with email
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 shadow-glow transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
