import type {
  Opening,
  CalculationUnit,
  MaterialDefinition,
  MaterialRequirement,
  SystemMaterial,
  CalculationRule,
  ValidationMessage,
} from "./types";

export type DrywallPartitionInput = {
  length: number;
  height: number;
  openings?: Opening[];

  sides: 1 | 2;
  layersPerSide: number;

  board: {
    width: number;
    height: number;
    wastePercent: number;
  };

  profile: {
    spacing: number;
    stockLength: number;
  };

  insulation: {
    enabled: boolean;
    thickness: number;
    wastePercent: number;
  };
};

export type DrywallPartitionResult = {
  grossArea: number;
  openingsArea: number;
  netArea: number;
  claddingArea: number;
  boardCount: number;
  studCount: number;
  uwLength: number;
  insulationArea: number;
  materials: MaterialRequirement[];
  validation: {
    status: "valid" | "warning" | "invalid";
    messages: ValidationMessage[];
  };
};

type MaterialCalculationContext = {
  input: DrywallPartitionInput;
  netArea: number;
  claddingArea: number;
  boardCount: number;
  studCount: number;
  uwLength: number;
};

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;

  return (
    Math.round((value + Number.EPSILON) * factor) /
    factor
  );
}

function ceilPositive(value: number): number {
  return Math.ceil(value - Number.EPSILON);
}

function getOpeningArea(opening: Opening): number {
  return (
    (opening.width / 1000) *
    (opening.height / 1000)
  );
}

function getOpeningAreaTotal(
  openings: Opening[] = [],
): number {
  return openings.reduce(
    (total, opening) =>
      total + getOpeningArea(opening),
    0,
  );
}

function addMessage(
  messages: ValidationMessage[],
  code: string,
  message: string,
  severity: "info" | "warning" | "error",
  parameter?: string,
): void {
  messages.push({
    code,
    message,
    severity,
    parameter,
  });
}

function validateInput(
  input: DrywallPartitionInput,
): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  if (
    !Number.isFinite(input.length) ||
    input.length <= 0
  ) {
    addMessage(
      messages,
      "INVALID_LENGTH",
      "Dĺžka priečky musí byť väčšia ako nula.",
      "error",
      "length",
    );
  }

  if (
    !Number.isFinite(input.height) ||
    input.height <= 0
  ) {
    addMessage(
      messages,
      "INVALID_HEIGHT",
      "Výška priečky musí byť väčšia ako nula.",
      "error",
      "height",
    );
  }

  if (
    !Number.isInteger(input.sides) ||
    ![1, 2].includes(input.sides)
  ) {
    addMessage(
      messages,
      "INVALID_SIDES",
      "Počet opláštených strán musí byť 1 alebo 2.",
      "error",
      "sides",
    );
  }

  if (
    !Number.isInteger(input.layersPerSide) ||
    input.layersPerSide < 1
  ) {
    addMessage(
      messages,
      "INVALID_LAYERS",
      "Počet vrstiev musí byť celé číslo minimálne 1.",
      "error",
      "layersPerSide",
    );
  }

  if (
    !Number.isFinite(input.board.width) ||
    input.board.width <= 0
  ) {
    addMessage(
      messages,
      "INVALID_BOARD_WIDTH",
      "Šírka dosky musí byť väčšia ako nula.",
      "error",
      "board.width",
    );
  }

  if (
    !Number.isFinite(input.board.height) ||
    input.board.height <= 0
  ) {
    addMessage(
      messages,
      "INVALID_BOARD_HEIGHT",
      "Dĺžka dosky musí byť väčšia ako nula.",
      "error",
      "board.height",
    );
  }

  if (
    !Number.isFinite(input.board.wastePercent) ||
    input.board.wastePercent < 0
  ) {
    addMessage(
      messages,
      "INVALID_BOARD_WASTE",
      "Odpad dosiek nesmie byť záporný.",
      "error",
      "board.wastePercent",
    );
  }

  if (
    !Number.isFinite(input.profile.spacing) ||
    input.profile.spacing <= 0
  ) {
    addMessage(
      messages,
      "INVALID_PROFILE_SPACING",
      "Rozostup stojok musí byť väčší ako nula.",
      "error",
      "profile.spacing",
    );
  }

  if (
    !Number.isFinite(input.profile.stockLength) ||
    input.profile.stockLength <= 0
  ) {
    addMessage(
      messages,
      "INVALID_PROFILE_LENGTH",
      "Dĺžka profilu musí byť väčšia ako nula.",
      "error",
      "profile.stockLength",
    );
  }

  if (
    !Number.isFinite(input.insulation.wastePercent) ||
    input.insulation.wastePercent < 0
  ) {
    addMessage(
      messages,
      "INVALID_INSULATION_WASTE",
      "Odpad izolácie nesmie byť záporný.",
      "error",
      "insulation.wastePercent",
    );
  }

  if (
    input.insulation.enabled &&
    (
      !Number.isFinite(input.insulation.thickness) ||
      input.insulation.thickness <= 0
    )
  ) {
    addMessage(
      messages,
      "INVALID_INSULATION_THICKNESS",
      "Hrúbka izolácie musí byť väčšia ako nula.",
      "error",
      "insulation.thickness",
    );
  }

  for (const opening of input.openings ?? []) {
    if (
      !Number.isFinite(opening.width) ||
      !Number.isFinite(opening.height) ||
      opening.width <= 0 ||
      opening.height <= 0
    ) {
      addMessage(
        messages,
        "INVALID_OPENING",
        `Otvor "${opening.name}" má neplatné rozmery.`,
        "error",
      );

      continue;
    }

    if (
      opening.width > input.length ||
      opening.height > input.height
    ) {
      addMessage(
        messages,
        "OPENING_TOO_LARGE",
        `Otvor "${opening.name}" je väčší ako priečka.`,
        "error",
      );
    }
  }

  const openingsArea = getOpeningAreaTotal(
    input.openings,
  );

  const grossArea =
    (input.length / 1000) *
    (input.height / 1000);

  if (openingsArea > grossArea) {
    addMessage(
      messages,
      "OPENINGS_EXCEED_WALL",
      "Celková plocha otvorov je väčšia ako plocha priečky.",
      "error",
    );
  }

  return messages;
}

function getRule(
  systemMaterial: SystemMaterial,
  rules: CalculationRule[],
): CalculationRule | undefined {
  return rules.find(
    (rule) => rule.id === systemMaterial.ruleId,
  );
}

function getParameter(
  rule: CalculationRule,
  name: string,
): number | undefined {
  const value = rule.parameters[name];

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return undefined;
  }

  return value;
}

function getMaterialDimension(
  material: MaterialDefinition,
  systemMaterial: SystemMaterial,
  dimension: "width" | "height" | "length" | "thickness",
  fallback: number,
): number {
  // 1. Priorita: Hodnota z formulára (to, čo zadal používateľ)
  if (typeof fallback === "number" && Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }

  // 2. Potom overrides (ak by boli)
  const override = systemMaterial.overrides?.[dimension];
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    return override;
  }

  // 3. Nakoniec materiál z DB
  const materialValue = material.dimensions?.[dimension];
  if (typeof materialValue === "number" && Number.isFinite(materialValue) && materialValue > 0) {
    return materialValue;
  }

  return 0;
}

function getMaterialConsumption(
  material: MaterialDefinition,
  systemMaterial: SystemMaterial,
  rule: CalculationRule,
  parameterName: string,
): number | undefined {
  const override =
    systemMaterial.overrides?.consumption;

  if (
    typeof override === "number" &&
    Number.isFinite(override) &&
    override >= 0
  ) {
    return override;
  }

  const materialConsumption =
    material.consumption?.value;

  if (
    typeof materialConsumption === "number" &&
    Number.isFinite(materialConsumption) &&
    materialConsumption >= 0
  ) {
    return materialConsumption;
  }

  return getParameter(rule, parameterName);
}

function getWastePercent(
  material: MaterialDefinition,
  systemMaterial: SystemMaterial,
  rule: CalculationRule,
  fallback: number,
): number {
  const override =
    systemMaterial.overrides?.wastePercent;

  if (
    typeof override === "number" &&
    Number.isFinite(override) &&
    override >= 0
  ) {
    return override;
  }

  if (
    typeof material.wastePercent === "number" &&
    Number.isFinite(material.wastePercent) &&
    material.wastePercent >= 0
  ) {
    return material.wastePercent;
  }

  if (
    typeof rule.wastePercent === "number" &&
    Number.isFinite(rule.wastePercent) &&
    rule.wastePercent >= 0
  ) {
    return rule.wastePercent;
  }

  return fallback;
}

function calculateMaterialRequirement(
  systemMaterial: SystemMaterial,
  material: MaterialDefinition,
  rule: CalculationRule,
  context: MaterialCalculationContext,
): MaterialRequirement {
  const { input } = context;

  const params = rule.parameters;

  let quantity = 0;
  let unit: CalculationUnit =
    material.calculationUnit;

  const boardWidth = getMaterialDimension(
    material,
    systemMaterial,
    "width",
    input.board.width,
  );

  const boardHeight = getMaterialDimension(
    material,
    systemMaterial,
    "height",
    input.board.height,
  );

  const boardWaste = getWastePercent(
    material,
    systemMaterial,
    rule,
    input.board.wastePercent,
  );

  const insulationWaste = getWastePercent(
    material,
    systemMaterial,
    rule,
    input.insulation.wastePercent,
  );

  const materialWaste = getWastePercent(
    material,
    systemMaterial,
    rule,
    0,
  );

  switch (rule.code) {
            case "drywall_board": {
      const boardWidthM = input.board.width / 1000;
      const boardHeightM = input.board.height / 1000;

      if (boardWidthM <= 0 || boardHeightM <= 0) {
        throw new Error("Rozmery dosky musia byť väčšie ako nula.");
      }

      const wallWidthM = input.length / 1000;
      const wallHeightM = input.height / 1000;
      
      // 1. Vypočítame hrubý počet dosiek na CELÚ stenu (bez otvorov)
      const boardsPerWidth = Math.ceil(wallWidthM / boardWidthM);
      const boardsPerHeight = Math.ceil(wallHeightM / boardHeightM);
      let totalBoards = boardsPerWidth * boardsPerHeight;

      // 2. Odpočítame dosky, ktoré padnú na otvory (okná/dvere)
      // Pre každý otvor vypočítame, koľko dosiek by sme naň potrebovali
      const openings = input.openings ?? [];
      for (const opening of openings) {
        const openingWidthM = opening.width / 1000;
        const openingHeightM = opening.height / 1000;

        const openingBoardsWidth = Math.ceil(openingWidthM / boardWidthM);
        const openingBoardsHeight = Math.ceil(openingHeightM / boardHeightM);
        
        // Koľko dosiek ušetríme (odpočítame z celkového počtu)
        const savedBoards = openingBoardsWidth * openingBoardsHeight;
        totalBoards = Math.max(0, totalBoards - savedBoards);
      }

      // 3. Vynásobíme počtom strán a vrstiev
      totalBoards = totalBoards * input.sides * input.layersPerSide;

      // 4. Pridáme rezervu (odpad)
      quantity = Math.ceil(totalBoards * (1 + input.board.wastePercent / 100));

      unit = "ks";
      break;
    }

    case "drywall_uw": {
      quantity =
        (input.length / 1000) * 2;

      unit = "bm";
      break;
    }

    case "drywall_cw": {
      const spacing =
        input.profile.spacing;

      const studCount =
        Math.ceil(input.length / spacing) + 1;

      quantity =
        studCount * (input.height / 1000);

      unit = "bm";
      break;
    }

    case "drywall_insulation": {
      if (!input.insulation.enabled) {
        quantity = 0;
        break;
      }

      quantity =
        context.netArea *
        (1 + insulationWaste / 100);

      unit = "m2";
      break;
    }

    case "drywall_screws": {
      const consumption =
        getMaterialConsumption(
          material,
          systemMaterial,
          rule,
          "screwsPerM2",
        );

      if (consumption === undefined) {
        throw new Error(
          "Chýba spotreba skrutiek na m².",
        );
      }

      quantity =
        context.claddingArea * consumption;

      unit = "ks";
      break;
    }

    case "drywall_joint_tape": {
      const consumption =
        getMaterialConsumption(
          material,
          systemMaterial,
          rule,
          "tapePerM2",
        );

      if (consumption === undefined) {
        throw new Error(
          "Chýba spotreba pásky na m².",
        );
      }

      quantity =
        context.claddingArea * consumption;

      unit = "bm";
      break;
    }

    case "drywall_joint_compound": {
      const consumption =
        getMaterialConsumption(
          material,
          systemMaterial,
          rule,
          "consumptionPerM2",
        );

      if (consumption === undefined) {
        throw new Error(
          "Chýba spotreba tmelu na m².",
        );
      }

      quantity =
        context.claddingArea * consumption;

      unit = material.calculationUnit;
      break;
    }

    default:
      throw new Error(
        `Nepodporované pravidlo SDK: ${rule.code}`,
      );
  }

  const shouldApplyWaste =
    ![
      "drywall_board",
      "drywall_insulation",
    ].includes(rule.code);

  if (
    shouldApplyWaste &&
    materialWaste > 0
  ) {
    quantity *=
      1 + materialWaste / 100;
  }

  quantity = round(quantity);

  const packageQuantity =
    systemMaterial.overrides?.packageQuantity ??
    material.packaging?.quantity;

  const validPackageQuantity =
    typeof packageQuantity === "number" &&
    Number.isFinite(packageQuantity) &&
    packageQuantity > 0;

  const purchaseCount =
    validPackageQuantity && quantity > 0
      ? ceilPositive(
          quantity / packageQuantity,
        )
      : undefined;

  const purchaseQuantity =
    purchaseCount !== undefined &&
    validPackageQuantity
      ? round(
          purchaseCount * packageQuantity,
        )
      : undefined;

  const totalPrice =
    material.unitPrice !== undefined &&
    purchaseCount !== undefined
      ? round(
          purchaseCount * material.unitPrice,
        )
      : undefined;

  return {
    materialId: material.id,
    materialName: material.name,
    role: systemMaterial.role,
    requiredQuantity: quantity,
    calculationUnit: unit,
    purchaseCount,
    purchaseUnit:
      material.packaging?.unit,
    purchaseQuantity,
    wastePercent: materialWaste,
    unitPrice: material.unitPrice,
    totalPrice,
    warnings: [],
  };
}

export function calculateDrywallPartition(
  input: DrywallPartitionInput,
  systemMaterials: SystemMaterial[],
  materials: MaterialDefinition[],
  rules: CalculationRule[],
): DrywallPartitionResult {
  const messages =
    validateInput(input);

  const invalid = messages.some(
    (message) =>
      message.severity === "error",
  );

  if (invalid) {
    return {
      grossArea: 0,
      openingsArea: 0,
      netArea: 0,
      claddingArea: 0,
      boardCount: 0,
      studCount: 0,
      uwLength: 0,
      insulationArea: 0,
      materials: [],
      validation: {
        status: "invalid",
        messages,
      },
    };
  }

  const grossArea =
    (input.length / 1000) *
    (input.height / 1000);

  const openingsArea =
    getOpeningAreaTotal(input.openings);

  const netArea = Math.max(
    0,
    grossArea - openingsArea,
  );

  const claddingArea =
    netArea *
    input.sides *
    input.layersPerSide;

  const boardArea =
    (input.board.width / 1000) *
    (input.board.height / 1000);

  const boardCount =
    boardArea > 0
      ? ceilPositive(
          (
            claddingArea *
            (1 + input.board.wastePercent / 100)
          ) / boardArea,
        )
      : 0;

  const studCount =
    Math.ceil(
      input.length / input.profile.spacing,
    ) + 1;

  const uwLength =
    (input.length / 1000) * 2;

  const insulationArea =
    input.insulation.enabled
      ? netArea *
        (
          1 +
          input.insulation.wastePercent / 100
        )
      : 0;

  const context: MaterialCalculationContext = {
    input,
    netArea,
    claddingArea,
    boardCount,
    studCount,
    uwLength,
  };

  const requirements: MaterialRequirement[] = [];

  for (const systemMaterial of systemMaterials) {
    if (
      systemMaterial.role === "insulation" &&
      !input.insulation.enabled
    ) {
      continue;
    }

    const material = materials.find(
      (item) =>
        item.id === systemMaterial.materialId,
    );

    const rule = getRule(
      systemMaterial,
      rules,
    );

    if (!material || !rule) {
      const severity =
        systemMaterial.required
          ? "error"
          : "warning";

      addMessage(
        messages,
        "MISSING_MATERIAL_OR_RULE",
        `Chýba ${
          !material ? "materiál" : "výpočtové pravidlo"
        } pre položku ${systemMaterial.role}.`,
        severity,
      );

      continue;
    }

    try {
      requirements.push(
        calculateMaterialRequirement(
          systemMaterial,
          material,
          rule,
          context,
        ),
      );
    } catch (error) {
      addMessage(
        messages,
        "MATERIAL_CALCULATION_ERROR",
        error instanceof Error
          ? error.message
          : `Výpočet položky ${systemMaterial.role} zlyhal.`,
        systemMaterial.required
          ? "error"
          : "warning",
      );
    }
  }

  const hasError = messages.some(
    (message) =>
      message.severity === "error",
  );

  const hasWarning = messages.some(
    (message) =>
      message.severity === "warning",
  );

  return {
    grossArea: round(grossArea),
    openingsArea: round(openingsArea),
    netArea: round(netArea),
    claddingArea: round(claddingArea),
    boardCount,
    studCount,
    uwLength: round(uwLength),
    insulationArea: round(insulationArea),
    materials: requirements,
    validation: {
      status: hasError
        ? "invalid"
        : hasWarning
          ? "warning"
          : "valid",
      messages,
    },
  };
}