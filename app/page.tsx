"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderKanban,
  Hammer,
  Home,
  Layers3,
  Menu,
  Package,
  Ruler,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import {
  getMaterials,
  findOrCreateMaterial, // <-- DOPLNENÉ
} from "@/lib/calculator/materials-db";

import DrywallPartitionSetup from "@/lib/calculator/DrywallPartitionSetup";
import DrywallPartitionCalculator from "@/lib/calculator/DrywallPartitionCalculator";
import { toMaterialDefinitions } from "@/lib/calculator/material-adapter";
import { createDrywallConfiguration } from "@/lib/calculator/drywall-partition-config";

import type {
  CalculationMaterial,
} from "@/lib/calculator/types";


type ViewMode = "home" | "calculator";
type CalculatorType = "wall" | "floor" | "ceiling" | "slope";

const categories: {
  id: CalculatorType;
  label: string;
  description: string;
  icon: typeof Home;
}[] = [
  {
    id: "wall",
    label: "Stena",
    description: "Omietky, priečky a steny",
    icon: Layers3,
  },
  {
    id: "floor",
    label: "Podlaha",
    description: "Poter, dlažba a podlahy",
    icon: Ruler,
  },
  {
    id: "ceiling",
    label: "Strop",
    description: "Sadrokartón a omietky",
    icon: Home,
  },
  {
    id: "slope",
    label: "Šikmina",
    description: "Podkrovné a šikmé plochy",
    icon: Hammer,
  },
];

const benefits = [
  {
    icon: Calculator,
    title: "Presnejšie kalkulácie",
    description:
      "Výpočty vychádzajú zo skutočných rozmerov a zvoleného typu materiálu.",
  },
  {
    icon: FolderKanban,
    title: "Každý projekt pokope",
    description:
      "Majte miestnosti, kalkulácie a ďalšie informácie k jednej stavbe prehľadne spolu.",
  },
  {
    icon: Package,
    title: "Prehľad materiálu",
    description:
      "Okrem vypočítaného množstva uvidíte aj potrebný počet balení alebo kusov.",
  },
  {
    icon: FileText,
    title: "Cenové ponuky",
    description:
      "Z kalkulácií bude možné vytvárať cenové ponuky pre zákazníkov.",
  },
  {
    icon: Users,
    title: "Zákazníci a zákazky",
    description:
      "Majstri si môžu viesť zákazníkov a priradiť k nim jednotlivé projekty.",
  },
  {
    icon: Sparkles,
    title: "Priestor na rozšírenie",
    description:
      "STAVIO je pripravené na ďalšie typy výpočtov a stavebných prác.",
  },
];

const steps = [
  {
    number: "01",
    title: "Vyberiete, čo idete robiť",
    description: "Zvoľte stenu, podlahu, strop alebo šikminu.",
  },
  {
    number: "02",
    title: "Zadáte rozmery",
    description: "Pri stene môžete pridať okná a dvere vrátane špaliet.",
  },
  {
    number: "03",
    title: "Vyberiete materiály",
    description: "Z databázy zvolíte materiály, ktoré chcete vypočítať.",
  },
  {
    number: "04",
    title: "Získate výsledok",
    description:
      "Uvidíte plochu, potrebné množstvo aj počet nákupných balení.",
  },
];

type WorkSubType = {
  id: string;
  label: string;
  description: string;
  available: boolean;
  icon: typeof Home;
};

const constructionPhases = {
  build: {
    label: "Stavať novú",
    description: "Murovanie, priečky, sadrokartón",
  },
  finish: {
    label: "Upraviť existujúcu",
    description: "Omietky, stierky, maľovanie",
  },
};

const workSubTypes: Record<
  CalculatorType,
  { build?: WorkSubType[]; finish?: WorkSubType[] }
> = {
  wall: {
    build: [
      { id: "drywall", label: "Sadrokartón", description: "Priečky a obklady", available: true, icon: Layers3 },
      { id: "brick", label: "Tehla / Ytong", description: "Murované steny", available: false, icon: Home },
    ],
    finish: [
      { id: "plaster", label: "Omietka", description: "Vnútorné aj vonkajšie", available: false, icon: Ruler },
      { id: "stucco", label: "Stierka", description: "Vyrovnanie povrchu", available: false, icon: Sparkles },
      { id: "paint", label: "Maľovka / Farba", description: "Náter stien", available: false, icon: Sparkles },
    ],
  },
  floor: {
    build: [
      { id: "screed", label: "Poter / Nivelák", description: "Liate podlahy", available: false, icon: Layers3 },
    ],
    finish: [
      { id: "tile", label: "Dlažba", description: "Keramika, obklady", available: false, icon: Ruler },
      { id: "laminate", label: "Laminát / Vinyl", description: "Plávajúce podlahy", available: false, icon: Home },
    ],
  },
  ceiling: {
    build: [
      { id: "drywall_ceiling", label: "Sadrokartónový strop", description: "Podhľady", available: false, icon: Home },
    ],
    finish: [
      { id: "ceiling_plaster", label: "Omietka stropu", description: "Vnútorné omietky", available: false, icon: Ruler },
      { id: "ceiling_paint", label: "Maľovka stropu", description: "Náter stropu", available: false, icon: Sparkles },
    ],
  },
  slope: {
    build: [
      { id: "slope_drywall", label: "Sadrokartón", description: "Podkrovie a šikminy", available: false, icon: Hammer },
    ],
    finish: [
      { id: "slope_plaster", label: "Omietka šikminy", description: "Vnútorné omietky", available: false, icon: Ruler },
    ],
  },
};

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [showDrywallSetup, setShowDrywallSetup] = useState(false);
  const [drywallConfig, setDrywallConfig] = useState<any>(null); 
  const [activeType, setActiveType] = useState<CalculatorType>("wall");
  const [activePhase, setActivePhase] = useState<"build" | "finish" | null>(null);
  const [activeSubType, setActiveSubType] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [materials, setMaterials] = useState<CalculationMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMaterials() {
      setMaterialsLoading(true);
      setMaterialsError("");

      try {
        const data = await getMaterials();

        if (active) {
          setMaterials(data);
        }
      } catch (error) {
        if (active) {
          setMaterialsError(
            error instanceof Error
              ? error.message
              : "Materiály sa nepodarilo načítať."
          );
        }
      } finally {
        if (active) {
          setMaterialsLoading(false);
        }
      }
    }

    void loadMaterials();

    return () => {
      active = false;
    };
  }, []);

  const changeType = (type: CalculatorType) => {
    setActiveType(type);
    setActivePhase(null);
    setActiveSubType(null);
  };

  const scrollToCalculator = (type?: CalculatorType) => {
    if (type) {
      changeType(type);
    }

    setMobileMenuOpen(false);
    setViewMode("calculator");

    window.setTimeout(() => {
      document
        .getElementById("calculator")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goHome = () => {
    setMobileMenuOpen(false);
    setViewMode("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setViewMode("home");

    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const activeCategory = categories.find(
    (category) => category.id === activeType
  );

  return (
    <div className="min-h-screen bg-[#F3F0EA] text-[#292824]">
      <header className="sticky top-0 z-40 border-b border-[#e4ded4] bg-[#F3F0EA]/95 backdrop-blur-xl">
        {/* ... HLAVIČKA (ostáva rovnaká) ... */}
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-3"
            aria-label="STAVIO – úvod"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#292824] text-sm font-black text-white shadow-sm">
              S
            </span>
            <span className="text-left">
              <span className="block text-lg font-black tracking-tight">
                STAVIO
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#898276] sm:block">
                Stavba jednoduchšie
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={goHome}
              className="rounded-xl px-3.5 py-2 text-sm font-bold text-[#292824] transition hover:bg-white"
            >
              Domov
            </button>
            <button
              type="button"
              onClick={() => scrollToCalculator()}
              className="group inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-[#625d54] transition hover:bg-white hover:text-[#292824]"
            >
              Kalkulačka
              <ChevronRight
                size={14}
                className="text-[#E87524] transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="rounded-xl px-3.5 py-2 text-sm font-bold text-[#625d54] transition hover:bg-white hover:text-[#292824]"
            >
              Ako to funguje
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("for-everyone")}
              className="rounded-xl px-3.5 py-2 text-sm font-bold text-[#625d54] transition hover:bg-white hover:text-[#292824]"
            >
              Pre koho
            </button>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#625d54] transition hover:bg-white hover:text-[#292824]"
            >
              Prihlásiť sa
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#E87524] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#d96519] hover:shadow-md"
            >
              Vytvoriť účet
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-xl p-2 text-[#292824] transition hover:bg-white lg:hidden"
            aria-label={mobileMenuOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#e4ded4] bg-[#F3F0EA] px-4 py-4 shadow-lg lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <button
                type="button"
                onClick={goHome}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white"
              >
                Domov
              </button>
              <button
                type="button"
                onClick={() => scrollToCalculator()}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white"
              >
                Kalkulačka
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white"
              >
                Ako to funguje
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("for-everyone")}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white"
              >
                Pre koho
              </button>
              <div className="my-2 border-t border-[#e4ded4]" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#625d54] transition hover:bg-white"
              >
                Prihlásiť sa
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-[#E87524] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d96519]"
              >
                Vytvoriť účet
              </Link>
            </nav>
          </div>
        )}
      </header>

      {viewMode === "home" && (
        <>
          {/* ... LANDING PAGE (ostáva rovnaká) ... */}
          <section className="relative isolate overflow-hidden">
            <div className="pointer-events-none absolute -left-32 top-16 -z-10 h-80 w-80 rounded-full bg-[#E87524]/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-96 w-96 rounded-full bg-[#C84C32]/10 blur-3xl" />

            <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#e4ded4] bg-white px-3 py-1.5 text-xs font-bold text-[#625d54] shadow-sm">
                  <Sparkles size={14} className="text-[#E87524]" />
                  Stavebná kalkulačka pre každého
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-[#292824] sm:text-5xl lg:text-6xl">
                  Vypočítajte si materiál.
                  <span className="mt-1 block text-[#E87524]">
                    Jednoducho a prehľadne.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#716b61] sm:text-lg">
                  Zadajte rozmery, vyberte materiály a získajte výpočet
                  potrebného množstva. Kalkulačku môžete používať aj bez
                  registrácie.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => scrollToCalculator()}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E87524] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E87524]/20 transition hover:-translate-y-0.5 hover:bg-[#d96519] hover:shadow-xl"
                  >
                    Začať kalkuláciu
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ded9d0] bg-white px-6 py-3.5 text-sm font-bold text-[#292824] shadow-sm transition hover:-translate-y-0.5 hover:border-[#E87524]/50 hover:shadow-md"
                  >
                    Vytvoriť účet
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#716b61]">
                  {[
                    "Bez registrácie",
                    "Výpočet podľa rozmerov",
                    "Pre majstrov aj domácich",
                  ].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#66815e]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative lg:pt-4">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#E87524]/15 via-white to-[#C84C32]/10 blur-xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-[#e4ded4] bg-white p-5 shadow-2xl shadow-[#292824]/10 sm:p-7">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#a19a8e]">
                        Rýchly štart
                      </div>
                      <h2 className="mt-1 text-xl font-black text-[#292824]">
                        Čo chcete vypočítať?
                      </h2>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e5] text-[#E87524]">
                      <Calculator size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => scrollToCalculator(category.id)}
                          className="group rounded-2xl border border-[#e8e3da] bg-[#faf9f6] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#E87524]/50 hover:bg-white hover:shadow-md"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#E87524] shadow-sm transition group-hover:bg-[#E87524] group-hover:text-white">
                            <Icon size={19} />
                          </div>
                          <div className="mt-4 text-sm font-black text-[#292824]">
                            {category.label}
                          </div>
                          <div className="mt-1 text-[11px] leading-4 text-[#898276]">
                            {category.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F3F0EA] px-4 py-3">
                    <span className="text-xs font-semibold text-[#716b61]">
                      Začnite bez registrácie
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToCalculator()}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#E87524] hover:underline"
                    >
                      Otvoriť kalkulačku
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#e4ded4] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#E87524]">
                  Prečo STAVIO
                </span>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#292824] sm:text-4xl">
                  Viac než len kalkulačka
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#898276] sm:text-base">
                  Kalkulácia je začiatok. STAVIO postupne rozšírime o nástroje,
                  ktoré vám pomôžu mať stavbu a zákazky prehľadne pokope.
                </p>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={benefit.title}
                      className="group rounded-2xl border border-[#e8e3da] bg-[#faf9f6] p-6 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-[#292824]/5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#E87524] transition group-hover:bg-[#E87524] group-hover:text-white">
                        <Icon size={21} />
                      </div>
                      <h3 className="mt-5 text-base font-black text-[#292824]">
                        {benefit.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#898276]">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="bg-[#F3F0EA]">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#E87524]">
                    Ako to funguje
                  </span>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-[#292824] sm:text-4xl">
                    Od rozmeru až po výsledok.
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-[#716b61] sm:text-base">
                    Vyberiete typ plochy, zadáte rozmery a zvolíte materiály.
                    STAVIO vypočíta množstvá podľa nastavení jednotlivých
                    materiálov.
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToCalculator()}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#292824] shadow-sm ring-1 ring-[#e4ded4] transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Vyskúšať kalkulačku
                    <ArrowRight size={16} className="text-[#E87524]" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="rounded-2xl border border-[#e4ded4] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-xs font-black tracking-widest text-[#E87524]">
                        {step.number}
                      </div>
                      <h3 className="mt-4 text-base font-black text-[#292824]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#898276]">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="for-everyone" className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-[2rem] bg-[#292824] shadow-xl">
                <div className="grid lg:grid-cols-2">
                  <div className="p-8 sm:p-12">
                    <div className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
                      Pre majstrov aj svojpomocných
                    </div>
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      Nemusíte byť stavebný odborník.
                    </h2>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                      Chcete si sami prerobiť izbu, podlahu, strop alebo
                      kúpeľňu? Začnite výpočtom potrebného materiálu. Neskôr
                      si môžete výpočty ukladať do projektov.
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToCalculator()}
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#E87524] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#d96519]"
                    >
                      Začať bez registrácie
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="relative hidden min-h-[300px] overflow-hidden bg-[#35332e] lg:block">
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E87524]/15 blur-2xl" />
                    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#C84C32]/15 blur-2xl" />
                    <div className="relative flex h-full items-center justify-center p-12">
                      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87524] text-white">
                            <Hammer size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              Rekonštrukcia bytu
                            </div>
                            <div className="text-xs text-white/50">
                              Ukážkový projekt
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 space-y-3">
                          {[
                            "Obývačka – strop",
                            "Kuchyňa – podlaha",
                            "Kúpeľňa – obklad",
                          ].map((item) => (
                            <div
                              key={item}
                              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                            >
                              <span className="text-xs font-semibold text-white/80">
                                {item}
                              </span>
                              <CheckCircle2 size={15} className="text-[#9bb98f]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#F3F0EA]">
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#E87524] shadow-sm ring-1 ring-[#e4ded4]">
                <FolderKanban size={25} />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-[#292824] sm:text-4xl">
                Chcete mať svoje projekty pokope?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#716b61] sm:text-base">
                Kalkulačku môžete používať hneď. Ak si chcete výpočty ukladať,
                vytvárať projekty a neskôr využívať ďalšie funkcie, vytvorte
                si účet.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#E87524] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#d96519]"
                >
                  Vytvoriť účet
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToCalculator()}
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#292824] shadow-sm ring-1 ring-[#e4ded4] transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Najprv vyskúšať kalkulačku
                </button>
              </div>
              <p className="mt-5 text-xs font-semibold text-[#a19a8e]">
                STAVIO budeme postupne rozširovať o ďalšie užitočné funkcie.
              </p>
            </div>
          </section>
        </>
      )}

      {viewMode === "calculator" && (
        showDrywallSetup ? (
          <DrywallPartitionSetup
            onBack={() => {
              setShowDrywallSetup(false);
              setDrywallConfig(null);
            }}
            onContinue={(config) => {
              setDrywallConfig(config);
              setShowDrywallSetup(false);
            }}
          />
        ) : drywallConfig ? (
          // TU JE TÁ ZMENA: Namiesto starého kódu voláme nový Loader
          <DrywallConfigLoader 
            drywallConfig={drywallConfig} 
            materials={materials}
            onBack={() => {
              setDrywallConfig(null);
              setShowDrywallSetup(true);
            }}
          />
        ) : (
          <section
            id="calculator"
            className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
          >
            <div className="mb-8">
              <button
                type="button"
                onClick={goHome}
                className="mb-5 text-sm font-bold text-[#716b61] transition hover:text-[#E87524]"
              >
                ← Späť na úvod
              </button>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e5] px-3 py-1.5 text-xs font-bold text-[#b95719]">
                    <Calculator size={14} />
                    Kalkulačka STAVIO
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-[#292824] sm:text-4xl">
                    Vypočítajte potrebný materiál
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716b61]">
                    Vyberte, čo idete počítať. Potom zvoľte fázu a materiál, z ktorého chcete počítať.
                  </p>
                </div>
              </div>
            </div>

            {/* Úroveň 1: Hlavné kategórie */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const selected = activeType === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => changeType(category.id)}
                    className={`rounded-2xl border p-4 text-left transition duration-200 ${
                      selected
                        ? "border-[#E87524] bg-[#fff0e5] shadow-sm ring-1 ring-[#E87524]/20"
                        : "border-[#e4ded4] bg-white hover:-translate-y-0.5 hover:border-[#E87524]/50 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-[#E87524] text-white"
                          : "bg-[#F3F0EA] text-[#625d54]"
                      }`}
                    >
                      <Icon size={19} />
                    </div>
                    <div className="mt-4 text-sm font-black text-[#292824]">
                      {category.label}
                    </div>
                    <div className="mt-1 text-[11px] leading-4 text-[#898276]">
                      {category.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Úroveň 2 a 3: Fáza a podkategórie */}
            <div className="mt-6 rounded-[2rem] border border-[#e4ded4] bg-white p-5 shadow-sm sm:p-7">
              
              {/* Ak ešte nie je vybraná fáza, ukážeme 2 možnosti */}
              {!activePhase && (
                <>
                  <h2 className="mb-4 text-base font-black text-[#292824]">
                    V akej fáze si? ({activeCategory?.label})
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(constructionPhases).map(([phaseKey, phase]) => (
                      <button
                        key={phaseKey}
                        type="button"
                        onClick={() => setActivePhase(phaseKey as "build" | "finish")}
                        className="rounded-2xl border border-[#e8e3da] bg-[#faf9f6] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#E87524]/50 hover:bg-white hover:shadow-md"
                      >
                        <div className="text-lg font-black text-[#292824]">
                          {phase.label}
                        </div>
                        <div className="mt-1 text-sm text-[#898276]">
                          {phase.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Ak je vybraná fáza, ukážeme materiály pre tú fázu */}
              {activePhase && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePhase(null);
                        setActiveSubType(null);
                      }}
                      className="text-sm font-bold text-[#E87524] hover:underline"
                    >
                      ← Zmeniť fázu
                    </button>
                    <span className="text-sm text-[#898276]">
                      {constructionPhases[activePhase].label}
                    </span>
                  </div>

                  <h2 className="mb-4 text-base font-black text-[#292824]">
                    Z čoho chceš počítať?
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {workSubTypes[activeType][activePhase]?.map((subType) => {
                      const Icon = subType.icon;
                      return (
                        <button
                          key={subType.id}
                          type="button"
                          onClick={() => {
                            setActiveSubType(subType.id);
                            if (subType.id === "drywall") {
                              setShowDrywallSetup(true);
                            }
                          }}
                          className={`relative rounded-2xl border p-4 text-left transition duration-200 ${
                            activeSubType === subType.id
                              ? "border-[#E87524] bg-[#fff7f0] ring-1 ring-[#E87524]/20"
                              : "border-[#e8e3da] bg-[#faf9f6] hover:-translate-y-0.5 hover:border-[#E87524]/50 hover:bg-white hover:shadow-md"
                          } ${!subType.available ? "opacity-60 grayscale-[50%]" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#E87524] shadow-sm">
                              <Icon size={19} />
                            </div>
                            {!subType.available && (
                              <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                                Pripravujeme
                              </span>
                            )}
                          </div>
                          <div className="mt-3 text-sm font-black text-[#292824]">
                            {subType.label}
                          </div>
                          <div className="mt-1 text-[11px] leading-4 text-[#898276]">
                            {subType.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {activeSubType && activeSubType !== "drywall" && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                      Táto kalkulačka je momentálne vo vývoji. Čoskoro pribudne!
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )
      )}

      <footer className="border-t border-[#e4ded4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-sm font-black text-[#292824]">STAVIO</div>
            <div className="mt-1 text-xs text-[#a19a8e]">
              Stavebné kalkulácie jednoducho a prehľadne.
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-[#716b61]">
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="transition hover:text-[#E87524]"
            >
              Ako to funguje
            </button>
            <Link href="/login" className="transition hover:text-[#E87524]">
              Prihlásenie
            </Link>
            <Link href="/register" className="transition hover:text-[#E87524]">
              Registrácia
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// SEM PRIDÁVAME NOVÝ KOMPONENT
function DrywallConfigLoader({ 
  drywallConfig, 
  materials, 
  onBack 
}: { 
  drywallConfig: any, 
  materials: any[], 
  onBack: () => void 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [configData, setConfigData] = useState<any>(null);

  useEffect(() => {
    async function prepare() {
      try {
        const board = await findOrCreateMaterial(
          `Sadrokartónová doska ${drywallConfig.boardWidth}x${drywallConfig.boardHeight}`,
          drywallConfig.boardWidth, drywallConfig.boardHeight, null, "ks", "ks", 1
        );
        const cw = await findOrCreateMaterial(
          `CW profil ${drywallConfig.cwLength / 1000} m`,
          null, null, drywallConfig.cwLength, "bm", "ks", 1
        );
        const uw = await findOrCreateMaterial(
          `UW profil ${drywallConfig.uwLength / 1000} m`,
          null, null, drywallConfig.uwLength, "bm", "ks", 1
        );
        const screws = await findOrCreateMaterial(
          `Skrutky do sadrokartónu (balenie ${drywallConfig.screwsPackage} ks)`,
          null, null, null, "ks", "bal", drywallConfig.screwsPackage
        );

        let tape = null;
        if (drywallConfig.tapeEnabled) {
          tape = await findOrCreateMaterial("Výstužná páska", null, null, null, "bm", "ks", 1);
        }
        let compound = null;
        if (drywallConfig.compoundEnabled) {
          compound = await findOrCreateMaterial("Tmel na škáry", null, null, null, "kg", "vrece", 25);
        }
        let insulation = null;
        if (drywallConfig.insulationEnabled) {
          insulation = await findOrCreateMaterial("Minerálna vlna", null, null, null, "m2", "bal", 1);
        }

        const allMaterials = [...materials]; 
        const newMaterials = [board, cw, uw, screws, tape, compound, insulation].filter(Boolean);
        for (const nm of newMaterials) {
          if (!allMaterials.find(m => m.id === nm.id)) allMaterials.push(nm);
        }

        const materialDefs = toMaterialDefinitions(allMaterials);

        const selections = [
          { ruleCode: "drywall_board" as const, materialId: board.id, required: true },
          { ruleCode: "drywall_uw" as const, materialId: uw.id, required: true },
          { ruleCode: "drywall_cw" as const, materialId: cw.id, required: true },
          { ruleCode: "drywall_screws" as const, materialId: screws.id, required: false },
          ...(tape ? [{ ruleCode: "drywall_joint_tape" as const, materialId: tape.id, required: false }] : []),
          ...(compound ? [{ ruleCode: "drywall_joint_compound" as const, materialId: compound.id, required: false }] : []),
          ...(insulation ? [{ ruleCode: "drywall_insulation" as const, materialId: insulation.id, required: false }] : []),
        ];

        const config = createDrywallConfiguration(materialDefs, selections);

        setConfigData({
          materials: materialDefs,
          systemMaterials: config.systemMaterials,
          rules: config.rules,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepodarilo sa pripraviť materiály.");
      } finally {
        setLoading(false);
      }
    }
    void prepare();
  }, [drywallConfig, materials]);

  if (loading) return <div className="p-10 text-center text-slate-600">Pripravujem materiály a ukladám do databázy...</div>;
  if (error) return <div className="p-10 text-center text-red-600">Chyba: {error}</div>;

  return (
    <DrywallPartitionCalculator
      config={drywallConfig}
      materials={configData.materials}
      systemMaterials={configData.systemMaterials}
      rules={configData.rules}
      onBack={onBack}
    />
  );
}