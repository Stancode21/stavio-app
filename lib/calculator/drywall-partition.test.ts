import assert from "node:assert/strict";
import { calculateDrywallPartition } from "./drywall-partition";

console.log("STAVIO – test výpočtu SDK priečky");

const baseInput = {
length: 5000,
height: 2600,
sides: 2 as const,
layersPerSide: 1,
board: {
width: 1200,
height: 2000,
wastePercent: 10,
},
profile: {
spacing: 600,
stockLength: 3000,
},
insulation: {
enabled: false,
thickness: 100,
wastePercent: 5,
},
};

const invalidResult = calculateDrywallPartition(
{ ...baseInput, length: 0 },
[],
[],
[],
);

assert.equal(invalidResult.validation.status, "invalid");
assert.ok(
invalidResult.validation.messages.some(
(message) => message.code === "INVALID_LENGTH",
),
);
console.log("✅ Neplatná dĺžka");

// Výpočet geometrie bez otvorov
const result = calculateDrywallPartition(
baseInput,
[],
[],
[],
);

assert.equal(result.grossArea, 13);
assert.equal(result.openingsArea, 0);
assert.equal(result.netArea, 13);
assert.equal(result.claddingArea, 26);
assert.equal(result.boardCount, 12);
assert.equal(result.studCount, 10);
assert.equal(result.uwLength, 10);

console.log("✅ Plocha, opláštenie a profily");

// Výpočet geometrie s oknom 1200 × 1000 mm
const windowResult = calculateDrywallPartition(
{
...baseInput,
openings: [
{
name: "Okno",
type: "window",
width: 1200,
height: 1000,
depth: 200,
includeReveal: true,
},
],
},
[],
[],
[],
);

assert.equal(windowResult.grossArea, 13);
assert.equal(windowResult.openingsArea, 1.2);
assert.equal(windowResult.netArea, 11.8);
assert.equal(windowResult.claddingArea, 23.6);

console.log("✅ Odpočítanie plochy okna");
console.log("Všetky testy prešli.");
