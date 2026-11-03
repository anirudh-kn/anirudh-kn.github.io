export type DestinationId =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'contact';

export interface SpatialDestination {
  id: DestinationId;
  index: number;
  scrollProgress: number;
  pigmentName: string;
  sectionTitle: string;
  roomTitle: string;
  subtitle: string;
  hex: string;
  /** Position of this pigment mound on the 3D Artist's Palette */
  paletteLocalPos: [number, number, number];
  /** Center of this 3D environment room in world coordinates */
  roomCenter: [number, number, number];
  /** Default camera position when visiting this destination */
  cameraPos: [number, number, number];
  /** Default camera lookAt target when visiting this destination */
  cameraTarget: [number, number, number];
}

export interface SkillItem {
  name: string;
  context: string;
}

export interface SkillCategory {
  id: string;
  code: string;
  title: string;
  pigmentName: string;
  color: string;
  description: string;
  skills: SkillItem[];
  nodePosition: [number, number, number];
}

export interface ProjectScreenshot {
  id: string;
  url: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  aspectRatio: number;
  implementationNote?: string;
}

export interface ProjectCaseStudySection {
  heading: string;
  content: string;
  bullets?: string[];
}

export interface ProjectKpiBadge {
  label: string;
  value: string;
  detail?: string;
}

export interface ProjectInstallation {
  id: 'seismos' | 'sales-dashboard' | 'churn-analysis' | 'marketing-funnel';
  accession: string;
  title: string;
  fullTitle: string;
  shortTitle: string;
  date: string;
  category: 'ml' | 'bi';
  categoryLabel: string;
  medium: string;
  pigmentColor: string;
  sculptureType: 'globe' | 'bars' | 'rings' | 'funnel';
  /** 3D position inside the Projects Digital Exhibition hall (relative to roomCenter) */
  localPosition: [number, number, number];
  /** Camera position in world space when zoomed into this specific installation */
  zoomCameraPos: [number, number, number];
  /** Camera lookAt target in world space when zoomed into this specific installation */
  zoomCameraTarget: [number, number, number];
  shortDescription: string;
  problemStatement: string;
  objective: string;
  dataset: string;
  technologies: string[];
  methods: string[];
  outcomes: string[];
  displayedMetrics: ProjectKpiBadge[];
  screenshots: ProjectScreenshot[];
  caseStudySections: ProjectCaseStudySection[];
  githubUrl: string;
  githubLabel: string;
  liveDemoUrl: string | null;
  highlightMetric: {
    value: string;
    label: string;
  };
}

export interface TimelineEntry {
  id: string;
  type: 'internship' | 'education' | 'forage' | 'certification';
  roleOrTitle: string;
  organization: string;
  location: string;
  period: string;
  pigmentColor: string;
  highlights: string[];
  credentialUrl?: string;
  credentialLabel?: string;
}

export interface QuickProfileSkillGroup {
  category: string;
  items: string[];
}

export const DESIGN_TOKENS = {
  charcoal: '#101112',
  ivory: '#F1EEE7',
  cobalt: '#6B84C4',
  vermilion: '#C7745C',
  gold: '#B9A078',
  teal: '#659B93',
} as const;

export const PROFILE_DATA = {
  name: 'ANIRUDH K N',
  displayName: 'Anirudh K N',
  recruiterHeadline:
    'BCA Graduate | Aspiring Data Analyst | Machine Learning & AI Enthusiast',
  heroHeadline: 'Turning Data Into Meaningful Intelligence.',
  heroSubtitle: 'BCA Graduate | Data Analytics | Machine Learning | AI/ML',
  atelierTitle: 'THE DATA ATELIER',
  atelierTagline: 'Where Art Meets Intelligence.',
  location: 'Kerala, India',
  phone: '+91 89213 60955',
  phoneHref: 'tel:+918921360955',
  email: 'theanirudhkn@gmail.com',
  emailHref: 'mailto:theanirudhkn@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/anirudh-k-n',
  githubUrl: 'https://github.com/anirudh-kn',
  portfolioUrl: 'https://anirudh-kn.github.io/',
  resumePdfUrl: '/Anirudh_KN_Resume.pdf',
  portraitImageUrl: '/assets/anirudh-profile-cutout.webp',
  summary:
    'Computer Applications (BCA) graduate and entry-level data science, analytics, and AI/ML professional with three practical internships. Builds Power BI dashboards that surface anomalies and quantify business impact, and develops Python and scikit-learn machine learning pipelines. Skilled in SQL, Python, and DAX; works independently, communicates clearly, and learns fast.',
  artPhilosophy:
    'In this atelier, raw data is treated as unrefined pigment. Python and SQL serve as the precision brushes, statistical cleaning prepares the linen canvas, machine learning shapes the underlying structure, and interactive dashboards emerge as the finished gallery exhibition.',
  education: {
    degree: 'Bachelor of Computer Applications (BCA)',
    institution: 'East Point College of Higher Education',
    university: 'Bengaluru North University',
    cgpa: '8.5',
    period: 'August 2022 – August 2025',
    location: 'Bengaluru, India',
  },
};

export const QUICK_PROFILE_SKILL_GROUPS: QuickProfileSkillGroup[] = [
  {
    category: 'Programming',
    items: ['Python', 'SQL', 'DAX (Data Analysis Expressions)', 'Power Query (M)'],
  },
  {
    category: 'Data Analytics',
    items: [
      'Exploratory Data Analysis (EDA)',
      'Statistical Analysis',
      'Data Cleaning & Transformation',
      'KPI Monitoring & Anomaly Flagging',
      'Cohort & Funnel Analysis',
    ],
  },
  {
    category: 'Machine Learning',
    items: [
      'Predictive Modeling',
      'Random Forest Classification',
      'Decision Tree Classification',
      'Logistic Regression',
      'Statistical Anomaly Detection',
    ],
  },
  {
    category: 'Visualization',
    items: [
      'Power BI',
      'Tableau',
      'Streamlit',
      'Plotly',
      'Matplotlib',
      'Executive Dashboard Design',
    ],
  },
  {
    category: 'Frameworks and Tools',
    items: [
      'Scikit-learn',
      'Pandas',
      'NumPy',
      'Git & GitHub',
      'REST APIs (USGS GeoJSON Telemetry)',
      'Advanced Excel',
      'Google Analytics',
    ],
  },
];

/**
 * Six Spatial Destinations inside the single persistent 3D world.
 */
export const SPATIAL_DESTINATIONS: SpatialDestination[] = [
  {
    id: 'home',
    index: 0,
    scrollProgress: 0,
    pigmentName: 'Warm Canvas Ivory',
    sectionTitle: 'Home',
    roomTitle: "THE ARTIST'S STUDIO",
    subtitle: 'The Living Canvas & 3D Palette',
    hex: '#F1EEE7',
    paletteLocalPos: [-1.42, 0.42, 0.14],
    roomCenter: [0, 0, 0],
    cameraPos: [0, 0.55, 7.2],
    cameraTarget: [0, 0.15, 0],
  },
  {
    id: 'about',
    index: 1,
    scrollProgress: 0.2,
    pigmentName: 'Muted Metallic Gold',
    sectionTitle: 'About',
    roomTitle: "THE CREATOR'S SPACE",
    subtitle: 'The Artist Behind the Data',
    hex: '#B9A078',
    paletteLocalPos: [-0.82, 0.86, 0.14],
    roomCenter: [-18, 0.4, -18],
    cameraPos: [-18, 0.85, -10.4],
    cameraTarget: [-18, 0.45, -18],
  },
  {
    id: 'skills',
    index: 2,
    scrollProgress: 0.4,
    pigmentName: 'Electric Cobalt',
    sectionTitle: 'Skills',
    roomTitle: 'THE NEURAL SCULPTURE',
    subtitle: 'Interconnected Technical Architecture',
    hex: '#6B84C4',
    paletteLocalPos: [0.05, 0.94, 0.14],
    roomCenter: [18, 1.0, -38],
    cameraPos: [18, 1.35, -30.2],
    cameraTarget: [18, 1.0, -38],
  },
  {
    id: 'projects',
    index: 3,
    scrollProgress: 0.6,
    pigmentName: 'Studio Vermilion',
    sectionTitle: 'Projects',
    roomTitle: 'THE DIGITAL EXHIBITION',
    subtitle: '3D Project Exhibitions & Real Evidence',
    hex: '#C7745C',
    paletteLocalPos: [0.92, 0.72, 0.14],
    roomCenter: [0, 0.8, -62],
    cameraPos: [0, 1.75, -49.6],
    cameraTarget: [0, 1.2, -62],
  },
  {
    id: 'experience',
    index: 4,
    scrollProgress: 0.8,
    pigmentName: 'Soft Verdigris Teal',
    sectionTitle: 'Experience',
    roomTitle: 'THE CREATIVE TIMELINE',
    subtitle: 'Internships, BCA Degree & Credentials',
    hex: '#659B93',
    paletteLocalPos: [1.38, 0.12, 0.14],
    roomCenter: [-18, 1.0, -86],
    cameraPos: [-18, 1.18, -76.0],
    cameraTarget: [-18, 0.76, -86],
  },
  {
    id: 'contact',
    index: 5,
    scrollProgress: 1.0,
    pigmentName: 'Titanium White',
    sectionTitle: 'Contact',
    roomTitle: 'THE FINAL SIGNATURE',
    subtitle: 'Direct Connection & Commission',
    hex: '#FFFFFF',
    paletteLocalPos: [0.75, -0.58, 0.14],
    roomCenter: [0, 0.8, -110],
    cameraPos: [0, 1.18, -101.8],
    cameraTarget: [0, 0.82, -110],
  },
];

// Keep backward-compatible export alias for tests and components
export const PALETTE_NAVIGATION = SPATIAL_DESTINATIONS;
export type PigmentNavItem = SpatialDestination;

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'programming',
    code: 'A',
    title: 'Programming and Data Handling',
    pigmentName: 'Architectural Cobalt',
    color: '#7894D4',
    description:
      'Core languages and query engines used to ingest, structure, and manipulate multi-source tabular and API datasets.',
    nodePosition: [-2.4, 0.72, 0.22],
    skills: [
      {
        name: 'Python (pandas, NumPy, scikit-learn)',
        context:
          'Used for automated KPI reporting at Future Interns and ML classification pipelines in Seismos.',
      },
      {
        name: 'SQL',
        context:
          'Relational data querying, filtering, and schema preparation for analytics workflows.',
      },
      {
        name: 'DAX (Data Analysis Expressions)',
        context:
          'Custom calculated measures for Superstore sales ($2.30M), churn rate (26.54%), and funnel conversion (5.42%).',
      },
      {
        name: 'Power Query',
        context:
          'Applied at Quest Innovative Solutions to clean and restructure multi-source datasets into analysis-ready models.',
      },
    ],
  },
  {
    id: 'analytics',
    code: 'B',
    title: 'Data Analytics and Statistics',
    pigmentName: 'Terracotta Vermilion',
    color: '#D1846D',
    description:
      'Analytical methodologies that isolate business bottlenecks, quantify revenue drivers, and surface operational anomalies.',
    nodePosition: [-0.95, 1.58, -0.12],
    skills: [
      {
        name: 'Exploratory Data Analysis (EDA)',
        context:
          'Applied across retail orders, telecom churn cohorts, seismic catalogs, and Tata Group Gen AI delinquency analysis.',
      },
      {
        name: 'Statistical Analysis',
        context:
          'Applied to large financial datasets at Zetheta Algorithms for real-time risk dashboard monitoring.',
      },
      {
        name: 'Data Cleaning & Transformation',
        context:
          'Standardizing raw multi-source inputs, handling missing values, and restructuring schemas for BI.',
      },
      {
        name: 'KPI Monitoring & Anomaly Flagging',
        context:
          'Automated Python and Power BI reporting at Future Interns, reducing manual reporting effort by ~30%.',
      },
      {
        name: 'Performance & Funnel Reporting',
        context:
          'Delivered stakeholder-ready sales, churn, and 36K-visitor marketing funnel conversion reports.',
      },
    ],
  },
  {
    id: 'machine-learning',
    code: 'C',
    title: 'Machine Learning',
    pigmentName: 'Amethyst Slate',
    color: '#A997C8',
    description:
      'Supervised classification algorithms and anomaly detection pipelines engineered for seismic risk prediction and pattern discovery.',
    nodePosition: [0.95, 1.58, -0.12],
    skills: [
      {
        name: 'Predictive Modeling',
        context:
          'End-to-end feature preparation, train/test evaluation, and multi-tier seismic risk classification.',
      },
      {
        name: 'Random Forest',
        context:
          'Ensemble classifier deployed in the Seismos earthquake risk analysis and pattern prediction pipeline.',
      },
      {
        name: 'Decision Tree',
        context:
          'Interpretable rule-based classification model evaluated in the Seismos seismic severity benchmark.',
      },
      {
        name: 'Logistic Regression',
        context:
          'Probabilistic baseline classifier evaluated in Seismos for earthquake risk-tier prediction.',
      },
      {
        name: 'Anomaly Detection',
        context:
          'Automated detection of abnormal seismic tremor patterns and business KPI deviations.',
      },
    ],
  },
  {
    id: 'visualization',
    code: 'D',
    title: 'Data Visualization and Business Intelligence',
    pigmentName: 'Verdigris Sage',
    color: '#73A99E',
    description:
      'Visual storytelling platforms and interactive dashboard environments that translate complex models into executive clarity.',
    nodePosition: [2.4, 0.72, 0.22],
    skills: [
      {
        name: 'Power BI',
        context:
          'Primary BI workbench across all three internships and the Sales, Customer Churn, and Marketing Funnel projects.',
      },
      {
        name: 'Tableau',
        context:
          'Used for data visualization and classification analysis in the Deloitte Australia Data Analytics simulation.',
      },
      {
        name: 'Streamlit',
        context:
          'Interactive Python web application framework powering the Seismos earthquake monitoring interface.',
      },
      {
        name: 'Plotly & Matplotlib',
        context:
          'Programmatic Python charting libraries used for seismic trend visualization and EDA plots.',
      },
    ],
  },
  {
    id: 'frameworks',
    code: 'E',
    title: 'Frameworks and Development Tools',
    pigmentName: 'Pewter Steel',
    color: '#AEB7C3',
    description:
      'Production tooling, version control, and live data ingestion interfaces supporting reproducible data engineering.',
    nodePosition: [-1.62, -0.58, 0.26],
    skills: [
      {
        name: 'Git & GitHub',
        context:
          'Version control, documentation, and open-source publishing for Seismos, FUTURE_DS_01, FUTURE_DS_02, and FUTURE_DS_03.',
      },
      {
        name: 'REST APIs (USGS Live Telemetry)',
        context:
          'Real-time JSON/GeoJSON telemetry ingestion for live seismic event monitoring and alert classification.',
      },
      {
        name: 'Advanced Excel',
        context:
          'Spreadsheet modeling, pivot analysis, and data verification in Deloitte and internship workflows.',
      },
      {
        name: 'Google Workspace',
        context:
          'Collaborative documentation, stakeholder presentation, and executive reporting workflows.',
      },
    ],
  },
  {
    id: 'cloud-ai-foundations',
    code: 'F',
    title: 'AI Foundations, Cloud & Digital Analytics',
    pigmentName: 'Warm Sandstone',
    color: '#C7B9A3',
    description:
      'Verified industry credentials spanning Generative AI foundations, GPU infrastructure operations, cloud architecture, and digital analytics.',
    nodePosition: [1.62, -0.58, 0.26],
    skills: [
      {
        name: 'Generative AI Foundations',
        context:
          'Certified by Google Cloud (Introduction to Generative AI) & IBM SkillsBuild; applied in Tata Group Gen AI Data Analytics simulation.',
      },
      {
        name: 'AI Infrastructure & Operations',
        context:
          'Verified NVIDIA AI Infrastructure & Operations Fundamentals credential (Feb 2026).',
      },
      {
        name: 'Cloud Solutions Architecture',
        context:
          'Completed AWS Solutions Architecture Virtual Experience Program designing scalable hosting architectures.',
      },
      {
        name: 'Google Analytics',
        context:
          'Google Analytics Certified (Feb 2026) for digital funnel and traffic behavior measurement.',
      },
    ],
  },
];

/**
 * Strictly the 4 verified projects from Anirudh K N's resume, paired with the 7 authentic screenshots.
 * Unverified projects (Crop Recommendation, Diabetes, Maternal Health, E-Commerce RAG) are permanently excluded.
 */
export const PROJECT_INSTALLATIONS: ProjectInstallation[] = [
  {
    id: 'seismos',
    accession: 'ACC. 2026.01 · FLAGSHIP INSTALLATION',
    title: 'Seismos — Earthquake Risk Analysis',
    fullTitle:
      'AI-Based Earthquake Risk Analysis & Seismic Pattern Prediction System',
    shortTitle: 'Seismos — Earthquake Risk AI',
    date: 'Apr – May 2026',
    category: 'ml',
    categoryLabel: 'Machine Learning & Seismic Intelligence',
    medium:
      '3D Tectonic Earth Installation & Exhibition Frame · Python, Scikit-learn, Streamlit & Power BI',
    pigmentColor: '#C7745C',
    sculptureType: 'globe',
    localPosition: [-1.45, 0.05, -0.15],
    zoomCameraPos: [-1.45, 1.65, -53.0],
    zoomCameraTarget: [-1.45, 1.35, -62.15],
    shortDescription:
      'Built a machine learning risk-classification pipeline (Random Forest, Decision Tree, Logistic Regression) with USGS API earthquake data, anomaly detection, and interactive analytical views in Streamlit and Power BI.',
    problemStatement:
      'Continuous global seismic activity produces high-velocity geospatial data streams where manual inspection cannot rapidly categorize multi-parameter event risk levels or compare regional magnitude patterns.',
    objective:
      'Engineer a modular Python and Scikit-learn classification pipeline paired with an interactive Streamlit and Power BI analytical interface to ingest USGS earthquake feeds, evaluate multi-tier risk scores, and visualize global and regional seismic distributions.',
    dataset:
      'USGS Earthquake Hazards Program REST API (GeoJSON event catalog) and historical seismic records.',
    technologies: [
      'Python',
      'Scikit-learn',
      'Streamlit',
      'Power BI',
      'Pandas',
      'NumPy',
      'Plotly',
      'Matplotlib',
      'USGS REST API',
    ],
    methods: [
      'Random Forest Classification',
      'Decision Tree Classification',
      'Logistic Regression',
      'Statistical Anomaly Detection',
      'Geospatial Risk Tiering (Low / Medium / High)',
    ],
    outcomes: [
      'Built and compared Random Forest, Decision Tree, and Logistic Regression classifiers for multi-tier seismic risk categorization.',
      'Integrated USGS API earthquake data with automated statistical anomaly flagging and interactive filtering by data window, magnitude, and depth.',
      'Designed four analytical modules covering live monitoring (220 events, Max M6.0, Avg 1.86), global activity timelines, single-event AI risk radar (e.g. 37% Low Risk score, 22km impact radius), and top-10 regional risk distributions.',
    ],
    displayedMetrics: [
      {
        label: 'Window Events',
        value: '220 Events',
        detail: '24-hour USGS monitoring window sample',
      },
      {
        label: 'Peak Magnitude',
        value: 'M6.0 Max',
        detail: '7 events at M5+ · 1.86 average magnitude',
      },
      {
        label: 'Risk Distribution',
        value: '88.2% Low',
        detail: '11.4% Medium · 0.455% High across 220 events',
      },
      {
        label: 'ML Risk Example',
        value: '37% Score',
        detail: 'Low Risk · 22km est. radius · 22.0km depth',
      },
    ],
    screenshots: [
      {
        id: 'seismos-live-monitor',
        url: '/assets/projects/seismos/live-monitor-interface.png',
        title: 'Live Seismic Monitor Interface',
        caption:
          'Streamlit Live Seismic Monitor ingesting USGS feed data with filters (Last 24 Hours, M >= 0.0, All Depths), elevated activity banner (Max M6.0), and KPI summary cards (220 total events, M6.0 max, 1.86 avg magnitude, 7 M5+ events, 0 tsunami flags).',
        width: 1917,
        height: 900,
        aspectRatio: 1917 / 900,
        implementationNote:
          'Working USGS GeoJSON feed ingestion and KPI aggregation in Streamlit.',
      },
      {
        id: 'seismos-global-analytics',
        url: '/assets/projects/seismos/global-activity-analytics.png',
        title: 'Global Activity Analytics & Risk Distribution',
        caption:
          'Global Risk Map plotting Low, Medium, and High seismic events alongside the Seismic Activity Timeline, Hourly Activity (UTC) curve, and Risk Distribution donut chart (220 events: 88.2% Low, 11.4% Medium, 0.455% High).',
        width: 1497,
        height: 911,
        aspectRatio: 1497 / 911,
        implementationNote:
          'Interactive Plotly geospatial map, temporal timeline, and risk-tier breakdown.',
      },
      {
        id: 'seismos-risk-assessment',
        url: '/assets/projects/seismos/risk-assessment-interface.png',
        title: 'AI Risk Assessment & Parameter Analysis',
        caption:
          'Single-event ML Risk Assessment view illustrating a Low Risk classification (37% Risk Score, 22km estimated felt radius), Class Probabilities (Low / Medium / High), 7-axis Risk Profile Radar, and Parameter Analysis (Depth 22.0 km, Azimuthal Gap 60°, RMS Residual 0.42).',
        width: 1517,
        height: 923,
        aspectRatio: 1517 / 923,
        implementationNote:
          'Supervised ML feature evaluation & prototype risk-scoring visualization.',
      },
      {
        id: 'seismos-regional-analysis',
        url: '/assets/projects/seismos/regional-seismic-analysis.png',
        title: 'Regional Seismic Analysis (Top 10 Tectonic Zones)',
        caption:
          'Comparative regional breakdown across Global, Alaska-Aleutian, Caribbean, Pacific Ring of Fire, South America Andes, Himalayan Belt, Central America, Mediterranean, and East Africa Rift by event count, average magnitude, and risk-level distribution.',
        width: 1916,
        height: 926,
        aspectRatio: 1916 / 926,
        implementationNote:
          'Regional tectonic zone aggregation and comparative risk-tier charting.',
      },
    ],
    caseStudySections: [
      {
        heading: 'Project Overview & System Purpose',
        content:
          'AI-Based Earthquake Risk Analysis & Seismic Pattern Prediction System (Seismos) is an analytical Python, Scikit-learn, Streamlit, and Power BI project designed to ingest seismic event catalogs from the USGS API, classify event severity tiers using supervised machine learning models, and visualize temporal and regional earthquake patterns.',
      },
      {
        heading: 'Business & Analytical Problem',
        content:
          'Raw earthquake feeds contain hundreds of daily events with varying magnitudes, focal depths, station coverage gaps, and waveform residuals. Analysts need structured filtering, multi-parameter risk classification, and regional aggregation to distinguish routine micro-tremors from shallow, moderate-to-strong events.',
      },
      {
        heading: 'Machine Learning & Analytical Pipeline',
        content:
          'The pipeline preprocesses geophysical attributes—including magnitude, focal depth (km), azimuthal gap (°), station coverage, minimum distance (dmin), and RMS waveform residual—and benchmarks Random Forest, Decision Tree, and Logistic Regression classifiers to categorize events into Low, Medium, and High risk tiers.',
        bullets: [
          'Supervised Classification: Random Forest, Decision Tree, and Logistic Regression evaluated on historical and USGS catalog features.',
          'Parameter Analysis: Evaluates shallow focal depth (<35km), azimuthal gap (e.g., 60° good station coverage), and RMS residual (e.g., 0.42 waveform fit).',
          'Statistical Anomaly Flagging: Surfaces elevated activity windows (such as Max M6.0 and 7 M5+ events in a 24-hour window of 220 events).',
        ],
      },
      {
        heading: 'Live Seismic Monitor & Global Activity Analytics',
        content:
          'As documented in the application screenshots, the Live Seismic Monitor tracks 220 recorded events in a 24-hour monitoring window with a peak magnitude of M6.0, an average magnitude of 1.86, and 7 M5+ events. The Global Activity Analytics module maps event coordinates by risk tier and breaks down the 220-event catalog into 88.2% Low Risk, 11.4% Medium Risk, and 0.455% High Risk.',
      },
      {
        heading: 'AI Risk Assessment & Regional Seismic Analysis',
        content:
          'The AI Risk Assessment screen inspects individual seismic events via class probability bars, a 7-axis Risk Profile Radar (Station Coverage, Network Gap, Depth Risk, D.Error, H.Error, Dmin Proximity, RMS Quality), and parameter diagnostics (e.g., 37% risk score, 22km estimated felt radius at 22.0 km depth). The Regional Seismic Analysis view compares the Top 10 tectonic zones including Alaska-Aleutian, Caribbean, Pacific Ring of Fire, South America Andes, and Himalayan Belt.',
      },
      {
        heading: 'Implementation Scope & Scientific Transparency',
        content:
          'To represent the project accurately: USGS GeoJSON API data ingestion, data cleaning, statistical aggregations, Plotly/Streamlit dashboards, and Scikit-learn classification benchmarking are working analytical implementations. Risk scores, impact radius estimates, and alert-center views are educational and analytical modeling prototypes—not a certified real-time emergency warning system or deterministic earthquake predictor.',
      },
      {
        heading: 'Technologies Used',
        content:
          'Python, Scikit-learn (Random Forest, Decision Tree, Logistic Regression), Pandas, NumPy, Streamlit, Plotly, Matplotlib, Power BI, and the USGS Earthquake Hazards REST API.',
      },
    ],
    githubUrl: 'https://github.com/anirudh-kn/ai-seismic-monitoring-system',
    githubLabel: 'View Seismos Repository',
    liveDemoUrl: null,
    highlightMetric: {
      value: '220 Events · M6.0 Max',
      label: 'RF · DT · LR + USGS API Pipeline',
    },
  },
  {
    id: 'sales-dashboard',
    accession: 'ACC. 2026.02 · SUPERSTORE BI',
    title: 'Sales Performance Dashboard',
    fullTitle: 'Sales Performance Dashboard — Superstore Revenue & Profit BI',
    shortTitle: 'Sales Performance Dashboard',
    date: 'Apr 2026',
    category: 'bi',
    categoryLabel: 'Business Intelligence & Revenue Analytics',
    medium:
      '3D Architectural Revenue Monolith & Framed Power BI Exhibition · Power BI & DAX',
    pigmentColor: '#6B84C4',
    sculptureType: 'bars',
    localPosition: [-4.6, -0.1, 0.55],
    zoomCameraPos: [-4.6, 1.55, -52.8],
    zoomCameraTarget: [-4.6, 1.25, -61.45],
    shortDescription:
      'Analyzed 38K Superstore orders ($2.30M total sales, $286.40K total profit) in Power BI and DAX, identifying Technology as the top-revenue category ($0.84M) followed by Furniture ($0.74M) and Office Supplies ($0.72M).',
    problemStatement:
      'Retail leadership needed a unified executive dashboard across 38K orders to track multi-year sales momentum, compare category revenue contributions, isolate top-performing SKUs, and visualize geographic city distribution.',
    objective:
      'Build an interactive Power BI Sales Performance Dashboard with Region, Order Date, and Category slicers, custom DAX KPI cards, time-series trend lines, category bar charts, Top-10 product rankings, and city-level geospatial mapping.',
    dataset:
      'Superstore Retail Dataset covering 38K orders, $2.30M in total sales, and $286.40K in total profit (2015–2017).',
    technologies: [
      'Power BI',
      'DAX',
      'Power Query',
      'Data Modeling',
      'Interactive Slicers',
      'Geospatial Mapping',
    ],
    methods: [
      'Executive KPI Aggregation ($2.30M Sales, 38K Orders, $286.40K Profit)',
      'Multi-Year Sales Trend Analysis (2015–2017)',
      'Category Revenue Comparison ($0.84M, $0.74M, $0.72M)',
      'Top-10 Pareto SKU Ranking & City-Level Mapping',
    ],
    outcomes: [
      'Quantified $2.30M in Total Sales, 38K Total Orders, and $286.40K in Total Profit.',
      'Demonstrated that Technology leads revenue at $0.84M, closely followed by Furniture ($0.74M) and Office Supplies ($0.72M).',
      'Isolated the Canon imageCLASS 2200 Advanced Copier ($62K) as the #1 revenue-generating product and mapped city-level sales concentration across the United States.',
    ],
    displayedMetrics: [
      {
        label: 'Total Sales',
        value: '$2.30M',
        detail: 'Cumulative Superstore revenue',
      },
      {
        label: 'Total Orders',
        value: '38K',
        detail: 'Order volume across all regions',
      },
      {
        label: 'Total Profit',
        value: '$286.40K',
        detail: '~12.45% overall profit margin',
      },
      {
        label: 'Top Category',
        value: '$0.84M Tech',
        detail: 'Furniture $0.74M · Office Supplies $0.72M',
      },
    ],
    screenshots: [
      {
        id: 'sales-performance-main',
        url: '/assets/projects/sales-performance/sales-performance-dashboard.png',
        title: 'Sales Performance Dashboard (Power BI)',
        caption:
          'Power BI Sales Performance Dashboard displaying Total Sales ($2.30M), Total Orders (38K), Total Profit ($286.40K), interactive Region/Order Date/Category filters, Sales Trend (2015–2017), Sales by Category (Technology $0.84M, Furniture $0.74M, Office Supplies $0.72M), Top 10 Products led by Canon imageCLASS 2200 ($62K), and Sum of Sales by City map.',
        width: 1378,
        height: 777,
        aspectRatio: 1378 / 777,
      },
    ],
    caseStudySections: [
      {
        heading: '1. Project Overview',
        content:
          'The Sales Performance Dashboard is an executive Business Intelligence solution built in Power BI during the Future Interns Data Science & Analytics internship (FUTURE_DS_01). It consolidates transactional retail data into a single interactive view for revenue, order volume, and profitability monitoring.',
      },
      {
        heading: '2. Business Objective',
        content:
          'Enable business stakeholders to evaluate overall commercial health at a glance, filter performance dynamically by Region, Order Date, and Category, and identify which product categories, individual SKUs, and geographic markets drive revenue growth.',
      },
      {
        heading: '3. Data Analysis Approach',
        content:
          'Raw Superstore order records were ingested and cleaned using Power Query, standardizing order dates, geographic city fields, and product hierarchies. Custom DAX measures were authored to compute Total Sales, Total Orders, Total Profit, and category/product rankings responsive to cross-filtering.',
      },
      {
        heading: '4. Sales and Profit KPI Analysis',
        content:
          'The dashboard surfaces three primary headline KPIs across the dataset: Total Sales of $2.30M, Total Orders of 38K, and Total Profit of $286.40K. The multi-year Sales Trend line (2015–2017) reveals seasonal Q4 peaks alongside a steady upward trajectory in annual revenue.',
      },
      {
        heading: '5. Category-Wise Sales Analysis',
        content:
          'Revenue is well-balanced across the three core departments, with Technology leading as the #1 category at $0.84M (36.5% of sales), followed by Furniture at $0.74M (32.2%) and Office Supplies at $0.72M (31.3%).',
      },
      {
        heading: '6. Regional and Geographical Analysis',
        content:
          'The Sum of Sales by City geospatial map highlights strong demand clusters across major metropolitan hubs on the US West Coast, Northeast corridor, and Midwest, paired with a dedicated REGION slicer for territorial drill-downs.',
      },
      {
        heading: '7. Product Performance Analysis',
        content:
          'The Top 10 Products pareto visual isolates high-ticket hardware and commercial office equipment as primary revenue drivers, led by the Canon imageCLASS 2200 Advanced Copier ($62K), Fellowes PB500 Electric Punch ($27K), Cisco TelePresence System EX90 ($23K), HON 5400 Series Task Chairs ($22K), and GBC DocuBind TL300 ($20K).',
      },
      {
        heading: '8. Technologies Used',
        content:
          'Microsoft Power BI Desktop, DAX (Data Analysis Expressions), Power Query (ETL & schema transformation), and Bing Geospatial Map Visuals.',
      },
      {
        heading: '9. Key Findings',
        content:
          'Technology hardware drives the highest top-line contribution ($0.84M) and dominates the Top-10 SKU leaderboard (Canon imageCLASS at $62K alone), while consistent year-over-year expansion from 2015 through 2017 confirms strong repeat commercial demand.',
      },
    ],
    githubUrl: 'https://github.com/anirudh-kn/FUTURE_DS_01',
    githubLabel: 'View FUTURE_DS_01 Repository',
    liveDemoUrl: null,
    highlightMetric: {
      value: '$2.30M Sales · $286.40K Profit',
      label: '38K Orders · Technology Top Category ($0.84M)',
    },
  },
  {
    id: 'churn-analysis',
    accession: 'ACC. 2026.03 · RETENTION COHORT',
    title: 'Customer Retention & Churn Analysis',
    fullTitle:
      'Customer Churn Analysis Dashboard — Retention & Attrition Insights',
    shortTitle: 'Customer Retention & Churn',
    date: 'Apr 2026',
    category: 'bi',
    categoryLabel: 'Customer Analytics & Retention Modeling',
    medium:
      '3D Customer Network Attrition Sculpture & Framed Power BI Exhibition · Power BI & DAX',
    pigmentColor: '#B9A078',
    sculptureType: 'rings',
    localPosition: [1.85, -0.1, -0.15],
    zoomCameraPos: [1.85, 1.55, -53.0],
    zoomCameraTarget: [1.85, 1.25, -62.15],
    shortDescription:
      'Diagnosed a 26.54% customer churn rate (73.46% retained) in Power BI across contract types, monthly charge tiers, and tenure cohorts, proving that month-to-month contracts, early tenure, and higher monthly charges drive attrition.',
    problemStatement:
      'Elevated subscriber churn (26.54%) erodes recurring revenue, requiring clear empirical visibility into how contract structure, monthly billing levels, and customer tenure influence cancellation behavior.',
    objective:
      'Design a focused Customer Churn Analysis Dashboard in Power BI that segments churned vs. retained customers across Contract Type, Monthly Charges, and Tenure Group to guide targeted retention programs.',
    dataset:
      'Telecom Customer Retention Dataset (customerID, Contract Type, MonthlyCharges Group, Tenure Group 0–80, Churn Yes/No).',
    technologies: [
      'Power BI',
      'DAX',
      'Power Query',
      'Cohort Grouping',
      'Retention Analytics',
    ],
    methods: [
      'Churn Rate & Distribution Modeling (26.54% Yes vs. 73.46% No)',
      'Contract-Type Attrition Comparison (Month-to-month, Two year, One year)',
      'Monthly Charges Binning & Sensitivity Analysis',
      'Customer Lifecycle Tenure Cohort Grouping (0 to 80 months)',
    ],
    outcomes: [
      'Quantified an overall 26.54% Churn Rate (73.46% retention rate) across the subscriber base.',
      'Proved that Month-to-month contracts account for the overwhelming majority of customer churn compared to One-year and Two-year contracts.',
      'Demonstrated that higher monthly charges (70–100+ group) and early onboarding tenure (Tenure Group 0) carry the highest attrition risk.',
    ],
    displayedMetrics: [
      {
        label: 'Churn Rate',
        value: '26.54%',
        detail: 'Churned subscriber proportion',
      },
      {
        label: 'Retention Rate',
        value: '73.46%',
        detail: 'Retained active subscriber base',
      },
      {
        label: 'Primary Risk Factor',
        value: 'Month-to-Month',
        detail: 'Highest churn vs. 1-yr & 2-yr contracts',
      },
      {
        label: 'Pricing & Tenure',
        value: 'Early Tenure / High Fee',
        detail: 'Tenure Group 0 & higher monthly charges',
      },
    ],
    screenshots: [
      {
        id: 'customer-churn-main',
        url: '/assets/projects/customer-churn/customer-churn-analysis-dashboard.png',
        title: 'Customer Churn Analysis Dashboard (Power BI)',
        caption:
          'Power BI Customer Churn Analysis Dashboard showcasing the 26.54% Churn Rate KPI card, Churn Distribution pie chart (73.46% No, 26.54% Yes), Churn by Contract Type (Month-to-month vs. Two year and One year), Churn by Monthly Charges, and Churn by Tenure (Tenure Group 0–80).',
        width: 1377,
        height: 775,
        aspectRatio: 1377 / 775,
      },
    ],
    caseStudySections: [
      {
        heading: '1. Business Problem',
        content:
          'In subscription-based telecommunications services, acquiring a new customer costs significantly more than retaining an existing one. With more than a quarter of customers leaving, leadership needed to pinpoint exactly which segments were cancelling and why.',
      },
      {
        heading: '2. Objective',
        content:
          'Develop an intuitive Power BI Customer Churn Analysis Dashboard (FUTURE_DS_02) that quantifies overall churn and isolates the behavioral and contractual drivers across contract duration, billing tiers, and customer tenure.',
      },
      {
        heading: '3. Customer Churn Analysis',
        content:
          'Across the analyzed subscriber base, the overall Churn Rate stands at 26.54%, while 73.46% of customers remain active. Rather than being uniformly distributed, churn is heavily concentrated in specific contract and lifecycle cohorts.',
      },
      {
        heading: '4. Contract-Type Analysis',
        content:
          'The "Churn by Contract Type" visual reveals the starkest divide in the dataset: customers on Month-to-month contracts experience massive attrition (nearly 1,700 churned accounts vs. ~2,200 retained), whereas One-year and Two-year contracts exhibit minimal churn.',
      },
      {
        heading: '5. Monthly-Charge Analysis',
        content:
          'The "Churn by Monthly Charges" grouped bar chart confirms that higher monthly charges directly correlate with higher churn. Subscribers in the lowest billing bracket ($0–$25) rarely cancel, whereas churn rises sharply across the $70–$100+ monthly charge groups.',
      },
      {
        heading: '6. Tenure Analysis',
        content:
          'The "Churn by Tenure" distribution (Tenure Group 0 to 80 months) demonstrates that attrition is most acute in Tenure Group 0 (new subscribers in their initial months, where churned accounts nearly equal retained accounts) and steadily declines as tenure matures toward 60–80 months.',
      },
      {
        heading: '7. Churn Distribution',
        content:
          'The Churn Distribution donut/pie visual provides an immediate executive benchmark: 26.54% (Yes — Red) versus 73.46% (No — Blue), anchoring all cohort comparisons on the canvas.',
      },
      {
        heading: '8. Analytical Insights',
        content:
          'Subscribers are most vulnerable to cancellation when three conditions overlap: (1) unconstrained Month-to-month billing, (2) high monthly recurring charges, and (3) the first 0–10 months of onboarding before long-term product stickiness is established.',
      },
      {
        heading: '9. Technologies Used',
        content:
          'Microsoft Power BI, DAX calculated measures, Power Query data cleaning, and custom tenure/charge binning.',
      },
      {
        heading: '10. Conclusion',
        content:
          'To reduce the 26.54% churn rate, the business should incentivize Month-to-month customers to migrate to 1-year or 2-year plans via bundled discounts, strengthen first-90-day onboarding support for Tenure Group 0, and introduce loyalty value-adds for high-monthly-charge tiers.',
      },
    ],
    githubUrl: 'https://github.com/anirudh-kn/FUTURE_DS_02',
    githubLabel: 'View FUTURE_DS_02 Repository',
    liveDemoUrl: null,
    highlightMetric: {
      value: '26.54% Churn · 73.46% Retained',
      label: 'Contract, Monthly Charge & Tenure Diagnosis',
    },
  },
  {
    id: 'marketing-funnel',
    accession: 'ACC. 2026.04 · FUNNEL VELOCITY',
    title: 'Marketing Funnel & Conversion Analysis',
    fullTitle:
      'Customer Conversion Funnel Dashboard — Marketing Funnel Performance & Insights',
    shortTitle: 'Marketing Funnel & Conversion',
    date: 'May 2026',
    category: 'bi',
    categoryLabel: 'Growth & Acquisition Analytics',
    medium:
      '3D Translucent Conversion Funnel Sculpture & Framed Power BI Exhibition · Power BI & DAX',
    pigmentColor: '#659B93',
    sculptureType: 'funnel',
    localPosition: [4.95, -0.1, 0.55],
    zoomCameraPos: [4.95, 1.55, -52.8],
    zoomCameraTarget: [4.95, 1.25, -61.45],
    shortDescription:
      'Mapped a 4-stage customer conversion funnel across 36K Visitors, 15K Leads, 6K Prospects, and 2K Customers (5.42% overall conversion rate) across Paid Ads, Social Media, Email, and Organic Search.',
    problemStatement:
      'Marketing teams lacked stage-by-stage visibility into how 36K top-of-funnel visitors progressed through lead qualification and prospect nurturing across acquisition channels.',
    objective:
      'Construct an interactive Customer Conversion Funnel Dashboard in Power BI (FUTURE_DS_03) with channel filtering, stage volume KPIs, channel-wise conversion comparison, and actionable growth recommendations.',
    dataset:
      'Marketing Conversion Funnel Dataset tracking 36K Visitors, 15K Leads, 6K Prospects, and 2K Customers across Paid Ads, Social Media, Email, and Organic Search.',
    technologies: [
      'Power BI',
      'DAX',
      'Funnel Modeling',
      'Channel Attribution Slicers',
      'Power Query',
    ],
    methods: [
      '4-Stage Funnel Progression Modeling (36K → 15K → 6K → 2K)',
      'Stage-to-Stage Drop-off Diagnosis',
      'Channel-Wise Conversion Benchmarking (Paid Ads, Social Media, Email, Organic Search)',
    ],
    outcomes: [
      'Tracked 36K Total Visitors converting into 15K Total Leads, 6K Prospects, and 2K Total Customers (5.42% overall conversion rate).',
      'Identified the Leads (15K) to Prospects (6K) transition as the steepest mid-funnel drop-off, signaling weak lead engagement.',
      'Compared Paid Ads, Social Media, Email, and Organic Search to recommend targeted lead nurturing, landing page optimization, and retargeting.',
    ],
    displayedMetrics: [
      {
        label: 'Total Visitors',
        value: '36K',
        detail: '100% top-of-funnel traffic',
      },
      {
        label: 'Total Leads',
        value: '15K',
        detail: '6K qualified prospects in mid-funnel',
      },
      {
        label: 'Total Customers',
        value: '2K',
        detail: 'Closed customer acquisitions',
      },
      {
        label: 'Conversion Rate',
        value: '5.42%',
        detail: 'Visitors-to-Customers (~5.4% funnel)',
      },
    ],
    screenshots: [
      {
        id: 'marketing-funnel-main',
        url: '/assets/projects/marketing-funnel/marketing-conversion-funnel-dashboard.png',
        title: 'Customer Conversion Funnel Dashboard (Power BI)',
        caption:
          'Power BI Customer Conversion Funnel Dashboard showing KPI cards for Total Visitors (36K), Total Leads (15K), Total Customers (2K), and Conversion Rate (5.42%), Select Channel slicer, Channel-wise Conversion Performance (Paid Ads, Social Media, Email, Organic Search), 4-stage Customer Conversion Funnel (36K Visitors -> 15K Leads -> 6K Prospects -> 2K Customers), and strategic Insights & Recommendations.',
        width: 1379,
        height: 776,
        aspectRatio: 1379 / 776,
      },
    ],
    caseStudySections: [
      {
        heading: '1. Business Objective',
        content:
          'Measure end-to-end marketing acquisition efficiency from initial website visit to closed customer purchase, and identify which funnel stage and marketing channels offer the highest leverage for conversion improvement.',
      },
      {
        heading: '2. Funnel Analysis',
        content:
          'The 4-stage Customer Conversion Funnel tracks 36K Total Visitors (100%) entering the top of the funnel, narrowing to 15K Leads (41.7% of visitors), 6K Prospects (40.0% of leads), and 2K Customers (~5.4% / 5.42% overall conversion rate).',
      },
      {
        heading: '3. Channel-Wise Conversion',
        content:
          'The "Channel-wise Conversion Performance" clustered bar chart evaluates Leads, Prospects, and Customers across four acquisition channels: Paid Ads, Social Media, Email, and Organic Search, paired with an interactive "Select Channel" slicer.',
      },
      {
        heading: '4. Lead Progression',
        content:
          'While 36K visitors successfully generate 15K initial leads, the transition from Leads (15K) to Prospects (6K) represents the steepest drop-off in the pipeline—losing 9,000 leads before qualification and indicating weak mid-funnel engagement.',
      },
      {
        heading: '5. Customer Acquisition',
        content:
          'Paid Ads generate the highest top-of-funnel lead volume (~5K+ leads) and customer count, followed by Social Media, Email, and Organic Search. However, Organic Search and Email exhibit steadier lead-to-prospect retention ratios.',
      },
      {
        heading: '6. Conversion-Rate Analysis',
        content:
          'The headline Conversion Rate of 5.42% (2K Customers from 36K Visitors) highlights significant room for both top-of-funnel landing page optimization and final-stage prospect closing (where 6K Prospects narrow to 2K Customers).',
      },
      {
        heading: '7. Business Insights',
        content:
          'Key dashboard insights: (1) Highest drop occurs from Leads to Prospects, indicating weak engagement; (2) Overall conversion rate is ~5.42%, suggesting improvement opportunity; (3) Paid Ads generate highest traffic but moderate conversion efficiency; (4) Organic Search shows better quality leads with relatively stable conversion; (5) Funnel significantly narrows at the final stage, requiring a stronger closing strategy.',
      },
      {
        heading: '8. Recommendations',
        content:
          'Actionable recommendations surfaced on the dashboard: (1) Improve lead nurturing strategies via automated email campaigns and follow-ups; (2) Optimize landing pages to reduce initial visitor drop-off; (3) Focus budget on high-converting channels like Organic Search and Email; (4) Implement retargeting strategies for mid-funnel prospects; (5) Enhance customer conversion closing strategies with targeted offers and personalization.',
      },
      {
        heading: '9. Technologies Used',
        content:
          'Microsoft Power BI Desktop, DAX calculated conversion measures, Power Query, and multi-channel funnel visualizations.',
      },
    ],
    githubUrl: 'https://github.com/anirudh-kn/FUTURE_DS_03',
    githubLabel: 'View FUTURE_DS_03 Repository',
    liveDemoUrl: null,
    highlightMetric: {
      value: '5.42% Conversion · 36K Visitors',
      label: '36K Visitors → 15K Leads → 6K Prospects → 2K Customers',
    },
  },
];

export const EXPERIENCE_CATEGORY_COLORS: Record<TimelineEntry['type'], string> = {
  internship: '#C7745C',
  education: '#659B93',
  forage: '#6B84C4',
  certification: '#B9A078',
} as const;

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'exp-future-interns',
    type: 'internship',
    roleOrTitle: 'Data Science and Analytics Intern',
    organization: 'Future Interns',
    location: 'Remote',
    period: 'Apr 2026 – May 2026',
    pigmentColor: '#C7745C',
    highlights: [
      'Automated Python and Power BI reporting to track KPIs and flag anomalies, reducing manual effort by ~30%.',
      'Delivered sales ($2.30M / 38K orders / $286.40K profit), customer churn (26.54%), and marketing funnel (36K visitors / 5.42% conversion) analyses as stakeholder-ready reports with clear recommendations.',
    ],
    credentialUrl: 'https://github.com/anirudh-kn/FUTURE_DS_01',
    credentialLabel: 'View Internship Project Repositories',
  },
  {
    id: 'exp-zetheta',
    type: 'internship',
    roleOrTitle: 'Risk Dashboard Developer Intern',
    organization: 'Zetheta Algorithms Private Limited',
    location: 'Virtual',
    period: 'Feb 2026 – Apr 2026',
    pigmentColor: '#C7745C',
    highlights: [
      'Designed real-time financial risk dashboards with live KPI monitoring, applying statistical analysis to large datasets.',
      'Documented trend summaries for senior stakeholders to support risk-related decisions.',
    ],
  },
  {
    id: 'exp-quest',
    type: 'internship',
    roleOrTitle: 'Data Analyst Intern',
    organization: 'Quest Innovative Solutions',
    location: 'Kochi, India',
    period: 'Jan 2026 – Feb 2026',
    pigmentColor: '#C7745C',
    highlights: [
      'Built interactive Power BI dashboards using DAX and Power Query to support business planning.',
      'Cleaned and restructured multi-source datasets into analysis-ready models for reporting.',
    ],
  },
  {
    id: 'edu-bca',
    type: 'education',
    roleOrTitle: 'Bachelor of Computer Applications (BCA)',
    organization:
      'East Point College of Higher Education, Bengaluru North University',
    location: 'Bengaluru, India',
    period: 'Aug 2022 – Aug 2025',
    pigmentColor: '#659B93',
    highlights: [
      'Graduated with CGPA: 8.5 / 10.0.',
      'Focused on Python programming, relational databases (SQL), statistical analysis, machine learning pipelines, and business intelligence.',
    ],
  },
  {
    id: 'forage-deloitte',
    type: 'forage',
    roleOrTitle: 'Data Analytics Virtual Experience Program',
    organization: 'Deloitte Australia (Forage)',
    location: 'Virtual Simulation',
    period: 'Jan 2026 – Feb 2026',
    pigmentColor: '#6B84C4',
    highlights: [
      'Completed practical data analysis, visualization, and classification tasks using Tableau and Excel.',
    ],
    credentialUrl:
      'https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/io9DzWKe3PTsiS6GG_9PBTqmSxAf6zZTseP_696526dcadc800fbf214db55_1768241082307_completion_certificate.pdf',
    credentialLabel: 'Verified Certificate (PDF)',
  },
  {
    id: 'forage-jpmorgan',
    type: 'forage',
    roleOrTitle: 'Quantitative Research Virtual Experience Program',
    organization: 'JPMorgan Chase (Forage)',
    location: 'Virtual Simulation',
    period: 'Jan 2026 – Feb 2026',
    pigmentColor: '#6B84C4',
    highlights: [
      'Developed commodity pricing analysis and quantitative credit/financial risk models.',
    ],
    credentialUrl:
      'https://www.theforage.com/completion-certificates/Sj7temL583QAYpHXD/bWqaecPDbYAwSDqJy_Sj7temL583QAYpHXD_696526dcadc800fbf214db55_1769944962988_completion_certificate.pdf',
    credentialLabel: 'Verified Certificate (PDF)',
  },
  {
    id: 'forage-tata',
    type: 'forage',
    roleOrTitle: 'Gen AI Data Analytics Virtual Experience Program',
    organization: 'Tata Group (Forage)',
    location: 'Virtual Simulation',
    period: 'Jan 2026 – Feb 2026',
    pigmentColor: '#6B84C4',
    highlights: [
      'Executed exploratory data analysis (EDA) and AI-assisted delinquency-risk prediction modeling.',
    ],
    credentialUrl:
      'https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_696526dcadc800fbf214db55_1768331196284_completion_certificate.pdf',
    credentialLabel: 'Verified Certificate (PDF)',
  },
  {
    id: 'forage-aws',
    type: 'forage',
    roleOrTitle: 'Solutions Architecture Virtual Experience Program',
    organization: 'AWS (Forage)',
    location: 'Virtual Simulation',
    period: 'Jan 2026 – Feb 2026',
    pigmentColor: '#6B84C4',
    highlights: [
      'Designed scalable, cloud-hosted infrastructure architectures aligned with modern reliability practices.',
    ],
    credentialUrl:
      'https://www.theforage.com/completion-certificates/pmnMSL4QiQ9JCgE3W/kkE9HyeNcw6rwCRGw_pmnMSL4QiQ9JCgE3W_696526dcadc800fbf214db55_1768389300268_completion_certificate.pdf',
    credentialLabel: 'Verified Certificate (PDF)',
  },
  {
    id: 'cert-google-analytics',
    type: 'certification',
    roleOrTitle: 'Google Analytics Certified',
    organization: 'Google',
    location: 'Credential Verification',
    period: 'Feb 2026',
    pigmentColor: '#B9A078',
    highlights: [
      'Verified proficiency in digital analytics, conversion tracking, and behavioral funnel reporting.',
    ],
    credentialUrl:
      'https://skillshop.credential.net/333dacf0-fc57-457b-9697-fb57ef684526',
    credentialLabel: 'Verify Skillshop Credential',
  },
  {
    id: 'cert-nvidia',
    type: 'certification',
    roleOrTitle: 'AI Infrastructure & Operations Fundamentals',
    organization: 'NVIDIA',
    location: 'Coursera Credential',
    period: 'Feb 2026',
    pigmentColor: '#B9A078',
    highlights: [
      'Foundational mastery of GPU compute architectures, AI deployment pipelines, and cluster operations.',
    ],
    credentialUrl:
      'https://www.coursera.org/account/accomplishments/records/1K20427ED8TA',
    credentialLabel: 'Verify Coursera Record',
  },
  {
    id: 'cert-google-cloud',
    type: 'certification',
    roleOrTitle: 'Introduction to Generative AI',
    organization: 'Google Cloud',
    location: 'Credential Verification',
    period: 'Jan 2026',
    pigmentColor: '#B9A078',
    highlights: [
      'Core principles of large language models, generative architectures, and responsible enterprise AI.',
    ],
    credentialUrl: 'https://simpli.app.link/Ht8h11kLs0b',
    credentialLabel: 'Verify Google Cloud Certificate',
  },
  {
    id: 'cert-ibm',
    type: 'certification',
    roleOrTitle: 'Artificial Intelligence Fundamentals',
    organization: 'IBM SkillsBuild',
    location: 'Credly Badge',
    period: 'Mar 2025',
    pigmentColor: '#B9A078',
    highlights: [
      'Verified badge covering machine learning paradigms, neural networks, ethics, and AI problem formulation.',
    ],
    credentialUrl:
      'https://www.credly.com/badges/3b37ef9e-95a5-4970-a890-f08eda8f144b',
    credentialLabel: 'Verify Credly Badge',
  },
];

export interface GalleryWallArtwork {
  id:
    | 'home-pencil-portrait'
    | 'home-landscape-painting'
    | 'skills-misty-meadow'
    | 'skills-golden-reflection'
    | 'experience-pencil-portrait-2021'
    | 'experience-pencil-portrait-2022'
    | 'contact-golden-lake-sunset'
    | 'contact-blue-mountain-meadow';
  wallSide: 'left' | 'right';
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export type HomeGalleryArtwork = GalleryWallArtwork;

export const HOME_GALLERY_ARTWORKS: {
  left: GalleryWallArtwork;
  right: GalleryWallArtwork;
} = {
  left: {
    id: 'home-landscape-painting',
    wallSide: 'left',
    url: '/assets/artworks/home-landscape-painting.jpg',
    width: 1536,
    height: 1166,
    aspectRatio: 1536 / 1166,
  },
  right: {
    id: 'home-pencil-portrait',
    wallSide: 'right',
    url: '/assets/artworks/home-pencil-portrait.jpg',
    width: 1536,
    height: 2048,
    aspectRatio: 1536 / 2048,
  },
};

export const SKILLS_GALLERY_ARTWORKS: {
  left: GalleryWallArtwork;
  right: GalleryWallArtwork;
} = {
  left: {
    id: 'skills-misty-meadow',
    wallSide: 'left',
    url: '/assets/artworks/skills-misty-meadow.jpg',
    width: 1536,
    height: 1165,
    aspectRatio: 1536 / 1165,
  },
  right: {
    id: 'skills-golden-reflection',
    wallSide: 'right',
    url: '/assets/artworks/skills-golden-reflection.jpg',
    width: 1536,
    height: 1131,
    aspectRatio: 1536 / 1131,
  },
};

export const EXPERIENCE_GALLERY_ARTWORKS: {
  left: GalleryWallArtwork;
  right: GalleryWallArtwork;
} = {
  left: {
    id: 'experience-pencil-portrait-2021',
    wallSide: 'left',
    url: '/assets/artworks/experience-pencil-portrait-2021.jpg',
    width: 1536,
    height: 2048,
    aspectRatio: 1536 / 2048,
  },
  right: {
    id: 'experience-pencil-portrait-2022',
    wallSide: 'right',
    url: '/assets/artworks/experience-pencil-portrait-2022.jpg',
    width: 1535,
    height: 2047,
    aspectRatio: 1535 / 2047,
  },
};

export const CONTACT_GALLERY_ARTWORKS: {
  left: GalleryWallArtwork;
  right: GalleryWallArtwork;
} = {
  left: {
    id: 'contact-golden-lake-sunset',
    wallSide: 'left',
    url: '/assets/artworks/contact-golden-lake-sunset.jpg',
    width: 1536,
    height: 1149,
    aspectRatio: 1536 / 1149,
  },
  right: {
    id: 'contact-blue-mountain-meadow',
    wallSide: 'right',
    url: '/assets/artworks/contact-blue-mountain-meadow.jpg',
    width: 1536,
    height: 1190,
    aspectRatio: 1536 / 1190,
  },
};



