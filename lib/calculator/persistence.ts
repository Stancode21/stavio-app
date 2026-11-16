import { supabase } from "@/lib/supabase";

import type {
  CalculationResult,
  CalculationMaterial,
} from "./types";

export type SaveCalculationInput = {
  projectId: string;
  projectItemId?: string;
  name: string;
  calculationType: string;
  calculationTypeId?: string;
  inputs: Record<string, unknown>;
};

export type SavedCalculation = {
  id: string;
};

function buildCalculationData(
  material: CalculationMaterial,
  result: CalculationResult["materials"][number],
  baseQuantity: number
) {
  return {
    calculationType:
      material.calculationType,

    calculationUnit:
      material.calculationUnit,

    baseQuantity,

    width:
      material.width ?? null,

    height:
      material.height ?? null,

    length:
      material.length ?? null,

    consumption:
      material.consumption ?? null,

    wastePercent:
      material.wastePercent ?? 0,
  };
}

export async function saveCalculation(
  input: SaveCalculationInput,
  result: CalculationResult,
  materials: CalculationMaterial[]
): Promise<SavedCalculation> {
  const baseQuantity =
    result.geometry.netArea ??
    result.geometry.netVolume ??
    result.geometry.netLength ??
    0;

  /*
   * 1. Uloženie hlavného výpočtu
   */
  const { data: calculation, error: calculationError } =
    await supabase
      .from("calculations")
      .insert({
        project_id: input.projectId,

        project_item_id:
          input.projectItemId ?? null,

        name: input.name,

        calculation_type:
          input.calculationType,

        calculation_type_id:
          input.calculationTypeId ?? null,

        inputs:
          input.inputs,
      })
      .select("id")
      .single();

  if (calculationError) {
    throw new Error(
      `Nepodarilo sa uložiť výpočet: ${calculationError.message}`
    );
  }

  /*
   * 2. Ak výpočet nemá materiály,
   *    hlavný výpočet už je uložený.
   */
  if (result.materials.length === 0) {
    return {
      id: calculation.id,
    };
  }

  /*
   * 3. Pripravíme materiálové položky
   */
  const calculationItems = result.materials.map(
    (resultMaterial) => {
      const sourceMaterial =
        materials.find(
          (material) =>
            material.id ===
            resultMaterial.materialId
        );

      return {
        calculation_id:
          calculation.id,

        material_id:
          resultMaterial.materialId ?? null,

        material_name:
          resultMaterial.materialName,

        /*
         * Staršie pole quantity
         * zachovávame kvôli kompatibilite.
         */
        quantity:
          resultMaterial.calculatedQuantity,

        unit:
          resultMaterial.calculationUnit,

        consumption:
          sourceMaterial?.consumption ??
          null,

        waste_percent:
          sourceMaterial?.wastePercent ??
          null,

        /*
         * Cena je snapshot výpočtu.
         */
        unit_price:
          resultMaterial.unitPrice ??
          null,

        total_price:
          resultMaterial.totalPrice ??
          null,

        /*
         * Detailný snapshot výpočtu
         * konkrétneho materiálu.
         */
        calculation_data:
          sourceMaterial
            ? buildCalculationData(
                sourceMaterial,
                resultMaterial,
                baseQuantity
              )
            : {
                calculationType: null,
                calculationUnit:
                  resultMaterial.calculationUnit,
                baseQuantity,
              },

        calculated_quantity:
          resultMaterial.calculatedQuantity,

        purchase_quantity:
          resultMaterial.purchaseQuantity ??
          null,

        purchase_unit:
          resultMaterial.purchaseUnit ??
          null,

        purchase_count:
          resultMaterial.purchaseCount ??
          null,
      };
    }
  );

  /*
   * 4. Uloženie všetkých materiálov.
   */
  const { error: itemsError } =
    await supabase
      .from("calculation_items")
      .insert(calculationItems);

  if (itemsError) {
    /*
     * Ak sa nepodarí uložiť položky,
     * odstránime už vytvorený hlavný výpočet.
     *
     * Tým sa vyhneme "polovičnému" výpočtu
     * v databáze.
     */
    await supabase
      .from("calculations")
      .delete()
      .eq("id", calculation.id);

    throw new Error(
      `Nepodarilo sa uložiť položky výpočtu: ${itemsError.message}`
    );
  }

  return {
    id: calculation.id,
  };
}