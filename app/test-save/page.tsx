"use client";

import { useState } from "react";

import {
  calculateWallWithMaterials,
} from "@/lib/calculator";

import {
  getMaterials,
} from "@/lib/calculator/materials-db";

import {
  saveCalculation,
} from "@/lib/calculator/persistence";

const PROJECT_ID =
  "3aa4eeb1-f67c-4deb-a26c-a2406d2ea0f6";

export default function TestSavePage() {
  const [status, setStatus] =
    useState("Pripravené na test.");

  const [savedId, setSavedId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {
    setLoading(true);
    setSavedId(null);

    try {
      setStatus(
        "Načítavam materiály..."
      );

      const materials =
        await getMaterials();

      setStatus(
        `Načítaných materiálov: ${materials.length}. Vykonávam výpočet...`
      );

      const wall = {
        geometryType: "wall" as const,

        dimensions: {
          length: 5000,
          height: 2600,
          unit: "mm" as const,
        },

        openings: [
          {
            name: "Okno",
            type: "window" as const,
            width: 1200,
            height: 1000,
            depth: 200,
            includeReveal: true,
          },
        ],
      };

      const result =
        calculateWallWithMaterials(
          wall,
          materials
        );

      setStatus(
        "Výpočet hotový. Ukladám do projektu RD Senec..."
      );

      const saved =
        await saveCalculation(
          {
            projectId:
              PROJECT_ID,

            name:
              "Test – stena 5000 × 2600 mm",

            calculationType:
              "wall",

            inputs:
              wall,
          },

          result,

          materials
        );

      setSavedId(saved.id);

      setStatus(
        "✅ Výpočet bol úspešne uložený."
      );
    } catch (error) {
      console.error(error);

      setStatus(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Nastala neznáma chyba."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3F0EA] p-6">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#E87524]">
              STAVIO TEST
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#292824]">
              Uloženie kalkulácie
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Testujeme uloženie výpočtu do projektu
              <strong> RD Senec</strong>.
            </p>
          </div>

          <div className="mb-6 rounded-xl bg-[#F3F0EA] p-4">
            <p className="text-sm font-semibold text-[#292824]">
              Testovaný výpočet
            </p>

            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <p>
                Stena: 5000 × 2600 mm
              </p>

              <p>
                Okno: 1200 × 1000 mm
              </p>

              <p>
                Špaleta: 200 mm
              </p>

              <p>
                Očakávaná čistá plocha:
                <strong> 12,68 m²</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-xl bg-[#E87524] px-5 py-3 font-semibold text-white transition hover:bg-[#d9681c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Ukladám..."
              : "Uložiť testovací výpočet"}
          </button>

          <div className="mt-6 rounded-xl border border-black/10 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-[#292824]">
              Stav
            </p>

            <p className="mt-2 text-sm text-gray-700">
              {status}
            </p>

            {savedId && (
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  ID výpočtu
                </p>

                <p className="mt-1 break-all font-mono text-sm text-green-900">
                  {savedId}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}