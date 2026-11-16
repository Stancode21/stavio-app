"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Ruler,
  Package,
  Info,
} from "lucide-react";

import {
  calculateDrywallPartition,
  type DrywallPartitionInput,
} from "@/lib/calculator/drywall-partition";

import type {
  MaterialDefinition,
  SystemMaterial,
  CalculationRule,
  Opening,
} from "@/lib/calculator/types";

import type { DrywallConfig } from "./DrywallPartitionSetup";

type Props = {
  config: DrywallConfig;
  materials: MaterialDefinition[];
  systemMaterials: SystemMaterial[];
  rules: CalculationRule[];
  onBack?: () => void;
};

// Toto už nepotrebujeme ako konštantu, lebo hodnoty idú z configu

function NumberField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-[#78918b] focus-within:ring-2 focus-within:ring-[#263d39]/10">
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm font-semibold outline-none"
        />
        <span className="px-4 text-xs font-semibold text-slate-400">
          {unit}
        </span>
      </div>
    </label>
  );
}

export default function DrywallPartitionCalculator({
  config,
  materials,
  systemMaterials,
  rules,
  onBack,
}: Props) {
  // Inicializujeme input s hodnotami z configu
  const [input, setInput] = useState<DrywallPartitionInput>({
    length: 5000,
    height: 2600,
    sides: 1,
    layersPerSide: 1,
    board: {
      width: config.boardWidth,
      height: config.boardHeight,
      wastePercent: 0,
    },
    profile: {
      spacing: 600,
      stockLength: config.cwLength, // Zatiaľ používame CW pre oba
    },
    insulation: {
      enabled: config.insulationEnabled,
      thickness: 100,
      wastePercent: 5,
    },
    openings: [],
  });

  // Toto je kľúčové – výsledok sa počíta automaticky pri každej zmene vstupu
  const result = useMemo(
    () =>
      calculateDrywallPartition(
        input,
        systemMaterials,
        materials,
        rules
      ),
    [input, systemMaterials, materials, rules]
  );

  function update<K extends keyof DrywallPartitionInput>(
    key: K,
    value: DrywallPartitionInput[K]
  ) {
    setInput((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function addOpening() {
    const opening: Opening = {
      name: `Otvor ${(input.openings ?? []).length + 1}`,
      type: "window",
      width: 1000,
      height: 1200,
      depth: 200,
      includeReveal: false,
    };

    update("openings", [...(input.openings ?? []), opening]);
  }

  function updateOpening(index: number, changes: Partial<Opening>) {
    const openings = [...(input.openings ?? [])];
    openings[index] = { ...openings[index], ...changes };
    update("openings", openings);
  }

  function removeOpening(index: number) {
    update(
      "openings",
      (input.openings ?? []).filter((_, i) => i !== index)
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#263d39]"
        >
          <ArrowLeft size={17} />
          Späť na výber kalkulácie
        </button>

        <div className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf1ef] px-3 py-1.5 text-xs font-bold text-[#263d39]">
            <Calculator size={14} />
            STAVIO / STENY
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Sadrokartónová priečka
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Zadajte rozmery priečky, nastavte konštrukciu a pridajte
            okná alebo dvere. STAVIO pripraví výpočet potrebného materiálu.
          </p>
        </div>

        <div className="space-y-6">
          {/* Rozmery */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ef] text-[#263d39]">
                <Ruler size={19} />
              </div>
              <div>
                <h2 className="font-black">Rozmery priečky</h2>
                <p className="text-xs text-slate-500">
                  Rozmery zadávajte v milimetroch.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Dĺžka priečky"
                value={input.length}
                unit="mm"
                onChange={(value) => update("length", value)}
              />
              <NumberField
                label="Výška priečky"
                value={input.height}
                unit="mm"
                onChange={(value) => update("height", value)}
              />
            </div>
          </section>

          {/* Konštrukcia */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ef] text-[#263d39]">
                <Package size={19} />
              </div>
              <div>
                <h2 className="font-black">Konštrukcia a dosky</h2>
                <p className="text-xs text-slate-500">
                  Parametre, ktoré ovplyvňujú množstvo materiálu.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Opláštené strany
                </span>
                <select
                  value={input.sides}
                  onChange={(event) =>
                    update("sides", Number(event.target.value) as 1 | 2)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value={1}>1 strana</option>
                  <option value={2}>2 strany</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Počet vrstiev dosiek na stranu
                </span>
                <select
                  value={input.layersPerSide}
                  onChange={(event) =>
                    update("layersPerSide", Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value={1}>1 vrstva</option>
                  <option value={2}>2 vrstvy</option>
                </select>
              </label>

              <NumberField
                label="Šírka dosky"
                value={input.board.width}
                unit="mm"
                onChange={(value) =>
                  update("board", { ...input.board, width: value })
                }
              />

              <NumberField
                label="Výška dosky"
                value={input.board.height}
                unit="mm"
                onChange={(value) =>
                  update("board", { ...input.board, height: value })
                }
              />

              <NumberField
                label="Rozostup CW profilov"
                value={input.profile.spacing}
                unit="mm"
                onChange={(value) =>
                  update("profile", { ...input.profile, spacing: value })
                }
              />

              <NumberField
                label="Dĺžka profilu v predaji"
                value={input.profile.stockLength}
                unit="mm"
                onChange={(value) =>
                  update("profile", {
                    ...input.profile,
                    stockLength: value,
                  })
                }
              />

              <NumberField
                label="Rezerva dosiek"
                value={input.board.wastePercent}
                unit="%"
                onChange={(value) =>
                  update("board", {
                    ...input.board,
                    wastePercent: value,
                  })
                }
              />
            </div>
          </section>

          {/* Otvory */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-black">Okná a dvere</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Otvory odpočítame od plochy priečky.
                </p>
              </div>
              <button
                type="button"
                onClick={addOpening}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#263d39] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1d302c]"
              >
                <Plus size={15} />
                Pridať otvor
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {(input.openings ?? []).map((opening, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <input
                      value={opening.name}
                      onChange={(event) =>
                        updateOpening(index, { name: event.target.value })
                      }
                      className="w-full bg-transparent text-sm font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeOpening(index)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Odstrániť otvor"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-500">
                        Typ otvoru
                      </span>
                      <select
                        value={opening.type}
                        onChange={(event) =>
                          updateOpening(index, {
                            type: event.target.value as Opening["type"],
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="window">Okno</option>
                        <option value="door">Dvere</option>
                      </select>
                    </label>

                    <NumberField
                      label="Šírka"
                      value={opening.width}
                      unit="mm"
                      onChange={(value) =>
                        updateOpening(index, { width: value })
                      }
                    />

                    <NumberField
                      label="Výška"
                      value={opening.height}
                      unit="mm"
                      onChange={(value) =>
                        updateOpening(index, { height: value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Izolácia */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={input.insulation.enabled}
                onChange={(event) =>
                  update("insulation", {
                    ...input.insulation,
                    enabled: event.target.checked,
                  })
                }
                className="h-5 w-5 accent-[#263d39]"
              />
              <span className="font-bold">Pridať minerálnu izoláciu</span>
            </label>

            {input.insulation.enabled && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Hrúbka izolácie"
                  value={input.insulation.thickness}
                  unit="mm"
                  onChange={(value) =>
                    update("insulation", {
                      ...input.insulation,
                      thickness: value,
                    })
                  }
                />
                <NumberField
                  label="Rezerva izolácie"
                  value={input.insulation.wastePercent}
                  unit="%"
                  onChange={(value) =>
                    update("insulation", {
                      ...input.insulation,
                      wastePercent: value,
                    })
                  }
                />
              </div>
            )}
          </section>

          {/* Výsledok – počíta sa automaticky */}
          <section className="rounded-3xl border border-[#cfddd9] bg-[#edf4f1] p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-black">Výsledok kalkulácie</h2>

            {result.validation.messages.length > 0 && (
              <div className="mt-4 space-y-2">
                {result.validation.messages.map((message, index) => (
                  <div
                    key={`${message.code}-${index}`}
                    className="flex gap-2 rounded-xl bg-white p-3 text-sm text-amber-800"
                  >
                    <Info size={17} className="shrink-0" />
                    {message.message}
                  </div>
                ))}
              </div>
            )}

            {result.validation.status !== "invalid" && (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Pôvodná plocha", result.grossArea, "m²"],
                    ["Otvory", result.openingsArea, "m²"],
                    ["Čistá plocha", result.netArea, "m²"],
                    ["Opláštenie", result.claddingArea, "m²"],
                  ].map(([label, value, unit]) => (
                    <div key={String(label)} className="rounded-2xl bg-white p-4">
                      <div className="text-xs text-slate-500">{label}</div>
                      <div className="mt-1 text-xl font-black text-[#263d39]">
                        {Number(value).toFixed(2)}{" "}
                        <span className="text-xs">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <h3 className="mb-3 font-black">Potrebný materiál</h3>

                  {result.materials.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Materiálový systém zatiaľ nie je pripojený.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {result.materials.map((item, index) => (
                        <div
                          key={`${item.materialId ?? item.role}-${index}`}
                          className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 last:border-0 sm:flex-row"
                        >
                          <span className="text-sm font-semibold">
                            {item.materialName}
                          </span>
                          <span className="text-sm font-black text-[#263d39]">
                            {item.requiredQuantity} {item.calculationUnit}
                            {item.purchaseCount !== undefined &&
                              ` · ${item.purchaseCount} ${item.purchaseUnit ?? "bal."}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}