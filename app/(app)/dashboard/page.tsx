"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Ruler,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Aktívne projekty",
    value: "4",
    description: "projekty v riešení",
    icon: FolderKanban,
  },
  {
    label: "Kalkulácie",
    value: "12",
    description: "tento mesiac",
    icon: Calculator,
  },
  {
    label: "Zákazníci",
    value: "8",
    description: "uložených zákazníkov",
    icon: Users,
  },
  {
    label: "Celková plocha",
    value: "486 m²",
    description: "v aktívnych projektoch",
    icon: Ruler,
  },
];

const projects = [
  {
    name: "Rodinný dom Novák",
    customer: "Ján Novák",
    type: "Novostavba",
    progress: 72,
    status: "Rozpracované",
    statusStyle: "bg-orange-50 text-[#c65e17] border-orange-200",
  },
  {
    name: "Rekonštrukcia bytu",
    customer: "Peter Horváth",
    type: "Rekonštrukcia",
    progress: 45,
    status: "Rozpracované",
    statusStyle: "bg-orange-50 text-[#c65e17] border-orange-200",
  },
  {
    name: "Garáž Kováč",
    customer: "Marek Kováč",
    type: "Novostavba",
    progress: 100,
    status: "Dokončené",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

const quickActions = [
  {
    title: "Nový projekt",
    description: "Vytvorte projekt a pridajte zákazníka",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    title: "Nová kalkulácia",
    description: "Vypočítajte materiál a cenu práce",
    icon: Calculator,
    href: "#",
  },
  {
    title: "Nový zákazník",
    description: "Pridajte zákazníka do databázy",
    icon: Users,
    href: "/customers",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-[#f3f0ea]">
      {/* HEADER */}
      <section className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e87524]">
              Prehľad
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#292824] sm:text-4xl">
              Dobrý deň, vitajte v STAVIO
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77716a] sm:text-base">
              Majte svoje projekty, kalkulácie, zákazníkov a materiály
              prehľadne na jednom mieste.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e87524] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/10 transition hover:bg-[#d9681b] hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Nový projekt
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#e4dfd6] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#77716a]">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#292824]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-[#98928a]">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8eee7] text-[#e87524]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* MAIN GRID */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        {/* PROJECTS */}
        <div className="rounded-2xl border border-[#e4dfd6] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eee9e1] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#292824]">
                Posledné projekty
              </h2>

              <p className="mt-1 text-sm text-[#89837b]">
                Prehľad vašich aktuálnych zákaziek
              </p>
            </div>

            <Link
              href="/projects"
              className="hidden items-center gap-1 text-sm font-semibold text-[#d9681b] transition hover:text-[#b95412] sm:flex"
            >
              Zobraziť všetky
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-[#eee9e1]">
            {projects.map((project) => (
              <div
                key={project.name}
                className="p-5 transition hover:bg-[#fcfaf7] sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#292824]">
                        {project.name}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${project.statusStyle}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#89837b]">
                      {project.customer} · {project.type}
                    </p>
                  </div>

                  <div className="w-full lg:w-56">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#77716a]">
                        Dokončenie
                      </span>

                      <span className="font-bold text-[#393531]">
                        {project.progress} %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#eeeae3]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          project.progress === 100
                            ? "bg-emerald-500"
                            : "bg-[#e87524]"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#eee9e1] p-5 sm:hidden">
            <Link
              href="/projects"
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#ded8cf] px-4 py-2.5 text-sm font-semibold text-[#4b4742] transition hover:bg-[#f8f5f0]"
            >
              Zobraziť všetky projekty
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-[#3b3834] bg-[#292824] p-5 text-white shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f3a15f]">
              Rýchly štart
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Čo chcete dnes vytvoriť?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#bdb8b0]">
              Najčastejšie používané funkcie máte vždy poruke.
            </p>
          </div>

          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              if (action.href === "#") {
                return (
                  <button
                    key={action.title}
                    type="button"
                    disabled
                    className="group flex w-full cursor-not-allowed items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left opacity-75"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e87524] text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {action.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#aaa59e]">
                        {action.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#77716a]">
                      Pripravujeme
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-[#e87524]/50 hover:bg-white/[0.09]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e87524] text-white shadow-md">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#aaa59e]">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#77716a] transition group-hover:translate-x-1 group-hover:text-[#f3a15f]" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="mt-6 rounded-2xl border border-[#e4dfd6] bg-white shadow-sm">
        <div className="border-b border-[#eee9e1] px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-[#292824]">Aktivita</h2>

          <p className="mt-1 text-sm text-[#89837b]">
            Posledné udalosti v STAVIO
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:px-6">
          <div className="flex items-start gap-3 rounded-xl bg-[#faf8f4] p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#3b3834]">
                Projekt dokončený
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8b857d]">
                Garáž Kováč bola označená ako dokončená.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-[#faf8f4] p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#e87524]">
              <Calculator className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#3b3834]">
                Nová kalkulácia
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8b857d]">
                Kalkulácia pre Rodinný dom Novák bola vytvorená.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-[#faf8f4] p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#c84c32]">
              <Clock3 className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#3b3834]">
                Projekt pokračuje
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8b857d]">
                Rekonštrukcia bytu je aktuálne na 45 %.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM INFO */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e4dfd6] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8eee7] text-[#e87524]">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-[#292824]">
                Všetko pod kontrolou
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#77716a]">
                STAVIO vám pomôže mať prehľad o projektoch, kalkuláciách a
                nákladoch bez zbytočného papierovania.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ead8c9] bg-gradient-to-br from-[#fff8f1] to-[#f8eee7] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#d9681b]">
                Tip
              </p>

              <h2 className="mt-2 font-bold text-[#292824]">
                Začnite vytvorením projektu
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#77716a]">
                Zákazník, projekt a následné kalkulácie budú prehľadne
                prepojené na jednom mieste.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#e87524] shadow-sm sm:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}