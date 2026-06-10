'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import {
  runMonteCarlo,
  generateHistogramData,
  generateExceedanceData,
  getPercentile,
  type SimulationResults,
  type SimulationParams,
  type RiskFactors
} from '@/lib/statistics';

export interface Evaluation {
  id: string;
  name: string;
  description: string;
  fluid_type: 'OIL' | 'GAS';
  include_secondary?: boolean;
  country?: string;
  geol_basin?: string;
  play_type?: string;
  reservoir_age?: string;
  lithology?: string;
  depo_env?: string;
  exp_stage?: string;
  terrain?: string;
  lahee_class?: string;
  type_well?: string;
  parameters: SimulationParams;
  risk_factors: RiskFactors;
  created_at?: string;
  updated_at?: string;
}

export const COUNTRIES_LIST = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export const GEOL_BASINS = [
  "Alaska ANWR", "Alaska Beaufort Sea", "Alaska North Slope", "Alaska NPRA", "Alberta Basin", "Amu-Darya Basin", "Angara-Terrace", "Anglo-Dutch Basin", "Assam", "Azov-Kuban Basin", "Baram Delta/Brunei-Sabah Basin", "Baykit Arch", "Bohaiwan Basin", "Bombay Basin", "Bonaparte Gulf Basin", "Browse Basin", "Campeche-Sigsbe Salt Basin", "Campos Basin", "Carpathian-Balkanian Basin", "Central Oman Platform", "Central Sumatra Basin", "Cis-Patom Foredeep", "Dnieper-Donets Basin", "East Greenland Rift Basins", "East Venezuela Basin", "Esprito Santo Basin", "Fahud Salt Basin", "Falklands Plateau", "Foz do Amazonas Basin", "Gaba Salt Basin", "Ganges-Brahmaputra Delta", "Ghudin-Khasfeh Flank Province", "Gippsland Basin", "Grand Erg/Ahnet Basin", "Greater Antilles Deformed Belt", "Greater Ghawar Uplift", "Greater Sarawak Basin", "Gulf of Guinea", "Gulf of Mexico", "Guyana-Suriname Basin", "Huqf-Haushi Uplift", "Illizi Basin", "Indus", "Interior Homocline-Central Arch", "Irrawddy", "Junngar Basin", "Kohat-Potwar", "Kutei Basin", "Labrador-Newfoundland Shelf", "Lesser Antilles Deformed Belt", "Llanos Basin", "Ludlov Saddle", "Magallenes Basin", "Malay Basin", "Malvinas Basin", "Maracaibo Basin", "Ma'Rib-Al Jawf/Masila Basin", "Masila-Jeza Basin", "Mesopotamian Foredeep Basin", "Middle Caspian Basin", "Middle Magdalena", "Nepa-Botuoba Arch", "Neuquen Basin", "Niger Delta", "North Barents Basin", "North Carpathian Basin", "North Caspian Basin", "North Sakhalin Basin", "North Sea Graben", "North Sumatra Basin", "North Ustyurt Basin", "Northwest German Basin", "Northwest Java Basin", "Northwest Shelf", "Oman Mountains", "Orange River Coastal", "Ordos Basin", "Pannonian Basin", "Pelagian Basin", "Pelotas Basin", "Po Basin", "Progreso Basin", "Provence Basin", "Putumayo-Oriente-Maranon Basin", "Qatar Arch", "Red Sea Basin", "Rocky Moutain Deformed Belt", "Rub Al Khali Basin", "Saline-Comalcalco Basin", "San Jorge Basin", "Santa Cruz-Tarija Basin", "Santos Basin", "Seirra Madre de Chiapas-Peten Foldbelt", "Senegal", "Sergipe-Alagoas Basin", "Shabwah Basin", "Sichuan Basin", "Sirte Basin", "Songliao Basin", "South Barents Basin", "South Caspian Basin", "South Oman Salt basin", "South Sumatra Basin", "Talara Basin", "Tampico-Misantla Basin", "Tarim Basin", "Timan-Pechora Basin", "Tobago Trough", "Transylvanian Basin", "Trias Ghadames Basin", "Veracruz Basin", "Vestford-Helgeland", "Villahermosa Uplift", "Volga-Urals Region", "Wadi-Surhan Basin", "West Siberian Basin", "West-Central Coastal", "Widyan Basin-Interior Platform", "Williston Basin", "Yucatan Platform", "Zagros Fold Belt"
];

export const PLAY_TYPES = ["Independent Closure", "Fault Dependent Closure", "Salt Flank Dependent Closure", "Stratigraphic", "Combined"];

export const RESERVOIR_AGES = [
  "Pleistocene", "Tertiary", "U Pliocene", "M Pliocene", "L Pliocene", "U Miocene", "M Miocene", "L Miocene", "Oligocene", "Eocene", "Paleocene", "Upper Cretaceous", "Middle Cretaceous", "Lower Cretaceous", "Upper Jurassic", "Middle Jurassic", "Lower Jurassic", "Upper Triassic", "Middle Triassic", "Lower Triassic", "Permian", "Pennsylvanian", "Mississippian", "Carboniferous", "Devonian", "Silurian", "Ordovician", "Cambrian", "Precambrian"
];

export const LITHOLOGIES = ["Basement", "Carbonates", "Chalk", "Coal", "Dolomite", "Limestone", "Sandstone", "Siltstone", "Shale", "Volcanics", "Undifferentiated"];

export const DEPO_ENVS = [
  "Alluvial Fan", "Atoll", "Beach/Nearshore", "Chalk/Deepwater Carb", "Deltaic", "Dune", "Fluvial Channel", "Fluvial Deltaic", "Overbank Splay", "Reef", "Reef Talus", "Shelf", "Slope", "Tidal Channel/Bar", "Tidal Flat", "Turbidite/Fan", "Turbidite/Overbank", "Turbidite/Channel"
];

export const EXP_STAGES = ["Lead", "Prospect"];

export const TERRAINS = ["Mountains", "Plains", "Desert", "Transitional", "Offshore Shelf", "Offshore Deep-Water", "Offshore Ultra-Deep-Water"];

export const LAHEE_CLASSES = ["New Field Wildcat", "New Pool Wildcat", "Deeper Pool Test", "Shallower Pool Test", "Extension or Appraisal Test", "Development Well"];

export const DEFAULT_PARAMS: SimulationParams = {
  A: { p90: 1000, p10: 5000, distribution: 'LOGNORMAL' },
  h: { p90: 20, p10: 80, distribution: 'LOGNORMAL' },
  Phi: { p90: 0.12, p10: 0.22, distribution: 'LOGNORMAL' },
  Sw: { p90: 0.40, p10: 0.20, distribution: 'LOGNORMAL' },
  Boi: { p90: 1.1, p10: 1.3, distribution: 'LOGNORMAL' },
  RE: { p90: 0.15, p10: 0.35, distribution: 'LOGNORMAL' },
  GOR: { p90: 600, p10: 1200, distribution: 'LOGNORMAL' },
  RE_SolGas: { p90: 0.20, p10: 0.40, distribution: 'LOGNORMAL' },
  CGR: { p90: 20, p10: 60, distribution: 'LOGNORMAL' },
  RE_Cond: { p90: 0.25, p10: 0.45, distribution: 'LOGNORMAL' }
};

export const DEFAULT_RISK: RiskFactors = {
  source: 0.9,
  migration: 0.8,
  reservoir: 0.75,
  closure: 0.7,
  containment: 0.85
};

interface DashboardContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  sidebarWidth: number;
  rightPaneWidth: number;
  handleSidebarMouseDown: (e: React.MouseEvent) => void;
  handleRightPaneMouseDown: (e: React.MouseEvent) => void;

  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;

  evaluations: Evaluation[];
  isLoadingScenarios: boolean;
  isSaving: boolean;
  activeId: string | null;
  activeName: string;
  setActiveName: (val: string) => void;
  activeDescription: string;
  setActiveDescription: (val: string) => void;
  fluidType: 'OIL' | 'GAS';
  setFluidType: (val: 'OIL' | 'GAS') => void;
  includeSecondary: boolean;
  handleToggleSecondary: (val: boolean) => void;

  country: string;
  setCountry: (val: string) => void;
  geolBasin: string;
  setGeolBasin: (val: string) => void;
  playType: string;
  setPlayType: (val: string) => void;
  reservoirAge: string;
  setReservoirAge: (val: string) => void;
  lithology: string;
  setLithology: (val: string) => void;
  depoEnv: string;
  setDepoEnv: (val: string) => void;
  expStage: string;
  setExpStage: (val: string) => void;
  terrain: string;
  setTerrain: (val: string) => void;
  laheeClass: string;
  setLaheeClass: (val: string) => void;
  typeWell: string;
  setTypeWell: (val: string) => void;
  isProfileExpanded: boolean;
  setIsProfileExpanded: (val: boolean) => void;
  isSettingsExpanded: boolean;
  setIsSettingsExpanded: (val: boolean) => void;

  parameters: SimulationParams;
  setParameters: React.Dispatch<React.SetStateAction<SimulationParams>>;
  handleParamChange: (key: keyof SimulationParams, field: 'p90' | 'p10' | 'distribution', value: string | number) => void;
  riskFactors: RiskFactors;
  handleRiskChange: (key: keyof RiskFactors, value: number) => void;

  iterations: number;
  setIterations: (val: number) => void;
  simResults: SimulationResults | null;
  setSimResults: (val: SimulationResults | null) => void;
  isSimulating: boolean;
  handleRunSimulation: () => void;

  activeTab: 'exceedance' | 'pdf';
  setActiveTab: (val: 'exceedance' | 'pdf') => void;
  chartTarget: 'primary' | 'secondary';
  setChartTarget: (val: 'primary' | 'secondary') => void;
  saveStatus: 'idle' | 'success' | 'error';
  setSaveStatus: (val: 'idle' | 'success' | 'error') => void;

  // Hidden references for chart capturing
  primaryExceedanceRef: React.RefObject<any>;
  primaryPdfRef: React.RefObject<any>;
  secondaryExceedanceRef: React.RefObject<any>;
  secondaryPdfRef: React.RefObject<any>;

  // Static chart data objects
  primaryExceedanceData: any;
  secondaryExceedanceData: any;
  primaryPdfData: any;
  secondaryPdfData: any;
  primaryExceedanceOptions: any;
  secondaryExceedanceOptions: any;
  primaryPdfOptions: any;
  secondaryPdfOptions: any;



  // Scenario CRUD
  loadScenario: (ev: Evaluation) => void;
  handleNewScenario: () => void;
  handleCopyScenario: () => void;
  handleSaveScenario: () => void;
  handleDeleteScenario: (id: string, e: React.MouseEvent) => void;

  // Stats Derived
  calculatedPg: number;
  scale: (val: number, type?: string) => number;
  formatVolume: (val: number, type?: string) => string;
  paramLabels: Record<string, { title: string; unit: string; min: number; max: number; step: number }>;
  primaryKeys: Array<keyof SimulationParams>;
  secondaryKeys: string[];
  tableData: any[] | null;
  exceedanceChartScatterData: any;
  pdfChartData: any;
  exceedanceChartOptions: any;
  pdfChartOptions: any;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Pane dragging widths
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [rightPaneWidth, setRightPaneWidth] = useState(320);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Scenario List and Loading States
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Current active evaluation state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState('New Evaluation Scenario');
  const [activeDescription, setActiveDescription] = useState('Default evaluation scenario');
  const [fluidType, setFluidType] = useState<'OIL' | 'GAS'>('OIL');
  const [includeSecondary, setIncludeSecondary] = useState(true);

  // Reserve Profile States
  const [country, setCountry] = useState('undefined');
  const [geolBasin, setGeolBasin] = useState('undefined');
  const [playType, setPlayType] = useState('undefined');
  const [reservoirAge, setReservoirAge] = useState('undefined');
  const [lithology, setLithology] = useState('undefined');
  const [depoEnv, setDepoEnv] = useState('undefined');
  const [expStage, setExpStage] = useState('undefined');
  const [terrain, setTerrain] = useState('undefined');
  const [laheeClass, setLaheeClass] = useState('undefined');
  const [typeWell, setTypeWell] = useState('None');

  // Collapsible toggle for Reserve Profile
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const [parameters, setParameters] = useState<SimulationParams>(JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({ ...DEFAULT_RISK });

  // Refs for capturing hidden off-screen charts
  const primaryExceedanceRef = useRef<any>(null);
  const primaryPdfRef = useRef<any>(null);
  const secondaryExceedanceRef = useRef<any>(null);
  const secondaryPdfRef = useRef<any>(null);

  // Toggle secondary product helper
  const handleToggleSecondary = (val: boolean) => {
    setIncludeSecondary(val);
    setSimResults(null);
  };

  // Force chartTarget to primary if secondary is disabled
  useEffect(() => {
    if (!includeSecondary) {
      setChartTarget('primary');
    }
  }, [includeSecondary]);

  // Simulation config
  const [iterations, setIterations] = useState(10000);
  const [simResults, setSimResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'exceedance' | 'pdf'>('exceedance');
  const [chartTarget, setChartTarget] = useState<'primary' | 'secondary'>('primary');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');



  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('resologix-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('resologix-theme', nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
  };

  // Dragging event handlers
  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(450, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  const handleRightPaneMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPaneWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX; // Dragging left increases width
      const newWidth = Math.max(220, Math.min(600, startWidth + deltaX));
      setRightPaneWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [rightPaneWidth]);

  // Fetch all evaluations on load
  const fetchEvaluations = async () => {
    setIsLoadingScenarios(true);
    try {
      // Add timestamp to bypass aggressive Next.js/Browser caching
      const res = await fetch(`/api/evaluations?t=${new Date().getTime()}`, { 
        cache: 'no-store' 
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data);

        // Auto-select first evaluation if available and activeId is not set
        if (data.length > 0 && !activeId) {
          loadScenario(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    } finally {
      setIsLoadingScenarios(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Load a scenario into state
  const loadScenario = (ev: Evaluation) => {
    setActiveId(ev.id);
    setActiveName(ev.name);
    setActiveDescription(ev.description);
    setFluidType(ev.fluid_type);
    setIncludeSecondary(ev.include_secondary ?? true);
    setCountry(ev.country || 'undefined');
    setGeolBasin(ev.geol_basin || 'undefined');
    setPlayType(ev.play_type || 'undefined');
    setReservoirAge(ev.reservoir_age || 'undefined');
    setLithology(ev.lithology || 'undefined');
    setDepoEnv(ev.depo_env || 'undefined');
    setExpStage(ev.exp_stage || 'undefined');
    setTerrain(ev.terrain || 'undefined');
    setLaheeClass(ev.lahee_class || 'undefined');
    setTypeWell(ev.type_well || 'None');

    // Ensure all parameters exist with fallback
    const mergedParams = { ...DEFAULT_PARAMS };
    Object.keys(DEFAULT_PARAMS).forEach((key) => {
      const pKey = key as keyof SimulationParams;
      if (ev.parameters && ev.parameters[pKey]) {
        mergedParams[pKey] = {
          p90: Number(ev.parameters[pKey].p90),
          p10: Number(ev.parameters[pKey].p10),
          distribution: ev.parameters[pKey].distribution || 'LOGNORMAL'
        };
      }
    });
    setParameters(mergedParams);

    // Merge risk factors
    setRiskFactors({
      source: ev.risk_factors?.source ?? DEFAULT_RISK.source,
      migration: ev.risk_factors?.migration ?? DEFAULT_RISK.migration,
      reservoir: ev.risk_factors?.reservoir ?? DEFAULT_RISK.reservoir,
      closure: ev.risk_factors?.closure ?? DEFAULT_RISK.closure,
      containment: ev.risk_factors?.containment ?? DEFAULT_RISK.containment
    });

    setSimResults(null); // Clear previous simulation
    setSaveStatus('idle');
  };

  // Reset to default new scenario
  const handleNewScenario = () => {
    setActiveId(null);
    setActiveName('New Evaluation Scenario');
    setActiveDescription('Default evaluation scenario');
    setFluidType('OIL');
    setIncludeSecondary(true);
    setCountry('undefined');
    setGeolBasin('undefined');
    setPlayType('undefined');
    setReservoirAge('undefined');
    setLithology('undefined');
    setDepoEnv('undefined');
    setExpStage('undefined');
    setTerrain('undefined');
    setLaheeClass('undefined');
    setTypeWell('None');
    setIsProfileExpanded(false);
    setParameters(JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
    setRiskFactors({ ...DEFAULT_RISK });
    setSimResults(null);
    setSaveStatus('idle');
  };

  // Copy current scenario as new
  const handleCopyScenario = () => {
    setActiveId(null);
    setActiveName((prev) => prev + ' Copied');
    setSaveStatus('idle');
  };

  // Save/Update evaluation
  const handleSaveScenario = async () => {
    if (!activeName.trim()) {
      alert('Please provide a name for the evaluation scenario.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    const payload = {
      id: activeId, // Will create new if null
      name: activeName,
      description: activeDescription,
      fluid_type: fluidType,
      include_secondary: includeSecondary,
      country,
      geol_basin: geolBasin,
      play_type: playType,
      reservoir_age: reservoirAge,
      lithology,
      depo_env: depoEnv,
      exp_stage: expStage,
      terrain,
      lahee_class: laheeClass,
      type_well: typeWell,
      parameters,
      risk_factors: riskFactors
    };

    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setActiveId(saved.id);
        setSaveStatus('success');
        fetchEvaluations(); // Refresh sidebar list
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to save scenario:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete evaluation
  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering loading scenario
    if (!confirm('Are you sure you want to delete this evaluation scenario?')) {
      return;
    }

    try {
      const res = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (activeId === id) {
          handleNewScenario();
        }
        fetchEvaluations();
      }
    } catch (err) {
      console.error('Failed to delete scenario:', err);
    }
  };

  // Handle parameter value changes
  const handleParamChange = (
    key: keyof SimulationParams,
    field: 'p90' | 'p10' | 'distribution',
    value: string | number
  ) => {
    setParameters((prev) => {
      const updated = { ...prev };
      updated[key] = {
        ...(updated[key] as any),
        [field]: field === 'distribution' ? value : Number(value)
      };
      return updated;
    });
    // Reset simulation output to force recalculation badge
    setSimResults(null);
  };

  // Handle risk factor slider changes
  const handleRiskChange = (key: keyof RiskFactors, value: number) => {
    setRiskFactors((prev) => ({
      ...prev,
      [key]: value
    }));
    setSimResults(null);
  };

  // Compute overall chance of success
  const calculatedPg = useMemo(() => {
    return (
      riskFactors.source *
      riskFactors.migration *
      riskFactors.reservoir *
      riskFactors.closure *
      riskFactors.containment
    );
  }, [riskFactors]);

  // Run the simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Add micro-delay to let loading spinner render
    setTimeout(() => {
      try {
        const results = runMonteCarlo(fluidType, parameters, riskFactors, iterations, includeSecondary);
        setSimResults(results);
      } catch (err) {
        console.error('Simulation run failed:', err);
        alert('Simulation run failed. Please check your parameter settings.');
      } finally {
        setIsSimulating(false);
      }
    }, 50);
  };

  // Automatically trigger simulation when active parameter configuration changes
  // or on loading a new scenario
  useEffect(() => {
    if (!simResults && !isSimulating) {
      const results = runMonteCarlo(fluidType, parameters, riskFactors, iterations, includeSecondary);
      setSimResults(results);
    }
  }, [parameters, riskFactors, fluidType, iterations, simResults, includeSecondary]);

  // Scaling helpers
  const scale = (val: number, type = 'primary') => {
    if (type === 'primary') {
      const scaleFactor = fluidType === 'OIL' ? 1e6 : 1e9;
      return val / scaleFactor;
    } else {
      const scaleFactor = fluidType === 'OIL' ? 1e9 : 1e6;
      return val / scaleFactor;
    }
  };

  const formatVolume = (val: number, type = 'primary') => {
    return scale(val, type).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  };

  // Parameter metadata
  const paramLabels: Record<string, { title: string; unit: string; min: number; max: number; step: number }> = useMemo(() => ({
    A: { title: 'Drainage Area', unit: 'acres', min: 10, max: 20000, step: 10 },
    h: { title: 'Net Pay Thickness', unit: 'ft', min: 1, max: 1000, step: 1 },
    Phi: { title: 'Porosity', unit: 'fraction', min: 0.01, max: 0.50, step: 0.01 },
    Sw: { title: 'Water Saturation', unit: 'fraction', min: 0.01, max: 0.95, step: 0.01 },
    Boi: {
      title: fluidType === 'OIL' ? 'Oil FVF (Boi)' : 'Gas Expansion Factor (GEF)',
      unit: fluidType === 'OIL' ? 'res bbl/STB' : 'scf/rcf',
      min: fluidType === 'OIL' ? 0.5 : 1,
      max: fluidType === 'OIL' ? 3.0 : 1000,
      step: fluidType === 'OIL' ? 0.001 : 1
    },
    RE: {
      title: fluidType === 'OIL' ? 'Oil Recovery Efficiency' : 'Recovery Efficiency-GAS',
      unit: 'fraction',
      min: 0.01,
      max: 0.90,
      step: 0.01
    },
    GOR: { title: 'Solution Gas/Oil Ratio (GOR)', unit: 'scf/STB', min: 1, max: 50000, step: 10 },
    RE_SolGas: { title: 'Secondary Product RE', unit: 'fraction', min: 0.01, max: 0.90, step: 0.01 },
    CGR: { title: 'Condensate/Gas Ratio (CGR)', unit: 'bbl/MMscf', min: 0.1, max: 1000, step: 1 },
    RE_Cond: { title: 'Secondary Product RE', unit: 'fraction', min: 0.01, max: 0.90, step: 0.01 }
  }), [fluidType]);

  const primaryKeys: Array<keyof SimulationParams> = useMemo(() => ['A', 'h', 'Phi', 'Sw', 'Boi', 'RE'], []);
  const secondaryKeys: string[] = useMemo(() => fluidType === 'OIL' ? ['GOR', 'RE_SolGas'] : ['CGR', 'RE_Cond'], [fluidType]);

  // Exceedance scatter data helper
  const getExceedanceData = useCallback((target: 'primary' | 'secondary') => {
    if (!simResults) return { datasets: [] };

    const isPrimary = target === 'primary';
    let inPlaceRuns: number[];
    let recoverableRuns: number[];
    let riskedInPlaceRuns: number[];
    let riskedRecoverableRuns: number[];

    let scaleFactor = 1;
    let labelInPlace = '';
    let labelRecoverable = '';
    let labelRiskedInPlace = '';
    let labelRiskedRecoverable = '';

    if (isPrimary) {
      inPlaceRuns = simResults.inPlaceRuns;
      recoverableRuns = simResults.recoverableRuns;
      riskedInPlaceRuns = simResults.riskedInPlaceRuns;
      riskedRecoverableRuns = simResults.riskedRecoverableRuns;

      scaleFactor = fluidType === 'OIL' ? 1e6 : 1e9;
      labelInPlace = fluidType === 'OIL' ? 'Unrisked OOIP' : 'Unrisked OGIP';
      labelRecoverable = 'Unrisked Recoverable';
      labelRiskedInPlace = fluidType === 'OIL' ? 'Risked OOIP' : 'Risked OGIP';
      labelRiskedRecoverable = 'Risked Recoverable';
    } else {
      inPlaceRuns = simResults.secInPlaceRuns || [];
      recoverableRuns = simResults.secRecoverableRuns || [];
      riskedInPlaceRuns = simResults.secRiskedInPlaceRuns || [];
      riskedRecoverableRuns = simResults.secRiskedRecoverableRuns || [];

      scaleFactor = fluidType === 'OIL' ? 1e9 : 1e6;
      labelInPlace = fluidType === 'OIL' ? 'Unrisked Solution Gas In-Place' : 'Unrisked Condensate In-Place';
      labelRecoverable = fluidType === 'OIL' ? 'Unrisked Rec. Solution Gas' : 'Unrisked Rec. Condensate';
      labelRiskedInPlace = fluidType === 'OIL' ? 'Risked Solution Gas In-Place' : 'Risked Condensate In-Place';
      labelRiskedRecoverable = fluidType === 'OIL' ? 'Risked Rec. Solution Gas' : 'Risked Rec. Condensate';
    }

    const buildPoints = (runs: number[]) => {
      const sorted = [...runs].sort((a, b) => a - b);
      const N = sorted.length;
      return sorted.map((val, idx) => {
        const prob = ((N - idx) / N) * 100;
        return { x: val / scaleFactor, y: prob };
      });
    };

    const filterPoints = (points: { x: number; y: number }[]) => {
      const step = Math.max(1, Math.floor(points.length / 150));
      const filtered = [];
      for (let i = 0; i < points.length; i += step) {
        filtered.push(points[i]);
      }
      if (filtered.length === 0) return [];
      if (filtered[filtered.length - 1] !== points[points.length - 1]) {
        filtered.push(points[points.length - 1]);
      }
      return filtered;
    };

    const inPlacePoints = filterPoints(buildPoints(inPlaceRuns));
    const recoverablePoints = filterPoints(buildPoints(recoverableRuns));
    const riskedInPlacePoints = filterPoints(buildPoints(riskedInPlaceRuns));
    const riskedRecoverablePoints = filterPoints(buildPoints(riskedRecoverableRuns));

    return {
      datasets: [
        {
          label: labelInPlace,
          data: inPlacePoints,
          borderColor: fluidType === 'OIL' ? '#06b6d4' : '#fb923c',
          backgroundColor: 'transparent',
          borderWidth: 3,
          showLine: true,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: labelRecoverable,
          data: recoverablePoints,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          showLine: true,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: labelRiskedInPlace,
          data: riskedInPlacePoints,
          borderColor: '#6366f1',
          backgroundColor: 'transparent',
          borderWidth: 2,
          showLine: true,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: labelRiskedRecoverable,
          data: riskedRecoverablePoints,
          borderColor: '#ec4899',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [3, 3],
          showLine: true,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    };
  }, [simResults, fluidType]);

  // Static exceedance datasets
  const primaryExceedanceData = useMemo(() => getExceedanceData('primary'), [getExceedanceData]);
  const secondaryExceedanceData = useMemo(() => getExceedanceData('secondary'), [getExceedanceData]);

  // Interactive UI exceedance target mapping
  const exceedanceChartScatterData = useMemo(() => {
    return chartTarget === 'primary' ? primaryExceedanceData : secondaryExceedanceData;
  }, [chartTarget, primaryExceedanceData, secondaryExceedanceData]);

  // Memoized table data containing exactly P90, P50, MEAN, and P10 rows
  const tableData = useMemo(() => {
    if (!simResults) return null;

    const calcP = (runs: number[] | undefined, pct: number) => {
      if (!runs || runs.length === 0) return 0;
      const sorted = [...runs].sort((a, b) => a - b);
      return getPercentile(sorted, pct);
    };

    const calcMean = (runs: number[] | undefined) => {
      if (!runs || runs.length === 0) return 0;
      const sum = runs.reduce((a, b) => a + b, 0);
      return sum / runs.length;
    };

    const rowsConfig = [
      { key: 'P90', type: 'percentile', value: 10 },
      { key: 'P50', type: 'percentile', value: 50 },
      { key: 'MEAN', type: 'mean', value: 0 },
      { key: 'P10', type: 'percentile', value: 90 },
    ];

    return rowsConfig.map((row) => {
      const getVal = (runs: number[] | undefined) => {
        if (row.type === 'percentile') {
          return calcP(runs, row.value);
        } else {
          return calcMean(runs);
        }
      };

      const Area = getVal(simResults.A_runs);
      const h = getVal(simResults.h_runs);
      const Phi = getVal(simResults.Phi_runs);
      const Sw = getVal(simResults.Sw_runs);
      const Boi = getVal(simResults.Boi_runs);
      const RE = getVal(simResults.RE_runs);
      const secRE = getVal(simResults.secRE_runs);

      const primaryInPlace = getVal(simResults.inPlaceRuns);

      const primaryLiquid = fluidType === 'OIL'
        ? getVal(simResults.recoverableRuns)
        : getVal(simResults.secRecoverableRuns || []);

      const secondaryFluid = fluidType === 'OIL'
        ? getVal(simResults.secRecoverableRuns || [])
        : getVal(simResults.recoverableRuns);

      const totalBOE = getVal(simResults.totalBOE_runs);

      return {
        prob: row.key,
        Area,
        h,
        Phi,
        Sw,
        Boi,
        RE,
        secRE,
        primaryInPlace,
        primaryLiquid,
        secondaryFluid,
        totalBOE,
      };
    });
  }, [simResults, fluidType]);

  // Dynamic Theme Colors for Charts
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      grid: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
      ticks: isDark ? '#94a3b8' : '#475569',
      legend: isDark ? '#e2e8f0' : '#0f172a'
    };
  }, [theme]);

  // Exceedance Chart Options helper
  const getExceedanceOptions = useCallback((target: 'primary' | 'secondary') => {
    let xTitle = '';
    if (target === 'primary') {
      xTitle = `Volume (${fluidType === 'OIL' ? 'MMbbl' : 'Bcf'})`;
    } else {
      xTitle = `Volume (${fluidType === 'OIL' ? 'Bcf' : 'MMbbl'})`;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { color: chartColors.legend, font: { family: 'inherit', size: 11 } }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: function (context: any) {
              return `${context.dataset.label}: ${context.raw.x.toFixed(2)} (${context.raw.y.toFixed(1)}% exceedance)`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear' as const,
          position: 'bottom' as const,
          title: {
            display: true,
            text: xTitle,
            color: chartColors.ticks,
            font: { weight: 'bold' as const }
          },
          grid: { color: chartColors.grid },
          ticks: { color: chartColors.ticks }
        },
        y: {
          title: {
            display: true,
            text: 'Probability of Exceeding (%)',
            color: chartColors.ticks,
            font: { weight: 'bold' as const }
          },
          min: 0,
          max: 100,
          grid: { color: chartColors.grid },
          ticks: { color: chartColors.ticks }
        }
      }
    };
  }, [fluidType, chartColors]);

  const primaryExceedanceOptions = useMemo(() => getExceedanceOptions('primary'), [getExceedanceOptions]);
  const secondaryExceedanceOptions = useMemo(() => getExceedanceOptions('secondary'), [getExceedanceOptions]);
  const exceedanceChartOptions = useMemo(() => {
    return chartTarget === 'primary' ? primaryExceedanceOptions : secondaryExceedanceOptions;
  }, [chartTarget, primaryExceedanceOptions, secondaryExceedanceOptions]);

  // PDF scatter data helper
  const getPdfData = useCallback((target: 'primary' | 'secondary') => {
    if (!simResults) return { labels: [], datasets: [] };

    const isPrimary = target === 'primary';
    const targetRuns = isPrimary
      ? simResults.inPlaceRuns
      : (simResults.secInPlaceRuns || []);

    const inPlaceHist = generateHistogramData(targetRuns, 30);

    let scaleFactor = 1;
    let label = '';
    if (isPrimary) {
      scaleFactor = fluidType === 'OIL' ? 1e6 : 1e9;
      label = fluidType === 'OIL' ? 'OOIP Frequency' : 'OGIP Frequency';
    } else {
      scaleFactor = fluidType === 'OIL' ? 1e9 : 1e6;
      label = fluidType === 'OIL' ? 'Solution Gas In-Place Frequency' : 'Condensate In-Place Frequency';
    }

    return {
      labels: inPlaceHist.labels.map((v) => (v / scaleFactor).toFixed(1)),
      datasets: [
        {
          label: label,
          data: inPlaceHist.percentages,
          backgroundColor: fluidType === 'OIL'
            ? (isPrimary ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.4)')
            : (isPrimary ? 'rgba(251, 146, 60, 0.4)' : 'rgba(236, 72, 153, 0.4)'),
          borderColor: fluidType === 'OIL'
            ? (isPrimary ? '#06b6d4' : '#6366f1')
            : (isPrimary ? '#fb923c' : '#ec4899'),
          borderWidth: 1.5,
          barPercentage: 0.95,
          categoryPercentage: 0.95
        }
      ]
    };
  }, [simResults, fluidType]);

  const primaryPdfData = useMemo(() => getPdfData('primary'), [getPdfData]);
  const secondaryPdfData = useMemo(() => getPdfData('secondary'), [getPdfData]);
  const pdfChartData = useMemo(() => {
    return chartTarget === 'primary' ? primaryPdfData : secondaryPdfData;
  }, [chartTarget, primaryPdfData, secondaryPdfData]);

  // PDF Chart Options helper
  const getPdfOptions = useCallback((target: 'primary' | 'secondary') => {
    let xTitle = '';
    if (target === 'primary') {
      xTitle = `Volume Range (${fluidType === 'OIL' ? 'MMbbl' : 'Bcf'})`;
    } else {
      xTitle = `Volume Range (${fluidType === 'OIL' ? 'Bcf' : 'MMbbl'})`;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: {
        legend: {
          labels: { color: chartColors.legend }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xTitle,
            color: chartColors.ticks
          },
          grid: { display: false },
          ticks: { color: chartColors.ticks }
        },
        y: {
          title: {
            display: true,
            text: 'Probability Density (%)',
            color: chartColors.ticks
          },
          grid: { color: chartColors.grid },
          ticks: { color: chartColors.ticks }
        }
      }
    };
  }, [chartColors, fluidType]);

  const primaryPdfOptions = useMemo(() => getPdfOptions('primary'), [getPdfOptions]);
      const secondaryPdfOptions = useMemo(() => getPdfOptions('secondary'), [getPdfOptions]);
  const pdfChartOptions = useMemo(() => {
    return chartTarget === 'primary' ? primaryPdfOptions : secondaryPdfOptions;
  }, [chartTarget, primaryPdfOptions, secondaryPdfOptions]);

  const contextValue: DashboardContextType = {
    theme,
    toggleTheme,
    sidebarWidth,
    rightPaneWidth,
    handleSidebarMouseDown,
    handleRightPaneMouseDown,

    showAuthModal,
    setShowAuthModal,

    evaluations,
    isLoadingScenarios,
    isSaving,
    activeId,
    activeName,
    setActiveName,
    activeDescription,
    setActiveDescription,
    fluidType,
    setFluidType,
    includeSecondary,
    handleToggleSecondary,

    country,
    setCountry,
    geolBasin,
    setGeolBasin,
    playType,
    setPlayType,
    reservoirAge,
    setReservoirAge,
    lithology,
    setLithology,
    depoEnv,
    setDepoEnv,
    expStage,
    setExpStage,
    terrain,
    setTerrain,
    laheeClass,
    setLaheeClass,
    typeWell,
    setTypeWell,
    isProfileExpanded,
    setIsProfileExpanded,
    isSettingsExpanded,
    setIsSettingsExpanded,

    parameters,
    setParameters,
    handleParamChange,
    riskFactors,
    handleRiskChange,

    iterations,
    setIterations,
    simResults,
    setSimResults,
    isSimulating,
    handleRunSimulation,

    activeTab,
    setActiveTab,
    chartTarget,
    setChartTarget,
    saveStatus,
    setSaveStatus,

    // Hidden references for chart capturing
    primaryExceedanceRef,
    primaryPdfRef,
    secondaryExceedanceRef,
    secondaryPdfRef,

    // Static chart data objects
    primaryExceedanceData,
    secondaryExceedanceData,
    primaryPdfData,
    secondaryPdfData,
    primaryExceedanceOptions,
    secondaryExceedanceOptions,
    primaryPdfOptions,
    secondaryPdfOptions,



    // Scenario CRUD
    loadScenario,
    handleNewScenario,
    handleCopyScenario,
    handleSaveScenario,
    handleDeleteScenario,

    // Derived Stats
    calculatedPg,
    scale,
    formatVolume,
    paramLabels,
    primaryKeys,
    secondaryKeys,
    tableData,
    exceedanceChartScatterData,
    pdfChartData,
    exceedanceChartOptions,
    pdfChartOptions
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
