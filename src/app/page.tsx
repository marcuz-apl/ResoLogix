'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Database,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Layers,
  Percent,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Check,
  FolderOpen,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  runMonteCarlo,
  generateHistogramData,
  generateExceedanceData,
  getPercentile,
  type SimulationResults,
  type SimulationParams,
  type RiskFactors
} from '@/lib/statistics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Evaluation {
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
  parameters: SimulationParams;
  risk_factors: RiskFactors;
  created_at?: string;
  updated_at?: string;
}

// Static lists for Reserve Profile dropdown selections
const COUNTRIES_LIST = [
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

const GEOL_BASINS = [
  "Alaska ANWR", "Alaska Beaufort Sea", "Alaska North Slope", "Alaska NPRA", "Alberta Basin", "Amu-Darya Basin", "Angara-Terrace", "Anglo-Dutch Basin", "Assam", "Azov-Kuban Basin", "Baram Delta/Brunei-Sabah Basin", "Baykit Arch", "Bohaiwan Basin", "Bombay Basin", "Bonaparte Gulf Basin", "Browse Basin", "Campeche-Sigsbe Salt Basin", "Campos Basin", "Carpathian-Balkanian Basin", "Central Oman Platform", "Central Sumatra Basin", "Cis-Patom Foredeep", "Dnieper-Donets Basin", "East Greenland Rift Basins", "East Venezuela Basin", "Esprito Santo Basin", "Fahud Salt Basin", "Falklands Plateau", "Foz do Amazonas Basin", "Gaba Salt Basin", "Ganges-Brahmaputra Delta", "Ghudin-Khasfeh Flank Province", "Gippsland Basin", "Grand Erg/Ahnet Basin", "Greater Antilles Deformed Belt", "Greater Ghawar Uplift", "Greater Sarawak Basin", "Gulf of Guinea", "Gulf of Mexico", "Guyana-Suriname Basin", "Huqf-Haushi Uplift", "Illizi Basin", "Indus", "Interior Homocline-Central Arch", "Irrawddy", "Junngar Basin", "Kohat-Potwar", "Kutei Basin", "Labrador-Newfoundland Shelf", "Lesser Antilles Deformed Belt", "Llanos Basin", "Ludlov Saddle", "Magallenes Basin", "Malay Basin", "Malvinas Basin", "Maracaibo Basin", "Ma'Rib-Al Jawf/Masila Basin", "Masila-Jeza Basin", "Mesopotamian Foredeep Basin", "Middle Caspian Basin", "Middle Magdalena", "Nepa-Botuoba Arch", "Neuquen Basin", "Niger Delta", "North Barents Basin", "North Carpathian Basin", "North Caspian Basin", "North Sakhalin Basin", "North Sea Graben", "North Sumatra Basin", "North Ustyurt Basin", "Northwest German Basin", "Northwest Java Basin", "Northwest Shelf", "Oman Mountains", "Orange River Coastal", "Ordos Basin", "Pannonian Basin", "Pelagian Basin", "Pelotas Basin", "Po Basin", "Progreso Basin", "Provence Basin", "Putumayo-Oriente-Maranon Basin", "Qatar Arch", "Red Sea Basin", "Rocky Moutain Deformed Belt", "Rub Al Khali Basin", "Saline-Comalcalco Basin", "San Jorge Basin", "Santa Cruz-Tarija Basin", "Santos Basin", "Seirra Madre de Chiapas-Peten Foldbelt", "Senegal", "Sergipe-Alagoas Basin", "Shabwah Basin", "Sichuan Basin", "Sirte Basin", "Songliao Basin", "South Barents Basin", "South Caspian Basin", "South Oman Salt basin", "South Sumatra Basin", "Talara Basin", "Tampico-Misantla Basin", "Tarim Basin", "Timan-Pechora Basin", "Tobago Trough", "Transylvanian Basin", "Trias Ghadames Basin", "Veracruz Basin", "Vestford-Helgeland", "Villahermosa Uplift", "Volga-Urals Region", "Wadi-Surhan Basin", "West Siberian Basin", "West-Central Coastal", "Widyan Basin-Interior Platform", "Williston Basin", "Yucatan Platform", "Zagros Fold Belt"
];

const PLAY_TYPES = ["Independent Closure", "Fault Dependent Closure", "Salt Flank Dependent Closure", "Stratigraphic", "Combined"];

const RESERVOIR_AGES = [
  "Pleistocene", "Tertiary", "U Pliocene", "M Pliocene", "L Pliocene", "U Miocene", "M Miocene", "L Miocene", "Oligocene", "Eocene", "Paleocene", "Upper Cretaceous", "Middle Cretaceous", "Lower Cretaceous", "Upper Jurassic", "Middle Jurassic", "Lower Jurassic", "Upper Triassic", "Middle Triassic", "Lower Triassic", "Permian", "Pennsylvanian", "Mississippian", "Carboniferous", "Devonian", "Silurian", "Ordovician", "Cambrian", "Precambrian"
];

const LITHOLOGIES = ["Basement", "Carbonates", "Chalk", "Coal", "Dolomite", "Limestone", "Sandstone", "Siltstone", "Shale", "Volcanics", "Undifferentiated"];

const DEPO_ENVS = [
  "Alluvial Fan", "Atoll", "Beach/Nearshore", "Chalk/Deepwater Carb", "Deltaic", "Dune", "Fluvial Channel", "Fluvial Deltaic", "Overbank Splay", "Reef", "Reef Talus", "Shelf", "Slope", "Tidal Channel/Bar", "Tidal Flat", "Turbidite/Fan", "Turbidite/Overbank", "Turbidite/Channel"
];

const EXP_STAGES = ["Lead", "Prospect"];

const TERRAINS = ["Mountains", "Plains", "Desert", "Transitional", "Offshore Shelf", "Offshore Deep-Water", "Offshore Ultra-Deep-Water"];

const LAHEE_CLASSES = ["New Field Wildcat", "New Pool Wildcat", "Deeper Pool Test", "Shallower Pool Test", "Extension or Appraisal Test", "Development Well"];

const DEFAULT_PARAMS: SimulationParams = {
  A: { p90: 1000, p10: 5000, distribution: 'LOGNORMAL' },
  h: { p90: 20, p10: 80, distribution: 'LOGNORMAL' },
  Phi: { p90: 0.12, p10: 0.22, distribution: 'LOGNORMAL' },
  Sw: { p90: 0.40, p10: 0.20, distribution: 'LOGNORMAL' },
  Boi: { p90: 1.1, p10: 1.3, distribution: 'LOGNORMAL' },
  RE: { p90: 0.15, p10: 0.35, distribution: 'LOGNORMAL' },
  
  // Secondary parameters defaults
  GOR: { p90: 600, p10: 1200, distribution: 'LOGNORMAL' },
  RE_SolGas: { p90: 0.20, p10: 0.40, distribution: 'LOGNORMAL' },
  CGR: { p90: 20, p10: 60, distribution: 'LOGNORMAL' },
  RE_Cond: { p90: 0.25, p10: 0.45, distribution: 'LOGNORMAL' }
};

const DEFAULT_RISK: RiskFactors = {
  source: 0.9,
  migration: 0.8,
  reservoir: 0.75,
  closure: 0.7,
  containment: 0.85
};

export default function ResoLogixDashboard() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Pane dragging widths
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [rightPaneWidth, setRightPaneWidth] = useState(320);

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

  // Collapsible toggle for Reserve Profile
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const [parameters, setParameters] = useState<SimulationParams>(JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({ ...DEFAULT_RISK });

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
      const res = await fetch('/api/evaluations');
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
    setIsProfileExpanded(false);
    setParameters(JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
    setRiskFactors({ ...DEFAULT_RISK });
    setSimResults(null);
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
      // Auto run simulation to keep results populated
      const results = runMonteCarlo(fluidType, parameters, riskFactors, iterations, includeSecondary);
      setSimResults(results);
    }
  }, [parameters, riskFactors, fluidType, iterations, simResults, includeSecondary]);

  // Exceedance Chart (CDF) Setup
  const exceedanceChartScatterData = useMemo(() => {
    if (!simResults) return { datasets: [] };
    
    const isPrimary = chartTarget === 'primary';
    
    // Select correct data runs and scales
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
      // Secondary product runs
      inPlaceRuns = simResults.secInPlaceRuns || [];
      recoverableRuns = simResults.secRecoverableRuns || [];
      riskedInPlaceRuns = simResults.secRiskedInPlaceRuns || [];
      riskedRecoverableRuns = simResults.secRiskedRecoverableRuns || [];
      
      scaleFactor = fluidType === 'OIL' ? 1e9 : 1e6; // Solution gas: Bcf (1e9), Condensate: MMbbl (1e6)
      labelInPlace = fluidType === 'OIL' ? 'Unrisked Solution Gas In-Place' : 'Unrisked Condensate In-Place';
      labelRecoverable = fluidType === 'OIL' ? 'Unrisked Rec. Solution Gas' : 'Unrisked Rec. Condensate';
      labelRiskedInPlace = fluidType === 'OIL' ? 'Risked Solution Gas In-Place' : 'Risked Condensate In-Place';
      labelRiskedRecoverable = fluidType === 'OIL' ? 'Risked Rec. Solution Gas' : 'Risked Rec. Condensate';
    }

    const buildPoints = (runs: number[]) => {
      const sorted = [...runs].sort((a, b) => a - b);
      const N = sorted.length;
      return sorted.map((val, idx) => {
        // Exceedance prob: percent of runs >= this value
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
  }, [simResults, fluidType, chartTarget]);

  // Memoized percentiles table data (P99, P90, P80, ..., P1)
  const tableData = useMemo(() => {
    if (!simResults) return null;

    // Helper to calculate percentile from runs
    const calcP = (runs: number[] | undefined, pct: number) => {
      if (!runs || runs.length === 0) return 0;
      const sorted = [...runs].sort((a, b) => a - b);
      return getPercentile(sorted, pct);
    };

    const percentiles = [99, 90, 80, 70, 60, 50, 40, 30, 20, 10, 1];

    return percentiles.map((p) => {
      const targetPct = 100 - p;

      // Parameters
      const Area = calcP(simResults.A_runs, targetPct);
      const h = calcP(simResults.h_runs, targetPct);
      const Phi = calcP(simResults.Phi_runs, targetPct);
      const Sw = calcP(simResults.Sw_runs, targetPct);
      const Boi = calcP(simResults.Boi_runs, targetPct);
      const RE = calcP(simResults.RE_runs, targetPct);
      const secRE = calcP(simResults.secRE_runs, targetPct);

      // Reserves
      const primaryInPlace = calcP(simResults.inPlaceRuns, targetPct);
      
      const primaryLiquid = fluidType === 'OIL'
        ? calcP(simResults.recoverableRuns, targetPct)
        : calcP(simResults.secRecoverableRuns || [], targetPct);

      const secondaryFluid = fluidType === 'OIL'
        ? calcP(simResults.secRecoverableRuns || [], targetPct)
        : calcP(simResults.recoverableRuns, targetPct);

      const totalBOE = calcP(simResults.totalBOE_runs, targetPct);

      return {
        prob: `P${p}`,
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

  // Exceedance Chart Options
  const exceedanceChartOptions = useMemo(() => {
    let xTitle = '';
    if (chartTarget === 'primary') {
      xTitle = `Volume (${fluidType === 'OIL' ? 'MMbbl' : 'Bcf'})`;
    } else {
      xTitle = `Volume (${fluidType === 'OIL' ? 'Bcf' : 'MMbbl'})`;
    }
    
    return {
      responsive: true,
      maintainAspectRatio: false,
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
  }, [fluidType, chartColors, chartTarget]);

  // PDF (Histogram) Chart Setup
  const pdfChartData = useMemo(() => {
    if (!simResults) return { labels: [], datasets: [] };

    const isPrimary = chartTarget === 'primary';
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
          data: inPlaceHist.percentages, // relative percentage count
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
  }, [simResults, fluidType, chartTarget]);

  const pdfChartOptions = useMemo(() => {
    let xTitle = '';
    if (chartTarget === 'primary') {
      xTitle = `Volume Range (${fluidType === 'OIL' ? 'MMbbl' : 'Bcf'})`;
    } else {
      xTitle = `Volume Range (${fluidType === 'OIL' ? 'Bcf' : 'MMbbl'})`;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
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
  }, [chartColors, chartTarget, fluidType]);

  // Scaling helpers
  const scale = (val: number, type = 'primary') => {
    if (type === 'primary') {
      const scaleFactor = fluidType === 'OIL' ? 1e6 : 1e9;
      return val / scaleFactor;
    } else {
      // Secondary: Solution gas is divided by 1e9 (Bcf), Condensate is divided by 1e6 (MMbbl)
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
  const paramLabels: Record<string, { title: string; unit: string; min: number; max: number; step: number }> = {
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
    
    // Secondary parameters metadata
    GOR: { title: 'Solution Gas/Oil Ratio (GOR)', unit: 'scf/STB', min: 1, max: 50000, step: 10 },
    RE_SolGas: { title: 'Solution Gas Recovery Efficiency (RE-SolGas)', unit: 'fraction', min: 0.01, max: 0.90, step: 0.01 },
    CGR: { title: 'Condensate/Gas Ratio (CGR)', unit: 'bbl/MMscf', min: 0.1, max: 1000, step: 1 },
    RE_Cond: { title: 'Recovery Efficiency of Condensate (RE-Cond)', unit: 'fraction', min: 0.01, max: 0.90, step: 0.01 }
  };

  // Groupings for parameters
  const primaryKeys: Array<keyof SimulationParams> = ['A', 'h', 'Phi', 'Sw', 'Boi', 'RE'];
  const secondaryKeys: string[] = fluidType === 'OIL' ? ['GOR', 'RE_SolGas'] : ['CGR', 'RE_Cond'];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden">
      
      {/* Top Header Single Row */}
      <header className="h-16 shrink-0 border-b border-card-border bg-card px-6 flex items-center justify-between z-30">
        
        {/* Left Side: MC Runs dropdown & Run Simulation Button */}
        <div className="flex items-center gap-4">
          {/* MC Runs Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary shrink-0">
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">MC Runs:</span>
            <select
              value={iterations}
              onChange={(e) => {
                setIterations(Number(e.target.value));
                setSimResults(null);
              }}
              className="bg-background border border-card-border rounded px-2.5 py-1 text-text-secondary font-semibold focus:outline-none focus:border-cyan-500 text-xs cursor-pointer"
            >
              <option value="5000">5,000</option>
              <option value="10000">10,000</option>
              <option value="20000">20,000</option>
            </select>
          </div>

          {/* Run Simulation Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Center Side: Logo, App Name (Stacked) and Version Badge */}
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow shadow-cyan-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col justify-center select-none text-left">
              <span className="font-extrabold text-base leading-none tracking-wide text-text-primary">
                ResoLogix
              </span>
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                Reserve Evaluation
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-card-border/50 text-text-muted px-2.5 py-1 rounded-md font-mono shrink-0 select-none">
            v1.0.1 Build 2026-06-06
          </span>
        </div>

        {/* Right Side: Fluid Type Selector & Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Fluid Type Selector (Primary Product Option) */}
          <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-xs font-semibold shrink-0">
            <button
              onClick={() => {
                setFluidType('OIL');
                setParameters(prev => {
                  const u = { ...prev };
                  u.Boi = { p90: 1.1, p10: 1.3, distribution: 'LOGNORMAL' };
                  return u;
                });
                setSimResults(null);
              }}
              className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                fluidType === 'OIL'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Oil Reservoir
            </button>
            <button
              onClick={() => {
                setFluidType('GAS');
                setParameters(prev => {
                  const u = { ...prev };
                  u.Boi = { p90: 100, p10: 200, distribution: 'LOGNORMAL' };
                  return u;
                });
                setSimResults(null);
              }}
              className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                fluidType === 'GAS'
                  ? 'bg-orange-500 text-white font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Gas Reservoir
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-background border border-card-border text-text-secondary hover:text-text-primary hover:border-card-border/80 transition-all duration-200 cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container below the two rows */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Sidebar - Scenario Manager */}
        <aside 
          className="shrink-0 border-r border-card-border bg-sidebar p-5 flex flex-col gap-6"
          style={{ width: sidebarWidth }}
        >
          {/* New / Save Buttons Side-by-Side */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleNewScenario}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs border border-dashed border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-300 truncate cursor-pointer"
              title="New Evaluation Scenario"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">New</span>
            </button>
            
            <button
              onClick={handleSaveScenario}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer truncate ${
                saveStatus === 'success'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  : saveStatus === 'error'
                  ? 'bg-rose-950 border-rose-500 text-rose-400'
                  : 'bg-card border-card-border text-text-secondary hover:border-card-border hover:text-text-primary'
              }`}
              title="Save Scenario"
            >
              {saveStatus === 'success' ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isSaving ? 'Saving...' : 'Save'}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
              <span className="flex items-center gap-1.5 min-w-0">
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Saved Evaluations</span>
              </span>
              <span className="shrink-0">({evaluations.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {isLoadingScenarios ? (
                <div className="text-text-muted text-xs text-center py-8">Loading scenarios...</div>
              ) : evaluations.length === 0 ? (
                <div className="text-text-muted text-xs text-center py-8">No saved scenarios. Create and save one!</div>
              ) : (
                evaluations.map((ev) => {
                  const isActive = ev.id === activeId;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => loadScenario(ev)}
                      className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'bg-card border-cyan-500 shadow-md shadow-cyan-950/20'
                          : 'bg-card/30 border-card-border hover:border-cyan-500/40 hover:bg-card/55'
                      }`}
                    >
                      <div className="font-semibold text-sm pr-6 text-text-primary group-hover:text-cyan-400 transition-colors duration-200 truncate">
                        {ev.name}
                      </div>
                      <div className="text-xs text-text-muted mt-1 truncate">
                        {ev.description || 'No description'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          ev.fluid_type === 'OIL' ? 'bg-blue-950/35 text-blue-400' : 'bg-orange-950/35 text-orange-400'
                        }`}>
                          {ev.fluid_type}
                        </span>
                        <span className="text-[10px] text-text-muted truncate">
                          {ev.updated_at ? new Date(ev.updated_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteScenario(ev.id, e)}
                        className="absolute top-3 right-3 text-text-muted hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete Scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Sidebar Resizer Handle Line */}
        <div 
          className="w-[3px] hover:w-[6px] cursor-col-resize bg-card-border/30 hover:bg-cyan-500/70 transition-all shrink-0 select-none z-20"
          onMouseDown={handleSidebarMouseDown}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background p-6">
          
          {/* Scenario Details & Reserve Profile sub-panel */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 mb-6 border border-card-border/50">
            {/* Name and Description Inputs Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Scenario Name</label>
                <input
                  type="text"
                  value={activeName}
                  onChange={(e) => setActiveName(e.target.value)}
                  className="bg-transparent text-sm font-bold text-text-primary focus:outline-none border-b border-transparent focus:border-card-border hover:border-card-border/60 px-1 py-0.5 rounded transition-all duration-200 w-full max-w-xl truncate"
                  placeholder="Scenario Name"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  value={activeDescription}
                  onChange={(e) => setActiveDescription(e.target.value)}
                  className="bg-transparent text-xs text-text-secondary focus:outline-none border-b border-transparent focus:border-card-border/60 px-1 py-1 rounded transition-all duration-200 w-full max-w-2xl truncate"
                  placeholder="Add description..."
                />
              </div>
            </div>

            {/* Collapsible Reserve Profile Section */}
            <div className="border-t border-card-border/40 pt-3">
              <button
                type="button"
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors duration-200 uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                {isProfileExpanded ? (
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
                <span>Reserve Profile</span>
                <span className="text-[9px] text-text-muted font-normal lowercase italic normal-case">
                  ({isProfileExpanded ? 'click to collapse' : 'click to expand - defaults to undefined'})
                </span>
              </button>

              {isProfileExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-2 border-t border-card-border/20 animate-fade-in">
                  
                  {/* Country Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Geological Basin Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Geol-Basin</label>
                    <select
                      value={geolBasin}
                      onChange={(e) => setGeolBasin(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {GEOL_BASINS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Play Type Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Play-Type</label>
                    <select
                      value={playType}
                      onChange={(e) => setPlayType(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {PLAY_TYPES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reservoir Age Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Reservoir-Age</label>
                    <select
                      value={reservoirAge}
                      onChange={(e) => setReservoirAge(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {RESERVOIR_AGES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lithology Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Lithology</label>
                    <select
                      value={lithology}
                      onChange={(e) => setLithology(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {LITHOLOGIES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Depositional Environment Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Depo-Env</label>
                    <select
                      value={depoEnv}
                      onChange={(e) => setDepoEnv(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {DEPO_ENVS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Exploration Stage Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Exp-Stage</label>
                    <select
                      value={expStage}
                      onChange={(e) => setExpStage(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {EXP_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Terrain Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Terrain</label>
                    <select
                      value={terrain}
                      onChange={(e) => setTerrain(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {TERRAINS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lahee Class Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Lahee-Class</label>
                    <select
                      value={laheeClass}
                      onChange={(e) => setLaheeClass(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                    >
                      <option value="undefined">undefined</option>
                      {LAHEE_CLASSES.map((lc) => (
                        <option key={lc} value={lc}>{lc}</option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Card 1: Primary Mean In-Place */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-cyan-500">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Unrisked Mean {fluidType === 'OIL' ? 'OOIP' : 'OGIP'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-primary">
                  {simResults ? formatVolume(simResults.inPlaceStats.mean) : '—'}
                </span>
                <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'MMbbl' : 'Bcf'}</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1">Based on volumetric simulation</span>
            </div>

            {/* Card 2: Primary Mean Recoverable */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Unrisked Mean Recoverable {fluidType === 'OIL' ? '(Oil)' : '(Gas)'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {simResults ? formatVolume(simResults.recoverableStats.mean) : '—'}
                </span>
                <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'MMbbl' : 'Bcf'}</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1">Primary Product Reserves</span>
            </div>

            {/* Card 3: Secondary Mean In-Place */}
            <div className={`glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-purple-500 transition-all duration-300 ${!includeSecondary ? 'opacity-50' : ''}`}>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Unrisked Mean {fluidType === 'OIL' ? 'Solution Gas In-Place' : 'Condensate In-Place'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {simResults && includeSecondary && simResults.secInPlaceStats 
                    ? formatVolume(simResults.secInPlaceStats.mean, 'secondary') 
                    : '—'}
                </span>
                <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'Bcf' : 'MMbbl'}</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1">
                {!includeSecondary ? 'Secondary Product Disabled' : 'Associated Secondary Product'}
              </span>
            </div>

            {/* Card 4: Secondary Mean Recoverable */}
            <div className={`glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-pink-500 transition-all duration-300 ${!includeSecondary ? 'opacity-50' : ''}`}>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Unrisked Mean Rec. {fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-pink-500 dark:text-pink-400">
                  {simResults && includeSecondary && simResults.secRecoverableStats 
                    ? formatVolume(simResults.secRecoverableStats.mean, 'secondary') 
                    : '—'}
                </span>
                <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'Bcf' : 'MMbbl'}</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1">
                {!includeSecondary ? 'Secondary Product Disabled' : 'Associated Secondary Reserves'}
              </span>
            </div>
            
          </div>

          {/* Premium Gradient Separator Bar */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-card-border/60 to-transparent my-3 shrink-0" />

          {/* Config Panels with Dynamic Flex Resizing */}
          <div className="flex flex-col lg:flex-row gap-0 items-stretch">
            
            {/* Volumetric Parameters Config (Middle pane) */}
            <section className="flex-1 glass-panel p-6 rounded-2xl flex flex-col gap-5 min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">Volumetric Parameters Settings</h2>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-panel text-text-muted border border-card-border/30">
                  Inputs must be values &gt; 0
                </div>
              </div>

              {/* Primary Volumetric Parameters */}
              <div className="flex flex-col gap-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-cyan-500/80 mb-1">
                  Primary Product Parameters ({fluidType === 'OIL' ? 'Crude Oil' : 'Natural Gas'})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {primaryKeys.map((key) => {
                    const param = parameters[key]!;
                    const labelInfo = paramLabels[key];
                    
                    const isSw = key === 'Sw';
                    const isInvalid = isSw ? (param.p10 > param.p90) : (param.p90 > param.p10);
                    
                    return (
                      <div key={key} className="flex flex-col gap-2 p-3 bg-panel border border-card-border/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-primary">{labelInfo.title}</span>
                            <span className="text-[10px] text-text-muted italic">Symbol: {key} ({labelInfo.unit})</span>
                          </div>
                          <select
                            value={param.distribution}
                            onChange={(e) => handleParamChange(key, 'distribution', e.target.value)}
                            className="bg-background border border-card-border rounded px-1.5 py-0.5 text-[10px] font-bold text-cyan-500 focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="LOGNORMAL">LogNormal</option>
                            <option value="NORMAL">Normal</option>
                            <option value="UNIFORM">Uniform</option>
                            <option value="BETA">Beta</option>
                            <option value="TRIANGULAR">Triangular</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                              P90 {isSw ? '(Pessimistic, Max)' : '(Pessimistic, Min)'}
                            </label>
                            <input
                              type="number"
                              step={labelInfo.step}
                              min={labelInfo.min}
                              value={param.p90}
                              onChange={(e) => handleParamChange(key, 'p90', e.target.value)}
                              className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                              P10 {isSw ? '(Optimistic, Min)' : '(Optimistic, Max)'}
                            </label>
                            <input
                              type="number"
                              step={labelInfo.step}
                              min={labelInfo.min}
                              value={param.p10}
                              onChange={(e) => handleParamChange(key, 'p10', e.target.value)}
                              className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Display Warning message */}
                        {isInvalid && (
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold mt-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>
                              {isSw
                                ? 'For Sw, P90 is typically greater than P10'
                                : 'P10 must be greater than P90'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Associated Secondary Product Parameters */}
              <div className="flex flex-col gap-4 pt-4 border-t border-card-border">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-purple-500/80">
                    Associated Secondary Product Parameters ({fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'})
                  </div>
                  
                  {/* Segmented Control for secondary product toggle */}
                  <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-[10px] font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSecondary(true)}
                      className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                        includeSecondary
                          ? 'bg-purple-600 text-white font-bold shadow'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      With Secondary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSecondary(false)}
                      className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                        !includeSecondary
                          ? 'bg-panel border border-card-border/80 text-text-muted font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Without Secondary
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {secondaryKeys.map((key) => {
                    const param = (parameters[key as keyof SimulationParams] || DEFAULT_PARAMS[key as keyof SimulationParams])!;
                    const labelInfo = paramLabels[key];
                    const isInvalid = param.p90 > param.p10;
                    
                    return (
                      <div key={key} className={`flex flex-col gap-2 p-3 bg-panel border border-card-border/50 rounded-xl transition-all duration-300 ${
                        !includeSecondary ? 'opacity-40 pointer-events-none select-none grayscale-[30%]' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-primary">{labelInfo.title}</span>
                            <span className="text-[10px] text-text-muted italic">Symbol: {key} ({labelInfo.unit})</span>
                          </div>
                          <select
                            disabled={!includeSecondary}
                            value={param.distribution}
                            onChange={(e) => handleParamChange(key as any, 'distribution', e.target.value)}
                            className="bg-background border border-card-border rounded px-1.5 py-0.5 text-[10px] font-bold text-purple-500 focus:outline-none focus:border-purple-500 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <option value="LOGNORMAL">LogNormal</option>
                            <option value="NORMAL">Normal</option>
                            <option value="UNIFORM">Uniform</option>
                            <option value="BETA">Beta</option>
                            <option value="TRIANGULAR">Triangular</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                              P90 (Pessimistic, Min)
                            </label>
                            <input
                              disabled={!includeSecondary}
                              type="number"
                              step={labelInfo.step}
                              min={labelInfo.min}
                              value={param.p90}
                              onChange={(e) => handleParamChange(key as any, 'p90', e.target.value)}
                              className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                              P10 (Optimistic, Max)
                            </label>
                            <input
                              disabled={!includeSecondary}
                              type="number"
                              step={labelInfo.step}
                              min={labelInfo.min}
                              value={param.p10}
                              onChange={(e) => handleParamChange(key as any, 'p10', e.target.value)}
                              className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Display Warning message */}
                        {isInvalid && includeSecondary && (
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold mt-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>P10 must be greater than P90</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Vertical Resizer Handle */}
            <div 
              className="hidden lg:block w-[4px] hover:w-[7px] cursor-col-resize bg-card-border/20 hover:bg-cyan-500/40 hover:border-cyan-500/20 hover:border-l hover:border-r transition-all shrink-0 mx-2.5 select-none z-20 rounded"
              onMouseDown={handleRightPaneMouseDown}
              title="Drag to resize panel width"
            />

            {/* Geological Risk Factors (Right pane) */}
            <section 
              className="shrink-0 glass-panel p-6 rounded-2xl flex flex-col gap-5"
              style={{ width: rightPaneWidth }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary truncate">Geological Risk</h2>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/25 border border-emerald-800/20 text-emerald-500 dark:text-emerald-400 shrink-0">
                  Chance: {(calculatedPg * 100).toFixed(1)}%
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {(Object.keys(riskFactors) as Array<keyof RiskFactors>).map((key) => {
                  const factorVal = riskFactors[key];
                  const labelMap: Record<keyof RiskFactors, string> = {
                    source: 'Source Rock / Charge',
                    migration: 'Timing & Migration',
                    reservoir: 'Reservoir Quality',
                    closure: 'Trap Closure / Geometry',
                    containment: 'Seal / Containment'
                  };

                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-text-primary truncate">{labelMap[key]}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/15 border border-emerald-900/20 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                          {(factorVal * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={factorVal}
                          onChange={(e) => handleRiskChange(key, Number(e.target.value))}
                          className="flex-1 h-1.5 bg-panel rounded-lg appearance-none cursor-pointer focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational banner about Pg calculation */}
              <div className="mt-2 text-[10px] text-text-muted bg-panel p-3 rounded-xl border border-card-border/50 leading-relaxed">
                <p className="font-bold text-text-secondary mb-1">Methodology:</p>
                Geological Chance of Success ($P_g$) is the product of these 5 independent geological variables:
                <div className="font-mono text-emerald-500/95 mt-1 select-all font-bold">
                  Pg = S × M × R × C × ST
                </div>
              </div>
            </section>
            
          </div>

          {/* Results Panels with Dynamic Flex Resizing */}
          <div className="flex flex-col lg:flex-row gap-0 items-stretch mt-6">
            
            {/* Visualizations Panel (Middle pane) */}
            <section className="flex-1 glass-panel p-6 rounded-2xl flex flex-col gap-4 min-h-[450px] min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">Probability Distributions</h2>
                </div>
                
                {/* Visual Tab and Product Selector */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Chart Target Selector */}
                  {includeSecondary && (
                    <div className="flex bg-card border border-card-border rounded-xl p-0.5 text-xs">
                      <button
                        onClick={() => setChartTarget('primary')}
                        className={`py-1 px-3 rounded-lg transition-all ${
                          chartTarget === 'primary'
                            ? 'bg-cyan-900/35 border border-cyan-800/40 text-cyan-400 font-bold shadow'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {fluidType === 'OIL' ? 'Primary (Oil)' : 'Primary (Gas)'}
                      </button>
                      <button
                        onClick={() => setChartTarget('secondary')}
                        className={`py-1 px-3 rounded-lg transition-all ${
                          chartTarget === 'secondary'
                            ? 'bg-purple-900/35 border border-purple-800/40 text-purple-400 font-bold shadow'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {fluidType === 'OIL' ? 'Secondary (Solution Gas)' : 'Secondary (Condensate)'}
                      </button>
                    </div>
                  )}

                  {/* Tab Selector */}
                  <div className="flex bg-card border border-card-border rounded-xl p-0.5 text-xs">
                    <button
                      onClick={() => setActiveTab('exceedance')}
                      className={`py-1 px-3 rounded-lg transition-all ${
                        activeTab === 'exceedance'
                          ? 'bg-sidebar border border-card-border text-cyan-500 font-bold shadow'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Exceedance (CDF)
                    </button>
                    <button
                      onClick={() => setActiveTab('pdf')}
                      className={`py-1 px-3 rounded-lg transition-all ${
                        activeTab === 'pdf'
                          ? 'bg-sidebar border border-card-border text-cyan-500 font-bold shadow'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Relative Density (PDF)
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Rendering Container */}
              <div className="flex-1 relative min-h-[350px]">
                {simResults ? (
                  activeTab === 'exceedance' ? (
                    <Line data={exceedanceChartScatterData} options={exceedanceChartOptions as any} />
                  ) : (
                    <Bar data={pdfChartData} options={pdfChartOptions as any} />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs font-semibold">
                    No simulation data available. Run simulation to render chart.
                  </div>
                )}
              </div>
            </section>

            {/* Vertical Resizer Handle */}
            <div 
              className="hidden lg:block w-[4px] hover:w-[7px] cursor-col-resize bg-card-border/20 hover:bg-cyan-500/40 hover:border-cyan-500/20 hover:border-l hover:border-r transition-all shrink-0 mx-2.5 select-none z-20 rounded"
              onMouseDown={handleRightPaneMouseDown}
              title="Drag to resize panel width"
            />

            {/* Results Table Panel (Right pane) */}
            <section 
              className="shrink-0 glass-panel p-6 rounded-2xl flex flex-col gap-4"
              style={{ width: rightPaneWidth }}
            >
              <div className="pb-3 border-b border-card-border flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary truncate">Summary Stats</h2>
              </div>

              {simResults ? (
                <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
                  
                  {/* Section A: Primary Product stats */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-black text-cyan-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                      Primary: {fluidType === 'OIL' ? 'Oil' : 'Gas'} ({fluidType === 'OIL' ? 'MMbbl' : 'Bcf'})
                    </h3>
                    <table className="w-full text-[11px] text-left text-text-secondary">
                      <thead>
                        <tr className="text-[9px] text-text-muted border-b border-card-border">
                          <th className="py-1">Percentile</th>
                          <th className="py-1 text-right">In-Place</th>
                          <th className="py-1 text-right">Recoverable</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-card-border/40 hover:bg-table-hover">
                          <td className="py-1 text-text-muted font-bold">P90</td>
                          <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p90)}</td>
                          <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.recoverableStats.p90)}</td>
                        </tr>
                        <tr className="border-b border-card-border/40 hover:bg-table-hover">
                          <td className="py-1 text-text-muted font-bold">P50</td>
                          <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p50)}</td>
                          <td className="py-1 text-right font-black text-cyan-500">{formatVolume(simResults.recoverableStats.p50)}</td>
                        </tr>
                        <tr className="border-b border-card-border/40 hover:bg-table-hover">
                          <td className="py-1 text-text-muted font-bold">P10</td>
                          <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p10)}</td>
                          <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.recoverableStats.p10)}</td>
                        </tr>
                        <tr className="hover:bg-table-hover font-bold text-text-primary">
                          <td className="py-1.5">Mean Success</td>
                          <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.inPlaceStats.mean)}</td>
                          <td className="py-1.5 text-right">{formatVolume(simResults.recoverableStats.mean)}</td>
                        </tr>
                        <tr className="hover:bg-table-hover font-bold text-purple-600 dark:text-purple-400 border-t border-dashed border-card-border/40">
                          <td className="py-1.5">Mean EV</td>
                          <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.riskedInPlaceStats.mean)}</td>
                          <td className="py-1.5 text-right">{formatVolume(simResults.riskedRecoverableStats.mean)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section B: Secondary Associated Product stats */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-card-border">
                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Secondary: {fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'} ({fluidType === 'OIL' ? 'Bcf' : 'MMbbl'})
                    </h3>
                    {!includeSecondary ? (
                      <div className="text-center py-6 text-text-muted text-[11px] bg-panel/30 rounded-xl border border-dashed border-card-border/60 font-semibold uppercase tracking-wider my-2">
                        Secondary Product Disabled
                      </div>
                    ) : (
                      <table className="w-full text-[11px] text-left text-text-secondary">
                        <thead>
                          <tr className="text-[9px] text-text-muted border-b border-card-border">
                            <th className="py-1">Percentile</th>
                            <th className="py-1 text-right">In-Place</th>
                            <th className="py-1 text-right">Recoverable</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-card-border/40 hover:bg-table-hover">
                            <td className="py-1 text-text-muted font-bold">P90</td>
                            <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p90 || 0, 'secondary')}</td>
                            <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.secRecoverableStats?.p90 || 0, 'secondary')}</td>
                          </tr>
                          <tr className="border-b border-card-border/40 hover:bg-table-hover">
                            <td className="py-1 text-text-muted font-bold">P50</td>
                            <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p50 || 0, 'secondary')}</td>
                            <td className="py-1 text-right font-black text-purple-400">{formatVolume(simResults.secRecoverableStats?.p50 || 0, 'secondary')}</td>
                          </tr>
                          <tr className="border-b border-card-border/40 hover:bg-table-hover">
                            <td className="py-1 text-text-muted font-bold">P10</td>
                            <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p10 || 0, 'secondary')}</td>
                            <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.secRecoverableStats?.p10 || 0, 'secondary')}</td>
                          </tr>
                          <tr className="hover:bg-table-hover font-bold text-text-primary">
                            <td className="py-1.5">Mean Success</td>
                            <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.secInPlaceStats?.mean || 0, 'secondary')}</td>
                            <td className="py-1.5 text-right">{formatVolume(simResults.secRecoverableStats?.mean || 0, 'secondary')}</td>
                          </tr>
                          <tr className="hover:bg-table-hover font-bold text-pink-600 dark:text-pink-400 border-t border-dashed border-card-border/40">
                            <td className="py-1.5">Mean EV</td>
                            <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.secRiskedInPlaceStats?.mean || 0, 'secondary')}</td>
                            <td className="py-1.5 text-right">{formatVolume(simResults.secRiskedRecoverableStats?.mean || 0, 'secondary')}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted text-xs font-semibold">
                  No simulation run.
                </div>
              )}
            </section>
            
          </div>

          {/* Combined Data Tables Section */}
          {simResults && tableData && (
            <div className="flex flex-col gap-6 mt-6 pb-12">
              
              {/* Parameter Data Table */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-card-border/50">
                <div className="flex items-center gap-2 pb-2 border-b border-card-border/60">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
                    Parameter Data Table
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-text-secondary border-collapse">
                    <thead>
                      <tr className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-card-border/80">
                        <th className="py-2.5 px-3">Prob</th>
                        <th className="py-2.5 px-3 text-right">Area (acres)</th>
                        <th className="py-2.5 px-3 text-right">h (ft)</th>
                        <th className="py-2.5 px-3 text-right">Phi (frac)</th>
                        <th className="py-2.5 px-3 text-right">Sw (frac)</th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'RE-Oil (frac)' : 'RE-Gas (frac)'}
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'FVF (Boi)' : 'GEF (scf/rcf)'}
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'Second-RE (RE-SolGas)' : 'Second-RE (RE-Cond)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/30">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-table-hover transition-colors font-medium">
                          <td className="py-2 px-3 text-text-muted font-bold">{row.prob}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.Area.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.h.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.Phi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.Sw.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.RE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            {fluidType === 'OIL'
                              ? row.Boi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                              : row.Boi.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{includeSecondary ? row.secRE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reserve Data Table */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-card-border/50">
                <div className="flex items-center gap-2 pb-2 border-b border-card-border/60">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
                    Reserve Data Table
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-text-secondary border-collapse">
                    <thead>
                      <tr className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-card-border/80">
                        <th className="py-2.5 px-3">Prob</th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'OOIP (MMbbl)' : 'OGIP (Bcf)'}
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'Primary Liquid Yield (MMbbl)' : 'Primary Liquid Yield (Condensate, MMbbl)'}
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          {fluidType === 'OIL' ? 'Secondary fluid yield (Gas, Bcf)' : 'Secondary fluid yield (Gas, Bcf)'}
                        </th>
                        <th className="py-2.5 px-3 text-right">Totalized MMBOE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/30">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-table-hover transition-colors font-medium">
                          <td className="py-2 px-3 text-text-muted font-bold">{row.prob}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-text-primary">
                            {formatVolume(row.primaryInPlace, 'primary')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400">
                            {fluidType === 'OIL'
                              ? formatVolume(row.primaryLiquid, 'primary')
                              : (includeSecondary ? formatVolume(row.primaryLiquid, 'secondary') : '—')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-purple-500 dark:text-purple-400">
                            {fluidType === 'OIL'
                              ? (includeSecondary ? formatVolume(row.secondaryFluid, 'secondary') : '—')
                              : formatVolume(row.secondaryFluid, 'primary')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-pink-500 dark:text-pink-400">
                            {row.totalBOE.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

      </main>
    </div>
  </div>
);
}
