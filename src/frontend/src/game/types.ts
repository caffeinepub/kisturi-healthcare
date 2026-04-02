export interface Career {
  id: string;
  name: string;
  category:
    | "medicine"
    | "law"
    | "engineering"
    | "arts"
    | "business"
    | "trades"
    | "science"
    | "education"
    | "military"
    | "sports"
    | "politics"
    | "tech"
    | "service";
  educationRequired:
    | "none"
    | "secondary"
    | "vocational"
    | "degree"
    | "postgrad"
    | "doctorate";
  yearsToQualify: number;
  startingSalary: number;
  maxSalary: number;
  happinessBonus: number;
  stressLevel: number;
  description: string;
}

export interface Relationship {
  id: string;
  name: string;
  type: "friend" | "partner" | "spouse" | "child" | "colleague";
  closeness: number;
  metAtAge: number;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  type:
    | "life"
    | "world"
    | "career"
    | "education"
    | "relationship"
    | "business"
    | "politics";
  choices: EventChoice[];
  autoResolve?: boolean;
}

export interface EventChoice {
  text: string;
  effects: Partial<StatEffects>;
  condition?: (state: GameState) => boolean;
}

export interface StatEffects {
  health: number;
  happiness: number;
  intelligence: number;
  reputation: number;
  wealth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  politicsSupport: number;
  businessValue: number;
}

export type LifeStage =
  | "infant"
  | "child"
  | "teen"
  | "youngAdult"
  | "adult"
  | "middleAge"
  | "senior";
export type EducationStage =
  | "none"
  | "primarySchool"
  | "secondarySchool"
  | "university"
  | "vocational"
  | "working"
  | "retired";
export type BusinessStage =
  | "none"
  | "sidehustle"
  | "startup"
  | "sme"
  | "corporation";
export type PoliticsRank =
  | "none"
  | "activist"
  | "councillor"
  | "mp"
  | "minister"
  | "pm";

export interface GameState {
  playerName: string;
  age: number;
  month: number;
  birthYear: number;
  totalMonths: number;

  health: number;
  happiness: number;
  intelligence: number;
  reputation: number;

  wealth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  debt: number;

  lifeStage: LifeStage;
  educationStage: EducationStage;
  educationProgress: number;
  selectedCareer: Career | null;
  universityYears: number;

  jobTitle: string;
  yearsAtJob: number;
  jobLevel: number;
  salaryHistory: number[];

  relationships: Relationship[];
  married: boolean;
  spouseName: string;
  children: number;

  hasBusiness: boolean;
  businessName: string;
  businessValue: number;
  businessMonthlyProfit: number;
  businessStage: BusinessStage;
  businessEmployees: number;

  politicsActive: boolean;
  politicsRank: PoliticsRank;
  politicsSupport: number;
  politicsCampaignFund: number;

  housing: string;
  food: string;
  transport: string;
  entertainment: string;
  healthCare: string;

  isAlive: boolean;
  causeOfDeath: string;
  lifeScore: number;
  achievements: string[];

  pendingEvent: LifeEvent | null;
  awaitingCareerChoice: boolean;
  lastEventTitle: string;
}

export interface LifestyleOption {
  id: string;
  label: string;
  monthlyCost: number;
  healthEffect: number;
  happinessEffect: number;
  reputationEffect: number;
  description: string;
}

export interface LifestyleCategory {
  id: string;
  name: string;
  options: LifestyleOption[];
}

export interface SavedGame {
  playerName: string;
  age: number;
  lifeScore: number;
  causeOfDeath: string;
  achievements: string[];
  savedAt: string;
  state: GameState;
}
