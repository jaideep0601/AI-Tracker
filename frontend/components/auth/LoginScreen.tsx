"use client";
import { useState, useEffect } from "react";
import { User } from "@/app/types";
import { API } from "@/app/constants";
import { Spinner } from "@/components/ui/SharedUI";

export default function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [step,     setStep]     = useState<"email" | "otp">("email");
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Decrement cooldown every second so the button re-enables automatically
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) setCooldown(parseInt(data.detail?.match(/\d+/)?.[0] || "60"));
        throw new Error(data.detail || "Failed to send OTP");
      }
      setStep("otp");
      setInfo(`Code sent to ${email}`);
      if (data.dev_otp) setOtp(data.dev_otp); // auto-fill in local dev when DEBUG=true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error sending OTP");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      const user: User = { email, name: data.name || email.split("@")[0] };
      localStorage.setItem("ts_user", JSON.stringify(user));
      onLogin(user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", background: "var(--bg2)", border: "0.5px solid var(--border2)",
    borderRadius: 9, padding: "11px 14px", color: "var(--text)", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none", marginBottom: 16, boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(59,158,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: "var(--text)" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent)", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }}/>
            ThinkStream
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 8 }}>your personal AI intelligence feed</div>
        </div>

        <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 16, padding: 28 }}>
          {step === "email" ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 6 }}>Sign in</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>We&apos;ll send a verification code to your email</div>
              <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>EMAIL ADDRESS</label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && sendOtp()}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,158,255,0.5)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
              {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>{error}</div>}
              {cooldown > 0 && (
                <div style={{ fontSize: 12, color: "var(--amber)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>
                  Wait {cooldown}s before requesting again
                </div>
              )}
              <button
                onClick={sendOtp} disabled={loading || cooldown > 0}
                style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 9, padding: "11px 0", color: "#fff", fontSize: 14, fontFamily: "var(--font-body)", cursor: loading || cooldown > 0 ? "not-allowed" : "pointer", opacity: (loading || cooldown > 0) ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <><Spinner size={14}/> Sending…</> : "Send verification code →"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setStep("email"); setOtp(""); setError(""); }} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 20, padding: 0 }}>← back</button>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 12 }}>Check your inbox</div>
              {info && (
                <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 16, fontFamily: "var(--font-mono)", background: "rgba(52,211,153,0.08)", border: "0.5px solid rgba(52,211,153,0.2)", borderRadius: 6, padding: "8px 12px" }}>
                  {info}
                </div>
              )}
              <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>6-DIGIT CODE</label>
              <input
                type="text" placeholder="000000" value={otp} maxLength={6} autoFocus
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                onKeyDown={e => e.key === "Enter" && verifyOtp()}
                style={{ ...inputStyle, fontSize: 28, fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textAlign: "center" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,158,255,0.5)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
              {error && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>{error}</div>}
              <button
                onClick={verifyOtp} disabled={loading}
                style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 9, padding: "11px 0", color: "#fff", fontSize: 14, fontFamily: "var(--font-body)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <><Spinner size={14}/> Verifying…</> : "Verify & sign in →"}
              </button>
              <button onClick={sendOtp} disabled={loading} style={{ width: "100%", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 14, padding: 0 }}>
                Didn&apos;t receive it? Resend code
              </button>
            </>
          )}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 20 }}>no password · no tracking · just your feed</div>
      </div>
    </div>
  );
}
