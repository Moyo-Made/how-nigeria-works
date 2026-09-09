import data from "./chambers.json";

// The rooms inside the institutions.
//
// Kept apart from institutions.js for the reason set out in useHashRoute: a
// chamber is a room in a building, not another arm of government, and nothing
// that reads the institution list should have to filter these out of it.
//
// PROVENANCE. Figueras, the seating contractor for the 2022-24 renovation,
// published per-chamber figures when the work finished — 312 seats and nearly a
// thousand square metres of red carpet in the Senate, 644 seats and two thousand
// square metres of green in the House, 956 seats and over 3,000 sq m in total.
// https://figueras.com/project/national-assembly-of-nigeria/
//
// Those are the only hard numbers either room has, and they are the numbers in
// chambers.json. No floor plan, no dimension, no row count and no gallery split
// has ever been published for either chamber, which is why chamberPlan.js
// derives its geometry and says so at length. The seat counts cover galleries as
// well as the floor, so they cap a room rather than sizing it.
//
// Free of three.js imports, same as institutions.js: App reads this to decide
// what to route to and must not pay for the 3D engine to find out.

export const chambers = data;

export const getChamber = (id) => data.find((c) => c.id === id) ?? null;

export const chambersOf = (institutionId) =>
  data.filter((c) => c.institution === institutionId);
