import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import {
  calculateWallWithMaterials,
} from "./index";

import {
  getMaterials,
} from "./materials-db";

import {
  saveCalculation,
} from "./persistence";

const PROJECT_ID =
  "3aa4eeb1-f67c-4deb-a26c-a2406d2ea0f6";

const USER_ID =
  "f562efed-83b1-4f1f-b52a-3c5f0e31e8fd";

async function main() {
  console.log("");
  console.log(
    "===================================="
  );
  console.log(
    "        STAVIO SAVE TEST"
  );
  console.log(
    "===================================="
  );

  console.log("");
  console.log(
    "Načítavam materiály zo Supabase..."
  );

  const materials =
    await getMaterials();

  console.log(
    `Načítaných materiálov: ${materials.length}`
  );

  const wall = {
    geometryType: "wall" as const,

    dimensions: {
      length: 5000,
      height: 2600,
      unit: "mm" as const,
    },

    openings: [
      {
        name: "Okno",
        type: "window" as const,
        width: 1200,
        height: 1000,
        depth: 200,
        includeReveal: true,
      },
    ],
  };

  console.log("");
  console.log(
    "Vykonávam výpočet..."
  );

  const result =
    calculateWallWithMaterials(
      wall,
      materials
    );

  console.log("");
  console.log(
    "Čistá plocha:",
    result.geometry.netArea,
    "m²"
  );

  console.log("");
  console.log(
    "Materiály:"
  );

  for (const material of result.materials) {
    console.log(
      `- ${material.materialName}:`,
      material.calculatedQuantity,
      material.calculationUnit,
      "→",
      material.purchaseCount,
      material.purchaseUnit
    );
  }

  console.log("");
  console.log(
    "Ukladám výpočet do projektu RD Senec..."
  );

  /*
   * USER_ID je tu zámerne iba na kontrolu,
   * že test používame pre správny účet.
   */
  console.log(
    "Používateľ:",
    USER_ID
  );

  const saved =
    await saveCalculation(
      {
        projectId: PROJECT_ID,

        name:
          "Test – stena 5000 × 2600 mm",

        calculationType:
          "wall",

        inputs:
          wall,
      },

      result,

      materials
    );

  console.log("");
  console.log(
    "===================================="
  );

  console.log(
    "✅ VÝPOČET BOL ÚSPEŠNE ULOŽENÝ"
  );

  console.log(
    "ID výpočtu:",
    saved.id
  );

  console.log(
    "===================================="
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "❌ CHYBA:"
  );

  console.error(error);

  process.exit(1);
});