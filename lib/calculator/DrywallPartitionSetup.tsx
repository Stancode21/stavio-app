"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Ruler,
  ShieldCheck,
  Plus,
} from "lucide-react";

// Toto sú typy, ktoré budeme posielať do kalkulačky
export type DrywallConfig = {
  boardWidth: number;
  boardHeight: number;
  cwLength: number;
  uwLength: number;
  screwsPackage: number;
  insulationEnabled: boolean;
  tapeEnabled: boolean;
  compoundEnabled: boolean;
};

type Props = {
  onBack: () => void;
  onContinue: (config: DrywallConfig) => void;
};

export default function DrywallPartitionSetup({ onBack, onContinue }: Props) {
  // Predvolené hodnoty (bežné na trhu)
  const [boardWidth, setBoardWidth] = useState<number>(1200);
  const [boardHeight, setBoardHeight] = useState<number>(2000);
  const [cwLength, setCwLength] = useState<number>(3000);
  const [uwLength, setUwLength] = useState<number>(3000);
  const [screwsPackage, setScrewsPackage] = useState<number>(1000);
  
  // Voliteľné materiály
  const [insulationEnabled, setInsulationEnabled] = useState<boolean>(false);
  const [tapeEnabled, setTapeEnabled] = useState<boolean>(true);
  const [compoundEnabled, setCompoundEnabled] = useState<boolean>(true);

  const [error, setError] = useState("");

  function handleContinue() {
    // Validácia - ochrana proti sprostostiam
    if (boardWidth < 100 || boardWidth > 3000) {
      setError("Šírka dosky musí byť medzi 100 a 3000 mm.");
      return;
    }
    if (boardHeight < 100 || boardHeight > 3000) {
      setError("Výška dosky musí byť medzi 100 a 3000 mm.");
      return;
    }
    if (cwLength < 500 || cwLength > 6000) {
      setError("Dĺžka CW profilu musí byť medzi 0.5 a 6 metrami (500 - 6000 mm).");
      return;
    }
    if (uwLength < 500 || uwLength > 6000) {
      setError("Dĺžka UW profilu musí byť medzi 0.5 a 6 metrami (500 - 6000 mm).");
      return;
    }
    if (screwsPackage < 100) {
      setError("Balenie skrutiek musí mať aspoň 100 kusov.");
      return;
    }

    setError("");
    onContinue({
      boardWidth,
      boardHeight,
      cwLength,
      uwLength,
      screwsPackage,
      insulationEnabled,
      tapeEnabled,
      compoundEnabled,
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
      {/* Hlavička */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-600">
            STAVIO / KALKULAČKA
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Nastavenie materiálov pre SDK priečku
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Zadajte rozmery materiálov, ktoré idete použiť. Systém už vie, že ide o sadrokartón, profily a skrutky.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} /> Späť
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
        
        {/* Sekcia 1: Základné materiály (Povinné) */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Box className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Základné materiály</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Doska */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Sadrokartónová doska
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={boardWidth}
                  onChange={(e) => setBoardWidth(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="Šírka"
                />
                <span className="text-slate-500">×</span>
                <input
                  type="number"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="Výška"
                />
                <span className="text-sm text-slate-500">mm</span>
              </div>
            </div>

            {/* CW Profil */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                CW profil (zvislý)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cwLength}
                  onChange={(e) => setCwLength(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-sm text-slate-500">mm</span>
              </div>
            </div>

            {/* UW Profil */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                UW profil (vodiaci)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={uwLength}
                  onChange={(e) => setUwLength(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-sm text-slate-500">mm</span>
              </div>
            </div>

            {/* Skrutky */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Skrutky (balenie)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={screwsPackage}
                  onChange={(e) => setScrewsPackage(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-sm text-slate-500">ks / bal.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sekcia 2: Spotrebný materiál (Voliteľný) */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Spotrebný materiál</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={tapeEnabled}
                onChange={(e) => setTapeEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Výstužná páska</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={compoundEnabled}
                onChange={(e) => setCompoundEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Tmel na škáry</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={insulationEnabled}
                onChange={(e) => setInsulationEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Minerálna izolácia</span>
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Spotreba týchto materiálov sa vypočíta automaticky podľa plochy steny.
          </p>
        </div>

      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md"
        >
          <CheckCircle2 size={18} />
          Pokračovať na rozmery steny
        </button>
      </div>
    </div>
  );
}