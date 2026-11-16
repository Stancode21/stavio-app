"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calculator,
  Package,
  Settings,
  X,
  HardHat,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SidebarProps = {
  onCloseMobile?: () => void;
};

const navigation = [
  {
    name: "Prehľad",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projekty",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Zákazníci",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Kalkulácie",
    href: "/calculations",
    icon: Calculator,
  },
  {
    name: "Materiály",
    href: "/materials",
    icon: Package,
  },
  {
    name: "Nastavenia",
    href: "/settings",
    icon: Settings,
  },
];

function getInitials(email: string) {
  const name = email.split("@")[0].trim();

  if (!name) {
    return "ST";
  }

  const parts = name
    .split(/[._-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    onCloseMobile?.();
    router.replace("/login");
    router.refresh();
  }

  const initials = userEmail ? getInitials(userEmail) : "ST";

  return (
    <aside className="h-full bg-[#292824] text-white flex flex-col border-r border-black/10">
      {/* Logo */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-white/10">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E87524] flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
            <HardHat
              className="w-5 h-5 text-white"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <div className="text-lg font-extrabold tracking-wide text-white">
              STAVIO
            </div>

            <div className="text-[11px] text-white/45 font-medium">
              stavebné kalkulácie
            </div>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Zavrieť menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigácia */}
      <div className="px-3 pt-6">
        <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.16em] font-semibold text-white/30">
          Pracovný priestor
        </p>

        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E87524] text-white shadow-lg shadow-orange-950/20"
                    : "text-white/55 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-white/40 group-hover:text-[#E87524]"
                  }`}
                  strokeWidth={1.9}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Používateľ */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                Prihlásený používateľ
              </p>

              <p
                className="text-[11px] text-white/35 truncate"
                title={userEmail}
              >
                {userEmail || "Načítavam..."}
              </p>
            </div>
          </div>

          {/* Odhlásenie */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/55 transition-colors hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.9} />
            Odhlásiť sa
          </button>
        </div>
      </div>
    </aside>
  );
}