'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Cpu, HelpCircle, FileText, Compass, Activity, Droplets, ShieldAlert, Database, DollarSign } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PageHeader from '../../components/layout/PageHeader';
import Header from '@/components/dashboard/Header';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';

export default function DocsPage() {
  return (
    <DashboardProvider>
      <DocsPageContent />
    </DashboardProvider>
  );
}

function DocsPageContent() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      <Header />
      
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-[#0891b2]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Documentation Header */}
        <PageHeader 
          title={<>ResoLogix&trade; Knowledge Base</>}
          subtitle="Scientific documentation, formulae & industry insights"
        />

        {/* Dynamic Sidebar / Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Menu (3 cols) */}
          <aside className="lg:col-span-3 flex flex-col gap-1.5 shrink-0 self-start sticky top-6">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2.5 px-3 block">
              Chapters
            </label>
            <a 
              href="#chapter-1" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="leading-tight">1. Introduction to Resource Evaluation</span>
            </a>
            <a 
              href="#chapter-2" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="leading-tight">2. Monte Carlo Simulation</span>
            </a>
            <a 
              href="#chapter-3" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="leading-tight">3. Decline Curve Analysis (DCA)</span>
            </a>
            <a 
              href="#chapter-4" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="leading-tight">4. Petroleum Economics & EMV</span>
            </a>
            <a 
              href="#chapter-5" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="leading-tight">5. Analytical Tools & Theory</span>
            </a>
            
            <div className="h-px bg-card-border my-2 mx-3"></div>
            
            <a 
              href="#appendix" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-cyan-400 hover:bg-card-border/20 transition-all duration-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Appendix: Tutorial</span>
            </a>

            {isAdmin && (
              <a 
                href="#admin-guide" 
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 transition-all duration-200 mt-2 border border-purple-500/20"
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Admin DB Guide</span>
              </a>
            )}
          </aside>

          {/* Right Contents (9 cols) */}
          <main className="lg:col-span-9 flex flex-col gap-12 text-sm text-text-secondary leading-relaxed">
            
            {/* Chapter 1: Resource Evaluation */}
            <section id="chapter-1" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-xl font-extrabold text-text-primary border-b border-card-border pb-3 mb-2 flex items-center gap-2">
                <Layers className="w-6 h-6 text-cyan-400" />
                <span>Chapter 1: Introduction to Resource Evaluation</span>
              </h2>
              
              <img 
                src="/docs_exploration_rig.png" 
                alt="Offshore Exploration Rig" 
                className="w-full h-64 object-cover rounded-xl border border-card-border shadow-lg mb-4"
              />

              <p>
                In the petroleum industry, estimating the volume of hydrocarbons stored in a reservoir (and the percentage that can be commercially extracted) is a core engineering task. Since geological datasets (cores, well logs, seismic records) are sparse, every parameter carries a high degree of uncertainty.
              </p>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Prospective Resources vs. Reserves</h3>
              <p>
                A critical distinction must be made depending on the lifecycle phase of the asset:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-text-primary text-cyan-300">Exploration Phase (Prospective Resources):</strong> These are estimated volumes of hydrocarbons that are <em>potentially</em> recoverable from undiscovered accumulations. Because they haven't been drilled or proven yet, they carry a <strong>Geological Chance of Success (P<sub>g</sub>)</strong>. Estimation here relies heavily on regional geology, seismic amplitude anomalies, and analog fields.
                </li>
                <li>
                  <strong className="text-text-primary text-emerald-300">Development Phase (Reserves):</strong> Once a discovery is made and confirmed to be commercially viable, the volumes are classified as Reserves. These are known accumulations. The Geological Risk (P<sub>g</sub>) is no longer applicable (it effectively becomes 100%). Estimation shifts towards precise well-log interpretations, core data, and production history.
                </li>
              </ul>
            </section>

            {/* Chapter 2: Monte Carlo Simulation */}
            <section id="chapter-2" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-xl font-extrabold text-text-primary border-b border-card-border pb-3 mb-2 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <span>Chapter 2: Monte Carlo Simulation & Statistics</span>
              </h2>

              <img 
                src="/docs_monte_carlo.png" 
                alt="Monte Carlo Simulation Visualization" 
                className="w-full h-64 object-cover rounded-xl border border-card-border shadow-lg mb-4"
              />

              <p>
                A Monte Carlo simulation models uncertainty by generating thousands of virtual trials. For each trial, the system randomly samples a value from the probability distribution defined for each parameter (e.g., Area, Net Pay, Porosity) according to its shape and bounds, then computes the volume equations.
              </p>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">The Aggregation Paradox (Why A<sub>P90</sub> &times; B<sub>P90</sub> &ne; C<sub>P90</sub>)</h3>
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

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">Geological Chance of Success (P<sub>g</sub>)</h3>
              <p>
                As discussed in Chapter 1, P<sub>g</sub> is strictly used for <strong>Prospective Resources</strong>. It is calculated as the product of independent geological risk factors:
                <br />
                <code className="font-mono bg-background/50 px-2 py-1 rounded text-cyan-400 mt-2 inline-block">P_g = P_trap &times; P_reservoir &times; P_charge &times; P_seal &times; P_timing</code>
              </p>

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">Scientific Formulae</h3>
              <div className="bg-background/40 p-4 rounded-xl border border-card-border text-xs font-mono space-y-4">
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">Oil In-Place (STOOIP)</div>
                  <div className="text-text-muted">MMSTB = Area &times; h &times; &Phi; &times; (1 - S_wi) / (B_oi &times; 7758)</div>
                </div>
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">Gas In-Place (GIIP)</div>
                  <div className="text-text-muted">BCF = Area &times; h &times; &Phi; &times; (1 - S_wi) / (B_gi &times; 43560)</div>
                </div>
              </div>

            </section>

            {/* Chapter 3: Decline Curve Analysis */}
            <section id="chapter-3" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-xl font-extrabold text-text-primary border-b border-card-border pb-3 mb-2 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                <span>Chapter 3: Decline Curve Analysis (DCA)</span>
              </h2>

              <img 
                src="/docs_dca.png" 
                alt="Decline Curve Analysis Dashboard" 
                className="w-full h-64 object-cover rounded-xl border border-card-border shadow-lg mb-4"
              />

              <p>
                Decline Curve Analysis (DCA) is the industry standard for forecasting production and estimating the Estimated Ultimate Recovery (EUR) of a well. It has evolved significantly from foundational empirical models to handle modern unconventional reservoirs.
              </p>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">1. Traditional Arps Models</h3>
              <p>
                Developed in 1945 by J.J. Arps, these equations form the backbone of conventional DCA, assuming constant bottom-hole pressure and boundary-dominated flow:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong className="text-text-primary">Exponential (b = 0):</strong> The decline rate is constant over time. Usually observed in highly permeable reservoirs or late-life production.</li>
                <li><strong className="text-text-primary">Hyperbolic (0 &lt; b &lt; 1):</strong> The decline rate slows down over time. This is the most common model for solution-gas drive reservoirs.</li>
                <li><strong className="text-text-primary">Harmonic (b = 1):</strong> A special case of hyperbolic decline where the decline rate drops inversely proportional to production rate.</li>
              </ul>

              <h4 className="font-bold text-text-primary mt-3 text-[10px] uppercase tracking-wide">Arps Rate Equations</h4>
              <div className="bg-background/40 p-4 rounded-xl border border-card-border text-xs font-mono space-y-4">
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">Hyperbolic (0 &lt; b &lt; 1)</div>
                  <div className="text-text-muted">q(t) = q_i / (1 + b &times; D_i &times; t)^(1/b)</div>
                </div>
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">Exponential (b = 0)</div>
                  <div className="text-text-muted">q(t) = q_i &times; exp(-D_i &times; t)</div>
                </div>
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">Harmonic (b = 1)</div>
                  <div className="text-text-muted">q(t) = q_i / (1 + D_i &times; t)</div>
                </div>
                <div className="mt-3 pt-3 border-t border-card-border/50">
                  <div className="text-text-muted">Where:</div>
                  <div className="text-text-muted pl-4">q(t) = Production rate at time t</div>
                  <div className="text-text-muted pl-4">q_i = Initial production rate</div>
                  <div className="text-text-muted pl-4">D_i = Initial decline rate</div>
                  <div className="text-text-muted pl-4">b = Decline exponent</div>
                </div>
              </div>

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">2. Modern Advanced DCA Methods</h3>
              <p>
                With the rise of unconventional shale and tight oil/gas, standard Arps models often fail because these wells exhibit multi-year transient flow. A standard hyperbolic curve with a high <em>b-factor</em> (&gt;1) can mathematically project infinite unrealistic reserves.
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong className="text-text-primary">Modified Arps (Modified Hyperbolic):</strong> Uses a hyperbolic curve initially (often allowing b &gt; 1), but mathematically forces the curve to switch to an exponential decline once a minimum terminal decline rate (e.g., 5-8% per year) is reached. This is the most practical industry standard fix for shale forecasting and prevents predicting infinite EURs.</li>
                <li><strong className="text-text-primary">Duong Method:</strong> Specifically designed to model the ultra-long linear flow periods observed in fractured shale reservoirs. It assumes fracture networks dominate flow for a very long time, offering an alternative to arbitrarily choosing a terminal decline.</li>
                <li><strong className="text-text-primary">Stretched Exponential Production Decline (SEPD):</strong> Derived from physics modeling systems that degrade over time, providing a mathematically bounded EUR without ballooning to infinity. Very popular for rigid Wall Street reserve reporting.</li>
                <li><strong className="text-text-primary">Power Law Exponential (PLE):</strong> Modifies exponential decline so that the decline rate changes over time as a power-law function. It smoothly handles the transition from transient early flow to boundary-dominated late flow naturally.</li>
              </ul>

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">3. Physics-Informed Machine Learning (PIML)</h3>
              <p>
                The latest frontier in forecasting is integrating Machine Learning with physical constraints. PIML approaches use deep learning (like RNNs or LSTMs) to identify complex non-linear patterns—such as the impact of adjacent well interference or changing choke sizes—while using standard Arps logic as a constraint to ensure long-term physical depletion realism.
              </p>

            </section>

            {/* Chapter 4: Petroleum Economics & EMV */}
            <section id="chapter-4" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-xl font-extrabold text-text-primary border-b border-card-border pb-3 mb-2 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-cyan-400" />
                <span>Chapter 4: Petroleum Economics & EMV</span>
              </h2>

              <p>
                In the exploration phase, discovering technical volumes of hydrocarbons is only half the battle. The true decision metric for drilling a prospect is whether those volumes are <strong>commercially viable</strong> given the extreme capital costs and geological risks involved.
              </p>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Net Present Value (NPV)</h3>
              <p>
                To value a project, engineers forecast the production profile over time (using DCA) and apply expected commodity prices, subtracting Operational Expenses (OPEX) and CapEx. Because cash received tomorrow is worth less than cash received today, future cash flows are discounted to the present using a <strong>Discount Rate</strong>. This yields the NPV for the P90, P50, and P10 cases.
              </p>
              
              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">Expected Monetary Value (EMV)</h3>
              <p>
                EMV combines the financial value of success with the cost of failure, risk-adjusted by the Geological Chance of Success (P<sub>g</sub>).
              </p>
              <div className="bg-background/40 p-4 rounded-xl border border-card-border text-xs font-mono space-y-4 mt-2">
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">1. Mean PV of Success</div>
                  <div className="text-text-muted">PV_success = (0.3 &times; NPV_90) + (0.4 &times; NPV_50) + (0.3 &times; NPV_10)</div>
                  <div className="text-[10px] text-text-muted mt-1 italic">Swanson's Rule is used to approximate the continuous mean from the three percentiles.</div>
                </div>
                <div>
                  <div className="text-cyan-400 mb-1 font-bold tracking-wide uppercase">2. Expected Monetary Value</div>
                  <div className="text-text-muted">EMV = (PV_success &times; P_g) - (CapEx &times; (1 - P_g))</div>
                </div>
              </div>

              <p className="mt-2">
                <strong>Decision Rule:</strong> If EMV &gt; 0, the project statistically justifies the capital risk. If EMV &lt; 0, the cost of a dry hole outweighs the risk-adjusted reward, and the prospect should not be drilled.
              </p>
            </section>

            {/* Chapter 5: Analytical Tools & Theory */}
            <section id="chapter-5" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6">
              <h2 className="text-xl font-extrabold text-text-primary border-b border-card-border pb-3 mb-2 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-cyan-400" />
                <span>Chapter 5: Analytical Tools & Theory</span>
              </h2>

              <img 
                src="/docs_pvt.png" 
                alt="PVT Laboratory Setup" 
                className="w-full h-64 object-cover rounded-xl border border-card-border shadow-lg mb-4"
              />

              <p>
                Accurate volumetric calculation requires precise fluid property data. When laboratory Pressure-Volume-Temperature (PVT) data is unavailable, petroleum engineers rely on established empirical correlations to determine the Formation Volume Factors.
              </p>

              <h3 className="font-bold text-text-primary mt-2 text-xs uppercase tracking-wide">Oil Formation Volume Factor (B<sub>o</sub>)</h3>
              <p>
                B<sub>o</sub> represents the ratio of the volume of oil (including dissolved gas) at reservoir conditions to its volume at standard surface conditions. To calculate this without lab data, two empirical correlations are industry-standard:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-3">
                <li>
                  <strong className="text-text-primary">Standing Correlation (1947):</strong> Developed using experimental data from California crude oils. It estimates B<sub>o</sub> as a function of Solution Gas-Oil Ratio (R<sub>s</sub>), Gas Specific Gravity (&gamma;<sub>g</sub>), Oil Specific Gravity (&gamma;<sub>o</sub> / API), and Reservoir Temperature. Best suited for lighter crude oils and medium API gravities.
                </li>
                <li>
                  <strong className="text-text-primary">Vasquez-Beggs Correlation (1980):</strong> Based on a massive database of over 6,000 measurements gathered worldwide. It is highly versatile and specifically categorizes oils by their API gravity (e.g., above or below 30&deg; API) to dynamically adjust its coefficients. This is typically the default recommendation in modern petroleum software.
                </li>
              </ul>

              <h3 className="font-bold text-text-primary mt-4 text-xs uppercase tracking-wide">Gas Formation Volume Factor (B<sub>g</sub>)</h3>
              <p>
                Unlike oil, gas behavior is highly predictable using the Real Gas Law (Equation of State), eliminating the need for strict geographic empirical correlations.
              </p>
              <div className="bg-background/40 p-4 rounded-xl border border-card-border text-xs font-mono space-y-2 mt-2">
                <div className="text-cyan-400 font-bold tracking-wide">B<sub>g</sub> = 0.02827 &times; Z &times; (T + 460) / P</div>
                <div className="text-text-muted mt-2">Where:</div>
                <div className="text-text-muted pl-4">Z = Gas Compressibility Factor (e.g., Standing-Katz chart)</div>
                <div className="text-text-muted pl-4">T = Reservoir Temperature (&deg;F)</div>
                <div className="text-text-muted pl-4">P = Reservoir Pressure (psia)</div>
              </div>

            </section>

            {/* Appendix: Tutorial */}
            <section id="appendix" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-card-border/50 bg-card/45 relative scroll-mt-6 mb-12">
              <h2 className="text-lg font-extrabold text-text-primary border-b border-card-border pb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>Appendix: Application Tutorial</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-background/50 p-5 rounded-xl border border-card-border/50">
                  <h4 className="font-bold text-cyan-400 mb-2">1. Distribution Setup</h4>
                  <p className="text-xs">Navigate to the Volumetrics tab. For each parameter (Area, Net Pay, etc.), select the distribution type and enter the minimum, mode (most likely), and maximum values. The system will automatically construct the probability density functions.</p>
                </div>
                <div className="bg-background/50 p-5 rounded-xl border border-card-border/50">
                  <h4 className="font-bold text-cyan-400 mb-2">2. Risk Matrix</h4>
                  <p className="text-xs">If evaluating a prospective resource, switch to the Geological Risk tab. Adjust the sliders for Trap, Reservoir, Charge, and Seal. The application will instantly compute the compounded probability of geological success (Pg).</p>
                </div>
                <div className="bg-background/50 p-5 rounded-xl border border-card-border/50">
                  <h4 className="font-bold text-cyan-400 mb-2">3. Engine Execution</h4>
                  <p className="text-xs">Click the Run Simulation button. The Monte Carlo engine will perform the trials locally within your browser, ensuring your proprietary data never leaves your machine.</p>
                </div>
                <div className="bg-background/50 p-5 rounded-xl border border-card-border/50">
                  <h4 className="font-bold text-cyan-400 mb-2">4. Automated Reporting</h4>
                  <p className="text-xs">Review the resulting Exceedance Curves and P90/P50/P10 outputs. You can then navigate to the Reporting dashboard to generate comprehensive Word, PDF, Excel, and PowerPoint documents instantly.</p>
                </div>
              </div>
            </section>

            {/* Admin Database Guide (Only visible to Admins) */}
            {isAdmin && (
              <section id="admin-guide" className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-purple-500/30 bg-purple-950/10 relative scroll-mt-6 mb-12 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <h2 className="text-lg font-extrabold text-purple-400 border-b border-purple-500/30 pb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Admin Guide: Database Introspection</span>
                </h2>
                
                <p className="text-sm">
                  As a system administrator, you may need to inspect the underlying database architecture. The specific query to list all table names in a database depends on the SQL dialect of the relational database management system (RDBMS) you are using.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* SQLite */}
                  <div className="bg-background/80 p-5 rounded-xl border border-card-border">
                    <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" /> SQLite3
                    </h4>
                    <p className="text-xs text-text-muted mb-3">ResoLogix currently uses SQLite natively. You can query the internal master table.</p>
                    <div className="bg-black/50 p-3 rounded-lg font-mono text-[10px] text-emerald-400 border border-card-border overflow-x-auto">
                      SELECT name FROM sqlite_master WHERE type='table';
                    </div>
                  </div>

                  {/* PostgreSQL */}
                  <div className="bg-background/80 p-5 rounded-xl border border-card-border">
                    <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" /> PostgreSQL
                    </h4>
                    <p className="text-xs text-text-muted mb-3">Postgres strictly adheres to the ANSI standard information schema.</p>
                    <div className="bg-black/50 p-3 rounded-lg font-mono text-[10px] text-emerald-400 border border-card-border overflow-x-auto">
                      SELECT table_name<br/>FROM information_schema.tables<br/>WHERE table_schema = 'public';
                    </div>
                  </div>

                  {/* MySQL */}
                  <div className="bg-background/80 p-5 rounded-xl border border-card-border">
                    <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" /> MySQL
                    </h4>
                    <p className="text-xs text-text-muted mb-3">MySQL provides a highly simplified syntax for introspection.</p>
                    <div className="bg-black/50 p-3 rounded-lg font-mono text-[10px] text-emerald-400 border border-card-border overflow-x-auto">
                      SHOW TABLES;
                    </div>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
