
import type {
  CalculationMaterial,
  MaterialDefinition,
  MaterialConsumption,
} from "./types";

/**
 * Prevod existujúceho materiálu zo Supabase
 * na nový dátový model STAVIO.
 *
 * Pôvodné načítavanie getMaterials() zostáva nezmenené.
 */

function getConsumptionBasis(
  type: CalculationMaterial["calculationType"],
): MaterialConsumption["basis"] {
  switch (type) {
    case "area_consumption":
    case "piece_by_area":
      return "m2";

    case "length":
      return "bm";

    case "volume":
      return "m3";

    case "pieces":
      return "ks";

    default:
      return "manual";
  }
}

export function toMaterialDefinition(
  material: CalculationMaterial,
): MaterialDefinition {
  const dimensions =
    material.width !== undefined ||
    material.height !== undefined ||
    material.length !== undefined
      ? {
          width: material.width,
          height: material.height,
          length: material.length,
          unit: "mm" as const,
        }
      : undefined;

  const consumption =
    material.consumption !== undefined
      ? {
          value: material.consumption,
          unit: material.calculationUnit,
          basis: getConsumptionBasis(
            material.calculationType,
          ),
        }
      : undefined;

  const packaging =
    material.purchaseQuantity !== undefined &&
    material.purchaseQuantity > 0
      ? {
          quantity: material.purchaseQuantity,
          unit: material.purchaseUnit ?? "ks",
        }
      : undefined;

  return {
    id: material.id ?? material.name,
    name: material.name,

    source: "reference",
    verification: "unverified",

    calculationTypeId: undefined,
    calculationUnit: material.calculationUnit,

    dimensions,
    consumption,
    packaging,

    wastePercent: material.wastePercent,
    unitPrice: material.unitPrice,
    currency: "EUR",

    isActive: true,
  };
}

export function toMaterialDefinitions(
  materials: CalculationMaterial[],
): MaterialDefinition[] {
  return materials.map(toMaterialDefinition);
}
