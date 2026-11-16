
import type {
  MaterialDefinition,
  SystemMaterial,
  SystemMaterialRole,
  CalculationRule,
  CalculationFormula,
  VerificationStatus,
} from "./types";

/**
 * Kódy pravidiel musia zodpovedať pravidlám,
 * ktoré spracováva calculateDrywallPartition().
 */
export type DrywallRuleCode =
  | "drywall_board"
  | "drywall_uw"
  | "drywall_cw"
  | "drywall_insulation"
  | "drywall_screws"
  | "drywall_joint_tape"
  | "drywall_joint_compound";

export type DrywallMaterialSelection = {
  materialId: string;
  ruleCode: DrywallRuleCode;
  required: boolean;
  overrides?: SystemMaterial["overrides"];
};

type RuleDefinition = {
  name: string;
  role: SystemMaterialRole;
  formula: CalculationFormula;
  verification: VerificationStatus;
};

const RULE_DEFINITIONS: Record<
  DrywallRuleCode,
  RuleDefinition
> = {
  drywall_board: {
    name: "Sadrokartónové dosky",
    role: "board",
    formula: "piece_by_area",
    verification: "unverified",
  },
  drywall_uw: {
    name: "Obvodové UW profily",
    role: "profile",
    formula: "perimeter",
    verification: "unverified",
  },
  drywall_cw: {
    name: "Zvislé CW profily",
    role: "profile",
    formula: "linear_spacing",
    verification: "unverified",
  },
  drywall_insulation: {
    name: "Izolácia priečky",
    role: "insulation",
    formula: "area_consumption",
    verification: "unverified",
  },
  drywall_screws: {
    name: "Skrutky do sadrokartónu",
    role: "screw",
    formula: "area_consumption",
    verification: "unverified",
  },
  drywall_joint_tape: {
    name: "Výstužná páska",
    role: "joint_tape",
    formula: "area_consumption",
    verification: "unverified",
  },
  drywall_joint_compound: {
    name: "Tmel na škáry",
    role: "joint_compound",
    formula: "area_consumption",
    verification: "unverified",
  },
};

export type DrywallConfiguration = {
  systemMaterials: SystemMaterial[];
  rules: CalculationRule[];
};

/**
 * Predvolené parametre pre jednotlivé pravidlá.
 * Tieto hodnoty môže používateľ prepísať v UI.
 */
function getDefaultParameters(
  ruleCode: DrywallRuleCode,
): Record<string, number> {
  switch (ruleCode) {
    case "drywall_screws":
      return {
        screwsPerM2: 25,
      };
    case "drywall_joint_tape":
      return {
        tapePerM2: 1.5,
      };
    case "drywall_joint_compound":
      return {
        consumptionPerM2: 0.4,
      };
    default:
      return {};
  }
}

/**
 * Vytvorí väzby medzi existujúcimi materiálmi
 * a pravidlami výpočtu SDK priečky.
 *
 * Materiály sa neukladajú ani nemenia.
 */
export function createDrywallConfiguration(
  materials: MaterialDefinition[],
  selections: DrywallMaterialSelection[],
): DrywallConfiguration {
  const systemMaterials: SystemMaterial[] = [];
  const rules: CalculationRule[] = [];

  const usedRuleCodes = new Set<DrywallRuleCode>();

  for (const selection of selections) {
    const material = materials.find(
      (item) => item.id === selection.materialId,
    );

    if (!material) {
      throw new Error(
        `Materiál s ID ${selection.materialId} nebol nájdený.`,
      );
    }

    const definition = RULE_DEFINITIONS[selection.ruleCode];
    const ruleId = `drywall:${selection.ruleCode}`;

    systemMaterials.push({
      id: `drywall:${selection.ruleCode}:${material.id}`,
      materialId: material.id,
      role: definition.role,
      required: selection.required,
      ruleId,
      overrides: selection.overrides,
    });

    if (!usedRuleCodes.has(selection.ruleCode)) {
rules.push({
  id: ruleId,
  code: selection.ruleCode,
  name: definition.name,
  formula: definition.formula,
  parameters: getDefaultParameters(selection.ruleCode),
  verification: definition.verification,
  version: 1,
});

      usedRuleCodes.add(selection.ruleCode);
    }
  }

  return {
    systemMaterials,
    rules,
  };
}
