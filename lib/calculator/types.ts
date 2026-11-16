// lib/calculator/types.ts


export type CalculationUnit =
  | "m"
  | "bm"
  | "m2"
  | "m3"
  | "kg"
  | "l"
  | "ks";

export type GeometryType =
  | "wall"
  | "floor"
  | "ceiling"
  | "slope"
  | "volume"
  | "custom";

export type Dimensions = {
  length?: number;
  width?: number;
  height?: number;
  thickness?: number;
};

export type Opening = {
  id?: string;
  name: string;
  type?: "window" | "door" | "other";
  width: number;
  height: number;
  depth?: number;
  includeReveal?: boolean;
};

export type WallInput = {
  geometryType: "wall";
  dimensions: {
    length: number;
    height: number;
    unit: "mm";
  };
  openings?: Opening[];
  wastePercent?: number;
};

export type FloorInput = {
  geometryType: "floor";
  dimensions: {
    length: number;
    width: number;
    unit: "mm";
  };
  wastePercent?: number;
};

export type CeilingInput = {
  geometryType: "ceiling";
  dimensions: {
    length: number;
    width: number;
    unit: "mm";
  };
  wastePercent?: number;
};

export type SlopeInput = {
  geometryType: "slope";
  dimensions: {
    width: number;
    slopeLength: number;
    unit: "mm";
  };
  wastePercent?: number;
};

export type GeometryResult = {
  geometryType: GeometryType;
  netArea?: number;
  netVolume?: number;
  netLength?: number;
  openingsArea?: number;
  revealArea?: number;
  areaWithWaste?: number;
  volumeWithWaste?: number;
  wastePercent: number;
};

export type MaterialCalculationType =
  | "area_consumption"
  | "piece_by_area"
  | "length"
  | "volume"
  | "pieces"
  | "weight"
  | "liquid_volume"
  | "package";

export type CalculationMaterial = {
  id?: string;
  name: string;
  calculationType: MaterialCalculationType;
  calculationUnit: CalculationUnit;
  width?: number;
  height?: number;
  length?: number;
  purchaseUnit?: string;
  purchaseQuantity?: number;
  consumption?: number;
  wastePercent?: number;
  unitPrice?: number;
};

export type MaterialResult = {
  materialId?: string;
  materialName: string;
  calculatedQuantity: number;
  calculationUnit: CalculationUnit;
  purchaseQuantity?: number;
  purchaseUnit?: string;
  purchaseCount?: number;
  unitPrice?: number;
  totalPrice?: number;
};

export type CalculationResult = {
  geometry: GeometryResult;
  materials: MaterialResult[];
  totalMaterialPrice?: number;
};

// ======================================================
// NOVÝ MODEL STAVIO
// ======================================================

// Kategórie konštrukcií
export type ConstructionCategory =
  | "wall"
  | "ceiling"
  | "floor"
  | "slope"
  | "shelter";

// Konkrétne typy konštrukcií
export type ConstructionType =
  | "drywall_partition"
  | "brick_wall"
  | "ytong_wall"
  | "wooden_wall"
  | "drywall_ceiling"
  | "laminate_floor"
  | "vinyl_floor"
  | "tile_floor"
  | "screed_floor"
  | "custom";

// Pôvod skladby alebo materiálu
export type DataSource =
  | "reference"
  | "custom";

// Stav technického overenia
export type VerificationStatus =
  | "verified"
  | "unverified"
  | "user_defined";

// Základné hodnoty parametrov
export type ParameterValue =
  | number
  | string
  | boolean;

// Rozmery konštrukcie v milimetroch
export type ConstructionDimensions = {
  length?: number;
  width?: number;
  height?: number;
  thickness?: number;
  slopeLength?: number;
  unit: "mm";
};

// Vstupy konkrétnej konštrukcie
export type ConstructionInput = {
  category: ConstructionCategory;
  type: ConstructionType;
  dimensions: ConstructionDimensions;
  openings?: Opening[];
  parameters: Record<string, ParameterValue>;
};

// Základný opis konštrukcie
export type ConstructionDefinition = {
  id: string;
  name: string;
  category: ConstructionCategory;
  type: ConstructionType;
  description?: string;
};

// Hodnoty, ktoré môžu byť súčasťou
// vlastného nastavenia materiálu
export type MaterialDimensions = {
  width?: number;
  height?: number;
  length?: number;
  thickness?: number;
  unit: "mm";
};

// Spotreba materiálu
export type MaterialConsumption = {
  value: number;
  unit: string;
  basis:
    | "m2"
    | "bm"
    | "m3"
    | "ks"
    | "manual";
};

// Nákupné balenie
export type MaterialPackaging = {
  quantity: number;
  unit: string;
};

// Materiál v STAVIO
export type MaterialDefinition = {
  id: string;
  ownerId?: string;

  name: string;
  description?: string;
  manufacturer?: string;
  productCode?: string;

  source: DataSource;
  verification: VerificationStatus;

  categoryId?: string;
  calculationTypeId?: string;

  calculationUnit: CalculationUnit;
  dimensions?: MaterialDimensions;
  consumption?: MaterialConsumption;
  packaging?: MaterialPackaging;

  wastePercent?: number;
  unitPrice?: number;
  currency?: "EUR";

  isActive: boolean;
};

// Materiál použitý v konkrétnej skladbe
export type SystemMaterialRole =
  | "board"
  | "profile"
  | "insulation"
  | "screw"
  | "anchor"
  | "joint_tape"
  | "joint_compound"
  | "other";

export type SystemMaterial = {
  id: string;
  materialId: string;
  role: SystemMaterialRole;

  required: boolean;
  ruleId: string;

  // Úpravy parametrov pre konkrétnu skladbu.
  // Nenahrádzajú pôvodné údaje materiálu.
  overrides?: {
    width?: number;
    height?: number;
    length?: number;
    thickness?: number;
    consumption?: number;
    packageQuantity?: number;
    wastePercent?: number;
  };
};

// Výpočtové pravidlá
export type CalculationFormula =
  | "area_consumption"
  | "piece_by_area"
  | "linear_spacing"
  | "perimeter"
  | "opening_perimeter"
  | "fixed_per_unit"
  | "area_to_volume"
  | "volume_consumption"
  | "manual";

export type CalculationRule = {
  id: string;
  code: string;
  name: string;
  description?: string;

  formula: CalculationFormula;

  // Napríklad rozostup, počet vrstiev
  // alebo spotreba podľa technického listu.
  parameters: Record<string, ParameterValue>;

  wastePercent?: number;
  verification: VerificationStatus;

  // Verzia pravidla, aby bolo možné
  // zachovať historické výpočty.
  version: number;
};

// Technické obmedzenia
export type ValidationSeverity =
  | "info"
  | "warning"
  | "error";

export type ValidationCondition = {
  parameter: string;
  min?: number;
  max?: number;
  allowedValues?: ParameterValue[];
};

export type ValidationRule = {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  conditions: ValidationCondition[];
};

// Kompletná skladba
export type ConstructionSystem = {
  id: string;
  name: string;
  description?: string;

  category: ConstructionCategory;
  constructionType: ConstructionType;

  source: DataSource;
  ownerId?: string;

  manufacturer?: string;
  manufacturerCode?: string;

  version: number;
  verification: VerificationStatus;

  materials: SystemMaterial[];
  rules: CalculationRule[];
  validations: ValidationRule[];

  isActive: boolean;
};

// Výsledná materiálová položka
export type MaterialRequirement = {
  materialId?: string;
  materialName: string;
  role: SystemMaterialRole;

  requiredQuantity: number;
  calculationUnit: CalculationUnit;

  purchaseCount?: number;
  purchaseUnit?: string;
  purchaseQuantity?: number;

  wastePercent?: number;
  unitPrice?: number;
  totalPrice?: number;

  warnings: string[];
};

// Výsledok validácie
export type ValidationMessage = {
  code: string;
  message: string;
  severity: ValidationSeverity;
  parameter?: string;
};

// Výsledok nového kalkulačného jadra
export type ConstructionCalculationResult = {
  construction: ConstructionDefinition;
  geometry: GeometryResult;

  materials: MaterialRequirement[];

  validation: {
    status: "valid" | "warning" | "invalid";
    messages: ValidationMessage[];
  };

  totalMaterialPrice?: number;
};

// Nemenná snímka použitej skladby
export type CalculationSnapshot = {
  schemaVersion: number;
  calculatedAt: string;

  construction: ConstructionInput;

  system: {
    id: string;
    name: string;
    version: number;
    source: DataSource;
    verification: VerificationStatus;
  };

  materials: {
    materialId?: string;
    name: string;
    parameters: Record<string, ParameterValue>;
    calculatedQuantity: number;
    calculationUnit: CalculationUnit;
    purchaseCount?: number;
    purchaseUnit?: string;
    unitPrice?: number;
    totalPrice?: number;
  }[];

  result: ConstructionCalculationResult;
};