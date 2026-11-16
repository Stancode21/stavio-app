"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  HardHat,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Zadaj e-mailovú adresu.");
      return;
    }

    if (!password) {
      setError("Zadaj heslo.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "E-mail ešte nebol potvrdený. Skontroluj svoju e-mailovú schránku."
        );
      } else {
        setError("E-mail alebo heslo nie sú správne.");
      }

      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F3F0EA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Horná navigácia */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#292824]/55 hover:text-[#292824] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Späť na úvod
          </Link>

          <Link
            href="/register"
            className="text-sm font-semibold text-[#E87524] hover:underline"
          >
            Vytvoriť účet
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E87524] flex items-center justify-center shadow-lg shadow-orange-900/15">
              <HardHat
                className="w-6 h-6 text-white"
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div className="text-xl font-extrabold tracking-wide text-[#292824]">
                STAVIO
              </div>

              <div className="text-[11px] text-[#292824]/45 font-medium">
                stavebné kalkulácie
              </div>
            </div>
          </Link>
        </div>

        {/* Hlavná karta */}
        <div className="bg-white rounded-3xl border border-[#292824]/10 shadow-xl shadow-black/[0.06] p-6 sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E87524] mb-2">
              Vitaj späť
            </p>

            <h1 className="text-2xl font-bold text-[#292824]">
              Prihlásiť sa
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#292824]/55">
              Prihlás sa do svojho pracovného priestoru STAVIO.
            </p>
          </div>

          {/* Chyba */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#292824] mb-2"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="napr. meno@email.sk"
                className="w-full rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 text-sm text-[#292824] outline-none transition focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/15"
                disabled={loading}
              />
            </div>

            {/* Heslo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#292824]"
                >
                  Heslo
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#E87524] hover:underline"
                >
                  Zabudol som heslo
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Zadaj heslo"
                  className="w-full rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 pr-12 text-sm text-[#292824] outline-none transition focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/15"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#292824]/40 hover:text-[#292824] transition-colors"
                  aria-label={
                    showPassword
                      ? "Skryť heslo"
                      : "Zobraziť heslo"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Prihlásenie */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E87524] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:bg-[#D9671D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Prihlasujem...
                </>
              ) : (
                "Prihlásiť sa"
              )}
            </button>
          </form>

          {/* Registrácia */}
          <div className="mt-6 pt-5 border-t border-[#292824]/10 text-center text-sm text-[#292824]/55">
            Ešte nemáš účet?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#E87524] hover:underline"
            >
              Vytvor si účet
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#292824]/35">
          Kalkulačku môžeš používať aj bez prihlásenia.
        </p>
      </div>
    </main>
  );
}