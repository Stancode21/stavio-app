// lib/calculator/geometry.ts

import type {
  CeilingInput,
  FloorInput,
  GeometryResult,
  Opening,
  SlopeInput,
  WallInput,
} from "./types";

function mmToM(value: number): number {
  return value / 1000;
}

function nonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * Plocha jedného otvoru.
 */
export function calculateOpeningArea(
  opening: Opening
): number {
  const width = mmToM(opening.width);
  const height = mmToM(opening.height);

  return width * height;
}

/**
 * Celková plocha všetkých otvorov.
 */
export function calculateOpeningsArea(
  openings: Opening[] = []
): number {
  return openings.reduce(
    (total, opening) =>
      total + calculateOpeningArea(opening),
    0
  );
}

/**
 * Plocha jednej špalety/revealu.
 *
 * Počítame:
 * 2 × výška × hĺbka
 * +
 * 2 × šírka × hĺbka
 */
export function calculateRevealArea(
  opening: Opening
): number {
  if (
    !opening.includeReveal ||
    !opening.depth ||
    opening.depth <= 0
  ) {
    return 0;
  }

  const width = mmToM(opening.width);
  const height = mmToM(opening.height);
  const depth = mmToM(opening.depth);

  return (
    2 * height * depth +
    2 * width * depth
  );
}

/**
 * Celková plocha špaliet.
 */
export function calculateTotalRevealArea(
  openings: Opening[] = []
): number {
  return openings.reduce(
    (total, opening) =>
      total + calculateRevealArea(opening),
    0
  );
}

/**
 * Výpočet steny.
 *
 * Dôležité:
 * Táto funkcia NEPOČÍTA odpad.
 * Vracia iba čistú výslednú plochu.
 */
export function calculateWall(
  input: WallInput
): GeometryResult {
  const length = mmToM(
    input.dimensions.length
  );

  const height = mmToM(
    input.dimensions.height
  );

  const wallArea =
    length * height;

  const openingsArea =
    calculateOpeningsArea(
      input.openings
    );

  const revealArea =
    calculateTotalRevealArea(
      input.openings
    );

  const netArea = nonNegative(
    wallArea -
      openingsArea +
      revealArea
  );

  return {
    geometryType: "wall",

    netArea,

    openingsArea,

    revealArea,

    wastePercent: 0,
  };
}

/**
 * Výpočet podlahy.
 *
 * Odpad sa tu NEPOČÍTA.
 */
export function calculateFloor(
  input: FloorInput
): GeometryResult {
  const length = mmToM(
    input.dimensions.length
  );

  const width = mmToM(
    input.dimensions.width
  );

  const netArea =
    length * width;

  return {
    geometryType: "floor",

    netArea,

    wastePercent: 0,
  };
}

/**
 * Výpočet stropu.
 *
 * Odpad sa tu NEPOČÍTA.
 */
export function calculateCeiling(
  input: CeilingInput
): GeometryResult {
  const length = mmToM(
    input.dimensions.length
  );

  const width = mmToM(
    input.dimensions.width
  );

  const netArea =
    length * width;

  return {
    geometryType: "ceiling",

    netArea,

    wastePercent: 0,
  };
}

/**
 * Výpočet šikminy.
 *
 * Plocha = šírka × dĺžka šikminy.
 *
 * Odpad sa tu NEPOČÍTA.
 */
export function calculateSlope(
  input: SlopeInput
): GeometryResult {
  const width = mmToM(
    input.dimensions.width
  );

  const slopeLength = mmToM(
    input.dimensions.slopeLength
  );

  const netArea =
    width * slopeLength;

  return {
    geometryType: "slope",

    netArea,

    wastePercent: 0,
  };
}