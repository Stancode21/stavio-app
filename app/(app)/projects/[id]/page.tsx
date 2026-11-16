"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Hammer,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  customers: Customer | Customer[] | null;
};

function getCustomer(project: Project): Customer | null {
  if (!project.customers) {
    return null;
  }

  if (Array.isArray(project.customers)) {
    return project.customers[0] ?? null;
  }

  return project.customers;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getProjectStatus(project: Project) {
  return project.description?.toLowerCase().includes("dokončen")
    ? "Dokončený"
    : "Aktívny";
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchProjectDetail() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("projects")
          .select(
            `
              id,
              name,
              description,
              created_at,
              customers (
                id,
                name,
                address,
                phone,
                email
              )
            `
          )
          .eq("id", projectId)
          .single();

        if (error) {
          throw error;
        }

        setProject(data as Project);
      } catch (err) {
        console.error("Chyba pri načítaní detailu projektu:", err);
        setError("Nepodarilo sa načítať detail projektu.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetail();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#f3f0ea]">
        <div className="mx-auto max-w-6xl py-12">
          <div className="rounded-2xl border border-[#e4dfd6] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#eadfd5] border-t-[#e87524]" />
            <p className="text-sm font-medium text-[#625d57]">
              Načítavam projekt...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-full bg-[#f3f0ea]">
        <div className="mx-auto max-w-6xl py-12">
          <div className="rounded-2xl border border-[#e4dfd6] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileText className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[#292824]">
              Projekt sa nepodarilo načítať
            </h1>

            <p className="mt-2 text-sm text-[#827c74]">
              {error || "Projekt nebol nájdený."}
            </p>

            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#292824] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3b3934]"
            >
              <ArrowLeft className="h-4 w-4" />
              Späť na projekty
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customer = getCustomer(project);
  const status = getProjectStatus(project);
  const isCompleted = status === "Dokončený";

  return (
    <div className="min-h-full bg-[#f3f0ea]">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <section>
          <Link
            href="/projects"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#77716a] transition hover:text-[#e87524]"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na projekty
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8ca] bg-[#fff7f1] px-3 py-1 text-xs font-bold text-[#c65e17]">
                  <Hammer className="h-3.5 w-3.5" />
                  Stavebný projekt
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-orange-200 bg-orange-50 text-[#c65e17]"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {status}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#292824] sm:text-4xl">
                {project.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77716a] sm:text-base">
                {project.description || "Bez popisu projektu."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#827c74]">
              <CalendarDays className="h-4 w-4" />
              Vytvorené {formatDate(project.created_at)}
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            className="group flex items-center justify-between rounded-2xl border border-[#e4dfd6] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e0cdbd] hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1e7] text-[#e87524]">
                <Calculator className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-[#292824]">Kalkulácie</p>
                <p className="mt-0.5 text-xs text-[#8a847c]">
                  Výpočty materiálu a ceny
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-[#aaa39a] transition group-hover:translate-x-1 group-hover:text-[#e87524]" />
          </button>

          <button
            type="button"
            className="group flex items-center justify-between rounded-2xl border border-[#e4dfd6] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e0cdbd] hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3ed] text-[#c84c32]">
                <ClipboardList className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-[#292824]">Položky projektu</p>
                <p className="mt-0.5 text-xs text-[#8a847c]">
                  Miestnosti a stavebné práce
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-[#aaa39a] transition group-hover:translate-x-1 group-hover:text-[#c84c32]" />
          </button>

          <button
            type="button"
            className="group flex items-center justify-between rounded-2xl border border-[#e4dfd6] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e0cdbd] hover:shadow-lg sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f2ec] text-[#5f5a54]">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-[#292824]">Dokumenty</p>
                <p className="mt-0.5 text-xs text-[#8a847c]">
                  Ponuky a výstupy
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-[#aaa39a] transition group-hover:translate-x-1 group-hover:text-[#5f5a54]" />
          </button>
        </section>

        {/* PROJECT + CUSTOMER */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* PROJECT INFO */}
          <div className="rounded-2xl border border-[#e4dfd6] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3 border-b border-[#eee9e1] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8eee7] text-[#e87524]">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-[#292824]">
                  Informácie o projekte
                </h2>
                <p className="text-xs text-[#8a847c]">
                  Základné údaje zákazky
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                  Názov projektu
                </p>
                <p className="text-sm font-semibold text-[#403c37]">
                  {project.name}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                  Popis
                </p>
                <p className="text-sm leading-6 text-[#625d57]">
                  {project.description || "Bez popisu projektu."}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    Stav
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isCompleted ? "bg-emerald-500" : "bg-[#e87524]"
                      }`}
                    />
                    <span className="text-sm font-semibold text-[#403c37]">
                      {status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    Vytvorené
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-[#403c37]">
                    <CalendarDays className="h-4 w-4 text-[#9b948b]" />
                    {formatDate(project.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rounded-2xl border border-[#e4dfd6] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3 border-b border-[#eee9e1] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3ed] text-[#c84c32]">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-[#292824]">Zákazník</h2>
                <p className="text-xs text-[#8a847c]">
                  Kontaktné údaje zákazníka
                </p>
              </div>
            </div>

            {customer ? (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    Meno
                  </p>
                  <p className="text-sm font-semibold text-[#403c37]">
                    {customer.name || "Neuvedené"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    Adresa
                  </p>

                  <div className="flex items-start gap-2 text-sm text-[#625d57]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9b948b]" />
                    <span>{customer.address || "Adresa neuvedená"}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    Telefón
                  </p>

                  <div className="flex items-center gap-2 text-sm text-[#625d57]">
                    <Phone className="h-4 w-4 text-[#9b948b]" />
                    <span>{customer.phone || "Telefón neuvedený"}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#999188]">
                    E-mail
                  </p>

                  <div className="flex items-center gap-2 text-sm text-[#625d57]">
                    <Mail className="h-4 w-4 text-[#9b948b]" />
                    <span className="truncate">
                      {customer.email || "E-mail neuvedený"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-[#d9d2c8] bg-[#faf9f6] p-6 text-center">
                <UserRound className="mx-auto h-6 w-6 text-[#aaa39a]" />

                <p className="mt-3 text-sm font-semibold text-[#625d57]">
                  Projekt nemá priradeného zákazníka
                </p>

                <p className="mt-1 text-xs leading-5 text-[#999188]">
                  Zákazníka bude možné priradiť neskôr.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CALCULATIONS PLACEHOLDER */}
        <section className="overflow-hidden rounded-2xl border border-[#e4dfd6] bg-white shadow-sm">
          <div className="border-b border-[#eee9e1] p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1e7] text-[#e87524]">
                  <Calculator className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[#292824]">
                    Kalkulácie a položky projektu
                  </h2>
                  <p className="text-xs text-[#8a847c]">
                    Miesto pre budúce výpočty a stavebné položky
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f1eee8] px-4 py-2.5 text-sm font-semibold text-[#aaa39a] cursor-not-allowed"
              >
                <Hammer className="h-4 w-4" />
                Pridať položku
              </button>
            </div>
          </div>

          <div className="p-10 text-center sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8eee7] text-[#e87524]">
              <Calculator className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#292824]">
              Kalkulácia projektu bude čoskoro
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#827c74]">
              Sem neskôr pridáme miestnosti, stavebné práce, systémy,
              materiály, množstvá a výslednú cenu projektu.
            </p>

            <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-4">
              {["Miestnosti", "Práce", "Materiály", "Cena"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[#eee9e1] bg-[#faf9f6] px-3 py-3 text-xs font-semibold text-[#77716a]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}