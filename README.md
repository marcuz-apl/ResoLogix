# ResoLogix

**Know Your Resources at First Place**

## Intro

ResoLogix is a premium, full-range Resource Evaluation and Analytics Platform for Petroleum Resources, specifically engineered for Exploration and Production (E&P) companies. It handles the lifecycle of petroleum resources from early discovery to active production with a suite of sophisticated data tools.

![ResoLogix Interface](./assets/ResoLogix-1-interface.png)

## Core Features

- **Monte Carlo Engine**: Advanced, localized probabilistic simulations for reserve estimations.
- **Decline Curve Analysis (DCA)**: Deep analytical tools for active production wells.
- **Reporting Suite**: Instantly generate highly-formatted PDF, Word (docx), PowerPoint (pptx), and Excel workbooks containing generated charts and volumetric tables.
- **Geological Risk Assessment**: Fully integrated risk matrices for trap, reservoir, charge, and seal.
- **Premium Interface**: A customized Next.js App Router UI featuring sleek animations, a responsive dark mode layout, and intuitive data visualizations via Chart.js.

## Advanced Security & User Management

ResoLogix comes equipped with a strict hierarchical Role-Based Access Control (RBAC) system:
- **SuperAdmin**: Supreme access. Can execute Raw SQL via the built-in database terminal, permanently delete users, and orchestrate other SuperAdmins. (The very first registered user is automatically elevated).
- **Admin**: Mid-level access. Can view the system telemetry, edit restricted tables via a safe point-and-click GUI, and promote regular users.
- **User**: Standard evaluation tier. Completely restricted from all `/admin` routes. 

## ID Architecture
Instead of unreadable UUIDs, the database employs customized, human-readable, millisecond-collision-safe timestamps (e.g. `uid-2026-06-11-16-08-20-4a8f` and `eid-2026-06-11-16-10-14-b2c1`) across the `users`, `evaluations`, and `parameters` tables for rapid tracking and debugging.

## Tech Stack

### Frameworks & UI
- **Framework**: [Next.js v15](https://nextjs.org/) (App Router & Server Components)
- **Language**: [TypeScript](https://www.typescript.org/) (Strict typings)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Custom UI/UX and dark mode handling)
- **Icons**: [Lucide React](https://lucide.dev/)

### State, Data & Engine
- **Database**: Native [SQLite](https://www.sqlite.org/) via `better-sqlite3`
- **Charts**: [Chart.js](https://www.chartjs.org/) & `react-chartjs-2`
- **Engine**: Custom TypeScript Monte Carlo engine (Local Execution)
- **Authentication**: `next-auth` (Credentials Provider, strictly typed JWT sessions)
- **Encryption**: `bcryptjs` for secure password hashing

### Export & Reporting Layer
- **PDF**: `pdfkit`
- **Word / Docx**: `docx`
- **Excel**: `exceljs`
- **PowerPoint**: `pptxgenjs`
- **Archiving**: `archiver` for bundled `.zip` downloads

## Getting Started

1. Clone the repository and install dependencies.
```bash
npm install
```

2. Boot the development server. The local SQLite database (`resologix.db`) will auto-initialize upon startup.
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) and register your first user (they will automatically become the SuperAdmin).

## License

Apache 2.0