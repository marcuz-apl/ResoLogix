import re

# 1. DashboardContext.tsx
with open('src/components/dashboard/DashboardContext.tsx', 'r') as f:
    content = f.read()

# Add enable_economics to Evaluation interface
content = content.replace(
    '  risk_factors: RiskFactors;\n  emv_params?: EmvParams;',
    '  risk_factors: RiskFactors;\n  enable_economics?: boolean;\n  emv_params?: EmvParams;'
)

# Add enableEconomics to Context Type
content = content.replace(
    '  setCalculatedPg: (val: number) => void;\n\n  emvParams: EmvParams;',
    '  setCalculatedPg: (val: number) => void;\n\n  enableEconomics: boolean;\n  setEnableEconomics: (val: boolean) => void;\n\n  emvParams: EmvParams;'
)

# Add to state
content = content.replace(
    '  const [emvParams, setEmvParams] = useState<EmvParams>({ ...DEFAULT_EMV });',
    '  const [enableEconomics, setEnableEconomics] = useState(false);\n  const [emvParams, setEmvParams] = useState<EmvParams>({ ...DEFAULT_EMV });'
)

# Add to loadScenario
content = content.replace(
    '    setEmvParams(ev.emv_params ? { ...ev.emv_params } : { ...DEFAULT_EMV });',
    '    setEnableEconomics(ev.enable_economics ?? false);\n    setEmvParams(ev.emv_params ? { ...ev.emv_params } : { ...DEFAULT_EMV });'
)

# Add to handleNewScenario
content = content.replace(
    "    setIsProfileExpanded(false);\n    setParameters",
    "    setIsProfileExpanded(false);\n    setEnableEconomics(false);\n    setParameters"
)

# Add to handleSaveScenario payload
content = content.replace(
    "      risk_factors: riskFactors,\n      emv_params: emvParams,",
    "      risk_factors: riskFactors,\n      enable_economics: enableEconomics,\n      emv_params: emvParams,"
)

# Add to contextValue
content = content.replace(
    "    handleRiskChange,\n    emvParams,",
    "    handleRiskChange,\n    enableEconomics,\n    setEnableEconomics,\n    emvParams,"
)

with open('src/components/dashboard/DashboardContext.tsx', 'w') as f:
    f.write(content)


# 2. ReserveProfile.tsx
with open('src/components/dashboard/ReserveProfile.tsx', 'r') as f:
    rp = f.read()

rp = rp.replace('const {', 'const {\n    enableEconomics,\n    setEnableEconomics,')

# Adjust flex factors
rp = rp.replace('className="flex flex-col gap-1.5 flex-[2] min-w-0"\n        >\n          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Folder</label>', 'className="flex flex-col gap-1.5 flex-[1] min-w-0">\n          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Folder</label>')
# That regex might be fragile, let's use a simpler replace
rp = rp.replace('flex-[2] min-w-0">\n          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Folder', 'flex-[1] min-w-0">\n          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Folder')


toggle_html = """
        {/* Economics Toggle */}
        <div className="flex flex-col gap-1.5 shrink-0 ml-2">
          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Economics & EMV</label>
          <button
            onClick={() => setEnableEconomics(!enableEconomics)}
            className={`h-8 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
              enableEconomics
                ? 'bg-emerald-500 text-white border-emerald-400 shadow shadow-emerald-500/20'
                : 'bg-card border-card-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${enableEconomics ? 'bg-white' : 'bg-text-muted'}`} />
            {enableEconomics ? 'ON' : 'OFF'}
          </button>
        </div>
"""

# Insert next to Reservoir Type
rp = rp.replace('          </div>\n        </div>\n      </div>', '          </div>\n        </div>\n' + toggle_html + '      </div>')

with open('src/components/dashboard/ReserveProfile.tsx', 'w') as f:
    f.write(rp)


# 3. EmvAnalysis.tsx
with open('src/components/dashboard/EmvAnalysis.tsx', 'r') as f:
    emv = f.read()

emv = emv.replace('const {', 'const {\n    enableEconomics,')

emv = emv.replace('if (!simResults) return null;', 'if (!simResults || !enableEconomics) return null;')

# Force expanded by default when shown
emv = emv.replace('const [isExpanded, setIsExpanded] = useState(false);', 'const [isExpanded, setIsExpanded] = useState(true);')

with open('src/components/dashboard/EmvAnalysis.tsx', 'w') as f:
    f.write(emv)

print("Done")
