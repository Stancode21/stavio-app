"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Loader2,
  UserRound,
  X,
  Save,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Používateľ nie je prihlásený.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, address, phone, email, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Chyba pri vytváraní zákazníka:", {
  message: error.message,
  details: error.details,
  hint: error.hint,
  code: error.code,
});
      setError("Zákazníkov sa nepodarilo načítať.");
      setLoading(false);
      return;
    }

    setCustomers(data ?? []);
    setLoading(false);
  }

  function openNewCustomer() {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setFormError("");
    setShowNewCustomer(true);
  }

  function closeNewCustomer() {
    if (saving) return;

    setShowNewCustomer(false);
    setFormError("");
  }

  async function handleCreateCustomer(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFormError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setFormError("Zadaj meno alebo názov zákazníka.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Zadaj platnú e-mailovú adresu.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormError("Používateľ nie je prihlásený.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        name: trimmedName,
        phone: trimmedPhone || null,
        email: trimmedEmail || null,
        address: trimmedAddress || null,
      })
      .select("id, name, address, phone, email, created_at")
      .single();

    if (error) {
      console.error("Chyba pri vytváraní zákazníka:", error);
      setFormError("Zákazníka sa nepodarilo uložiť.");
      setSaving(false);
      return;
    }

    setCustomers((current) => [data, ...current]);

    setSaving(false);
    setShowNewCustomer(false);

    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setFormError("");
  }

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  return (
    <>
      <div className="space-y-6">
        {/* Hlavička */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E87524] mb-2">
              Zákazníci
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#292824]">
              Tvoji zákazníci
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#292824]/55 max-w-2xl">
              Maj všetky kontakty zákazníkov prehľadne na jednom mieste.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewCustomer}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E87524] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:bg-[#D9671D]"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            Nový zákazník
          </button>
        </div>

        {/* Súhrn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#292824]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#292824]/40">
                  Celkom zákazníkov
                </p>

                <p className="mt-2 text-2xl font-bold text-[#292824]">
                  {customers.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-[#E87524]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E87524]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#292824]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#292824]/40">
                  Zobrazených
                </p>

                <p className="mt-2 text-2xl font-bold text-[#292824]">
                  {filteredCustomers.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-[#292824]/[0.06] flex items-center justify-center">
                <Search className="w-5 h-5 text-[#292824]/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Vyhľadávanie */}
        <div className="rounded-2xl border border-[#292824]/10 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#292824]/35" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Hľadať podľa mena, e-mailu, telefónu alebo adresy..."
              className="w-full rounded-xl border border-[#292824]/10 bg-[#F8F6F2] py-3 pl-10 pr-4 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/35 focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/10"
            />
          </div>
        </div>

        {/* Obsah */}
        {loading ? (
          <div className="rounded-2xl border border-[#292824]/10 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#E87524]" />

              <p className="mt-4 text-sm font-medium text-[#292824]/55">
                Načítavam zákazníkov...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#292824]/15 bg-white p-10 sm:p-14 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E87524]/10 flex items-center justify-center">
                {search ? (
                  <Search className="w-6 h-6 text-[#E87524]" />
                ) : (
                  <UserRound className="w-6 h-6 text-[#E87524]" />
                )}
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#292824]">
                {search
                  ? "Žiadny zákazník nevyhovuje vyhľadávaniu"
                  : "Zatiaľ nemáš žiadnych zákazníkov"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#292824]/50">
                {search
                  ? "Skús zmeniť hľadaný výraz."
                  : "Keď pridáš prvého zákazníka, zobrazí sa tu jeho kontakt a ďalšie údaje."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openNewCustomer}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E87524] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:bg-[#D9671D]"
                >
                  <Plus className="w-4 h-4" />
                  Pridať prvého zákazníka
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map((customer) => {
              const initials = customer.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-[#292824]/10 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#E87524]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-[#292824] text-white flex items-center justify-center text-sm font-bold">
                      {initials || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-[#292824] truncate">
                        {customer.name}
                      </h2>

                      <div className="mt-3 space-y-2">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-[#292824]/55">
                            <Phone className="w-4 h-4 shrink-0 text-[#E87524]" />
                            <span className="truncate">
                              {customer.phone}
                            </span>
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-[#292824]/55">
                            <Mail className="w-4 h-4 shrink-0 text-[#E87524]" />
                            <span className="truncate">
                              {customer.email}
                            </span>
                          </div>
                        )}

                        {customer.address && (
                          <div className="flex items-start gap-2 text-sm text-[#292824]/55">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#E87524]" />
                            <span className="line-clamp-2">
                              {customer.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal – nový zákazník */}
      {showNewCustomer && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeNewCustomer();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#292824]/10 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#292824]/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E87524] mb-1.5">
                  Zákazníci
                </p>

                <h2 className="text-xl font-bold text-[#292824]">
                  Nový zákazník
                </h2>

                <p className="mt-1 text-sm text-[#292824]/50">
                  Pridaj kontakt do svojho pracovného priestoru.
                </p>
              </div>

              <button
                type="button"
                onClick={closeNewCustomer}
                disabled={saving}
                className="p-2 rounded-xl text-[#292824]/40 hover:text-[#292824] hover:bg-[#292824]/[0.06] transition-colors disabled:opacity-40"
                aria-label="Zavrieť"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer}>
              <div className="px-6 py-6 space-y-5">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-sm font-semibold text-[#292824] mb-2"
                  >
                    Meno a priezvisko / názov
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <input
                    id="customer-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="napr. Ján Novák"
                    autoFocus
                    disabled={saving}
                    className="w-full rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/35 focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/10 disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="block text-sm font-semibold text-[#292824] mb-2"
                    >
                      Telefón
                    </label>

                    <input
                      id="customer-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+421 900 123 456"
                      autoComplete="tel"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/35 focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/10 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customer-email"
                      className="block text-sm font-semibold text-[#292824] mb-2"
                    >
                      E-mail
                    </label>

                    <input
                      id="customer-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="meno@email.sk"
                      autoComplete="email"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/35 focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customer-address"
                    className="block text-sm font-semibold text-[#292824] mb-2"
                  >
                    Adresa
                  </label>

                  <textarea
                    id="customer-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Ulica, číslo, mesto..."
                    rows={3}
                    disabled={saving}
                    className="w-full resize-none rounded-xl border border-[#292824]/15 bg-[#F8F6F2] px-4 py-3 text-sm text-[#292824] outline-none transition placeholder:text-[#292824]/35 focus:border-[#E87524] focus:ring-2 focus:ring-[#E87524]/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-5 bg-[#F8F6F2] border-t border-[#292824]/10">
                <button
                  type="button"
                  onClick={closeNewCustomer}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl border border-[#292824]/15 bg-white px-4 py-3 text-sm font-semibold text-[#292824]/65 transition hover:bg-[#292824]/[0.04] hover:text-[#292824] disabled:opacity-50"
                >
                  Zrušiť
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E87524] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:bg-[#D9671D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ukladám...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Uložiť zákazníka
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}