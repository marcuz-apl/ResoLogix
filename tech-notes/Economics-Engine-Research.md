# Research Notes: Linking NPV to OOIP and Recoverable Yields

To accurately calculate the Net Present Value (NPV) of a project and directly link it to the Original Oil In Place (OOIP) or Recoverable Yields, we must bridge the gap between **Reservoir Engineering** (estimating volumes) and **Petroleum Economics** (forecasting cash flows).

Based on industry standards and web research, here is the exact step-by-step workflow for how these concepts connect:

## 1. From OOIP to Recoverable Reserves
We already do this in ResoLogix!
- We calculate the **OOIP** volumetrically.
- We apply a **Recovery Efficiency (RE)** factor.
- **Formula:** `Recoverable Yield = OOIP × RE`
- *Outcome:* We know the total volume of hydrocarbons that can physically be extracted.

## 2. From Recoverable Reserves to a Production Profile
This is the critical missing link. A single volume number (e.g., 50 MMSTB) does not tell us *when* that oil is produced. A dollar today is worth more than a dollar tomorrow.
- We must spread the Recoverable Yield out over time (e.g., 20 years).
- We use **Decline Curve Analysis (DCA)** to forecast how many barrels will be produced in Year 1, Year 2, ..., Year $N$.
- *Outcome:* A timeline of production volumes $Q(t)$.

## 3. From Production to Revenue
Once we know how many barrels are produced each year, we apply market assumptions.
- **Formula:** `Annual Revenue(t) = Q(t) × Projected Oil Price(t)`
- We must factor in royalties or production sharing contracts that take a cut off the top.
- *Outcome:* A timeline of gross revenues.

## 4. From Revenue to Net Cash Flow
Operating a field costs money.
- **Capital Expenditures (CAPEX):** Upfront costs for drilling, platforms, and facilities (usually concentrated in Year 0 or Year 1).
- **Operating Expenditures (OPEX):** Ongoing costs to pump the oil, maintain facilities, and transport the product.
- **Taxes:** Government taxes applied to the profit.
- **Formula:** `Cash Flow(t) = Revenue(t) - CAPEX(t) - OPEX(t) - Taxes(t)`

## 5. From Cash Flow to NPV
Finally, we apply the time value of money by discounting future cash flows back to today.
- **Formula:** $NPV = \sum_{t=1}^{n} \frac{Cash Flow_t}{(1 + r)^t} - Initial CAPEX$
- $r$ is the discount rate (often 10% in the oil industry, leading to the term "PV10").

---

> [!TIP]
> ### How We Could Implement This in ResoLogix
> If you want to automatically generate the $NPV_{90}$, $NPV_{50}$, and $NPV_{10}$ inputs required for the EMV module, we would need to build a **Petroleum Economics Engine**.
> 
> **The Flow:**
> 1. Take the P90, P50, and P10 Recoverable Yields from the Monte Carlo simulation.
> 2. Feed those yields into a basic DCA engine to generate a 20-year production profile for each case.
> 3. Provide inputs for Flat Oil Price ($/bbl), CAPEX ($MM), OPEX ($/bbl), and Discount Rate (%).
> 4. Automatically calculate the resulting $NPV_{90}$, $NPV_{50}$, and $NPV_{10}$ and pipe them directly into the EMV module!
