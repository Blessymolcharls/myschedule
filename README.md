# MySchedule — Intelligent Personal Scheduler & Productivity Platform

**MySchedule** is a full-stack MERN application engineered to bridge the gap between static task management and deterministic time allocation. By combining priority weighting, deadline urgency factors, availability windows, break preferences, and fixed hard commitments, MySchedule automatically constructs and dynamically maintains an achievable daily calendar.

---

## 🌟 Core Architecture & Capabilities

### 1. 🧠 Deterministic Scheduling Engine
- **Multi-Factor Priority Scoring**:
  $$\text{Score} = \text{BasePriority} + \text{DeadlineUrgency} + \text{DurationBoost}$$
  * Base Weights: Urgent ($1000$), High ($600$), Medium ($300$), Low ($100$).
  * Impending deadlines within $24\text{h}$ or $48\text{h}$ receive exponential urgency multipliers.
- **Availability Windowing**: Dynamically computes free non-overlapping time slots based on configured working hours, sleep windows, and designated rest days.
- **Hard Constraint Protection**: Fixed commitments (classes, office shifts, recurring meetings) are strictly non-moveable and fully respected.
- **Intelligent Chunking & Buffer Insertion**: Breaks large tasks exceeding chunk thresholds (e.g. 120m) into multiple sessions with configurable buffer times.

### 2. ⚡ Dynamic Mid-Day Rescheduling
- When life happens (early task completion, session overruns, postponed activities, or newly added fixed commitments), the dynamic rescheduling engine re-balances remaining pending tasks into the earliest available free slots.

### 3. 🔥 Systematic Consistency Streaks & Adherence Engine
- Streaks are earned exclusively through **real schedule adherence**, not empty application logins:
  $$\text{Adherence \%} = \min\left(100, \left(\frac{\text{Completed Minutes}}{\text{Planned Minutes}}\right) \times 100\right)$$
- Days with adherence $\ge 70\%$ qualify towards the streak.
- **Streak Protection (Freezes)**: Allows activating shields for emergency missed days.
- **Streak Recovery**: Coming back with 2 consecutive days at $\ge 85\%$ adherence automatically restores a broken streak.
- **Designated Rest Days**: Streak remains active and protected on weekly rest days (e.g. Sundays).

### 4. ⏱️ Live Focus Mode & Time Tracking
- Real-time digital stopwatch directly linked to active schedule events.
- Live elapsed timer bar with one-click completion & celebration feedback.
- Manual log entry and historic time log ledger.

### 5. 📊 Planned vs Actual Productivity Analytics
- Recharts visualizations comparing planned effort against actual execution time.
- Category distribution breakdown (Academics, Projects, Placement Prep, Personal).
- Task duration variance ledger (identifying estimation discrepancies).
- Adaptive AI insights suggesting duration buffer adjustments.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js (ES Modules), JWT Authentication, Zod |
| **Database** | MongoDB / MongoDB Atlas, Mongoose ODM |
| **Testing** | Jest, Node.js VM Modules |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI in `.env`

### Installation
```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Configure environment files (server/.env and client/.env)
# Customize server/.env with your MongoDB URI if using MongoDB Atlas
```

### Running Locally
```bash
# Run both Backend API and React Frontend concurrently
npm run dev

# Or run separately:
npm run dev:server   # Starts Express on http://localhost:5000
npm run dev:client   # Starts Vite on http://localhost:5173
```

### Testing
```bash
# Run backend unit tests (conflict detection & scheduling algorithm)
npm run test:server
```

---

## 📁 Suggested Directory Structure

```text
myschedule/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI, Modals & Navigation
│   │   ├── context/          # AuthContext & TimerContext
│   │   ├── pages/            # Dashboard, Calendar, Tasks, Streaks, Analytics, etc.
│   │   ├── services/         # Axios API client
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/           # Database & Environment setup
│   │   ├── controllers/      # REST API Route Controllers
│   │   ├── middleware/       # Auth, Validation & Error Handlers
│   │   ├── models/           # Mongoose Schemas (Tasks, Commitments, Streaks, etc.)
│   │   ├── routes/           # Express Routers
│   │   ├── services/         # Scheduling Engine, Conflict Detector, Streaks, Adherence
│   │   ├── validators/       # Zod Schemas
│   │   └── server.js
│   ├── tests/                # Jest Unit Tests
│   └── package.json
│
└── README.md
```

---

## 🛡️ License
ISC License © 2026 Antigravity Team
