import type { LifeEvent } from "./types";

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "school_bully",
    title: "School Bully",
    description:
      "A bully at school is making your life miserable. How do you handle it?",
    type: "life",
    choices: [
      {
        text: "Stand up to them",
        effects: { happiness: 5, reputation: 5, health: -3 },
      },
      { text: "Tell a teacher", effects: { happiness: 2, reputation: -2 } },
      { text: "Ignore it", effects: { happiness: -5, health: -2 } },
    ],
  },
  {
    id: "new_friend",
    title: "New Friend",
    description:
      "You meet someone who could become a great friend. Do you make the effort?",
    type: "relationship",
    choices: [
      { text: "Become best friends", effects: { happiness: 8, reputation: 3 } },
      { text: "Keep it casual", effects: { happiness: 3 } },
      {
        text: "Decline, focus on studies",
        effects: { intelligence: 3, happiness: -2 },
      },
    ],
  },
  {
    id: "study_opportunity",
    title: "Extra Study",
    description: "Your teacher offers extra tutoring sessions after school.",
    type: "education",
    choices: [
      {
        text: "Take the opportunity",
        effects: { intelligence: 8, happiness: -2 },
      },
      { text: "Decline", effects: { happiness: 3 } },
    ],
  },
  {
    id: "part_time_job",
    title: "Part-Time Job Offer",
    description: "A local shop wants to hire you part-time.",
    type: "career",
    choices: [
      {
        text: "Take the job ($500/month)",
        effects: { wealth: 500, happiness: 2, intelligence: -1 },
      },
      { text: "Focus on school", effects: { intelligence: 3, happiness: 1 } },
    ],
  },
  {
    id: "car_accident",
    title: "Car Accident",
    description: "You were in a car accident on your way home.",
    type: "life",
    choices: [
      {
        text: "Get medical treatment ($2000)",
        effects: { health: -10, wealth: -2000 },
      },
      { text: "Walk it off (risky)", effects: { health: -20 } },
    ],
  },
  {
    id: "illness",
    title: "Sudden Illness",
    description: "You have fallen seriously ill and need medical care.",
    type: "life",
    choices: [
      {
        text: "Get full treatment ($5000)",
        effects: { health: 10, wealth: -5000 },
      },
      { text: "Rest at home", effects: { health: -8, wealth: -500 } },
    ],
  },
  {
    id: "romance",
    title: "Romantic Interest",
    description: "Someone has shown romantic interest in you.",
    type: "relationship",
    choices: [
      { text: "Start dating them", effects: { happiness: 12, wealth: -200 } },
      { text: "Stay focused on work", effects: { intelligence: 2 } },
    ],
  },
  {
    id: "promotion_offer",
    title: "Promotion Opportunity",
    description: "Your boss offers you a promotion with more responsibility.",
    type: "career",
    choices: [
      {
        text: "Accept the promotion",
        effects: { monthlyIncome: 800, happiness: 5, health: -5 },
      },
      {
        text: "Decline, keep work-life balance",
        effects: { happiness: 5, health: 3 },
      },
    ],
  },
  {
    id: "inheritance",
    title: "Inheritance",
    description: "A relative has passed away and left you money in their will.",
    type: "life",
    choices: [
      { text: "Invest it wisely", effects: { wealth: 20000, happiness: 3 } },
      {
        text: "Spend it on lifestyle",
        effects: { wealth: 5000, happiness: 15 },
      },
    ],
  },
  {
    id: "robbery",
    title: "Robbery!",
    description: "You were robbed on your way home.",
    type: "life",
    choices: [
      {
        text: "Report to police",
        effects: { wealth: -2000, happiness: -5, reputation: 2 },
      },
      { text: "Move on quietly", effects: { wealth: -2000, happiness: -8 } },
    ],
  },
  {
    id: "viral_post",
    title: "Viral Social Media Post",
    description: "A post you made went viral online!",
    type: "life",
    choices: [
      {
        text: "Capitalize on the fame",
        effects: { reputation: 15, happiness: 10, monthlyIncome: 300 },
      },
      { text: "Keep a low profile", effects: { happiness: 5 } },
    ],
  },
  {
    id: "mentor",
    title: "Meeting a Mentor",
    description: "An experienced professional wants to mentor you.",
    type: "career",
    choices: [
      {
        text: "Accept mentorship",
        effects: { intelligence: 10, reputation: 5, happiness: 5 },
      },
      { text: "Decline politely", effects: {} },
    ],
  },
  {
    id: "investment_opportunity",
    title: "Investment Opportunity",
    description: "A friend tips you off about a promising investment.",
    type: "life",
    choices: [
      { text: "Invest $10,000", effects: { wealth: 25000, happiness: 8 } },
      {
        text: "Invest $2,000 (safer)",
        effects: { wealth: 4000, happiness: 3 },
      },
      { text: "Ignore it", effects: {} },
    ],
  },
  {
    id: "award",
    title: "Award & Recognition",
    description: "You have received an award for your outstanding work.",
    type: "career",
    choices: [
      {
        text: "Accept graciously",
        effects: { reputation: 15, happiness: 12, monthlyIncome: 200 },
      },
    ],
  },
  {
    id: "job_offer",
    title: "Better Job Offer",
    description: "A competitor company has offered you a higher-paying job.",
    type: "career",
    choices: [
      {
        text: "Accept the offer",
        effects: { monthlyIncome: 1200, happiness: 5, reputation: 3 },
      },
      { text: "Stay loyal", effects: { reputation: 5, happiness: 3 } },
      {
        text: "Negotiate with current employer",
        effects: { monthlyIncome: 600, happiness: 3 },
      },
    ],
  },
  {
    id: "health_scare",
    title: "Health Scare",
    description: "Your doctor found something concerning during a checkup.",
    type: "life",
    choices: [
      {
        text: "Get full tests done ($3000)",
        effects: { health: 5, wealth: -3000, happiness: -3 },
      },
      { text: "Wait and see", effects: { health: -10 } },
    ],
  },
  {
    id: "neighbour_dispute",
    title: "Neighbour Dispute",
    description: "Your neighbour is causing problems for you.",
    type: "life",
    choices: [
      {
        text: "Resolve it peacefully",
        effects: { happiness: 3, reputation: 3 },
      },
      {
        text: "Take legal action ($1000)",
        effects: { wealth: -1000, reputation: -2 },
      },
      { text: "Ignore it", effects: { happiness: -3 } },
    ],
  },
  {
    id: "charity_event",
    title: "Charity Gala",
    description: "You are invited to a charity fundraising gala.",
    type: "life",
    choices: [
      {
        text: "Attend and donate ($2000)",
        effects: { wealth: -2000, reputation: 10, happiness: 5 },
      },
      {
        text: "Attend only (no donation)",
        effects: { reputation: 3, happiness: 3 },
      },
      { text: "Skip it", effects: {} },
    ],
  },
  {
    id: "startup_offer",
    title: "Startup Opportunity",
    description: "A friend wants you to co-found a startup with them.",
    type: "business",
    choices: [
      {
        text: "Join as co-founder ($10,000 investment)",
        effects: { wealth: -10000, businessValue: 30000, happiness: 8 },
      },
      { text: "Decline", effects: {} },
    ],
  },
  {
    id: "political_rally",
    title: "Political Rally",
    description: "A political party invites you to speak at their rally.",
    type: "politics",
    choices: [
      {
        text: "Give a speech",
        effects: { reputation: 10, politicsSupport: 15, happiness: 5 },
      },
      {
        text: "Attend but stay quiet",
        effects: { reputation: 3, politicsSupport: 5 },
      },
      { text: "Decline", effects: {} },
    ],
  },
];

export const WORLD_EVENTS: LifeEvent[] = [
  {
    id: "recession",
    title: "🌍 Global Recession",
    description:
      "A global economic recession has hit. Businesses are struggling and unemployment is rising.",
    type: "world",
    choices: [
      {
        text: "Cut lifestyle costs",
        effects: { happiness: -10, health: -3, wealth: 2000 },
      },
      { text: "Stay the course", effects: { happiness: -5, wealth: -3000 } },
      {
        text: "Invest in cheap assets",
        effects: { wealth: -5000, happiness: -3 },
      },
    ],
  },
  {
    id: "pandemic",
    title: "🦠 Global Pandemic",
    description:
      "A deadly virus is spreading worldwide. Lockdowns are in effect.",
    type: "world",
    choices: [
      {
        text: "Stay home and stay safe",
        effects: { health: 5, wealth: -2000, happiness: -10 },
      },
      {
        text: "Work from home",
        effects: { health: 2, wealth: -1000, happiness: -5 },
      },
      { text: "Ignore precautions", effects: { health: -20, happiness: 0 } },
    ],
  },
  {
    id: "tech_boom",
    title: "🚀 Tech Boom",
    description:
      "The technology sector is experiencing unprecedented growth and opportunity.",
    type: "world",
    choices: [
      {
        text: "Invest in tech stocks ($5000)",
        effects: { wealth: 15000, happiness: 8 },
      },
      {
        text: "Switch to a tech career",
        effects: { monthlyIncome: 2000, happiness: 5 },
      },
      { text: "Keep things as they are", effects: {} },
    ],
  },
  {
    id: "housing_boom",
    title: "🏠 Housing Market Boom",
    description: "Property values have surged dramatically.",
    type: "world",
    choices: [
      {
        text: "Buy a property ($50,000 down)",
        effects: { wealth: -50000, businessValue: 100000, happiness: 5 },
      },
      {
        text: "Sell existing property",
        effects: { wealth: 30000, happiness: 5 },
      },
      { text: "Wait for prices to fall", effects: {} },
    ],
  },
  {
    id: "war",
    title: "⚔️ Regional Conflict",
    description:
      "Armed conflict has broken out in a nearby region, causing economic uncertainty.",
    type: "world",
    choices: [
      {
        text: "Volunteer to help",
        effects: { reputation: 10, happiness: 3, health: -5 },
      },
      {
        text: "Donate to relief efforts ($2000)",
        effects: { wealth: -2000, reputation: 8 },
      },
      {
        text: "Focus on personal safety",
        effects: { health: 3, happiness: -5 },
      },
    ],
  },
  {
    id: "stock_crash",
    title: "📉 Stock Market Crash",
    description:
      "The stock market has crashed, wiping out billions in wealth overnight.",
    type: "world",
    choices: [
      {
        text: "Panic sell everything",
        effects: { wealth: -10000, happiness: -8 },
      },
      { text: "Hold steady", effects: { happiness: -5 } },
      { text: "Buy the dip ($5000)", effects: { wealth: -5000, happiness: 3 } },
    ],
  },
  {
    id: "climate_disaster",
    title: "🌊 Climate Disaster",
    description: "A major flood / hurricane has devastated your region.",
    type: "world",
    choices: [
      {
        text: "Repair and rebuild ($10,000)",
        effects: { wealth: -10000, happiness: -5, health: -5 },
      },
      {
        text: "Relocate to a new city",
        effects: { wealth: -5000, happiness: -10, reputation: -5 },
      },
      { text: "Claim insurance", effects: { wealth: -2000, happiness: -5 } },
    ],
  },
  {
    id: "election",
    title: "🗳️ National Election",
    description:
      "A major election is underway. Political activity is at its peak.",
    type: "world",
    choices: [
      {
        text: "Campaign for your party",
        effects: { reputation: 8, politicsSupport: 10, happiness: 3 },
      },
      { text: "Vote and stay neutral", effects: { reputation: 2 } },
      { text: "Ignore it entirely", effects: { reputation: -3 } },
    ],
  },
];

export const CAREER_EVENTS: LifeEvent[] = [
  {
    id: "annual_review",
    title: "📊 Annual Review",
    description: "It's your annual performance review. How did you prepare?",
    type: "career",
    choices: [
      {
        text: "Negotiate a 20% raise",
        effects: { monthlyIncome: 0, happiness: 10, reputation: 5 },
      },
      {
        text: "Accept standard 5% raise",
        effects: { monthlyIncome: 0, happiness: 3 },
      },
      {
        text: "Ask for more vacation days",
        effects: { happiness: 8, health: 3 },
      },
    ],
  },
  {
    id: "workplace_conflict",
    title: "😤 Workplace Conflict",
    description: "You have a serious conflict with a colleague.",
    type: "career",
    choices: [
      { text: "Report to HR", effects: { reputation: -3, happiness: -3 } },
      { text: "Resolve it directly", effects: { reputation: 5, happiness: 3 } },
      {
        text: "Quit and find new job",
        effects: { happiness: 5, monthlyIncome: 500 },
      },
    ],
  },
];
