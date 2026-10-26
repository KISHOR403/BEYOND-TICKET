import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scan,
  ShieldCheck,
  Search,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

interface ScanResult {
  valid: boolean;
  result: "valid" | "already_used" | "invalid" | "cancelled";
  message: string;
  ticket?: any;
}

export const TicketValidationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [inputToken, setInputToken] = useState(tokenFromUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Automatically scan if token is passed in query params
  useEffect(() => {
    if (tokenFromUrl) {
      handleValidate(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleValidate = async (tokenToTest?: string) => {
    const token = (tokenToTest || inputToken).trim();
    if (!token) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await api.post("/tickets/validate/", {
        token,
        location: "Main Gate Gate 3",
        device_info: "Beyond Scanner Terminal #1",
      });
      const data: ScanResult = res.data;
      setScanResult(data);
      setScanHistory((prev) => [
        {
          token: token.slice(0, 10),
          time: new Date().toLocaleTimeString(),
          status: data.result,
          title: data.ticket?.event_title || "Ticket",
          ref: data.ticket?.reference,
        },
        ...prev,
      ]);
    } catch (err: any) {
      const data: ScanResult = err.response?.data || {
        valid: false,
        result: "invalid",
        message: "Invalid ticket token. Ticket could not be verified.",
      };
      setScanResult(data);
      setScanHistory((prev) => [
        {
          token: token.slice(0, 10),
          time: new Date().toLocaleTimeString(),
          status: data.result,
          title: data.ticket?.event_title || "Unknown Ticket",
          ref: data.ticket?.reference,
        },
        ...prev,
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
          <Scan className="w-3.5 h-3.5" />
          <span>Venue Gate & Check-in Terminal Simulator</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Digital Pass Gate Scanner
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Simulate official venue check-in by entering or scanning a ticket token or reference ID.
        </p>
      </div>

      {/* Scanner Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Scan / Enter Pass Token or Reference ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. TK-XXXXXXXX or token string..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => handleValidate()}
              disabled={isScanning || !inputToken.trim()}
              className="px-6 py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {isScanning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Verify Pass</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Result Feedback Banner */}
        {scanResult && (
          <div
            className={`p-6 rounded-2xl border transition-all animate-in fade-in zoom-in-95 space-y-4 ${
              scanResult.valid
                ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                : scanResult.result === "already_used"
                ? "bg-amber-950/40 border-amber-500/60 text-amber-200"
                : "bg-rose-950/40 border-rose-500/60 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.valid ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : scanResult.result === "already_used" ? (
                <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  {scanResult.valid
                    ? "ACCESS GRANTED"
                    : scanResult.result === "already_used"
                    ? "ALREADY SCANNED"
                    : "ACCESS DENIED"}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">{scanResult.message}</p>
              </div>
            </div>

            {/* Ticket Info Card if found */}
            {scanResult.ticket && (
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Event</span>
                  <span className="font-bold text-white text-sm">{scanResult.ticket.event_title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Pass Reference</span>
                  <span className="font-mono font-bold text-indigo-400">{scanResult.ticket.reference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Tier</span>
                  <span className="font-semibold text-slate-200">{scanResult.ticket.ticket_type_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Seat Assignment</span>
                  <span className="font-semibold text-amber-400">
                    {scanResult.ticket.seat_info || "General Admission"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scan History Audit Trail */}
      {scanHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-white">
            Recent Gate Scans ({scanHistory.length})
          </h3>
          <div className="space-y-2">
            {scanHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === "valid"
                        ? "bg-emerald-400"
                        : item.status === "already_used"
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="text-slate-500 ml-2 font-mono">{item.ref}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-slate-400">{item.status.replace("_", " ")}</span>
                  <span className="text-slate-500 font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
