# Petroleum Economics Engine Implementation Plan

This plan outlines the architecture for a new Petroleum Economics Engine that automatically bridges the Monte Carlo Volumetric Yields to the Expected Monetary Value (EMV) module.

## Goal
Build a module that takes the calculated P90, P50, and P10 Recoverable Yields, generates a production profile using Decline Curve Analysis (DCA) principles, and applies economic assumptions to calculate $NPV_{90}$, $NPV_{50}$, and $NPV_{10}$. These NPVs will then auto-feed into the EMV module.

## Proposed Architecture

### 1. Global State Management (`DashboardContext.tsx`)
We will introduce a new state object for Economics parameters:
- `oilPrice` ($/bbl, default: $70)
- `gasPrice` ($/mcf, default: $3)
- `opex` ($/boe, default: $15)
- `discountRate` (%, default: 10%)
- `projectLife` (years, default: 20)
- `declineRate` (%, default: 15% / year)

*Note: The `dryHoleCost` (CAPEX) already exists in the EMV parameters state and will be reused as the Initial CAPEX for the NPV calculation.*

### 2. Economic Calculation Logic (`lib/statistics.ts` or `lib/economics.ts`)
Create a new function `calculateNpvFromYield(eur, params)`:
1. **Production Profile**: We must distribute the total Estimated Ultimate Recovery (EUR) over the `projectLife`. We will use a standard discrete exponential decline. 
   - To ensure the sum of production equals the EUR, the Year 1 production ($q_1$) is calculated as: $q_1 = EUR \times \frac{d}{1 - (1-d)^N}$ where $d$ is the decline rate and $N$ is the project life.
   - Production in Year $t$: $q_t = q_{t-1} \times (1 - d)$
2. **Cash Flow Model**:
   - $Revenue_t = q_t \times Price$
   - $OpexCost_t = q_t \times OPEX$
   - $NetCashFlow_t = Revenue_t - OpexCost_t$
3. **Discounting (NPV)**:
   - Apply the $10\%$ discount rate to each year's cash flow.
   - Subtract the `dryHoleCost` (representing Initial CAPEX) at Year 0.
   - Sum to get the final NPV.

### 3. UI Component Integration (`src/components/dashboard/EmvAnalysis.tsx`)
We will upgrade the existing EMV Analysis block into a **"Economics & EMV Analysis"** block.
- **Inputs Panel**: Add fields for Oil Price, Gas Price, OPEX, Project Life, Discount Rate, and Annual Decline Rate.
- **Automation Link**: We will remove the manual inputs for $NPV_{90}$, $NPV_{50}$, and $NPV_{10}$. Instead, these will be *read-only* fields that are automatically calculated instantly whenever the Monte Carlo simulation finishes or whenever an economic input (like Oil Price) is changed.
- **Visuals (Optional but recommended)**: Add a small bar chart showing the 20-year cash flow profile for the P50 case.

### 4. Database & Scenario Saving
- Update the SQLite database schema to include an `econ_params` JSON column.
- Update the `/api/evaluations` endpoints to save and load these new economic assumptions alongside the scenario.

## Open Questions

> [!IMPORTANT]
> 1. **Taxes & Royalties:** For this first version, should we keep it simple (Gross Revenue - OPEX - CAPEX) or do you want me to add an input field for "Royalties (%)" and "Tax Rate (%)"?
> 2. **Auto-Link vs Manual:** By automatically calculating the NPVs from the simulation yields, you lose the ability to manually type in an arbitrary NPV number. Are you okay with the NPV fields becoming purely calculated/read-only outputs based on the economics engine?
