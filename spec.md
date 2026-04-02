# Life Simulator Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full life simulation game from birth to death
- Age progression: monthly or yearly ticks
- Life stages: Infant, Child, Teen, Young Adult, Adult, Senior
- Education system: Primary School (ages 6-12), Secondary School (ages 12-18), University/Career Training (ages 18+)
- 50+ real-life careers with realistic salary ranges and time-to-qualify durations
- Lifestyle system: housing, food, transport, entertainment, health - each with tiered costs
- Relationship system: friends, romantic partners, family events
- Happiness, Health, Intelligence, Wealth, Reputation stats
- Random real-world life events (accidents, promotions, recessions, pandemics, elections)
- Politics track: local councillor → MP → Minister → Prime Minister
- Business track: side hustle → startup → SME → corporation
- Financial system: income, expenses, savings, investments, debt
- Game save/load via backend canister
- Death conditions: age, health, accidents, lifestyle choices
- End-of-life summary with achievements

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko backend: save/load game state, leaderboard of life scores
2. Frontend game engine:
   - Game state machine with life stages
   - Age/time progression system
   - Stats panel (Health, Happiness, Intelligence, Wealth, Reputation)
   - Education flow with school choice events
   - Career selection modal with 50+ careers, salary, duration
   - Lifestyle tab: housing/food/transport/entertainment choices
   - Relationships tab: meet people, date, marry, have children
   - Business tab: start business, grow it, manage employees
   - Politics tab: run for office, campaign, vote mechanics
   - Events system: random world events that affect stats
   - Financial dashboard: monthly income/expenses breakdown
   - Death screen with life summary and score
3. Data: careers.ts, events.ts, lifestyles.ts data files
