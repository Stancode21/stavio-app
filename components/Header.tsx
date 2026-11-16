"use client";

import { Menu } from "lucide-react";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
};

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-[#F3F0EA]/95 backdrop-blur-sm border-b border-[#292824]/10 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
      {/* Ľavá strana */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#292824]/65 hover:text-[#292824] hover:bg-[#292824]/[0.06] transition-colors"
          aria-label="Otvoriť menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#292824]">
            Pracovný priestor
          </p>
          <p className="text-[11px] text-[#292824]/45">
            Stavebné kalkulácie a projekty
          </p>
        </div>
      </div>

      {/* Pravá strana */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-[#292824]">
            StaviO Admin
          </p>
          <p className="text-[11px] text-[#292824]/45">
            Pracovný účet
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#292824] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
          ST
        </div>
      </div>
    </header>
  );
}