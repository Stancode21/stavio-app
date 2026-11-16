"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HardHat, Loader2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#F3F0EA] flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E87524] flex items-center justify-center shadow-lg shadow-orange-900/15">
            <HardHat
              className="w-7 h-7 text-white"
              strokeWidth={2.2}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-[#292824]/55">
            <Loader2 className="w-4 h-4 animate-spin text-[#E87524]" />
            Overujem prihlásenie...
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}