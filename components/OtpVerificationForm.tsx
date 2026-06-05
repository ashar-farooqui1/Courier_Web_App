"use client";

import React, { useState } from "react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/AppLogo";
import { verifyOtp } from "@/lib/api/auth";

interface OtpVerificationFormProps {
  email: string;
  infoMessage?: string;
  onVerified: (message: string) => void;
  onBack: () => void;
}

const OtpVerificationForm = ({
  email,
  infoMessage,
  onVerified,
  onBack,
}: OtpVerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpValue = Number(otp.trim());
    if (!Number.isInteger(otpValue) || otpValue <= 0) {
      setError("Please enter a valid OTP code.");
      return;
    }

    setLoading(true);

    try {
      const message = await verifyOtp(email, otpValue);
      onVerified(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,43,91,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
      <div className="hidden md:flex md:w-[55%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
          alt="Office Environment"
          className="absolute inset-0 object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-20 p-12 text-white flex flex-col justify-end h-full w-full bg-gradient-to-t from-primary/80 to-transparent">
          <h3 className="text-3xl font-bold mb-2">Verify Your Email</h3>
          <p className="text-slate-200 text-sm max-w-md">
            Enter the verification code sent to your email to activate your account.
          </p>
        </div>
      </div>

      <div className="w-full md:w-[45%] p-8 md:p-14 flex flex-col justify-center bg-white">
        <div className="mb-10">
          <AppLogo className="items-start mb-8 scale-110 origin-left" />
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors mb-6 disabled:opacity-50"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
          <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">OTP Verification</h2>
          <p className="text-slate-500 text-sm">
            {infoMessage ?? "Your email is not verified yet. Enter the OTP code to continue."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                readOnly
                icon={<Mail size={18} className="text-primary/60" />}
                className="h-12 bg-slate-100 border-slate-200 text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                OTP Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter verification code"
                icon={<KeyRound size={18} className="text-primary/60" />}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all tracking-[0.3em] font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-14 font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationForm;
