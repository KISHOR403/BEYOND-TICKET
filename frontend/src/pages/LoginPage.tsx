import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
            <div className="w-9 h-9 rounded-xl bg-[#F26336] text-white flex items-center justify-center shadow-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-2xl text-[#172033]">
              BEYOND<span className="text-[#F26336]">TICKETS</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-xl text-[#172033]">Welcome Back</h2>
          <p className="text-xs text-[#647084]">
            Sign in to access your digital passes and manage bookings.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
          {/* Quick Demo Logins Bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#647084] block text-center">
              Quick Test: One-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo("customer")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-[#FFF0E9] hover:bg-[#FFE3D6] text-[#F26336] border border-[#FFC2A8] transition"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemo("organizer")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-[#FEF7EB] hover:bg-[#FCEFD8] text-[#D99116] border border-[#FCEFD8] transition"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleDemo("admin")}
                disabled={isLoading}
                className="px-2 py-2 rounded-xl text-xs font-semibold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4263EB] border border-[#E0E7FF] transition"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E6E9EF] w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-[#8E98A8] shrink-0">
              Or sign in with email
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors"
                  required
                />
                <Mail className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-display font-bold text-xs sm:text-sm text-white bg-[#F26336] hover:bg-[#DF4E27] active:bg-[#C83E18] disabled:opacity-40 shadow-sm transition flex items-center justify-center gap-2"
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

          <p className="text-xs text-[#647084] text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#F26336] hover:underline font-semibold">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
