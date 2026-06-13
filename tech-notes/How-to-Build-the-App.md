# How to Build ResoLogix: A Comprehensive Guide

This document is a systematic consolidation of the operations, designs, and architectural choices that built **ResoLogix** from day 1. It outlines how the various components were requested, designed, and implemented across our entire development journey.

---

## 1. Project Initialization & Architecture

### Tech Stack & Core Decisions
- **Frontend & Backend Framework:** Next.js (App Router, React Server Components) combined with strict TypeScript.
- **Styling:** Tailwind CSS with a highly customized dark theme (Navy/Indigo) with glassmorphism components to ensure a premium, modern aesthetic.
- **Database:** `better-sqlite3` chosen for its simplicity, speed, and seamless integration for a local/embedded database without requiring external network services. 
- **Charting & Math:** Chart.js for rendering PDF/CDF histograms and scatter plots; `ml-levenberg-marquardt` for complex decline curve fitting math.
- **Document Generation:** A robust suite of libraries (`exceljs`, `docx`, `pptxgenjs`, `pdfkit`, `archiver`) deployed for high-fidelity multi-format reporting.

### Version Control & Automation
- Configured semantic versioning (`m.n.p`) where `p` increments per commit.
- Created a custom `.git/hooks/prepare-commit-msg` hook. It intercepts commits to automatically append the version and build time (e.g., `v1.0.12 build 2026-06-10-0930`), ensuring every commit is rigorously tracked.

---

## 2. Authentication & User Management

### Security Framework
- Implemented **NextAuth** to secure the application. 
- Database schema established in `src/lib/db.ts` capturing users, passwords (via `bcryptjs`), and role flags (`is_admin`, `isSuperAdmin`).

### User Roles & Permissions
1. **Registered Users:** Can create, edit, save, and organize their own evaluations and DCA scenarios into custom folders.
2. **Administrators:** Access to a hidden Admin panel to manage platform roles and perform database CRUD operations.
3. **Unregistered Guests:** 
   - Welcomed by a "Guest Access Notice".
   - Can interact with pre-seeded **Example Scenarios**.
   - Allowed to run Monte Carlo simulations or DCA auto-fits on the fly, and even export reports.
   - **Restricted:** Cannot permanently save data or overwrite example scenarios.

---

## 3. Core Module: Monte Carlo Simulation (Primary Engine)

### Reserve Evaluation Logic
- Replicates the logic of industry-standard tools (like Rose & Associates RoseRA/MMRA).
- Takes parameters like Area (A), Net Pay (h), Porosity (Phi), Water Saturation (Sw), Formation Volume Factor (Boi), and Recovery Efficiency (RE).
- **Stochastic Modeling:** Users input P90 and P10 values for lognormal/normal distributions. The engine runs up to 50,000 iterations to yield Mean, P10, P50, P90 reserves.

### UI Implementation
- Form inputs organized into collapsible sections: `SCENARIO NAME`, `RESOURCE PROFILE` (including fields for Country, Basin, Play-Type, Age, Lithology, Environment, etc.), `VOLUMETRIC PARAMETERS`, and `GEOLOGICAL RISK`.
- **Geological Risk:** Evaluates Source, Timing/Migration, Reservoir Quality, Closures, and Containment to calculate overall Chance of Success (Pg).

---

## 4. Core Module: Decline Curve Analysis (DCA)

### Engine & Math
- Built as an alternative production analysis engine running alongside the Monte Carlo simulation.
- Analyzes historical production data against the Arps equations (Exponential, Harmonic, Hyperbolic).
- **Auto-Fitting:** Utilizes the Levenberg-Marquardt algorithm to iteratively guess and fit parameters (`qi`, `di`, `b`). 
- Features a **Manual-Fit** group box for users wanting to override the LM algorithm.

### Data Ingestion & Visualization
- Supported pasting 2-column tabular data directly from Excel or text files into the UI.
- Generates a dynamic, logarithmic-scale scatter plot overlaid with the forecasted Arps curve.

### Example Scenarios
- Seeded via a Node script (`seed_examples.js`) fetching real open-source decline curves from public Github repositories, offering immediate visual feedback for unregistered and registered users alike.

---

## 5. Reporting & Export Engine

### Multi-Format Generation
- Replaced basic output tables with a comprehensive Report Generator.
- Outputs include:
  - **Excel/CSV:** Transposed and standard data tables.
  - **Images:** High-res PNGs of cumulative and density distribution charts.
  - **PowerPoint & Word:** Branded slide decks and documents featuring the data tables and full-page images.
  - **PDF:** Formal generated documents.

### Status Dialog & Preview Workflow
- Developed a live-updating dialog box tracking the generation of reports (e.g., "Copying Reserve Parameters", "Generating PPTX").
- Introduced a "Preview" step allowing users to view the generated files in their browser.
- Zips all selected files into a single bundle under 20MB.
- **Cleanup:** Implemented a backend timer that purges generated reports from the server `./reports` directory exactly 10 minutes after generation to save disk space.

---

## 6. Utilities & Ancillary Pages

### Tools Page
- Added industry-standard calculators:
  - **Oil FVF (Bo):** Based on the Standing (1947) correlation.
  - **Gas FVF (Bg):** Based on the Dranchuk-Abou-Kassem (1975) equation.
  - **Unit Converter:** Rapid conversions for oilfield units.

### Documentation (Docs Page)
- Organized into 4 distinct chapters:
  1. Introduction to Resource Evaluation
  2. Monte Carlo Simulation Theory
  3. Decline Curve Analysis
  4. Tool Theory (Bo/Bg calculation approaches)

---

## 7. UI/UX Enhancements & Polish

- **Theming Fixes:** Addressed contrast issues in the Dark Theme by lightening dropdowns and input boxes against the navy background to ensure maximum readability.
- **Navigation:** Standardized headers with a "Return to main App" back arrow and consistent layout.
- **Sidebar Integration:** Built a resizable sidebar handling folderized categorization of scenarios, featuring "Eye" toggles to hide/show Example Scenarios (disabled for guests to prevent them from hiding their only data).
- **Footer:** Implemented a globally consistent footer tracking the automatic build year, copyrights, and social media links.
