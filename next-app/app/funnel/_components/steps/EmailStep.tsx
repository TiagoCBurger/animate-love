"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Mail, Loader2, Shield, Send, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EmailStepProps {
  onVerified: () => void;
  onBack: () => void;
}

type Step = "email" | "otp";

export function EmailStep({ onVerified, onBack }: EmailStepProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);
  const sendingRef = useRef(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código.");
        return;
      }

      setStep("otp");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Erro ao enviar codigo. Tente novamente.");
    } finally {
      setIsSending(false);
      sendingRef.current = false;
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      verifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newCode = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setOtpCode(newCode);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "magiclink",
      });

      if (verifyError) {
        console.error("OTP verify error:", verifyError.message, verifyError);
        setError(verifyError.message);
        setOtpCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      onVerified();
    } catch {
      setError("Erro ao verificar codigo. Tente novamente.");
    } finally {
      setIsVerifying(false);
      verifyingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-md mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Quase la!
          </h1>
          <p className="text-zinc-400">
            Confirme seu email para continuar
          </p>
        </div>

        {/* Benefits explanation */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <Shield className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-zinc-300 font-medium">Acesse sua conta a qualquer momento</p>
              <p className="text-xs text-zinc-500">Use seu email para entrar e ver suas animacoes sempre que quiser</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <Send className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-zinc-300 font-medium">Receba sua animacao por email</p>
              <p className="text-xs text-zinc-500">Se voce sair do site, enviaremos o link da sua animacao para este email</p>
            </div>
          </div>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                Seu melhor email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="seu@email.com"
                autoFocus
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!email || isSending}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-xl shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><Mail className="w-5 h-5 mr-2" /> Enviar codigo de verificacao</>
              )}
            </Button>

            <p className="text-xs text-center text-zinc-600">
              Nao se preocupe, nao enviaremos spam.
            </p>
          </form>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400">
                Enviamos um codigo de 6 digitos para
              </p>
              <p className="text-white font-medium mt-1">{email}</p>
            </div>

            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={isVerifying}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-60"
                />
              ))}
            </div>

            {isVerifying && (
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpCode(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Alterar email
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpCode(["", "", "", "", "", ""]);
                  setError("");
                  handleSendOtp(new Event("submit") as unknown as React.FormEvent);
                }}
                disabled={isSending || resendCooldown > 0}
                className="text-sm text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar codigo"}
              </button>
            </div>

            <p className="text-xs text-center text-zinc-600">
              Verifique tambem a caixa de spam. O codigo expira em 1 hora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
