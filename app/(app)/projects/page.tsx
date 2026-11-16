"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronDown,
  FolderKanban,
  MapPin,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  name: string | null;
  address: string | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  customers: Customer | Customer[] | null;
};

type ProjectStatus = "Aktívny" | "Dokončený";

function getCustomer(project: Project): Customer | null {
  if (!project.customers) {
    return null;
  }

  if (Array.isArray(project.customers)) {
    return project.customers[0] ?? null;
  }

  return project.customers;
}

function getProjectStatus(project: Project): ProjectStatus {
  return project.description?.toLowerCase().includes("dokončen")
    ? "Dokončený"
    : "Aktívny";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Všetky" | ProjectStatus
  >("Všetky");

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("projects")
          .select(`
            id,
            name,
            description,
            created_at,
            customers (
              name,
              address
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setProjects((data as Project[]) || []);
      } catch (err) {
        console.error("Chyba pri načítaní projektov:", err);
        setError("Nepodarilo sa načítať zoznam projektov.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const customer = getCustomer(project);
      const status = getProjectStatus(project);

      const matchesSearch =
        !normalizedSearch ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        customer?.name?.toLowerCase().includes(normalizedSearch) ||
        customer?.address?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "Všetky" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const activeProjects = projects.filter(
    (project) => getProjectStatus(project) === "Aktívny"
  ).length;

  const completedProjects = projects.filter(
    (project) => getProjectStatus(project) === "Dokončený"
  ).length;

  return (
    <div className="min-h-full bg-[#f3f0ea]">
      {/* Page heading */}
      <section className="mb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e87524]">
              Pracovný priestor
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#292824] sm:text-4xl">
              Projekty
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77716a] sm:text-base">
              Spravujte svoje stavebné zákazky, zákazníkov a kalkulácie
              prehľadne na jednom mieste.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e87524] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/10 transition hover:bg-[#d9681b] hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Nový projekt
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e4dfd6] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8eee7] text-[#e87524]">
              <FolderKanban className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a847c]">
                Všetky projekty
              </p>
              <p className="mt-0.5 text-2xl font-bold text-[#292824]">
                {projects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4dfd6] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2e8] text-[#c84c32]">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a847c]">
                Aktívne
              </p>
              <p className="mt-0.5 text-2xl font-bold text-[#292824]">
                {activeProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4dfd6] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FolderKanban className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a847c]">
                Dokončené
              </p>
              <p className="mt-0.5 text-2xl font-bold text-[#292824]">
                {completedProjects}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section className="mb-6 rounded-2xl border border-[#e4dfd6] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999188]" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Hľadať projekt, zákazníka alebo adresu..."
              className="w-full rounded-xl border border-[#ddd7ce] bg-[#faf9f6] py-3 pl-11 pr-4 text-sm text-[#292824] outline-none transition placeholder:text-[#aaa39a] focus:border-[#e87524] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "Všetky" | ProjectStatus
                )
              }
              className="w-full appearance-none rounded-xl border border-[#ddd7ce] bg-[#faf9f6] py-3 pl-4 pr-10 text-sm font-medium text-[#4d4944] outline-none transition focus:border-[#e87524] focus:bg-white focus:ring-4 focus:ring-orange-500/10 sm:w-48"
            >
              <option value="Všetky">Všetky projekty</option>
              <option value="Aktívny">Aktívne</option>
              <option value="Dokončený">Dokončené</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d877f]" />
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Projects */}
      {loading ? (
        <section className="rounded-2xl border border-[#e4dfd6] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#eadfd5] border-t-[#e87524]" />

          <p className="text-sm font-medium text-[#625d57]">
            Načítavam projekty...
          </p>
        </section>
      ) : filteredProjects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#d8d1c7] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8eee7] text-[#e87524]">
            <FolderKanban className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#292824]">
            {projects.length === 0
              ? "Zatiaľ nemáte žiadne projekty"
              : "Žiadny projekt nevyhovuje vyhľadávaniu"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#827c74]">
            {projects.length === 0
              ? "Vytvorte svoj prvý projekt a začnite mať svoje stavebné zákazky pod kontrolou."
              : "Skúste zmeniť vyhľadávanie alebo filter a skúste to znova."}
          </p>

          {projects.length === 0 && (
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e87524] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d9681b]"
            >
              <Plus className="h-4 w-4" />
              Vytvoriť prvý projekt
            </button>
          )}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const customer = getCustomer(project);
            const status = getProjectStatus(project);
            const isCompleted = status === "Dokončený";

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e4dfd6] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#d9c9bb] hover:shadow-xl hover:shadow-black/5"
              >
                {/* Card accent */}
                <div
                  className={`h-1.5 w-full ${
                    isCompleted ? "bg-emerald-500" : "bg-[#e87524]"
                  }`}
                />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8eee7] text-[#e87524]">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-orange-200 bg-orange-50 text-[#c65e17]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h2 className="mt-5 line-clamp-2 text-lg font-bold text-[#292824] transition group-hover:text-[#d9681b]">
                    {project.name}
                  </h2>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-[#827c74]">
                    {project.description || "Bez popisu projektu"}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-[#eee9e1] pt-5">
                    <div className="flex items-center gap-3 text-sm">
                      <UserRound className="h-4 w-4 shrink-0 text-[#a09a92]" />

                      <span className="truncate text-[#5e5953]">
                        {customer?.name || "Bez zákazníka"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 shrink-0 text-[#a09a92]" />

                      <span className="truncate text-[#7d776f]">
                        {customer?.address || "Adresa neuvedená"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="h-4 w-4 shrink-0 text-[#a09a92]" />

                      <span className="text-[#7d776f]">
                        Vytvorené {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#eee9e1] pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#9a938a]">
                      Otvoriť projekt
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f5f0] text-[#77716a] transition group-hover:bg-[#e87524] group-hover:text-white">
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {/* Footer hint */}
      {!loading && filteredProjects.length > 0 && (
        <div className="mt-6 text-center text-xs text-[#9a938a]">
          Zobrazené projekty: {filteredProjects.length} z {projects.length}
        </div>
      )}
    </div>
  );
}