import { CAREER_EVENTS, LIFE_EVENTS, WORLD_EVENTS } from "./events";
import { getLifestyleMonthlyCost, getLifestyleStatBonus } from "./lifestyles";
import type { Career, GameState, LifeEvent } from "./types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getMonthName(month: number): string {
  return MONTHS[month] ?? "Jan";
}

export function createNewGame(
  playerName: string,
  birthYear: number,
): GameState {
  return {
    playerName,
    age: 0,
    month: 0,
    birthYear,
    totalMonths: 0,

    health: 80,
    happiness: 70,
    intelligence: 30,
    reputation: 20,

    wealth: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    debt: 0,

    lifeStage: "infant",
    educationStage: "none",
    educationProgress: 0,
    selectedCareer: null,
    universityYears: 0,

    jobTitle: "Unemployed",
    yearsAtJob: 0,
    jobLevel: 1,
    salaryHistory: [],

    relationships: [],
    married: false,
    spouseName: "",
    children: 0,

    hasBusiness: false,
    businessName: "",
    businessValue: 0,
    businessMonthlyProfit: 0,
    businessStage: "none",
    businessEmployees: 0,

    politicsActive: false,
    politicsRank: "none",
    politicsSupport: 0,
    politicsCampaignFund: 0,

    housing: "shared_room",
    food: "budget",
    transport: "walk",
    entertainment: "none",
    healthCare: "no_care",

    isAlive: true,
    causeOfDeath: "",
    lifeScore: 0,
    achievements: [],

    pendingEvent: null,
    awaitingCareerChoice: false,
    lastEventTitle: "",
  };
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

function getLifeStage(age: number): GameState["lifeStage"] {
  if (age < 6) return "infant";
  if (age < 12) return "child";
  if (age < 18) return "teen";
  if (age < 26) return "youngAdult";
  if (age < 46) return "adult";
  if (age < 66) return "middleAge";
  return "senior";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function rollChance(probability: number): boolean {
  return Math.random() < probability;
}

const NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Morgan",
  "Riley",
  "Casey",
  "Quinn",
  "Drew",
  "Avery",
  "Blake",
  "Cameron",
  "Dana",
  "Ellis",
  "Finley",
];

export function advanceMonth(state: GameState): GameState {
  if (!state.isAlive) return state;

  let s = { ...state };
  s.totalMonths += 1;
  s.month = (s.month + 1) % 12;
  if (s.month === 0) {
    // Birthday
    s.age = Math.floor(s.totalMonths / 12);
  } else {
    s.age = s.birthYear > 0 ? s.totalMonths / 12 : s.totalMonths / 12;
  }
  s.age = s.totalMonths / 12;

  // Update life stage
  s.lifeStage = getLifeStage(s.age);

  // Education auto-enrollment
  if (s.age >= 6 && s.educationStage === "none") {
    s.educationStage = "primarySchool";
    s.educationProgress = 0;
  }
  if (s.age >= 12 && s.educationStage === "primarySchool") {
    s.educationStage = "secondarySchool";
    s.educationProgress = 0;
  }

  // Education progress
  if (s.educationStage === "primarySchool") {
    s.educationProgress += 1;
    s.intelligence = clamp(s.intelligence + 0.5);
  } else if (s.educationStage === "secondarySchool") {
    s.educationProgress += 1;
    s.intelligence = clamp(s.intelligence + 0.7);
    // At end of secondary (72 months = 6 years)
    if (
      s.educationProgress >= 72 &&
      !s.awaitingCareerChoice &&
      !s.selectedCareer
    ) {
      s.awaitingCareerChoice = true;
    }
  } else if (
    s.educationStage === "university" ||
    s.educationStage === "vocational"
  ) {
    s.educationProgress += 1;
    s.intelligence = clamp(s.intelligence + 0.8);
    s.wealth -= 500; // Tuition
    if (s.selectedCareer) {
      const requiredMonths = s.selectedCareer.yearsToQualify * 12;
      if (s.educationProgress >= requiredMonths) {
        s.educationStage = "working";
        s.jobTitle = s.selectedCareer.name;
        s.monthlyIncome = s.selectedCareer.startingSalary;
        s.jobLevel = 1;
        s.yearsAtJob = 0;
        s.achievements.push(`🎓 Qualified as ${s.selectedCareer.name}`);
      }
    }
  }

  // Career progression
  if (s.educationStage === "working" && s.selectedCareer) {
    s.yearsAtJob += 1 / 12;
    // Annual raise (every 12 months)
    if (s.totalMonths % 12 === 0 && s.yearsAtJob > 0) {
      const raisePercent = 0.03 + s.intelligence / 1000;
      s.monthlyIncome = Math.round(s.monthlyIncome * (1 + raisePercent));
      s.salaryHistory.push(s.monthlyIncome);
      // Level up every 5 years
      const newLevel = Math.min(5, Math.floor(s.yearsAtJob / 5) + 1);
      if (newLevel > s.jobLevel) {
        s.jobLevel = newLevel;
        s.monthlyIncome = Math.round(s.monthlyIncome * 1.15);
        s.achievements.push(`⬆️ Reached Level ${newLevel} in ${s.jobTitle}`);
      }
    }
    // Stress affects health
    if (s.selectedCareer) {
      s.health = clamp(s.health - s.selectedCareer.stressLevel * 0.03);
      s.happiness = clamp(s.happiness + s.selectedCareer.happinessBonus * 0.05);
    }
  }

  // Retirement
  if (s.age >= 65 && s.educationStage === "working") {
    s.educationStage = "retired";
    s.monthlyIncome = Math.round(s.monthlyIncome * 0.4); // Pension
    s.jobTitle = `Retired ${s.jobTitle}`;
    s.achievements.push("🏖️ Retired!");
  }

  // Business income
  if (s.hasBusiness) {
    s.wealth += s.businessMonthlyProfit;
    s.businessValue = Math.round(s.businessValue * 1.002); // Slow appreciation
  }

  // Lifestyle costs
  const lifestyleCost = getLifestyleMonthlyCost(s);
  s.monthlyExpenses = lifestyleCost + s.children * 300;
  const netMonthly = s.monthlyIncome - s.monthlyExpenses;
  s.wealth += netMonthly;

  // Lifestyle stat effects (applied fractionally each month)
  const bonus = getLifestyleStatBonus(s);
  s.health = clamp(s.health + bonus.health * 0.1);
  s.happiness = clamp(s.happiness + bonus.happiness * 0.1);
  s.reputation = clamp(s.reputation + bonus.reputation * 0.05);

  // Age-based health decay
  if (s.age > 50) {
    s.health = clamp(s.health - (s.age - 50) * 0.02);
  }
  if (s.age > 70) {
    s.health = clamp(s.health - (s.age - 70) * 0.05);
  }

  // Children effects
  if (s.children > 0) {
    s.happiness = clamp(s.happiness + 0.5);
  }

  // Marriage happiness
  if (s.married) {
    s.happiness = clamp(s.happiness + 0.3);
  }

  // Random events
  let event: LifeEvent | null = null;

  // World event (3% chance per month)
  if (rollChance(0.03) && !s.pendingEvent) {
    event = pickRandom(WORLD_EVENTS);
  }
  // Life event (10% chance)
  else if (rollChance(0.1) && !s.pendingEvent) {
    const ageAppropriate = LIFE_EVENTS.filter((e) => {
      if (e.type === "relationship" && s.age < 16) return false;
      if (e.id === "part_time_job" && s.age < 14) return false;
      if (e.id === "romance" && s.age < 18) return false;
      if (e.id === "startup_offer" && s.age < 22) return false;
      if (e.id === "investment_opportunity" && s.wealth < 10000) return false;
      if (e.id === "inheritance" && s.age < 20) return false;
      return true;
    });
    event = pickRandom(ageAppropriate);
  }
  // Career event (5% chance when working)
  else if (
    rollChance(0.05) &&
    s.educationStage === "working" &&
    !s.pendingEvent
  ) {
    event = pickRandom(CAREER_EVENTS);
  }

  if (event) {
    s.pendingEvent = event;
    s.lastEventTitle = event.title;
  }

  // Death checks
  if (s.health <= 0) {
    s.isAlive = false;
    s.causeOfDeath = "Health deterioration";
  } else if (s.age > 70 && rollChance((s.age - 70) * 0.005)) {
    s.isAlive = false;
    s.causeOfDeath = "Natural causes";
    s.achievements.push(`👴 Lived to age ${Math.floor(s.age)}`);
  } else if (s.wealth < -100000) {
    s.isAlive = false;
    s.causeOfDeath = "Financial ruin and despair";
  }

  // Achievements
  if (s.wealth >= 1000000 && !s.achievements.includes("💰 Millionaire!")) {
    s.achievements.push("💰 Millionaire!");
  }
  if (
    s.wealth >= 10000000 &&
    !s.achievements.includes("🤑 Multi-Millionaire!")
  ) {
    s.achievements.push("🤑 Multi-Millionaire!");
  }
  if (s.married && !s.achievements.includes("💍 Married!")) {
    s.achievements.push("💍 Married!");
  }
  if (s.children >= 1 && !s.achievements.includes("👶 Parent!")) {
    s.achievements.push("👶 Parent!");
  }
  if (
    s.politicsRank === "pm" &&
    !s.achievements.includes("🏛️ Prime Minister!")
  ) {
    s.achievements.push("🏛️ Prime Minister!");
  }
  if (
    s.businessStage === "corporation" &&
    !s.achievements.includes("🏢 Built a Corporation!")
  ) {
    s.achievements.push("🏢 Built a Corporation!");
  }
  if (s.reputation >= 90 && !s.achievements.includes("⭐ Famous!")) {
    s.achievements.push("⭐ Famous!");
  }

  s.lifeScore = calculateLifeScore(s);
  return s;
}

export function applyEventChoice(
  state: GameState,
  choiceIndex: number,
): GameState {
  const event = state.pendingEvent;
  if (!event) return state;

  const choice = event.choices[choiceIndex];
  if (!choice) return { ...state, pendingEvent: null };

  let s = { ...state, pendingEvent: null };
  const e = choice.effects;

  if (e.health) s.health = clamp(s.health + e.health);
  if (e.happiness) s.happiness = clamp(s.happiness + e.happiness);
  if (e.intelligence) s.intelligence = clamp(s.intelligence + e.intelligence);
  if (e.reputation) s.reputation = clamp(s.reputation + e.reputation);
  if (e.wealth) s.wealth += e.wealth;
  if (e.monthlyIncome) s.monthlyIncome += e.monthlyIncome;
  if (e.monthlyExpenses) s.monthlyExpenses += e.monthlyExpenses;
  if (e.politicsSupport)
    s.politicsSupport = clamp(s.politicsSupport + e.politicsSupport);
  if (e.businessValue) s.businessValue += e.businessValue;

  // Special effects for certain events
  if (event.id === "romance" && choice.text.includes("dating")) {
    const name = pickRandom(NAMES);
    s.relationships.push({
      id: Date.now().toString(),
      name,
      type: "partner",
      closeness: 50,
      metAtAge: Math.floor(s.age),
    });
  }
  if (event.id === "startup_offer" && choice.text.includes("co-founder")) {
    s.hasBusiness = true;
    s.businessName = "My Startup";
    s.businessStage = "startup";
    s.businessMonthlyProfit = 500;
  }

  // Career event: salary raise
  if (event.id === "annual_review" && s.selectedCareer) {
    if (choice.text.includes("20%")) {
      s.monthlyIncome = Math.round(s.monthlyIncome * 1.2);
    } else if (choice.text.includes("5%")) {
      s.monthlyIncome = Math.round(s.monthlyIncome * 1.05);
    }
  }

  s.lifeScore = calculateLifeScore(s);
  return s;
}

export function startCareer(state: GameState, career: Career): GameState {
  let s = { ...state, awaitingCareerChoice: false };
  s.selectedCareer = career;

  if (career.yearsToQualify === 0) {
    // Enter workforce directly
    s.educationStage = "working";
    s.jobTitle = career.name;
    s.monthlyIncome = career.startingSalary;
    s.jobLevel = 1;
  } else if (career.educationRequired === "vocational") {
    s.educationStage = "vocational";
    s.educationProgress = 0;
  } else {
    s.educationStage = "university";
    s.educationProgress = 0;
    s.universityYears = career.yearsToQualify;
  }

  return s;
}

export function calculateLifeScore(state: GameState): number {
  const wealth = Math.min(100, (state.wealth / 100000) * 20);
  const stats =
    (state.health + state.happiness + state.intelligence + state.reputation) /
    4;
  const career = state.selectedCareer ? 10 : 0;
  const family = (state.married ? 10 : 0) + Math.min(10, state.children * 3);
  const business = state.hasBusiness
    ? Math.min(15, (state.businessValue / 100000) * 15)
    : 0;
  const politics = {
    none: 0,
    activist: 5,
    councillor: 10,
    mp: 20,
    minister: 30,
    pm: 50,
  }[state.politicsRank];
  const achievements = state.achievements.length * 2;
  return Math.round(
    wealth +
      stats * 0.4 +
      career +
      family +
      business +
      (politics ?? 0) +
      achievements,
  );
}

export function getAvailableCareers(
  state: GameState,
  allCareers: Career[],
): Career[] {
  const eduMap: Record<string, number> = {
    none: 0,
    secondary: 1,
    vocational: 2,
    degree: 3,
    postgrad: 4,
    doctorate: 5,
  };
  const playerEdu =
    state.educationStage === "secondarySchool"
      ? 1
      : state.educationStage === "university"
        ? 3
        : state.educationStage === "working"
          ? 3
          : 1;
  return allCareers.filter(
    (c) => (eduMap[c.educationRequired] ?? 0) <= playerEdu + 1,
  );
}

export function saveGame(state: GameState): void {
  const saves = loadSaves();
  const existingIdx = saves.findIndex(
    (s) => s.state.playerName === state.playerName,
  );
  const save = {
    playerName: state.playerName,
    age: Math.floor(state.age),
    lifeScore: state.lifeScore,
    causeOfDeath: state.causeOfDeath,
    achievements: state.achievements,
    savedAt: new Date().toISOString(),
    state,
  };
  if (existingIdx >= 0) saves[existingIdx] = save;
  else saves.push(save);
  localStorage.setItem("life-simulator-saves", JSON.stringify(saves));
}

export function loadSaves() {
  try {
    return JSON.parse(localStorage.getItem("life-simulator-saves") ?? "[]");
  } catch {
    return [];
  }
}

export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${Math.round(amount).toLocaleString()}`;
}
