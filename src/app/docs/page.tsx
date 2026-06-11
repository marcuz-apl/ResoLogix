'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Cpu, HelpCircle, FileText, Compass } from 'lucide-react';
import pkg from '../../../package.json';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#070a13] text-[#f8fafc] font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-[#0891b2]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        
        {/* Navigation Link back */}
        <div className="mb-8 flex justify-end">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-cyan-400 transition-colors duration-250 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to main App
          </Link>
        </div>

        {/* Documentation Header */}
        <header className="border-b border-card-border pb-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="ResoLogix Logo" className="w-14 h-14 rounded-2xl shadow-lg shadow-cyan-500/10 object-contain animate-pulse" />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text-primary">
                ResoLogix&trade; Knowledge Base
              </h1>
              <p className="text-xs text-text-secondary mt-1 font-semibold uppercase tracking-wider">
                Scientific documentation, formulae & tutorial guide
              </p>
            </div>
          </div>
          <span className="text-xs bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 px-3 py-1.5 rounded-lg font-bold select-none shrink-0 self-start md:self-auto">
            Documentation Version {pkg.version}
          </span>
        </header>

        {/* Dynamic Sidebar / Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Menu (3 cols) */}
          <aside className="lg:col-span-3 flex flex-col gap-1.5 shrink-0 self-start sticky top-6">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2.5 px-3 block">
              Table of Contents
            </label>
            <a 
              href="#background" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>1. Reserve Estimation</span>
            </a>
            <a 
              href="#monte-carlo" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>2. Monte Carlo Theory</span>
            </a>
            <a 
              href="#geological-risk" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>3. Geological Risk (Pg)</span>
            </a>
            <a 
              href="#formulae" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>4. Scientific Formulae</span>
            </a>
            <a 
              href="#tutorial" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>5. Application Tutorial</span>
            </a>
          </aside>

          {/* Right Contents (9 cols) */}
          <main className="lg:col-span-9 flex flex-col gap-12 text-sm text-text-secondary leading-relaxed">
            
            {/* Section 1: Reserve Estimation */}
            <section id="background" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>1. Reserve Estimation Background</span>
              </h2>
              <p>
                In the petroleum industry, estimating the volume of hydrocarbons stored in a reservoir (and the percentage that can be commercially extracted) is a core engineering task. Since geological datasets (cores, well logs, seismic records) are sparse, every parameter carries a high degree of uncertainty.
              </p>
              <p>
                Estimation approaches fall into two categories:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-text-primary">Deterministic:</strong> Employs single values (often representing low, middle, and high estimates) for each parameter to compute static outputs. While simple, it fails to quantify the likelihood of achieving those outcomes.
                </li>
                <li>
                  <strong className="text-text-primary">Probabilistic:</strong> Treats each parameter as a probability distribution. Computer algorithms (like Monte Carlo simulations) perform thousands of runs by randomly sampling these distributions to construct an output probability curve. This curve yields precise estimates of conservative, average, and optimistic recoverable reserves.
                </li>
              </ul>
            </section>

            {/* Section 2: Monte Carlo Theory */}
            <section id="monte-carlo" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>2. Monte Carlo Probabilistic Theory</span>
              </h2>
              <p>
                A Monte Carlo simulation models uncertainty by generating thousands of virtual trials. For each trial, the system randomly samples a value from the probability distribution defined for each parameter (e.g. Area, Net Pay, Porosity) according to its shape and bounds, then computes the volume equations.
              </p>
              
              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Probability Distributions</h3>
              <p className="text-sm font-bold text-text-secondary leading-relaxed mb-6">
                ResoLogix&trade; supports three key distributions:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-text-primary">Lognormal (Recommended):</strong> Positively skewed distribution bounded by zero. Skewness prevents negative value generation and models typical geological characteristics (like reservoir area and net pay thickness) which tend to have a long tail of rare, exceptionally large values.
                </li>
                <li>
                  <strong className="text-text-primary">Normal (Gaussian):</strong> Symmetric bell curve characterized by its mean and standard deviation. Best for parameters with symmetric deviation patterns.
                </li>
                <li>
                  <strong className="text-text-primary">Uniform:</strong> Flat distribution where all values between the minimum and maximum have equal likelihood. Useful when data is extremely sparse.
                </li>
              </ul>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Key Percentiles ($P_{90}$, $P_{50}$, $P_{10}$)</h3>
              <p>
                The outputs are sorted to construct an <strong>Exceedance Curve (Cumulative Distribution Function - CDF)</strong>:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-text-primary">P90 (Proven / Conservative):</strong> There is a 90% probability that the actual volumes in the reservoir will equal or exceed this estimate.
                </li>
                <li>
                  <strong className="text-text-primary">P50 (Probable / Median):</strong> There is a 50% probability that the actual volumes will equal or exceed this estimate.
                </li>
                <li>
                  <strong className="text-text-primary">P10 (Possible / Optimistic):</strong> There is a 10% probability that the actual volumes will equal or exceed this estimate.
                </li>
                <li>
                  <strong className="text-text-primary">MEAN (Expected Value):</strong> The statistical average of all simulation trials. Used as the base case in economic calculations.
                </li>
              </ul>

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">The Aggregation Paradox (Why A<sub>P90</sub> &times; B<sub>P90</sub> &ne; C<sub>P90</sub>)</h3>
              <p>
                When calculating reserves (A &times; B = C), it is a common observation that multiplying the deterministic P<sub>90</sub> of the inputs does <strong>not</strong> equal the P<sub>90</sub> of the output, yet the Means do.
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-text-primary">The Means are Linear:</strong> Statistically, the expected value (Mean) of the product of independent variables strictly equals the product of their individual means: 
                  <code className="mx-2 font-mono bg-background/50 px-1 py-0.5 rounded text-cyan-400">Mean(A) &times; Mean(B) = Mean(C)</code>
                </li>
                <li>
                  <strong className="text-text-primary">The Tails Shrink (P90 / P10):</strong> The P<sub>90</sub> represents a worst-case scenario (10% probability of being lower). The statistical likelihood of <em>both</em> Parameter A and Parameter B failing to their absolute worst-case P<sub>90</sub> values at the exact same time is extremely rare (10% &times; 10% = 1%).
                </li>
                <li>
                  <strong className="text-text-primary">The Result:</strong> Because Monte Carlo correctly accounts for this independence, the resulting output distribution is narrower than deterministically multiplying the extremes. Therefore, the actual P<sub>90</sub> of the output is significantly <strong>higher</strong> (more optimistic) than A<sub>P90</sub> &times; B<sub>P90</sub>. Conversely, the P<sub>10</sub> of the output is significantly <strong>lower</strong> (more conservative) than A<sub>P10</sub> &times; B<sub>P10</sub>. This phenomenon prevents the calculation of unrealistic "phantom" reserves.
                </li>
              </ul>
            </section>

            {/* Section 3: Geological Risk (Pg) */}
            <section id="geological-risk" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>3. Geological Chance of Success ($P_g$)</span>
              </h2>
              <p>
                Per best practice, the <strong>Geological Chance of Success ($P_g$) is not evaluated for established Reserves</strong>, as Reserves are defined as volumes already discovered and commercially producible. $P_g$ is strictly used for <strong>Prospective Resources</strong> (untested, drill-ready prospects).
              </p>
              <p>
                For a drill-ready prospect, the target $P_g$ generally ranges from <strong>20% to 40%</strong> to meet standard industry and commerciality thresholds.
              </p>
              
              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">The Evaluation Framework</h3>
              <p>
                The $P_g$ is calculated as the product of independent geological risk factors:
                <br />
                <code className="font-mono bg-background/50 px-2 py-1 rounded text-cyan-400 mt-2 inline-block">P_g = P_trap × P_reservoir × P_charge × P_seal × P_timing</code>
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong className="text-text-primary">Trap:</strong> Is there a geometric closure or pinch-out?</li>
                <li><strong className="text-text-primary">Reservoir:</strong> Are porous and permeable rocks present?</li>
                <li><strong className="text-text-primary">Charge:</strong> Have hydrocarbons been generated and migrated into the trap?</li>
                <li><strong className="text-text-primary">Seal:</strong> Is there a caprock to prevent the hydrocarbons from leaking?</li>
                <li><strong className="text-text-primary">Timing:</strong> Did the trap, reservoir, and charge form in the correct geological sequence?</li>
              </ul>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Strategic Considerations</h3>
              <p>
                While geologists calculate $P_g$ strictly for the presence of hydrocarbons, management also filters projects using the <strong>Probability of Commercial Success ($P_c$)</strong>, which factors in:
              </p>
              <ol className="list-decimal pl-5 flex flex-col gap-1">
                <li>Economic thresholds (Minimum Economic Field Size - MEFS)</li>
                <li>Development costs</li>
                <li>Commodity price projections</li>
              </ol>
            </section>

            {/* Section 4: Scientific Formulae */}
            <section id="formulae" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>4. Scientific Formulae & Conversions</span>
              </h2>
              
              <div className="flex flex-col gap-5 mt-2">
                {/* Oil Formulas */}
                <div className="bg-background/40 border border-card-border/60 p-4 rounded-xl">
                  <h3 className="font-extrabold text-xs text-blue-400 uppercase tracking-wide mb-2.5">Oil Volumetrics (Liquid Primary)</h3>
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      OOIP (MMSTB) = (7758 * A * h * &Phi; * (1 - S_w) / B_oi) / 1,000,000
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Unrisked Recoverable Oil (MMSTB) = OOIP * RE_oil
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Solution Gas In-Place (BCF) = (OOIP * 1,000,000 * GOR) / 1,000,000,000
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Unrisked Rec. Solution Gas (BCF) = Solution Gas In-Place * RE_solgas
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-text-muted">
                    Where: 7758 = conversion factor from acre-feet to barrels (bbl); A = Area (acres); h = Net Pay (ft); &Phi; = Porosity (frac); S_w = Water Saturation (frac); B_oi = Formation Volume Factor (res bbl/STB); GOR = Solution Gas/Oil Ratio (scf/STB); RE = Recovery Efficiency (frac).
                  </div>
                </div>

                {/* Gas Formulas */}
                <div className="bg-background/40 border border-card-border/60 p-4 rounded-xl">
                  <h3 className="font-extrabold text-xs text-orange-400 uppercase tracking-wide mb-2.5">Gas Volumetrics (Gas Primary)</h3>
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      OGIP (BCF) = (43560 * A * h * &Phi; * (1 - S_w) * GEF) / 1,000,000,000
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Unrisked Recoverable Gas (BCF) = OGIP * RE_gas
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Condensate In-Place (MMSTB) = (OGIP * 1,000,000,000 * (CGR / 1,000,000)) / 1,000,000
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Unrisked Rec. Condensate (MMSTB) = Condensate In-Place * RE_cond
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-text-muted">
                    Where: 43560 = conversion factor from acres to square feet; GEF = Gas Expansion Factor (scf/rcf); CGR = Condensate/Gas Ratio (bbl/MMscf). Note: CGR values are divided by 1,000,000 to maintain correct dimension scaling.
                  </div>
                </div>

                {/* Risk Integration */}
                <div className="bg-background/40 border border-card-border/60 p-4 rounded-xl">
                  <h3 className="font-extrabold text-xs text-purple-400 uppercase tracking-wide mb-2.5">Geological Risk & BOE conversions</h3>
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      P_g (Chance of Success) = source * migration * reservoir * closure * containment
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Risked Recoverable Volume = Unrisked Recoverable * P_g
                    </div>
                    <div className="bg-background/80 p-3 rounded border border-card-border/30">
                      Total MMBOE = Primary Liquid + (Secondary Gas / 5.8)
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-text-muted">
                    P_g represents the product of the 5 geological risk factor probabilities (Source rock, Migration pathway, Reservoir presence, Structure closure, and Seal containment). Total Barrels of Oil Equivalent (BOE) utilizes the energy equivalence scale of 5.8 Bcf of gas per 1 Million barrels of oil.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Tutorial */}
            <section id="tutorial" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>5. Step-by-Step User Tutorial</span>
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 bg-background/20 p-3.5 rounded-xl border border-card-border/35">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-extrabold border border-cyan-800/40 text-xs">1</span>
                  <div>
                    <strong className="text-text-primary block text-xs uppercase tracking-wide">Create or Select Scenario</strong>
                    Manage your evaluations list using the left sidebar. Click <strong>New</strong> to start a blank scenario or click <strong>Save</strong> to save your current config.
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-background/20 p-3.5 rounded-xl border border-card-border/35">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-extrabold border border-cyan-800/40 text-xs">2</span>
                  <div>
                    <strong className="text-text-primary block text-xs uppercase tracking-wide">Set Scenario Profile & Reservoir Type</strong>
                    Provide a name and description in the top section. Set your reservoir type to either <strong>Oil Reservoir</strong> or <strong>Gas Reservoir</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-background/20 p-3.5 rounded-xl border border-card-border/35">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-extrabold border border-cyan-800/40 text-xs">3</span>
                  <div>
                    <strong className="text-text-primary block text-xs uppercase tracking-wide">Enter Parameter Bounds & Distributions</strong>
                    Configure your volumetric parameters. Input conservative (P90) and optimistic (P10) values, and set their statistical distributions. For secondary products, you can check/uncheck the toggles to add or ignore gas/condensate calculation.
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-background/20 p-3.5 rounded-xl border border-card-border/35">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-extrabold border border-cyan-800/40 text-xs">4</span>
                  <div>
                    <strong className="text-text-primary block text-xs uppercase tracking-wide">Evaluate Geological Factors</strong>
                    Use the Geological Risk sliders on the right panel to assess individual risk factors. The app calculates the final chance of success $P_g$ dynamically.
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-background/20 p-3.5 rounded-xl border border-card-border/35">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-extrabold border border-cyan-800/40 text-xs">5</span>
                  <div>
                    <strong className="text-text-primary block text-xs uppercase tracking-wide">Run Simulation & Analyze Results</strong>
                    Adjust the number of Monte Carlo runs in the left sidebar and click <strong>Run Simulation</strong>. Look down at the generated CDF exceedance curve, PDF frequency bar chart, and results tables to study your proven and potential reserve volumes.
                  </div>
                </div>
              </div>
            </section>

          </main>

        </div>

      </div>

    </div>
  );
}
