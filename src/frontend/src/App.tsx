import { useCallback, useState } from "react";
import { CAREERS, CAREER_CATEGORIES } from "./game/careers";
import {
  advanceMonth,
  applyEventChoice,
  calculateLifeScore,
  createNewGame,
  formatMoney,
  getMonthName,
  loadSaves,
  saveGame,
  startCareer,
} from "./game/engine";
import { LIFESTYLE_CATEGORIES } from "./game/lifestyles";
import type { GameState, LifeEvent } from "./game/types";

// ——— Helper ———
function StatBar({
  label,
  value,
  color,
  icon,
}: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium">{label}</span>
          <span className="text-white font-bold">{Math.round(value)}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const LIFE_STAGE_COLORS: Record<string, string> = {
  infant: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  child: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  teen: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  youngAdult: "bg-green-500/20 text-green-300 border-green-500/40",
  adult: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  middleAge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  senior: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

const LIFE_STAGE_LABEL: Record<string, string> = {
  infant: "Infant",
  child: "Child",
  teen: "Teenager",
  youngAdult: "Young Adult",
  adult: "Adult",
  middleAge: "Middle-Aged",
  senior: "Senior",
};

// ——— Welcome Screen ———
function WelcomeScreen({
  onStart,
}: { onStart: (name: string, year: number, existing?: GameState) => void }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState(1995);
  const saves = loadSaves();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Life Simulator
          </h1>
          <p className="text-slate-400 mt-2">
            Live your life. Make your choices. Shape your destiny.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Start a New Life
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nameInput"
                className="block text-sm text-slate-400 mb-1"
              >
                Your Name
              </label>
              <input
                id="nameInput"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Birth Year: <span className="text-white font-bold">{year}</span>
              </label>
              <input
                type="range"
                min={1970}
                max={2005}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1970</span>
                <span>2005</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => name.trim() && onStart(name.trim(), year)}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
            >
              Begin Life 🚀
            </button>
          </div>
        </div>

        {saves.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">
              🏆 Past Lives (Leaderboard)
            </h2>
            <div className="space-y-2">
              {saves
                .sort((a: any, b: any) => b.lifeScore - a.lifeScore)
                .slice(0, 5)
                .map((save: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
                  >
                    <span className="text-lg">
                      {["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {save.playerName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {save.causeOfDeath
                          ? `Died at ${save.age} — ${save.causeOfDeath}`
                          : `Age ${save.age} (ongoing)`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-sm">
                        {save.lifeScore} pts
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onStart(
                          save.playerName,
                          save.state.birthYear,
                          save.state,
                        )
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-slate-700 rounded"
                    >
                      Load
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ——— Career Choice Screen ———
function CareerChoiceScreen({ onChoose }: { onChoose: (career: any) => void }) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = CAREERS.filter(
    (c) =>
      (!selectedCat || c.category === selectedCat) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-center">
          🎓 Choose Your Career Path
        </h1>
        <p className="text-slate-400 text-center text-sm mt-1">
          You've finished secondary school. What's next?
        </p>
      </div>
      <div className="p-4 space-y-3">
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          placeholder="Search careers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !selectedCat
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            All
          </button>
          {CAREER_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() =>
                setSelectedCat(selectedCat === cat.id ? null : cat.id)
              }
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCat === cat.id
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {filtered.map((career) => (
          <button
            type="button"
            key={career.id}
            onClick={() => onChoose(career)}
            className="w-full text-left p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-white">{career.name}</span>
              <span className="text-green-400 text-sm font-bold">
                {formatMoney(career.startingSalary)}/mo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{career.description}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-blue-400">
                📚 {career.yearsToQualify}y training
              </span>
              <span className="text-yellow-400">
                💛 Happiness +{career.happinessBonus}
              </span>
              <span className="text-red-400">
                ⚡ Stress {career.stressLevel}/10
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ——— Death Screen ———
function DeathScreen({
  state,
  onRestart,
}: { state: GameState; onRestart: () => void }) {
  const score = calculateLifeScore(state);
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚰️</div>
          <h1 className="text-3xl font-bold">{state.playerName}</h1>
          <p className="text-slate-400">
            {state.birthYear} — {state.birthYear + Math.floor(state.age)}
          </p>
          <p className="text-red-400 mt-2">
            Cause of death: {state.causeOfDeath}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-yellow-400">{score}</div>
            <div className="text-slate-400 text-sm">Life Score</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Age", value: `${Math.floor(state.age)}` },
              { label: "Wealth", value: formatMoney(state.wealth) },
              { label: "Career", value: state.jobTitle },
              {
                label: "Relationships",
                value: `${state.relationships.length}`,
              },
              { label: "Children", value: `${state.children}` },
              { label: "Married", value: state.married ? "Yes" : "No" },
              {
                label: "Business",
                value: state.hasBusiness ? state.businessStage : "None",
              },
              {
                label: "Politics",
                value:
                  state.politicsRank === "none" ? "None" : state.politicsRank,
              },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-400 text-xs">{item.label}</div>
                <div className="font-semibold mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {state.achievements.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
            <h3 className="font-semibold mb-3">
              🏆 Achievements ({state.achievements.length})
            </h3>
            <div className="space-y-1">
              {state.achievements.map((a, i) => (
                <div key={i} className="text-sm text-slate-300">
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all"
        >
          🔄 Live Again
        </button>
      </div>
    </div>
  );
}

// ——— Event Card ———
function EventCard({
  event,
  onChoice,
}: { event: LifeEvent; onChoice: (i: number) => void }) {
  const typeColors: Record<string, string> = {
    world: "border-orange-500/50 bg-orange-950/30",
    life: "border-blue-500/50 bg-blue-950/30",
    career: "border-green-500/50 bg-green-950/30",
    relationship: "border-pink-500/50 bg-pink-950/30",
    education: "border-yellow-500/50 bg-yellow-950/30",
    business: "border-cyan-500/50 bg-cyan-950/30",
    politics: "border-purple-500/50 bg-purple-950/30",
  };

  return (
    <div
      className={`border-2 rounded-2xl p-5 ${typeColors[event.type] ?? "border-slate-600 bg-slate-800/50"}`}
    >
      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
      <p className="text-slate-300 text-sm mb-4">{event.description}</p>
      <div className="space-y-2">
        {event.choices.map((choice, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onChoice(i)}
            className="w-full text-left px-4 py-3 bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600 hover:border-slate-400 rounded-xl text-sm font-medium transition-all"
          >
            {choice.text}
            {Object.entries(choice.effects)
              .filter(([, v]) => v !== 0)
              .slice(0, 3)
              .map(([k, v]) => (
                <span
                  key={k}
                  className={`ml-2 text-xs font-bold ${(v as number) > 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {(v as number) > 0 ? "+" : ""}
                  {k === "wealth" || k === "monthlyIncome"
                    ? formatMoney(v as number)
                    : v}
                  {k !== "wealth" && k !== "monthlyIncome" ? "" : ""}
                </span>
              ))}
          </button>
        ))}
      </div>
    </div>
  );
}

// ——— Tabs ———
type Tab = "life" | "career" | "education" | "business" | "politics";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "life", icon: "🏠", label: "Life" },
  { id: "career", icon: "💼", label: "Career" },
  { id: "education", icon: "📚", label: "Education" },
  { id: "business", icon: "🏢", label: "Business" },
  { id: "politics", icon: "🗳️", label: "Politics" },
];

// ——— Life Tab ———
function LifeTab({
  state,
  onUpdate,
}: { state: GameState; onUpdate: (s: GameState) => void }) {
  return (
    <div className="space-y-4">
      {LIFESTYLE_CATEGORIES.map((cat) => {
        const key = cat.id === "healthcare" ? "healthCare" : cat.id;
        const current = state[key as keyof GameState] as string;
        return (
          <div key={cat.id}>
            <h3 className="font-semibold text-slate-300 mb-2">{cat.name}</h3>
            <div className="space-y-2">
              {cat.options.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => onUpdate({ ...state, [key]: opt.id })}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    current === opt.id
                      ? "bg-blue-900/50 border-blue-500 text-white"
                      : "bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{opt.label}</span>
                    <span
                      className={`text-sm font-bold ${opt.monthlyCost === 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {opt.monthlyCost === 0
                        ? "Free"
                        : `-${formatMoney(opt.monthlyCost)}/mo`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {opt.description}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs">
                    {opt.healthEffect !== 0 && (
                      <span
                        className={
                          opt.healthEffect > 0
                            ? "text-red-400"
                            : "text-slate-500"
                        }
                      >
                        ❤️ {opt.healthEffect > 0 ? "+" : ""}
                        {opt.healthEffect}
                      </span>
                    )}
                    {opt.happinessEffect !== 0 && (
                      <span
                        className={
                          opt.happinessEffect > 0
                            ? "text-yellow-400"
                            : "text-slate-500"
                        }
                      >
                        😊 {opt.happinessEffect > 0 ? "+" : ""}
                        {opt.happinessEffect}
                      </span>
                    )}
                    {opt.reputationEffect !== 0 && (
                      <span
                        className={
                          opt.reputationEffect > 0
                            ? "text-purple-400"
                            : "text-slate-500"
                        }
                      >
                        ⭐ {opt.reputationEffect > 0 ? "+" : ""}
                        {opt.reputationEffect}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ——— Career Tab ———
function CareerTab({ state }: { state: GameState }) {
  if (!state.selectedCareer) {
    return (
      <div className="text-center text-slate-400 py-12">
        <div className="text-4xl mb-3">💼</div>
        <p>You haven't chosen a career yet.</p>
        <p className="text-sm mt-1">
          Finish secondary school to unlock career options.
        </p>
      </div>
    );
  }

  const cat = CAREER_CATEGORIES.find(
    (c) => c.id === state.selectedCareer!.category,
  );

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{state.jobTitle}</h3>
            <span className={`text-xs font-semibold ${cat?.color}`}>
              {cat?.label}
            </span>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold text-lg">
              {formatMoney(state.monthlyIncome)}/mo
            </div>
            <div className="text-xs text-slate-400">
              Level {state.jobLevel}/5
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Years at Job</div>
            <div className="font-bold mt-0.5">
              {state.yearsAtJob.toFixed(1)}y
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Max Salary</div>
            <div className="font-bold mt-0.5">
              {formatMoney(state.selectedCareer.maxSalary)}/mo
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Stress Level</div>
            <div className="font-bold mt-0.5">
              {state.selectedCareer.stressLevel}/10
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Job Level</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((l) => (
                <div
                  key={l}
                  className={`flex-1 h-2 rounded-full ${l <= state.jobLevel ? "bg-blue-500" : "bg-slate-700"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {state.salaryHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="font-semibold mb-3 text-sm text-slate-300">
            📈 Salary History
          </h4>
          <div className="space-y-1">
            {state.salaryHistory.slice(-5).map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Year{" "}
                  {state.salaryHistory.length -
                    (state.salaryHistory.slice(-5).length - i) +
                    1}
                </span>
                <span className="text-green-400">{formatMoney(s)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ——— Education Tab ———
function EducationTab({ state }: { state: GameState }) {
  const educationLabels: Record<string, string> = {
    none: "Not in school yet",
    primarySchool: "Primary School (Ages 6-12)",
    secondarySchool: "Secondary School (Ages 12-18)",
    university: "University",
    vocational: "Vocational Training",
    working: "Graduated - Working",
    retired: "Retired",
  };

  const totalMonthsForStage =
    state.educationStage === "primarySchool"
      ? 72
      : state.educationStage === "secondarySchool"
        ? 72
        : state.selectedCareer
          ? state.selectedCareer.yearsToQualify * 12
          : 48;

  const progress = Math.min(
    100,
    (state.educationProgress / totalMonthsForStage) * 100,
  );

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold mb-1">
          {educationLabels[state.educationStage]}
        </h3>
        {state.selectedCareer && (
          <p className="text-sm text-slate-400 mb-3">
            Studying: {state.selectedCareer.name}
          </p>
        )}
        {[
          "primarySchool",
          "secondarySchool",
          "university",
          "vocational",
        ].includes(state.educationStage) && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {state.educationProgress} / {totalMonthsForStage} months
            </div>
          </div>
        )}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h4 className="font-semibold mb-3 text-slate-300">📊 Intelligence</h4>
        <StatBar
          label="Intelligence"
          value={state.intelligence}
          color="bg-blue-500"
          icon="🧠"
        />
        <p className="text-xs text-slate-500 mt-2">
          Intelligence affects career growth, salary raises, and life decisions.
        </p>
      </div>
    </div>
  );
}

// ——— Business Tab ———
function BusinessTab({
  state,
  onUpdate,
}: { state: GameState; onUpdate: (s: GameState) => void }) {
  const stages = ["none", "sidehustle", "startup", "sme", "corporation"];
  const stageLabels: Record<string, string> = {
    none: "No Business",
    sidehustle: "Side Hustle",
    startup: "Startup",
    sme: "Small Business",
    corporation: "Corporation",
  };

  function startBusiness() {
    if (state.wealth >= 500) {
      onUpdate({
        ...state,
        hasBusiness: true,
        businessName: `${state.playerName}'s Venture`,
        businessStage: "sidehustle",
        businessValue: 2000,
        businessMonthlyProfit: 200,
        wealth: state.wealth - 500,
      });
    }
  }

  function growBusiness() {
    if (!state.hasBusiness) return;
    const cost =
      state.businessStage === "sidehustle"
        ? 5000
        : state.businessStage === "startup"
          ? 20000
          : state.businessStage === "sme"
            ? 100000
            : 0;
    if (state.wealth < cost) return;
    const nextStage = stages[stages.indexOf(state.businessStage) + 1] as any;
    if (!nextStage || nextStage === "none") return;
    const profitMultiplier =
      nextStage === "startup" ? 5 : nextStage === "sme" ? 4 : 3;
    onUpdate({
      ...state,
      businessStage: nextStage,
      businessValue: state.businessValue * 4,
      businessMonthlyProfit: state.businessMonthlyProfit * profitMultiplier,
      businessEmployees:
        (state.businessEmployees || 0) +
        (nextStage === "startup" ? 3 : nextStage === "sme" ? 20 : 100),
      wealth: state.wealth - cost,
      achievements:
        nextStage === "corporation" &&
        !state.achievements.includes("🏢 Built a Corporation!")
          ? [...state.achievements, "🏢 Built a Corporation!"]
          : state.achievements,
    });
  }

  const nextStageCost =
    state.businessStage === "sidehustle"
      ? 5000
      : state.businessStage === "startup"
        ? 20000
        : state.businessStage === "sme"
          ? 100000
          : null;

  if (!state.hasBusiness) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="font-bold mb-2">Start Your Business</h3>
          <p className="text-slate-400 text-sm mb-4">
            Invest $500 to start a side hustle. Grow it into a corporation!
          </p>
          <button
            type="button"
            onClick={startBusiness}
            disabled={state.wealth < 500}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl"
          >
            Start Side Hustle (-$500)
          </button>
          {state.wealth < 500 && (
            <p className="text-red-400 text-xs mt-2">Need $500 to start</p>
          )}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="font-semibold mb-3 text-sm">Business Growth Path</h4>
          <div className="flex justify-between items-center">
            {["Side Hustle", "Startup", "SME", "Corporation"].map(
              (stage, i) => (
                <div key={i} className="flex items-center">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 w-16 text-center">
                      {stage}
                    </div>
                  </div>
                  {i < 3 && <div className="w-4 h-0.5 bg-slate-700 mx-1" />}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{state.businessName}</h3>
            <span className="text-xs text-cyan-400 font-semibold">
              {stageLabels[state.businessStage]}
            </span>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold">
              {formatMoney(state.businessMonthlyProfit)}/mo profit
            </div>
            <div className="text-slate-400 text-xs">
              Worth {formatMoney(state.businessValue)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Employees</div>
            <div className="font-bold mt-0.5">{state.businessEmployees}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Stage</div>
            <div className="font-bold mt-0.5">
              {stages.indexOf(state.businessStage) + 1}/5
            </div>
          </div>
        </div>
        {nextStageCost !== null && (
          <button
            type="button"
            onClick={growBusiness}
            disabled={state.wealth < nextStageCost}
            className="w-full mt-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm"
          >
            Expand Business (-{formatMoney(nextStageCost)})
          </button>
        )}
        {nextStageCost === null && (
          <div className="mt-3 text-center text-green-400 font-semibold text-sm">
            🏆 Maximum growth reached!
          </div>
        )}
      </div>
    </div>
  );
}

// ——— Politics Tab ———
function PoliticsTab({
  state,
  onUpdate,
}: { state: GameState; onUpdate: (s: GameState) => void }) {
  const ranks: {
    id: GameState["politicsRank"];
    label: string;
    cost: number;
    requirement: string;
  }[] = [
    {
      id: "activist",
      label: "Community Activist",
      cost: 0,
      requirement: "None",
    },
    {
      id: "councillor",
      label: "Local Councillor",
      cost: 5000,
      requirement: "Be an activist",
    },
    {
      id: "mp",
      label: "Member of Parliament",
      cost: 25000,
      requirement: "Be a councillor",
    },
    {
      id: "minister",
      label: "Government Minister",
      cost: 50000,
      requirement: "Be an MP",
    },
    {
      id: "pm",
      label: "Prime Minister",
      cost: 200000,
      requirement: "Be a minister",
    },
  ];

  const currentIdx = ranks.findIndex((r) => r.id === state.politicsRank);

  function joinPolitics() {
    onUpdate({
      ...state,
      politicsActive: true,
      politicsRank: "activist",
      politicsSupport: 20,
    });
  }

  function seekPromotion() {
    const next = ranks[currentIdx + 1];
    if (!next || state.wealth < next.cost || state.politicsSupport < 40) return;
    onUpdate({
      ...state,
      politicsRank: next.id,
      wealth: state.wealth - next.cost,
      reputation: Math.min(100, state.reputation + 10),
      politicsSupport: Math.max(30, state.politicsSupport - 20),
    });
  }

  if (!state.politicsActive) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-3">🗳️</div>
          <h3 className="font-bold mb-2">Enter Politics</h3>
          <p className="text-slate-400 text-sm mb-4">
            Start as a community activist and work your way up to Prime
            Minister!
          </p>
          <button
            type="button"
            onClick={joinPolitics}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-xl"
          >
            Join Politics (Free)
          </button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="font-semibold mb-3 text-sm">Political Career Path</h4>
          <div className="space-y-2">
            {ranks.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-800"
              >
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.label}</div>
                  {r.cost > 0 && (
                    <div className="text-xs text-slate-500">
                      Campaign fund: {formatMoney(r.cost)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nextRank = ranks[currentIdx + 1];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold mb-1">{ranks[currentIdx]?.label}</h3>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Public Support</span>
            <span>{Math.round(state.politicsSupport)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${state.politicsSupport}%` }}
            />
          </div>
        </div>
      </div>
      {nextRank && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="font-semibold mb-3">Next: {nextRank.label}</h4>
          <div className="text-sm text-slate-400 space-y-1 mb-4">
            <p>
              Campaign cost:{" "}
              <span className="text-yellow-400">
                {formatMoney(nextRank.cost)}
              </span>
            </p>
            <p>
              Support needed: <span className="text-purple-400">40%</span>
            </p>
            <p>
              Your support:{" "}
              <span
                className={
                  state.politicsSupport >= 40
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {Math.round(state.politicsSupport)}%
              </span>
            </p>
            <p>
              Your wealth:{" "}
              <span
                className={
                  state.wealth >= nextRank.cost
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {formatMoney(state.wealth)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={seekPromotion}
            disabled={
              state.wealth < nextRank.cost || state.politicsSupport < 40
            }
            className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm"
          >
            Run for {nextRank.label}
          </button>
        </div>
      )}
      {!nextRank && (
        <div className="text-center text-purple-400 font-bold py-8 text-lg">
          👑 You are the Prime Minister!
        </div>
      )}
    </div>
  );
}

// ——— Main Game Screen ———
function GameScreen({
  initialState,
  onDeath,
}: { initialState: GameState; onDeath: (s: GameState) => void }) {
  const [state, setState] = useState<GameState>(initialState);
  const [tab, setTab] = useState<Tab>("life");
  const handleNextMonth = useCallback(() => {
    if (state.pendingEvent || state.awaitingCareerChoice) return;
    const next = advanceMonth(state);
    setState(next);
    saveGame(next);
    if (!next.isAlive) {
      onDeath(next);
    }
  }, [state, onDeath]);

  const handleChoice = useCallback(
    (i: number) => {
      const next = applyEventChoice(state, i);
      setState(next);
      saveGame(next);
    },
    [state],
  );

  const handleCareerChoice = useCallback(
    (career: any) => {
      const next = startCareer(state, career);
      setState(next);
      saveGame(next);
    },
    [state],
  );

  if (state.awaitingCareerChoice) {
    return <CareerChoiceScreen onChoose={handleCareerChoice} />;
  }

  const currentYear = state.birthYear + Math.floor(state.age);
  const netMonthly = state.monthlyIncome - state.monthlyExpenses;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg leading-tight">
              {state.playerName}
            </div>
            <div className="text-slate-400 text-xs">
              {getMonthName(state.month)} {currentYear}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${LIFE_STAGE_COLORS[state.lifeStage]}`}
            >
              {LIFE_STAGE_LABEL[state.lifeStage]}
            </span>
            <span className="text-slate-300 font-bold">
              {Math.floor(state.age)}y
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 space-y-2 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-2">
          <StatBar
            label="Health"
            value={state.health}
            color="bg-red-500"
            icon="❤️"
          />
          <StatBar
            label="Happiness"
            value={state.happiness}
            color="bg-yellow-500"
            icon="😊"
          />
          <StatBar
            label="Intelligence"
            value={state.intelligence}
            color="bg-blue-500"
            icon="🧠"
          />
          <StatBar
            label="Reputation"
            value={state.reputation}
            color="bg-purple-500"
            icon="⭐"
          />
        </div>
        {/* Financial */}
        <div className="flex gap-2 text-xs">
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <div className="text-slate-400">Income</div>
            <div className="text-green-400 font-bold">
              {formatMoney(state.monthlyIncome)}
            </div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <div className="text-slate-400">Expenses</div>
            <div className="text-red-400 font-bold">
              -{formatMoney(state.monthlyExpenses)}
            </div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <div className="text-slate-400">Savings</div>
            <div
              className={`font-bold ${state.wealth >= 0 ? "text-white" : "text-red-400"}`}
            >
              {formatMoney(state.wealth)}
            </div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <div className="text-slate-400">Net</div>
            <div
              className={`font-bold ${netMonthly >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {netMonthly >= 0 ? "+" : ""}
              {formatMoney(netMonthly)}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Event card or Next Month */}
        {state.pendingEvent ? (
          <div className="mb-4">
            <EventCard event={state.pendingEvent} onChoice={handleChoice} />
          </div>
        ) : (
          <div className="mb-4">
            {state.lastEventTitle && (
              <div className="text-xs text-slate-500 text-center mb-2">
                Last: {state.lastEventTitle}
              </div>
            )}
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3.5 rounded-xl text-base transition-all active:scale-95"
            >
              ⏩ Next Month →
            </button>
          </div>
        )}

        {/* Tab panels */}
        {tab === "life" && <LifeTab state={state} onUpdate={setState} />}
        {tab === "career" && <CareerTab state={state} />}
        {tab === "education" && <EducationTab state={state} />}
        {tab === "business" && (
          <BusinessTab state={state} onUpdate={setState} />
        )}
        {tab === "politics" && (
          <PoliticsTab state={state} onUpdate={setState} />
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="bg-slate-900 border-t border-slate-800 flex sticky bottom-0">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all ${
              tab === t.id
                ? "text-blue-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ——— Root ———
export default function App() {
  const [screen, setScreen] = useState<"welcome" | "game" | "death">("welcome");
  const [gameState, setGameState] = useState<GameState | null>(null);

  function handleStart(name: string, year: number, existing?: GameState) {
    if (existing) {
      setGameState(existing);
    } else {
      setGameState(createNewGame(name, year));
    }
    setScreen("game");
  }

  function handleDeath(finalState: GameState) {
    setGameState(finalState);
    setScreen("death");
  }

  if (screen === "welcome") return <WelcomeScreen onStart={handleStart} />;
  if (screen === "death" && gameState)
    return (
      <DeathScreen state={gameState} onRestart={() => setScreen("welcome")} />
    );
  if (screen === "game" && gameState)
    return <GameScreen initialState={gameState} onDeath={handleDeath} />;
  return null;
}
