# Geological Chance of Success ($P_g$) and Expected Monetary Value ($EMV$)



## $P_g$

Per best practice, the **Geological Chance of Success ($P_g$) is not evaluated for established Reserves**, as Reserves are defined as volumes already discovered and commercially producible. $P_g$ is strictly used for **Prospective Resources** (untested, drill-ready prospects). [[1](https://kejoragasbumi.com/exploration-resource-estimation-best-practices/), [2](https://www.scribd.com/document/372985977/Geological-Chance-of-Success), [3](https://nextinvestors.com/learn-to-invest/oil-gas/what-are-oil-and-gas-resources/), [4](https://www.linkedin.com/pulse/petroleum-reserves-resources-understanding-nick-bahrami-yjhff), [5](https://jpt.spe.org/prms-classifications-updated-methodology-resource-inventory-management)]

For a drill-ready prospect, the target $P_g$ generally ranges from **20% to 40%** to meet standard industry and commerciality thresholds. [[1](https://www.asx.com.au/asxpdf/20180511/pdf/43tyfqvyjw3b34.pdf), [2](https://www.researchgate.net/publication/314274552_Exploration_Chance_of_Success_Predictions_-_Statistical_Concepts_and_Realities), [3](https://discoveryalert.com.au/nova-scotia-offshore-licensing-round-2026/)]

### The Evaluation Framework

The $P_g$ is calculated as the product of independent geological risk factors:
$P_g = P_{trap} \times P_{reservoir} \times P_{charge} \times P_{seal} \times P_{timing}$ [[1](https://mereninc.com/wp-content/uploads/2025/02/9.-Prime-Prospective-Resources-Audit-YE2023.pdf), [2](https://hal.science/hal-04504103v1/file/S0920410521001741.pdf), [3](https://pubs.geoscienceworld.org/seg/interpretation/article/2/2/SC61/75706/The-role-of-AVO-in-prospect-risk-assessment)]

- **Trap:** Is there a geometric closure or pinch-out?
- **Reservoir:** Are porous and permeable rocks present?
- **Charge:** Have hydrocarbons been generated and migrated into the trap?
- **Seal:** Is there a caprock to prevent the hydrocarbons from leaking?
- **Timing:** Did the trap, reservoir, and charge form in the correct geological sequence? [[1](https://www.searchanddiscovery.com/documents/2017/42063rose/ndx_rose.pdf), [2](https://www.sandovalcountynm.gov/wp-content/uploads/2018/06/OriginofOilandGas-BasicsPetroleumGeology.pdf), [3](https://hal.science/hal-04504103v1/file/S0920410521001741.pdf)]

### Strategic Considerations

While geologists calculate $P_g$ strictly for the presence of hydrocarbons, management also filters projects using the **Probability of Commercial Success ($P_{commercial}$ or $P_{c}$)**, which factors in: [[1](https://www.spe.org/industry/docs/PRMS_Guidelines_Nov2011.pdf)]

1. Economic thresholds (Minimum Economic Field Size - MEFS)
2. Development costs
3. Commodity price projections [[1](http://gtgiiag.umsa.bo/ojs-iiag/index.php/1/article/download/8/5)]



## $EMV$

To calculate the **Expected Monetary Value (EMV)** using the geological chance of success ($P_{g}$) and resource volume distributions, you must combine the probability of discovery with the mean economic outcomes of both success and failure.

Because resource volumes are a distribution (typically lognormal), you cannot just use a single resource number. You must first find the **mean Net Present Value (NPV)** across that volume distribution.

Here is the step-by-step calculation framework used per oil and gas best practices.

------

### 1. The Core EMV Formula

The standard decision-tree formula for EMV is:
$$
EMV=(PV_{success}\times P_{g})-(CapEx_{dry\_hole}\times [1-P_{g}])
$$
Where:

- $P_{g}$: Geological chance of success (expressed as a decimal).
- $1-P_{g}$: Chance of failure (dry hole).
- $CapEx_{dry\_{hole}}$: The total after-tax cost of drilling a dry well (expressed as a negative number).
- $PV_{success}$: The **Mean Present Value** of a success outcome. [[1](https://pubs.geoscienceworld.org/aapg/books/edited-volume/1294/chapter/107147146/Risk-Analysis-of-Exploration-Prospects)]

------

### 2. Step-by-Step Calculation Guide

Step 1: Define your Resource Volume Distribution

Resource distributions are typically defined by three points on a cumulative probability curve:

- **P90 (Low Case):** 90% chance the volume will be equal to or greater than this amount.
- **P50 (Best Case):** Median volume outcome.
- **P10 (High Case):** 10% chance the volume will be equal to or greater than this amount. [[1](https://cgxenergy.com/wp-content/uploads/2020/03/51-101DeGolyerandMacNaugtonReport-Jun15-11.pdf), [2](https://onepetro.org/SJ/article/27/03/1763/480378/Probabilistic-Reserves-Categorization-Using), [3](https://www.quorumsoftware.com/energy-industry-terminology-glossary/), [4](https://onepetro.org/books/book/70/chapter/14095457/Probabilistic-Resources-Estimation), [5](https://onepetro.org/books/book/70/chapter/14095457/Probabilistic-Resources-Estimation)]

Step 2: Run Economic Models to get the NPV Curve

You cannot simply multiply the mean volume by a fixed dollar amount. Big fields have different economies of scale than small fields. You must run independent cash flow models for multiple points on your volume distribution:

1. Run a cash flow model using the **P90 volume** $\rightarrow$ yields **$NPV_{90}$**
2. Run a cash flow model using the **P50 volume**  $\rightarrow$ yields **$NPV_{50}$**
3. Run a cash flow model using the **P10 volume**  $\rightarrow$ yields **$NPV_{10}$**

Step 3: Calculate the Mean Success Value ($PV_{success}$)

Once you have your NPV distribution ($NPV_{90}$, $NPV_{50}$, $NPV_{10}$), you must calculate the **Mean NPV (Expected Value of Success)**. Because the distribution is skewed, do not take a simple average.

Per Rose & Associates and standard industry approximations (like the Swanson’s Mean rule), use this weighted formula:
$$
PV_{success}=(0.3\times NPV_{90})+(0.4\times NPV_{50})+(0.3\times NPV_{10})
$$
Step 4: Multiply by $P_{g}$ and Subtract Dry Hole Costs

Plug your calculated $PV_{success}$, your $P_{g}$, and your dry hole cost into the core EMV formula. [[1](https://www.peelhunt.com/news-insights/articles/reserves-resources-and-why-you-should-care/)]

------

### 3. Practical Calculation Example

Let's assume you are evaluating an exploration prospect with the following parameters:

- **$P_{g}$**: 25% (0.25)
- **Chance of Failure ($1 - P_g$):** 75% (0.75)
- **Dry Hole Cost:** $15 Million

After running economics on your P90/P50/P10 resource volumes, you get these project NPVs: [[1](https://www.sciencedirect.com/science/chapter/bookseries/pii/S0376736107000155)]

- **$NPV_{90}$ (Small field):** $20 Million
- **$NPV_{50}$ (Medium field):** $80 Million
- **$NPV_{10}$ (Large field):** $300 Million

**Calculate $PV_{success}$:**
$$
PV_{success}=(0.3\times 20)+(0.4\times 80)+(0.3\times 300)
$$

$$
PV_{success}=6+32+90=\mathbf{\$128}\text{\ Million}
$$



**Calculate EMV:**
$$
EMV=(\$128\text{M}\times 0.25)-(\$15\text{M}\times 0.75)
$$

$$
EMV=\$32\text{M}-\$11.25\text{M}
$$

$$
EMV=+\$20.75\text{\ Million}
$$



**Decision Rule:** Since the EMV is greater than $0, this prospect is considered an economically viable drilling candidate under current assumptions.

------

### 4. Advanced Best Practice: Factoring in Commercial Risk ($P_{c}$)

In reality, a geological discovery might be too small to make money. To be rigorous, you should use the **Probability of Commercial Success ($P_{c}$)** instead of just $P_{g}$. [[1](https://www.researchgate.net/figure/A-decision-tree-of-an-oil-exploration-project_fig1_260764198)]

1. Find the **Minimum Commercial Field Size (MCFS)**—the volume where NPV = $0.
2. Look at your resource curve to see the probability of exceeding that MCFS volume.
3. If 20% of your geological success distribution falls below the MCFS, your Commerciality Factor ($P_{e}$) is 80%.
4. Your true Chance of Commercial Success is: $P_{c}=P_{g}\times P_{e}$. Use this $P_{c}$ in your EMV tree for the most accurate results.