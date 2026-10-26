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
        location: "Main Gate - Turnstile 3",
        device_info: "Beyond Terminal Scanner #1",
      });
      const data: ScanResult = res.data;
      setScanResult(data);
      setScanHistory((prev) => [
        {
          token: token.slice(0, 10),
          time: new Date().toLocaleTimeString(),
          status: data.result,
          title: data.ticket?.event_title || "Verified Pass",
          ref: data.ticket?.reference,
        },
        ...prev,
      ]);
    } catch (err: any) {
      const data: ScanResult = err.response?.data || {
        valid: false,
        result: "invalid",
        message: "Invalid ticket token. Pass could not be verified by cryptographic key.",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E9] text-[#F26336] text-xs font-semibold">
          <Scan className="w-3.5 h-3.5" />
          <span>Venue Gate & Check-in Terminal Simulator</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#172033]">
          Digital Pass Gate Scanner
        </h1>
        <p className="text-xs sm:text-sm text-[#647084] max-w-xl mx-auto">
          Simulate official venue check-in by entering or scanning a ticket token or reference ID.
        </p>
      </div>

      {/* Scanner Input Card */}
      <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block">
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
                className="w-full bg-[#F7F8FA] border border-[#E6E9EF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#172033] placeholder-[#8E98A8] focus:bg-white focus:outline-none focus:border-[#F26336] font-mono transition-colors"
              />
              <QrCode className="w-4 h-4 text-[#8E98A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => handleValidate()}
              disabled={isScanning || !inputToken.trim()}
              className="px-6 py-3 rounded-xl font-display font-bold text-xs bg-[#F26336] hover:bg-[#DF4E27] text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
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
                ? "bg-[#E8F5F1] border-[#BDE3D7] text-[#168566]"
                : scanResult.result === "already_used"
                ? "bg-[#FEF7EB] border-[#FCEFD8] text-[#D99116]"
                : "bg-red-50 border-red-200 text-[#DC2626]"
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.valid ? (
                <CheckCircle2 className="w-8 h-8 text-[#168566] shrink-0" />
              ) : scanResult.result === "already_used" ? (
                <AlertTriangle className="w-8 h-8 text-[#D99116] shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-[#DC2626] shrink-0" />
              )}
              <div>
                <h3 className="font-display font-black text-xl text-[#172033]">
                  {scanResult.valid
                    ? "ACCESS GRANTED"
                    : scanResult.result === "already_used"
                    ? "ALREADY SCANNED"
                    : "ACCESS DENIED"}
                </h3>
                <p className="text-xs text-[#647084] mt-0.5">{scanResult.message}</p>
              </div>
            </div>

            {/* Ticket Info Card */}
            {scanResult.ticket && (
              <div className="bg-white rounded-xl p-4 border border-[#E6E9EF] text-xs text-[#647084] grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] text-[#8E98A8] block uppercase">Event</span>
                  <span className="font-bold text-[#172033] text-sm">{scanResult.ticket.event_title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E98A8] block uppercase">Pass Reference</span>
                  <span className="font-mono font-bold text-[#F26336]">{scanResult.ticket.reference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E98A8] block uppercase">Tier</span>
                  <span className="font-semibold text-[#172033]">{scanResult.ticket.ticket_type_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E98A8] block uppercase">Seat Assignment</span>
                  <span className="font-semibold text-[#172033]">
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
        <div className="bg-white border border-[#E6E9EF] rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-display font-bold text-base text-[#172033]">
            Recent Gate Scans ({scanHistory.length})
          </h3>
          <div className="space-y-2">
            {scanHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E6E9EF] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.status === "valid"
                        ? "bg-[#168566]"
                        : item.status === "already_used"
                        ? "bg-[#D99116]"
                        : "bg-[#DC2626]"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[#172033]">{item.title}</span>
                    <span className="text-[#8E98A8] ml-2 font-mono">{item.ref}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-[#647084]">{item.status.replace("_", " ")}</span>
                  <span className="text-[#8E98A8] font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
