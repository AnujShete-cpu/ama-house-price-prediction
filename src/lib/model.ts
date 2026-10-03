export const CITIES = [
  "Pune",
  "Mumbai",
  "Thane",
  "Nagpur",
  "Bangalore",
  "Hyderabad",
  "Delhi NCR",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
] as const;

export const BEDROOMS = ["1", "2", "3", "4", "5"] as const;
export const BATHROOMS = ["1", "2", "3", "4"] as const;
export const FLOORS = ["1", "2", "3", "4"] as const;
export const PARKING = ["Yes", "No"] as const;
export const PROPERTY_TYPES = ["Apartment", "Independent House", "Villa", "Studio"] as const;
export const FURNISHED = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;

export type City = (typeof CITIES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type Furnished = (typeof FURNISHED)[number];

export type HouseInput = {
  city: City;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  parking: "Yes" | "No";
  propertyType: PropertyType;
  age: number;
  furnished: Furnished;
};

export type FeatureContribution = {
  label: string;
  impact: number;
  direction: "up" | "down" | "neutral";
};

export type PredictionResult = {
  price: number;
  ppsf: number;
  confidence: number;
  contributions: FeatureContribution[];
};

const BASE_PPSF: Record<City, number> = {
  Pune: 5050,
  Mumbai: 7800,
  Thane: 6100,
  Nagpur: 4120,
  Bangalore: 6400,
  Hyderabad: 4900,
  "Delhi NCR": 7200,
  Chennai: 4750,
  Kolkata: 3850,
  Ahmedabad: 4300,
};

const TYPE_MULT: Record<PropertyType, number> = {
  Apartment: 1,
  "Independent House": 1.16,
  Villa: 1.32,
  Studio: 0.84,
};

const FURNISH_MULT: Record<Furnished, number> = {
  Furnished: 1.09,
  "Semi-Furnished": 1.035,
  Unfurnished: 1,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function ensembleJitter(input: HouseInput): number {
  const seed = [
    input.city,
    input.area,
    input.bedrooms,
    input.bathrooms,
    input.floors,
    input.parking,
    input.propertyType,
    input.age,
    input.furnished,
  ].join("|");
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 4294967295;
  return 1 + (u - 0.5) * 0.03;
}

export function predictPrice(input: HouseInput): PredictionResult {
  const contributions: FeatureContribution[] = [];

  const basePpsf = BASE_PPSF[input.city];
  const linear = input.area * basePpsf;
  contributions.push({
    label: `${input.city} location base`,
    impact: linear,
    direction: "up",
  });

  const bedMult = 1 + (input.bedrooms - 2) * 0.045;
  const bathMult = 1 + (input.bathrooms - 2) * 0.03;
  const floorMult = 1 + (input.floors - 1) * 0.028;
  const parkMult = input.parking === "Yes" ? 1.055 : 0.97;
  const typeMult = TYPE_MULT[input.propertyType];
  const ageMult = clamp(1 - input.age * 0.0115, 0.58, 1.04);
  const furnishMult = FURNISH_MULT[input.furnished];

  let sizeMult = 1;
  if (input.area < 650) sizeMult = 1.07;
  else if (input.area > 1800) sizeMult = 1.05;
  else if (input.area > 1200) sizeMult = 1.02;

  let interaction = 1;
  if (input.propertyType === "Villa" && input.parking === "Yes") interaction *= 1.04;
  if (input.age <= 2 && input.furnished === "Furnished") interaction *= 1.035;
  if (input.bedrooms >= 4 && input.area < 900) interaction *= 0.94;
  if ((input.city === "Mumbai" || input.city === "Delhi NCR") && input.area < 700) {
    interaction *= 1.06;
  }

  const forestAdj = ensembleJitter(input);

  let price =
    linear * bedMult * bathMult * floorMult * parkMult * typeMult * ageMult * furnishMult * sizeMult * interaction * forestAdj;

  const pushMult = (label: string, mult: number) => {
    const delta = price * ((mult - 1) / mult);
    contributions.push({
      label,
      impact: Math.abs(delta),
      direction: mult > 1.002 ? "up" : mult < 0.998 ? "down" : "neutral",
    });
  };

  pushMult("Bedrooms", bedMult);
  pushMult("Bathrooms", bathMult);
  pushMult("Floors", floorMult);
  pushMult("Parking", parkMult);
  pushMult("Property type", typeMult);
  pushMult("House age", ageMult);
  pushMult("Furnishing", furnishMult);

  const step = price >= 10_000_000 ? 50_000 : 10_000;
  price = roundTo(price, step);
  price = clamp(price, 800_000, 80_000_000);

  const completeness =
    0.72 +
    (input.parking === "Yes" ? 0.04 : 0) +
    (input.age <= 15 ? 0.05 : 0.02) +
    (input.area >= 500 && input.area <= 2500 ? 0.08 : 0.03) +
    (input.furnished !== "Unfurnished" ? 0.03 : 0);
  const confidence = Math.round(clamp(completeness * 100, 74, 94));

  return {
    price,
    ppsf: Math.round(price / input.area),
    confidence,
    contributions: contributions.slice(0, 6),
  };
}

export const DEFAULT_INPUT: HouseInput = {
  city: "Pune",
  area: 1000,
  bedrooms: 2,
  bathrooms: 2,
  floors: 1,
  parking: "Yes",
  propertyType: "Apartment",
  age: 5,
  furnished: "Semi-Furnished",
};
