"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  HardHat,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 6,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
    }),
    [password]
  );

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "",
        percent: 0,
      };
    }

    const score = [
      passwordRules.length,
      passwordRules.number,
      passwordRules.uppercase,
    ].filter(Boolean).length;

    if (score <= 1) {
      return {
        label: "Slabé heslo",
        percent: 33,
      };
    }

    if (score === 2) {
      return {
        label: "Stredne silné heslo",
        percent: 66,
      };
    }

    return {
      label: "Silné heslo",
      percent: 100,
    };
  }, [password, passwordRules]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Zadaj e-mailovú adresu.");
      return;
    }

    if (password.length < 6) {
      setError("Heslo musí mať aspoň 6 znakov.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Heslá sa nezhodujú.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setPassword("");
    setConfirmPassword("");
  }

  function getRuleClass(isValid: boolean) {
    return isValid ? "text-green-700" : "text-[#292824]/40";
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
            href="/login"
            className="text-sm font-semibold text-[#E87524] hover:underline"
          >
            Prihlásiť sa
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
              Nový účet
            </p>

            <h1 className="text-2xl font-bold text-[#292824]">
              Vytvoriť účet
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#292824]/55">
              Ulož si svoje projekty, zákazníkov a stavebné kalkulácie na
              jednom mieste.
            </p>
          </div>

          {/* Chyba */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Úspešná registrácia */}
          {success ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600" />

                <div>
                  <h2 className="font-semibold text-green-800">
                    Registrácia bola úspešná
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-green-700">
                    Ak máš v Supabase zapnuté potvrdenie e-mailu, skontroluj
                    svoju e-mailovú schránku a potvrď registráciu.
                  </p>

                  <Link
                    href="/login"
                    className="inline-flex mt-4 text-sm font-semibold text-green-800 hover:underline"
                  >
                    Prejsť na prihlásenie →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
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
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#292824] mb-2"
                >
                  Heslo
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Vytvor si heslo"
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

                {/* Sila hesla */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#292824]/50">
                        Sila hesla
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.percent === 100
                            ? "text-green-700"
                            : passwordStrength.percent === 66
                              ? "text-[#E87524]"
                              : "text-red-600"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-[#292824]/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.percent === 100
                            ? "bg-green-500"
                            : passwordStrength.percent === 66
                              ? "bg-[#E87524]"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${passwordStrength.percent}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <p
                        className={`text-xs flex items-center gap-2 ${getRuleClass(
                          passwordRules.length
                        )}`}
                      >
                        <span>{passwordRules.length ? "✓" : "○"}</span>
                        Aspoň 6 znakov
                      </p>

                      <p
                        className={`text-xs flex items-center gap-2 ${getRuleClass(
                          passwordRules.number
                        )}`}
                      >
                        <span>{passwordRules.number ? "✓" : "○"}</span>
                        Aspoň jedno číslo
                      </p>

                      <p
                        className={`text-xs flex items-center gap-2 ${getRuleClass(
                          passwordRules.uppercase
                        )}`}
                      >
                        <span>{passwordRules.uppercase ? "✓" : "○"}</span>
                        Aspoň jedno veľké písmeno
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Potvrdenie hesla */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#292824] mb-2"
                >
                  Potvrdenie hesla
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Zopakuj heslo"
                    className={`w-full rounded-xl border bg-[#F8F6F2] px-4 py-3 pr-12 text-sm text-[#292824] outline-none transition focus:ring-2 ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
                          : "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                        : "border-[#292824]/15 focus:border-[#E87524] focus:ring-[#E87524]/15"
                    }`}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#292824]/40 hover:text-[#292824] transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Skryť potvrdenie hesla"
                        : "Zobraziť potvrdenie hesla"
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      passwordsMatch ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {passwordsMatch
                      ? "✓ Heslá sa zhodujú"
                      : "Heslá sa zatiaľ nezhodujú"}
                  </p>
                )}
              </div>

              {/* Registrovať */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E87524] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:bg-[#D9671D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vytváram účet...
                  </>
                ) : (
                  "Vytvoriť účet"
                )}
              </button>
            </form>
          )}

          {/* Spodná navigácia */}
          {!success && (
            <div className="mt-6 pt-5 border-t border-[#292824]/10 text-center text-sm text-[#292824]/55">
              Už máš účet?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#E87524] hover:underline"
              >
                Prihlás sa
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[#292824]/35">
          Základnú stavebnú kalkulačku môžeš používať aj bez registrácie.
        </p>
      </div>
    </main>
  );
}