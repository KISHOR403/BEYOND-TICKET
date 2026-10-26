import React from "react";
import { Link } from "react-router-dom";
import { Ticket, ShieldCheck, CheckCircle2, Lock, ArrowRight, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F8FA] border-t border-[#E6E9EF] text-[#647084] text-xs">
      {/* Trust & Transparency Guarantee Banner */}
      <div className="border-b border-[#E6E9EF] bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E9] text-[#F26336] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#172033]">100% Genuine Digital Passes</h4>
                <p className="text-xs text-[#647084] leading-relaxed">
                  Every pass is cryptographically signed and verified directly by organizers. Instant entry at venue gates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4263EB] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#172033]">No Surprises at Checkout</h4>
                <p className="text-xs text-[#647084] leading-relaxed">
                  All taxes, platform fees, and pricing breakdowns are itemized upfront from the very first click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5F1] text-[#168566] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#172033]">10-Minute Cart Hold</h4>
                <p className="text-xs text-[#647084] leading-relaxed">
                  Locks your tickets while you review details and pay with complete peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F26336] text-white flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-base text-[#172033]">
                BEYOND<span className="text-[#F26336]">TICKETS</span>
              </span>
            </div>
            <p className="text-xs text-[#647084] max-w-sm leading-relaxed">
              A unified entertainment and travel ticketing platform designed for humans. Discover stadium concerts, IPL matches, comedy, movies, intercity buses, and conferences with genuine price transparency.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#8E98A8]">
              <span>Crafted for live entertainment lovers</span>
              <Heart className="w-3.5 h-3.5 text-[#F26336] fill-[#F26336]" />
            </div>
          </div>

          {/* Categories Column */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#172033]">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/concerts" className="hover:text-[#F26336] transition-colors">Concerts & Gigs</Link></li>
              <li><Link to="/category/sports" className="hover:text-[#F26336] transition-colors">Sports Matches</Link></li>
              <li><Link to="/category/comedy" className="hover:text-[#F26336] transition-colors">Comedy & Theatre</Link></li>
              <li><Link to="/category/movies" className="hover:text-[#F26336] transition-colors">Cinema & Movies</Link></li>
              <li><Link to="/category/buses" className="hover:text-[#F26336] transition-colors">Intercity Buses</Link></li>
              <li><Link to="/category/activities" className="hover:text-[#F26336] transition-colors">Theme Parks & Tours</Link></li>
              <li><Link to="/category/cultural" className="hover:text-[#F26336] transition-colors">Cultural Festivals</Link></li>
              <li><Link to="/category/conferences" className="hover:text-[#F26336] transition-colors">Conferences</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#172033]">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-[#F26336] transition-colors">Explore All Events</Link></li>
              <li><Link to="/tickets" className="hover:text-[#F26336] transition-colors">My Digital Passes</Link></li>
              <li><Link to="/orders" className="hover:text-[#F26336] transition-colors">Order Receipts</Link></li>
              <li><Link to="/scanner" className="hover:text-[#F26336] transition-colors">Gate Scanner Simulator</Link></li>
              <li><Link to="/organizer" className="hover:text-[#F26336] transition-colors">Organizer Portal</Link></li>
            </ul>
          </div>

          {/* Transparency & Trust */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#172033]">Transparency</h5>
            <ul className="space-y-2 text-xs">
              <li className="text-[#647084]">Zero Hidden Fee Pledge</li>
              <li className="text-[#647084]">Pricing Breakdown Policy</li>
              <li className="text-[#647084]">Cancellation & Refunds</li>
              <li className="text-[#647084]">Terms of Service</li>
              <li className="text-[#647084]">Privacy Policy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E6E9EF] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E98A8]">
          <p>© {new Date().getFullYear()} Beyond Tickets. All rights reserved.</p>
          <p>Demo sandbox enabled with instant verified payment simulation.</p>
        </div>
      </div>
    </footer>
  );
};
