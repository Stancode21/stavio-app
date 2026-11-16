
import { supabase } from "@/lib/supabase";

import type {
  CalculationMaterial,
  MaterialCalculationType,
  CalculationUnit,
} from "./types";

type SupabaseMaterialRow = {
  id: string;
  name: string;
  calculation_unit: string | null;
  purchase_unit: string | null;
  purchase_quantity: number | null;
  consumption: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  waste_percent: number | null;
  calculation_type_id: string | null;
};

type SupabaseCalculationTypeRow = {
  id: string;
  code: string;
};

function isCalculationType(
  value: string
): value is MaterialCalculationType {
  return [
    "area_consumption",
    "piece_by_area",
    "length",
    "volume",
    "pieces",
    "weight",
    "liquid_volume",
    "package",
  ].includes(value);
}

function isCalculationUnit(
  value: string
): value is CalculationUnit {
  return [
    "m",
    "bm",
    "m2",
    "m3",
    "kg",
    "l",
    "ks",
  ].includes(value);
}

function mapMaterial(
  row: SupabaseMaterialRow,
  calculationTypeMap: Map<string, string>
): CalculationMaterial {
  if (!row.calculation_type_id) {
    throw new Error(
      `Materiál "${row.name}" nemá priradený typ výpočtu.`
    );
  }

  const calculationType =
    calculationTypeMap.get(row.calculation_type_id);

  if (!calculationType) {
    throw new Error(
      `Materiál "${row.name}" odkazuje na neexistujúci typ výpočtu.`
    );
  }

  if (!isCalculationType(calculationType)) {
    throw new Error(
      `Materiál "${row.name}" má nepodporovaný typ výpočtu: ${calculationType}`
    );
  }

  const calculationUnit = row.calculation_unit;

  if (!calculationUnit) {
    throw new Error(
      `Materiál "${row.name}" nemá zadanú calculation_unit.`
    );
  }

  if (!isCalculationUnit(calculationUnit)) {
    throw new Error(
      `Materiál "${row.name}" má nepodporovanú calculation_unit: ${calculationUnit}`
    );
  }

  return {
    id: row.id,
    name: row.name,
    calculationType,
    calculationUnit,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    length: row.length ?? undefined,
    purchaseUnit: row.purchase_unit ?? undefined,
    purchaseQuantity: row.purchase_quantity ?? undefined,
    consumption: row.consumption ?? undefined,
    wastePercent: row.waste_percent ?? undefined,
    unitPrice: undefined,
  };
}

async function getCalculationTypeMap(): Promise<
  Map<string, string>
> {
  const { data, error } = await supabase
    .from("material_calculation_types")
    .select("id, code");

  if (error) {
    throw new Error(
      `Nepodarilo sa načítať typy výpočtov materiálov: ${error.message}`
    );
  }

  const map = new Map<string, string>();

  for (
    const row of (data ?? []) as SupabaseCalculationTypeRow[]
  ) {
    map.set(row.id, row.code);
  }

  return map;
}

export async function getMaterials(): Promise<
  CalculationMaterial[]
> {
  const [materialsResult, calculationTypeMap] =
    await Promise.all([
      supabase
        .from("materials")
        .select(`
          id,
          name,
          calculation_unit,
          purchase_unit,
          purchase_quantity,
          consumption,
          width,
          height,
          length,
          waste_percent,
          calculation_type_id
        `)
        .order("name"),
      getCalculationTypeMap(),
    ]);

  if (materialsResult.error) {
    throw new Error(
      `Nepodarilo sa načítať materiály: ${materialsResult.error.message}`
    );
  }

  return (
    (materialsResult.data ?? []) as SupabaseMaterialRow[]
  ).map((row) => mapMaterial(row, calculationTypeMap));
}

export async function getMaterialById(
  materialId: string
): Promise<CalculationMaterial | null> {
  const [materialResult, calculationTypeMap] =
    await Promise.all([
      supabase
        .from("materials")
        .select(`
          id,
          name,
          calculation_unit,
          purchase_unit,
          purchase_quantity,
          consumption,
          width,
          height,
          length,
          waste_percent,
          calculation_type_id
        `)
        .eq("id", materialId)
        .maybeSingle(),
      getCalculationTypeMap(),
    ]);

  if (materialResult.error) {
    throw new Error(
      `Nepodarilo sa načítať materiál: ${materialResult.error.message}`
    );
  }

  if (!materialResult.data) {
    return null;
  }

  return mapMaterial(
    materialResult.data as SupabaseMaterialRow,
    calculationTypeMap
  );
}

// Pridaj na koniec súboru materials-db.ts


export async function findOrCreateMaterial(
  name: string,
  width: number | null,
  height: number | null,
  length: number | null,
  unit: string,
  purchaseUnit: string,
  purchaseQuantity: number
) {
  // 1. Skúsime nájsť materiál, ktorý presne zodpovedá parametrom
  let query = supabase
    .from("materials")
    .select("*")
    .eq("name", name)
    .eq("unit", unit);

  if (width !== null) query = query.eq("width", width);
  if (height !== null) query = query.eq("height", height);
  if (length !== null) query = query.eq("length", length);

  const { data: existing, error: searchError } = await query.maybeSingle();

  if (searchError) {
    console.error("Chyba pri hľadaní materiálu:", searchError);
  }

  // 2. Ak existuje, vrátime ho
  if (existing) {
    return existing;
  }

  // 3. Ak neexistuje, vytvoríme nový
  const { data: created, error: createError } = await supabase
    .from("materials")
    .insert({
      name: name,
      width: width,
      height: height,
      length: length,
      unit: unit,
      calculation_unit: unit,
      dimension_unit: "mm",
      purchase_unit: purchaseUnit,
      purchase_quantity: purchaseQuantity,
      is_system: false, // Používateľský materiál
      waste_percent: 5,
    })
    .select()
    .single();

  if (createError) {
    console.error("Chyba pri vytváraní materiálu:", createError);
    throw new Error("Nepodarilo sa vytvoriť materiál v databáze.");
  }

  return created;
}