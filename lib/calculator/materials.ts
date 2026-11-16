// lib/calculator/materials.ts

import type {
  CalculationMaterial,
  MaterialResult,
} from "./types";

function roundQuantity(
  value: number,
  decimals = 2
): number {
  return Number(
    value.toFixed(decimals)
  );
}

function applyMaterialWaste(
  quantity: number,
  wastePercent = 0
): number {
  if (wastePercent <= 0) {
    return quantity;
  }

  return quantity * (
    1 + wastePercent / 100
  );
}

function calculatePurchase(
  requiredQuantity: number,
  purchaseQuantity?: number,
  purchaseUnit?: string
) {
  if (
    purchaseQuantity === undefined ||
    purchaseQuantity <= 0 ||
    !purchaseUnit
  ) {
    return {
      purchaseQuantity: undefined,
      purchaseUnit: undefined,
      purchaseCount: undefined,
    };
  }

  const purchaseCount =
    Math.ceil(
      requiredQuantity /
      purchaseQuantity
    );

  const totalPurchaseQuantity =
    purchaseCount *
    purchaseQuantity;

  return {
    purchaseQuantity:
      roundQuantity(
        totalPurchaseQuantity
      ),

    purchaseUnit,

    purchaseCount,
  };
}

export function calculateMaterial(
  material: CalculationMaterial,
  baseQuantity: number
): MaterialResult {
  const wastePercent =
    material.wastePercent ?? 0;

  let calculatedQuantity = 0;
  let calculationUnit =
    material.calculationUnit;

  switch (
    material.calculationType
  ) {
    case "area_consumption": {
      const rawQuantity =
        baseQuantity *
        (material.consumption ?? 0);

      calculatedQuantity =
        applyMaterialWaste(
          rawQuantity,
          wastePercent
        );

      break;
    }

    case "piece_by_area": {
      if (
        !material.width ||
        !material.height
      ) {
        throw new Error(
          `Materiál "${material.name}" nemá zadanú šírku alebo výšku.`
        );
      }

      const pieceArea =
        (material.width / 1000) *
        (material.height / 1000);

      if (pieceArea <= 0) {
        throw new Error(
          `Materiál "${material.name}" má neplatnú plochu kusu.`
        );
      }

      const requiredArea =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      const pieceCount =
        Math.ceil(
          requiredArea /
          pieceArea
        );

      calculatedQuantity =
        pieceCount;

      calculationUnit = "ks";

      break;
    }

    case "length": {
      calculatedQuantity =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      break;
    }

    case "volume": {
      calculatedQuantity =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      break;
    }

    case "pieces": {
      calculatedQuantity =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      calculationUnit = "ks";

      break;
    }

    case "weight": {
      calculatedQuantity =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      break;
    }

    case "liquid_volume": {
      calculatedQuantity =
        applyMaterialWaste(
          baseQuantity,
          wastePercent
        );

      break;
    }

    case "package": {
      calculatedQuantity =
        Math.ceil(
          applyMaterialWaste(
            baseQuantity,
            wastePercent
          )
        );

      calculationUnit = "ks";

      break;
    }

    default:
      throw new Error(
        `Nepodporovaný typ výpočtu materiálu: ${material.calculationType}`
      );
  }

  const roundedCalculatedQuantity =
    roundQuantity(
      calculatedQuantity
    );

  const purchase =
    calculatePurchase(
      roundedCalculatedQuantity,
      material.purchaseQuantity,
      material.purchaseUnit
    );

  const totalPrice =
    material.unitPrice !== undefined &&
    purchase.purchaseCount !== undefined
      ? roundQuantity(
          purchase.purchaseCount *
          material.unitPrice
        )
      : undefined;

  return {
    materialId:
      material.id,

    materialName:
      material.name,

    calculatedQuantity:
      roundedCalculatedQuantity,

    calculationUnit,

    purchaseQuantity:
      purchase.purchaseQuantity,

    purchaseUnit:
      purchase.purchaseUnit,

    purchaseCount:
      purchase.purchaseCount,

    unitPrice:
      material.unitPrice,

    totalPrice,
  };
}

export function calculateMaterials(
  materials: CalculationMaterial[],
  baseQuantity: number
): MaterialResult[] {
  return materials.map(
    (material) =>
      calculateMaterial(
        material,
        baseQuantity
      )
  );
}

export function calculateTotalMaterialPrice(
  results: MaterialResult[]
): number {
  return roundQuantity(
    results.reduce(
      (total, material) =>
        total +
        (material.totalPrice ?? 0),
      0
    )
  );
}