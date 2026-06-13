# The Python Script to Calculate EMV

This script defines a reusable function, incorporates Swanson's Rule, and evaluates whether the asset is a viable investment (\(EMV > 0\)). You can easily scale this to loop through an entire portfolio database or CSV file.

```python
def calculate_emv(pg, npv_90, npv_50, npv_10, dry_hole_cost):
    """
    Calculates Expected Monetary Value (EMV) for an oil & gas prospect.
    Uses Swanson's Rule to calculate the mean NPV of the success distribution.
    """
    # 1. Apply Swanson's Rule for Mean Success NPV
    pv_success = (0.3 * npv_90) + (0.4 * npv_50) + (0.3 * npv_10)
    
    # 2. Calculate the Chance of Failure
    p_failure = 1.0 - pg
    
    # 3. Calculate EMV
    emv = (pv_success * pg) - (dry_hole_cost * p_failure)
    
    return pv_success, emv

# --- ASSET PARAMETERS (Input your values here) ---
chance_of_success = 0.25      # 25% Pg
cost_of_dry_hole  = 15.0      # $15 Million
p90_npv           = 20.0      # $20 Million
p50_npv           = 80.0      # $80 Million
p10_npv           = 300.0     # $300 Million

# --- EXECUTION ---
mean_success_npv, final_emv = calculate_emv(
    pg=chance_of_success, 
    npv_90=p90_npv, 
    npv_50=p50_npv, 
    npv_10=p10_npv, 
    dry_hole_cost=cost_of_dry_hole
)

# --- DISPLAY RESULTS ---
print(f"--- Exploration Prospect Evaluation ---")
print(f"Mean Success Value (PV_success): ${mean_success_npv:,.2f} MM")
print(f"Calculated EMV:                 ${final_emv:,.2f} MM")

if final_emv > 0:
    print("Decision: APPROVED. The asset yields a positive expected value.")
else:
    print("Decision: REJECTED. The asset yields a negative expected value.")

```

To run a Monte Carlo simulation on oil and gas resource volumes, we must model the distribution as **Lognormal**, which is the industry standard because geological properties (like area, thickness, and porosity) multiply together.

This expanded Python script uses `numpy` to simulate 100,000 drilling trials. It samples random resource volumes, converts them to NPV using a scalable factor, and calculates the true distribution of EMV—including how often you hit a dry hole versus a commercial success. [[1](https://medium.com/@anastasiya.khromova17/the-monte-carlo-method-when-nothing-else-works-with-pythons-examples-1a1e7e95844c)]

### Python Monte Carlo Simulation Script

```python
import numpy as np

def run_prospect_monte_carlo(p90_vol, p10_vol, pg, dry_hole_cost, npv_per_bbl, trials=100000):
    """
    Runs a Monte Carlo simulation for an O&G prospect using a Lognormal volume distribution.
    
    Parameters:
    - p90_vol, p10_vol: Resource volumes (e.g., in MMbbl) at P90 and P10 confidence
    - pg: Geological chance of success (decimal, 0.0 to 1.0)
    - dry_hole_cost: Cost to drill a dry hole (positive float, e.g., 15.0 for $15M)
    - npv_per_bbl: Value factor to convert volume to success NPV (e.g., $5.00/bbl)
    - trials: Number of iteration loops
    """
    # 1. Calculate lognormal parameters (mu and sigma) from P90 and P10 volumes
    # For a standard lognormal resource curve: P90 is the 10th percentile of log, P10 is the 90th percentile
    # Z-scores for 10% and 90% are -1.28155 and 1.28155
    log_p90 = np.log(p90_vol)
    log_p10 = np.log(p10_vol)
    
    sigma = (log_p10 - log_p90) / (2 * 1.28155)
    mu = (log_p90 + log_p10) / 2.0
    
    # 2. Simulate Geological Success/Failure Outcomes (Binomial)
    # 1 = Success, 0 = Dry Hole
    geological_outcomes = np.random.binomial(1, pg, trials)
    
    # 3. Simulate Resource Volumes for all trials (assuming Lognormal)
    simulated_volumes = np.random.lognormal(mu, sigma, trials)
    
    # 4. Calculate Financial Outcomes for every trial
    trial_npvs = np.zeros(trials)
    
    for i in range(trials):
        if geological_outcomes[i] == 1:
            # Success Case: Volume * Value factor
            trial_npvs[i] = simulated_volumes[i] * npv_per_bbl
        else:
            # Failure Case: Lose the dry hole cost
            trial_npvs[i] = -dry_hole_cost
            
    # 5. Extract Statistics from results
    mean_emv = np.mean(trial_npvs)
    
    # Filter out only the successful trials to find the Success Case distribution
    success_volumes = simulated_volumes[geological_outcomes == 1]
    success_npvs = success_volumes * npv_per_bbl
    
    # Calculate standard O&G percentiles for the volume distribution
    # Note: np.percentile calculates values 'less than', so P90 is the 10th percentile of data
    v_p90 = np.percentile(simulated_volumes, 10)
    v_p50 = np.percentile(simulated_volumes, 50)
    v_p10 = np.percentile(simulated_volumes, 90)
    v_mean = np.mean(simulated_volumes)
    
    # Print Dashboard
    print(f"==================================================")
    print(f"      MONTE CARLO PROSPECT SIMULATION RESULTS     ")
    print(f"==================================================")
    print(f"Simulated Trials:       {trials:,}")
    print(f"Geological Chance (Pg): {pg*100:.1f}%")
    print(f"Dry Hole Risk Cost:     ${dry_hole_cost:,.2f} MM\n")
    
    print(f"--- Simulated Success Volume Distribution ---")
    print(f"P90 (Low Case):         {v_p90:.2f} MMbbl")
    print(f"P50 (Best Case):        {v_p50:.2f} MMbbl")
    print(f"P10 (High Case):        {v_p10:.2f} MMbbl")
    print(f"Mean Volume:            {v_mean:.2f} MMbbl\n")
    
    print(f"--- Economic Evaluation Summary ---")
    print(f"Mean Success NPV:       ${np.mean(success_npvs):,.2f} MM")
    print(f"FINAL EXPECTED MONTE CARLO EMV:  ${mean_emv:,.2f} MM")
    
    if mean_emv > 0:
        print("\nDecision: APPROVED. Positive Expected Monetary Value.")
    else:
        print("\nDecision: REJECTED. Negative Expected Monetary Value.")
    print(f"==================================================")

# --- RUNNING THE CASE STUDY ---
# Input your known P90 and P10 volume targets to generate the model curves
run_prospect_monte_carlo(
    p90_vol=5.0,         # 5 Million Barrels Low Case
    p10_vol=60.0,        # 60 Million Barrels High Case
    pg=0.25,             # 25% Chance of Discovery
    dry_hole_cost=15.0,  # $15 Million Dry Hole CapEx
    npv_per_bbl=5.0,     # Value factor: $5.00 net margin per barrel found
    trials=100000        # Run 100k iterations
)

```

Why This is Better Than a Flat Formula

1. **Verifies Swanson's Rule:** If you compare this Monte Carlo output to the spreadsheet formula from earlier, you will see the results are incredibly close.
2. **Defines Full Range Exposure:** It maps out the real risk curve, showing the board exactly what the downside cap looks like ($15M loss) compared to the un-capped lognormal volume upside.
3. **Prepares for Commerciality:** You can easily add a single line inside the success block to say: `if simulated_volumes[i] < MCFS: trial_npvs[i] = -dry_hole_cost` to instantly calculate your commercial risk truncation.

------

This upgraded Python script implements **price volatility** (using a normal distribution), accounts for **Minimum Commercial Field Size (MCFS)** truncation, and plots an **Expectation Curve** (Cumulative P-value plot) using `matplotlib`.

The chart displays an industry-standard survival curve (\(1 - CDF\)). It allows you to read exactly what your probability is of exceeding any given Net Present Value (NPV).

### Advanced Monte Carlo Script

```python
import numpy as np
import matplotlib.pyplot as plt

def run_advanced_prospect_sim(p90_vol, p10_vol, pg, dry_hole_cost, mcfs, mean_price, std_price, margin_pct=0.15, trials=100000):
    """
    Advanced O&G Monte Carlo Simulation factoring in Price Volatility and Commercial Truncation (MCFS).
    Generates an industry-standard Expectation Curve.
    """
    # 1. Setup Volume Lognormal Distribution
    log_p90, log_p10 = np.log(p90_vol), np.log(p10_vol)
    sigma_vol = (log_p10 - log_p90) / (2 * 1.28155)
    mu_vol = (log_p90 + log_p10) / 2.0
    simulated_volumes = np.random.lognormal(mu_vol, sigma_vol, trials)
    
    # 2. Setup Price Volatility (Normal Distribution clipped at $0)
    simulated_prices = np.random.normal(mean_price, std_price, trials)
    simulated_prices = np.clip(simulated_prices, 0, None)
    # Convert crude price to net project margin per barrel (accounting for opex, tax, royalty)
    npv_per_bbl_dist = simulated_prices * margin_pct
    
    # 3. Simulate Geological Success (1 = Success, 0 = Dry Hole)
    geological_outcomes = np.random.binomial(1, pg, trials)
    
    # 4. Financial Evaluation Loop
    trial_npvs = np.zeros(trials)
    commercial_successes = np.zeros(trials)
    
    for i in range(trials):
        if geological_outcomes[i] == 1:
            if simulated_volumes[i] >= mcfs:
                # Commercial Success: Field is large enough to build infrastructure
                trial_npvs[i] = simulated_volumes[i] * npv_per_bbl_dist[i]
                commercial_successes[i] = 1
            else:
                # Geological Success BUT Commercial Failure (Too small, abandoned)
                trial_npvs[i] = -dry_hole_cost
        else:
            # Geological Dry Hole
            trial_npvs[i] = -dry_hole_cost

    # 5. Calculate Metrics
    mean_emv = np.mean(trial_npvs)
    total_geo_successes = np.sum(geological_outcomes)
    total_comm_successes = np.sum(commercial_successes)
    
    geo_but_not_comm = total_geo_successes - total_comm_successes
    pct_geo_failed_commercially = (geo_but_not_comm / total_geo_successes) * 100 if total_geo_successes > 0 else 0
    pc = (total_comm_successes / trials) * 100
    
    # --- PRINT DASHBOARD ---
    print(f"==================================================")
    print(f"    ADVANCED PORTFOLIO RISK & EMV METRICS        ")
    print(f"==================================================")
    print(f"Total Simulated Trials:         {trials:,}")
    print(f"Geological Chance of Success (Pg):  {pg*100:.1f}%")
    print(f"Commercial Chance of Success (Pc): {pc:.1f}%")
    print(f"--------------------------------------------------")
    print(f"Geological Discoveries:         {total_geo_successes:,}")
    print(f"Commercial Discoveries:         {total_comm_successes:,}")
    print(f"Sub-Commercial Value Failures:  {geo_but_not_comm:,}")
    print(f" % of Discoveries Abandoned:    {pct_geo_failed_commercially:.1f}%")
    print(f"--------------------------------------------------")
    print(f"FINAL PRICE-VOLATILE EMV:       ${mean_emv:,.2f} MM")
    print(f"==================================================")

    # 6. Generate Expectation Curve (Cumulative Probability Plot)
    sorted_npvs = np.sort(trial_npvs)
    # Survival probability: Y-axis represents chance of achieving 'at least' X value
    survival_prob = 1.0 - (np.arange(1, trials + 1) / trials)
    
    plt.figure(figsize=(10, 6))
    plt.plot(sorted_npvs, survival_prob * 100, color='darkblue', linewidth=2.5, label='Prospect Risk Profile')
    
    # Formatting visual anchors
    plt.axvline(x=0, color='red', linestyle='--', alpha=0.7, label='Break-Even Line ($0 NPV)')
    plt.axvline(x=mean_emv, color='green', linestyle=':', linewidth=2, label=f'Mean EMV (${mean_emv:.1f}M)')
    plt.axhline(y=pc, color='purple', linestyle='-.', alpha=0.5, label=f'Commercial Success Rate ({pc:.1f}%)')
    
    plt.title("Prospect Expectation Curve (Cumulative Probability Value)", fontsize=14, fontweight='bold', pad=15)
    plt.xlabel("Net Present Value ($MM USD)", fontsize=11)
    plt.ylabel("Probability of Exceedance (%)", fontsize=11)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(loc='upper right', fontsize=10)
    plt.xlim(-dry_hole_cost - 5, np.percentile(trial_npvs, 95)) # Cap X-axis at 95th percentile for readability
    plt.ylim(0, 100)
    
    plt.show()

# --- EXECUTE THE SIMULATION ---
run_advanced_prospect_sim(
    p90_vol=5.0,          # Low volume case (MMbbl)
    p10_vol=60.0,         # High volume case (MMbbl)
    pg=0.25,              # 25% Geological Chance
    dry_hole_cost=15.0,   # $15M Dry hole cost
    mcfs=12.0,            # Minimum Commercial Field Size: Pools under 12 MMbbl are un-economic
    mean_price=75.0,      # Mean oil price ($/bbl)
    std_price=15.0,       # Price standard deviation ($15 volatility)
    margin_pct=0.15,      # 15% of crude price hits net project NPV per barrel
    trials=100000
)
```



### How to Read the Resulting Curve

When you execute this script, the generated Matplotlib chart serves as a primary tool for executive risk communication:

```text
Probability (%)
100 |========================= 

    |                        |
 75 |- - - - - - - - - - - - | <-- Flat line at 75% risk level represents

    |                        |     the combined chance of dry holes + 
 50 |                        |     sub-commercial size drops.

    |                        |
 25 |                        \ _ _ _ _ _ _ _ _ _ _ _
    |                                               \
  0 |------------------------|------------------------|----> NPV ($MM)
                       -$15M (Dry hole)             +$100M+ Upside
```

**The Flat Risk "Floor":** The vertical drop on the left side of the chart caps exactly at your maximum loss exposure (-$15 Million). The height of this line represents your total risk of making no money.

**The Truncation Gap ($P_{g}$ vs $P_{c}$):** Because we added the `mcfs=12.0` limit, you will notice that even though $P_{g}$ is **25%**, the actual chance of making money ($P_{c}$) drops to around **16%**. The missing **9%** represents the fields where geologists found oil, but engineers abandoned it because the pool was too small to pay for the platform.

**Price Volatility S-Curve:** Instead of a straight line showing success outcomes, the curve on the right bends more softly. This represents the blended volatility of fluctuating oil prices multiplying against your fluid volumes.