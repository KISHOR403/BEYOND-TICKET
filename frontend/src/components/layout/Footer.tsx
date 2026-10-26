import React from "react";
import { Link } from "react-router-dom";
import { Ticket, ShieldCheck, Zap, RefreshCw, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      {/* Trust & Transparency Banner */}
      <div className="border-b border-slate-900/80 bg-slate-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Verified Tickets</h4>
                <p className="text-xs text-slate-500">Every ticket is backed by official organizers and cryptographic QR codes.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Transparent Zero Hidden Fees</h4>
                <p className="text-xs text-slate-500">All convenience fees and taxes are itemized upfront. No surprises at checkout.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Guaranteed Inventory Hold</h4>
                <p className="text-xs text-slate-500">Locks your seats for 10 minutes while you complete checkout peacefully.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                BEYOND <span className="text-indigo-400">TICKETS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              India's premier unified marketplace for concerts, live sports, stand-up comedy, movies, buses, and conferences. Experience seamless discovery, reliable booking, and instant digital passes.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for fans and live event lovers everywhere.</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/concerts" className="hover:text-white transition">Concerts & Gigs</Link></li>
              <li><Link to="/category/sports" className="hover:text-white transition">Sports Matches</Link></li>
              <li><Link to="/category/comedy" className="hover:text-white transition">Standup Comedy</Link></li>
              <li><Link to="/category/movies" className="hover:text-white transition">Cinema & Movies</Link></li>
              <li><Link to="/category/buses" className="hover:text-white transition">Luxury Buses</Link></li>
              <li><Link to="/category/conferences" className="hover:text-white transition">Conferences</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-white transition">Explore All</Link></li>
              <li><Link to="/tickets" className="hover:text-white transition">My Tickets</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Order History</Link></li>
              <li><Link to="/scanner" className="hover:text-white transition">Ticket Scanner</Link></li>
              <li><Link to="/organizer" className="hover:text-white transition">Organizer Portal</Link></li>
            </ul>
          </div>

          {/* Transparency & Legal */}
          <div>
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Transparency</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Zero Hidden Fee Pledge</span></li>
              <li><span className="text-slate-400">Pricing Breakdown Policy</span></li>
              <li><span className="text-slate-400">Refund Guarantee</span></li>
              <li><span className="text-slate-400">Terms of Service</span></li>
              <li><span className="text-slate-400">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Beyond Tickets Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Demo sandbox mode available for test bookings.</p>
        </div>
      </div>
    </footer>
  );
};
