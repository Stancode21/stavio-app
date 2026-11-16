// lib/calculator/index.ts

import {
  calculateCeiling,
  calculateFloor,
  calculateSlope,
  calculateWall,
} from "./geometry";

import {
  calculateMaterials,
  calculateTotalMaterialPrice,
} from "./materials";

import type {
  CalculationMaterial,
  CalculationResult,
  CeilingInput,
  FloorInput,
  SlopeInput,
  WallInput,
} from "./types";

export function calculateGeometry(
  input:
    | WallInput
    | FloorInput
    | CeilingInput
    | SlopeInput
) {
  switch (input.geometryType) {
    case "wall":
      return calculateWall(input);

    case "floor":
      return calculateFloor(input);

    case "ceiling":
      return calculateCeiling(input);

    case "slope":
      return calculateSlope(input);

    default:
      throw new Error(
        "Tento typ geometrického výpočtu zatiaľ nie je podporovaný."
      );
  }
}

export function calculate(
  input:
    | WallInput
    | FloorInput
    | CeilingInput
    | SlopeInput,
  materials: CalculationMaterial[] = []
): CalculationResult {
  const geometry = calculateGeometry(input);

  /**
   * Materiály dostávajú ČISTÉ množstvo.
   *
   * Odpad geometrie sa tu už nepoužíva.
   * Každý materiál si následne aplikuje svoj vlastný
   * wastePercent.
   */
  const baseQuantity =
    geometry.netArea ??
    geometry.netVolume ??
    geometry.netLength ??
    0;

  const materialResults =
    calculateMaterials(
      materials,
      baseQuantity
    );

  const totalMaterialPrice =
    calculateTotalMaterialPrice(
      materialResults
    );

  return {
    geometry,
    materials: materialResults,
    totalMaterialPrice,
  };
}

export function calculateWallWithMaterials(
  input: WallInput,
  materials: CalculationMaterial[] = []
): CalculationResult {
  return calculate(input, materials);
}

export function calculateFloorWithMaterials(
  input: FloorInput,
  materials: CalculationMaterial[] = []
): CalculationResult {
  return calculate(input, materials);
}

export function calculateCeilingWithMaterials(
  input: CeilingInput,
  materials: CalculationMaterial[] = []
): CalculationResult {
  return calculate(input, materials);
}

export function calculateSlopeWithMaterials(
  input: SlopeInput,
  materials: CalculationMaterial[] = []
): CalculationResult {
  return calculate(input, materials);
}