import type { LifestyleCategory } from "./types";

export const LIFESTYLE_CATEGORIES: LifestyleCategory[] = [
  {
    id: "housing",
    name: "Housing",
    options: [
      {
        id: "homeless",
        label: "Homeless",
        monthlyCost: 0,
        healthEffect: -5,
        happinessEffect: -10,
        reputationEffect: -8,
        description: "Living on the streets.",
      },
      {
        id: "shared_room",
        label: "Shared Room",
        monthlyCost: 200,
        healthEffect: -1,
        happinessEffect: -3,
        reputationEffect: -3,
        description: "Sharing a house with others.",
      },
      {
        id: "apartment",
        label: "Apartment",
        monthlyCost: 800,
        healthEffect: 0,
        happinessEffect: 2,
        reputationEffect: 0,
        description: "A decent apartment in the city.",
      },
      {
        id: "house",
        label: "Family Home",
        monthlyCost: 2000,
        healthEffect: 2,
        happinessEffect: 5,
        reputationEffect: 3,
        description: "A comfortable family home.",
      },
      {
        id: "luxury_home",
        label: "Luxury Home",
        monthlyCost: 5000,
        healthEffect: 3,
        happinessEffect: 8,
        reputationEffect: 7,
        description: "A high-end luxury property.",
      },
      {
        id: "mansion",
        label: "Mansion",
        monthlyCost: 15000,
        healthEffect: 5,
        happinessEffect: 10,
        reputationEffect: 10,
        description: "A sprawling mansion estate.",
      },
    ],
  },
  {
    id: "food",
    name: "Food & Diet",
    options: [
      {
        id: "street_food",
        label: "Street Food",
        monthlyCost: 50,
        healthEffect: -3,
        happinessEffect: 0,
        reputationEffect: -1,
        description: "Cheap street food and leftovers.",
      },
      {
        id: "budget",
        label: "Budget Meals",
        monthlyCost: 150,
        healthEffect: -1,
        happinessEffect: 1,
        reputationEffect: 0,
        description: "Basic home cooking on a budget.",
      },
      {
        id: "regular",
        label: "Regular Diet",
        monthlyCost: 300,
        healthEffect: 1,
        happinessEffect: 2,
        reputationEffect: 0,
        description: "A balanced, varied diet.",
      },
      {
        id: "healthy",
        label: "Healthy Diet",
        monthlyCost: 500,
        healthEffect: 4,
        happinessEffect: 3,
        reputationEffect: 1,
        description: "Nutritious organic and healthy meals.",
      },
      {
        id: "gourmet",
        label: "Gourmet",
        monthlyCost: 1500,
        healthEffect: 3,
        happinessEffect: 6,
        reputationEffect: 4,
        description: "Fine dining and gourmet experiences.",
      },
    ],
  },
  {
    id: "transport",
    name: "Transport",
    options: [
      {
        id: "walk",
        label: "Walk / Bike",
        monthlyCost: 0,
        healthEffect: 3,
        happinessEffect: 1,
        reputationEffect: -1,
        description: "Getting around on foot or bicycle.",
      },
      {
        id: "bus",
        label: "Public Bus",
        monthlyCost: 50,
        healthEffect: 0,
        happinessEffect: -1,
        reputationEffect: -1,
        description: "Using public transport.",
      },
      {
        id: "old_car",
        label: "Old Car",
        monthlyCost: 300,
        healthEffect: 0,
        happinessEffect: 2,
        reputationEffect: 0,
        description: "A reliable but old vehicle.",
      },
      {
        id: "new_car",
        label: "New Car",
        monthlyCost: 600,
        healthEffect: 0,
        happinessEffect: 4,
        reputationEffect: 3,
        description: "A modern, comfortable car.",
      },
      {
        id: "luxury_car",
        label: "Luxury Car",
        monthlyCost: 1500,
        healthEffect: 0,
        happinessEffect: 6,
        reputationEffect: 7,
        description: "A high-end luxury vehicle.",
      },
      {
        id: "chauffeur",
        label: "Chauffeur",
        monthlyCost: 3000,
        healthEffect: 1,
        happinessEffect: 8,
        reputationEffect: 10,
        description: "Private driver at your service.",
      },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    options: [
      {
        id: "none",
        label: "No Entertainment",
        monthlyCost: 0,
        healthEffect: -1,
        happinessEffect: -5,
        reputationEffect: -2,
        description: "All work, no play.",
      },
      {
        id: "basic",
        label: "Streaming & Games",
        monthlyCost: 30,
        healthEffect: 0,
        happinessEffect: 3,
        reputationEffect: 0,
        description: "Netflix, games, and basic leisure.",
      },
      {
        id: "social",
        label: "Active Social Life",
        monthlyCost: 200,
        healthEffect: 1,
        happinessEffect: 6,
        reputationEffect: 3,
        description: "Dining out, friends, and events.",
      },
      {
        id: "clubs",
        label: "Clubs & Travel",
        monthlyCost: 800,
        healthEffect: -1,
        happinessEffect: 8,
        reputationEffect: 5,
        description: "Clubbing, parties, and travel.",
      },
      {
        id: "luxury_leisure",
        label: "Luxury Leisure",
        monthlyCost: 3000,
        healthEffect: 2,
        happinessEffect: 10,
        reputationEffect: 8,
        description: "Yachts, private events, and luxury travel.",
      },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    options: [
      {
        id: "no_care",
        label: "No Healthcare",
        monthlyCost: 0,
        healthEffect: -4,
        happinessEffect: -2,
        reputationEffect: -1,
        description: "Avoiding doctors entirely.",
      },
      {
        id: "basic",
        label: "Basic Checkups",
        monthlyCost: 50,
        healthEffect: 1,
        happinessEffect: 1,
        reputationEffect: 0,
        description: "Annual checkups and basic care.",
      },
      {
        id: "gym",
        label: "Gym + Doctor",
        monthlyCost: 200,
        healthEffect: 4,
        happinessEffect: 3,
        reputationEffect: 1,
        description: "Regular gym and medical visits.",
      },
      {
        id: "premium",
        label: "Premium Healthcare",
        monthlyCost: 500,
        healthEffect: 6,
        happinessEffect: 4,
        reputationEffect: 2,
        description: "Private healthcare plan.",
      },
      {
        id: "top_tier",
        label: "Top-Tier Wellness",
        monthlyCost: 1500,
        healthEffect: 8,
        happinessEffect: 6,
        reputationEffect: 4,
        description: "Personal trainer, therapist, and top doctors.",
      },
    ],
  },
];

export function getLifestyleMonthlyCost(state: {
  housing: string;
  food: string;
  transport: string;
  entertainment: string;
  healthCare: string;
}): number {
  let total = 0;
  for (const cat of LIFESTYLE_CATEGORIES) {
    const key = cat.id === "healthcare" ? "healthCare" : cat.id;
    const selectedId = state[key as keyof typeof state];
    const option = cat.options.find((o) => o.id === selectedId);
    if (option) total += option.monthlyCost;
  }
  return total;
}

export function getLifestyleStatBonus(state: {
  housing: string;
  food: string;
  transport: string;
  entertainment: string;
  healthCare: string;
}): { health: number; happiness: number; reputation: number } {
  let health = 0;
  let happiness = 0;
  let reputation = 0;
  for (const cat of LIFESTYLE_CATEGORIES) {
    const key = cat.id === "healthcare" ? "healthCare" : cat.id;
    const selectedId = state[key as keyof typeof state];
    const option = cat.options.find((o) => o.id === selectedId);
    if (option) {
      health += option.healthEffect;
      happiness += option.happinessEffect;
      reputation += option.reputationEffect;
    }
  }
  return { health, happiness, reputation };
}
