/**
 * Clean role taxonomy for the apply/claim wizard (93 roles, 14 categories).
 *
 * Source: Moblyze "Roles Reference" Google Sheet (gid=1952473549).
 * These are user-friendly role labels shown in the web flow.
 * Each clean role maps to one or more raw app roles (500+) via the
 * rawRoleNames field.
 *
 * In demo mode, the wizard displays these directly.
 * In production mode, the wizard also displays these (not the raw 500+
 * API roles), then expands selections to raw role IDs before saving
 * via expandCleanToRawIds().
 */

export interface TaxonomyRole {
  id: string;
  name: string;
  category: string;
  /** Raw app role names this clean role maps to (for frontend expansion) */
  rawRoleNames: string[];
}

export interface TaxonomyCategory {
  name: string;
  roles: TaxonomyRole[];
}

const ROLES: TaxonomyRole[] = [
  // — Drilling & Well Services (25 roles) —
  { id: 'rov-supervisor', name: 'ROV Supervisor', category: 'Drilling & Well Services', rawRoleNames: ['ROV Shift Supervisor', 'ROV Superintendent', 'ROV Supervisor'] },
  { id: 'rov-pilot-technician', name: 'ROV Pilot/Technician', category: 'Drilling & Well Services', rawRoleNames: ['Chief Remote Pilot', 'ROV Pilot Tech I', 'ROV Pilot Tech II', 'ROV Pilot Tech III (Trainee)', 'ROV Pilot Technician', 'ROV Senior Pilot Tech', 'ROV Tooling Tech I', 'ROV Tooling Tech II', 'Senior ROV Tooling Tech', 'Trenching Pilot Tech', 'Trenching Senior Pilot Tech'] },
  { id: 'subsea-engineer', name: 'Subsea Engineer', category: 'Drilling & Well Services', rawRoleNames: ['Sub Engineer', 'Subsea (BOP) Engineer', 'Subsea Controls Engineer', 'Subsea Engineer', 'Subsea Project Engineer', 'Subsea Technician'] },
  { id: 'saturation-diver', name: 'Saturation Diver', category: 'Drilling & Well Services', rawRoleNames: ['ALST - Assistant Life Support Technician', 'Air / Surface Diver', 'Air Diver', 'Dive Tender', 'Life Support Supervisor (LSS)', 'Life Support Technician', 'SAT Diver'] },
  { id: 'diving-marine', name: 'Diving & Marine', category: 'Drilling & Well Services', rawRoleNames: ['2nd Officer', 'Able Seaman', 'Air Diving Supervisor', 'Bosun (Boatswain)', 'Chief Officer', 'Deck Crew', 'Deck Foreman', 'Deck Supervisor', 'Dive Supervisor', 'Diving Superintendent', 'Marine Advisor', 'Marine Client Representative', 'Marine Representative', 'Marine Superintendent', 'Marine Technical Advisor', 'Marine Vetting Team Lead', 'Marine Warranty Surveyor', 'Marine Warranty Surveyor (MWS)', 'Mariner', 'Master Mariner', 'Mooring Master', 'OIM', 'Offshore Installation Manager', 'Oiler / Wiper', 'Port Captain', 'Senior Marine Superintendent', 'Towmaster', 'Trainee Marine Superintendent', 'Vessel Auditor', 'Vessel Inspector', 'Vessel Superintendent'] },
  { id: 'dp-operator', name: 'DP Operator', category: 'Drilling & Well Services', rawRoleNames: ['DP Representative', 'DPO (Dynamic Positioning Officer)', 'Junior DPO (Dynamic Positioning Officer)', 'SDPO (Senior Dynamic Positioning Officer)'] },
  { id: 'chief-engineer-marine', name: 'Chief Engineer (Marine)', category: 'Drilling & Well Services', rawRoleNames: ['Chief Engineer'] },
  { id: 'offshore-operations', name: 'Offshore Operations', category: 'Drilling & Well Services', rawRoleNames: ['Offshore Clerk', 'Offshore Construction Manager', 'Offshore Engineer', 'Offshore Manager', 'Offshore Technician'] },
  { id: 'ei-technician', name: 'E&I Technician', category: 'Drilling & Well Services', rawRoleNames: ['C&I (Control & Instrumentation) Designer', 'C&I (Control & Instrumentation) Engineer', 'E & I Project Manager', 'Electrical Dive Technician', 'Electro-Technical Officer (ETO)', 'I&C (Instrumentation & Control) Engineer', 'Instrument Engineer', 'Instrument Technician I', 'Instrument Technician III', 'Superintendent - E & I', 'Work Pack Engineer (E&I)'] },
  { id: 'drilling-operations', name: 'Drilling Operations', category: 'Drilling & Well Services', rawRoleNames: ['Brakeman', 'Derrickhand', 'Derrickman', 'Drilling Fluids Specialist', 'Drilling Superintendent', 'Drilling Supervisor', 'Floorhand', 'Motorman', 'Rig Mover', 'Roughneck', 'Toolpusher'] },
  { id: 'driller-rig-crew', name: 'Driller & Rig Crew', category: 'Drilling & Well Services', rawRoleNames: ['Driller', 'Roustabout'] },
  { id: 'assistant-driller', name: 'Assistant Driller', category: 'Drilling & Well Services', rawRoleNames: ['Assistant Driller'] },
  { id: 'directional-drilling', name: 'Directional Drilling', category: 'Drilling & Well Services', rawRoleNames: ['Directional Driller'] },
  { id: 'drilling-engineer', name: 'Drilling Engineer', category: 'Drilling & Well Services', rawRoleNames: ['Drilling/Wells Engineer'] },
  { id: 'mud-engineer', name: 'Mud Engineer/Specialist', category: 'Drilling & Well Services', rawRoleNames: ['MUD Engineer'] },
  { id: 'mwd-lwd', name: 'MWD/LWD Specialist', category: 'Drilling & Well Services', rawRoleNames: ['LWD Technician', 'MWD Technician'] },
  { id: 'wireline-operator', name: 'Wireline Operator/Engineer', category: 'Drilling & Well Services', rawRoleNames: ['Engineer', 'Wireline -  Slickline Operator'] },
  { id: 'slickline', name: 'Slickline Operator', category: 'Drilling & Well Services', rawRoleNames: [] },
  { id: 'coiled-tubing', name: 'Coiled Tubing Operator', category: 'Drilling & Well Services', rawRoleNames: ['Coiled Tubing Operator'] },
  { id: 'cementing-services', name: 'Cementing Services', category: 'Drilling & Well Services', rawRoleNames: ['Cementing Supervisor'] },
  { id: 'well-testing', name: 'Well Testing', category: 'Drilling & Well Services', rawRoleNames: ['Testing Engineer', 'Well Test Operator'] },
  { id: 'fracturing-stimulation', name: 'Fracturing & Stimulation', category: 'Drilling & Well Services', rawRoleNames: [] },
  { id: 'completions', name: 'Completions Specialist', category: 'Drilling & Well Services', rawRoleNames: ['Completions Engineer'] },
  { id: 'workover-intervention', name: 'Workover & Well Intervention', category: 'Drilling & Well Services', rawRoleNames: ['Fishing Tool Supervisor', 'Plug & Abandonment (P&A) Engineer'] },
  { id: 'artificial-lift', name: 'Artificial Lift Specialist', category: 'Drilling & Well Services', rawRoleNames: [] },

  // — Production & Field Operations (10 roles) —
  { id: 'production-operator', name: 'Production Operator', category: 'Production & Field Operations', rawRoleNames: ['Oil & Gas Production Operator', 'Production Operator'] },
  { id: 'production-engineer', name: 'Production Engineer', category: 'Production & Field Operations', rawRoleNames: ['Production Engineer'] },
  { id: 'process-operator', name: 'Process Operator', category: 'Production & Field Operations', rawRoleNames: ['Process Engineer', 'Process Operator', 'Process Supervisor'] },
  { id: 'plant-operator', name: 'Plant Operator', category: 'Production & Field Operations', rawRoleNames: ['Fluids Plant Operator'] },
  { id: 'control-room-operator', name: 'Control Room Operator', category: 'Production & Field Operations', rawRoleNames: ['Control Room Operator', 'Solids Control Operator'] },
  { id: 'reactor-operator', name: 'Reactor Operator', category: 'Production & Field Operations', rawRoleNames: [] },
  { id: 'field-engineer', name: 'Field Engineer', category: 'Production & Field Operations', rawRoleNames: ['Field Engineer', 'MPD Engineer'] },
  { id: 'field-specialist', name: 'Field Specialist/Technician', category: 'Production & Field Operations', rawRoleNames: ['CAM Field Specialists', 'Field Inspector', 'Field Service Technician', 'Field Specialist', 'Field Technician I', 'Field Technician II', 'Field Technician III', 'Senior Field Inspector', 'Senior Field Technician', 'Superintendent - Field'] },
  { id: 'service-operator', name: 'Service Operator', category: 'Production & Field Operations', rawRoleNames: ['Service Technician', 'Thermal Services Manager', 'Jetting Operative'] },
  { id: 'crane-operator', name: 'Crane Operator', category: 'Production & Field Operations', rawRoleNames: ['Crane Operator'] },

  // — Reservoir & Geoscience (7 roles) —
  { id: 'reservoir-engineer', name: 'Reservoir Engineer', category: 'Reservoir & Geoscience', rawRoleNames: ['Reservoir Engineer'] },
  { id: 'petroleum-engineer', name: 'Petroleum Engineer', category: 'Reservoir & Geoscience', rawRoleNames: ['Petroleum Engineer'] },
  { id: 'petrophysicist', name: 'Petrophysicist', category: 'Reservoir & Geoscience', rawRoleNames: ['Petrophysicist'] },
  { id: 'geologist', name: 'Geologist', category: 'Reservoir & Geoscience', rawRoleNames: ['Geologist', 'Wellsite Geologist'] },
  { id: 'geophysicist', name: 'Geophysicist', category: 'Reservoir & Geoscience', rawRoleNames: ['Geophysical Surveyor', 'Geophysicist', 'Geophysicist Grade II', 'Geophysicist I', 'Senior Geophysicist'] },
  { id: 'geoscientist', name: 'Geoscientist', category: 'Reservoir & Geoscience', rawRoleNames: ['Biologist', 'Biostratigrapher', 'Environmental Scientist', 'Geoscientist', 'Hydrologist', 'Sedimentologist'] },
  { id: 'geoscientists', name: 'Geoscientists & Earth Scientists', category: 'Reservoir & Geoscience', rawRoleNames: ['Hydrographic Surveyor', 'Scientist', 'Seismic Interpreter'] },

  // — Engineering (3 roles) —
  { id: 'engineering-electrical', name: 'Electrical & Electronics Engineers', category: 'Engineering', rawRoleNames: ['Cable Inspector', 'Cable Mate', 'Cable Tech', 'Cable Technician', 'Electrical AP / SAP (Appointed Person / Senior Appointed Person)', 'Electrical Apprentice I', 'Electrical Apprentice II', 'Electrical Apprentice III', 'Electrical Assembler', 'Electrical Designer', 'Electrical Engineer', 'Electrical Foreman', 'Electrical Inspector', 'Electrical Technician', 'Electricians Mate', 'Electronic Tech', 'Electronics Technician', 'HV Jointer', 'Pipe Lay Electrical Tech'] },
  { id: 'engineering-mechanical', name: 'Mechanical Engineers', category: 'Engineering', rawRoleNames: ['Mechanic', 'Mechanical Analyst', 'Mechanical Assembler', 'Mechanical Completion Surveyor', 'Mechanical Engineer', 'Mechanical Fitter', 'Mechanical Fitter w/Ropes Access', 'Mechanical Inspector', 'Mechanical Specialist', 'Mechanical Technician', 'Wind Technician - Mechanical'] },
  { id: 'engineering-specialized', name: 'Specialized Engineers', category: 'Engineering', rawRoleNames: ['AI Engineer', 'Asset Integrity Engineer', 'Chemical Engineer', 'Civil Engineer', 'Computer Engineer', 'Cost Engineer', 'Design Engineer', 'Environmental Engineer', 'Geotechnical Engineer', 'Inspection Engineer', 'Integrity Engineer', 'Piping Designer', 'Piping Engineer', 'Piping Inspector', 'Project Engineer', 'Software Engineer', 'Structural Engineer', 'Telecoms Engineer'] },

  // — Engineering Technicians (1 role) —
  { id: 'engineering-technicians', name: 'Engineering Technicians', category: 'Engineering Technicians', rawRoleNames: ['CAM Engineering Technologist', 'Commissioning Manager', 'Flowline Pre-Comm Technician', 'Pre-Commissioning Supervisor', 'Pre-Commissioning Tech'] },

  // — Technical Trades (19 roles) —
  { id: 'welder', name: 'Welder', category: 'Technical Trades', rawRoleNames: ['Rigger/Welder', 'Senior Weld Inspector', 'Weld Inspector', 'Welder'] },
  { id: 'pipefitter', name: 'Pipefitter', category: 'Technical Trades', rawRoleNames: ['Bolt Up Fitter', 'Fitter', 'Pipefitter'] },
  { id: 'rigger', name: 'Rigger', category: 'Technical Trades', rawRoleNames: ['Banksman Slinger', 'Lead Rigger', 'Rigger', 'Rigger Level III'] },
  { id: 'scaffolder', name: 'Scaffolder', category: 'Technical Trades', rawRoleNames: ['Scaffold Builder 1', 'Scaffold Builder 3'] },
  { id: 'rig-mechanic', name: 'Rig Mechanic', category: 'Technical Trades', rawRoleNames: [] },
  { id: 'millwright', name: 'Millwright/Industrial Mechanic', category: 'Technical Trades', rawRoleNames: ['Millwright', 'Millwright Apprentice'] },
  { id: 'mechanic-technician', name: 'Mechanic/Technician (General)', category: 'Technical Trades', rawRoleNames: ['CNC Machining', 'CNC Programmer/Operator', 'Craftsman', 'Fabricator', 'Ironworker', 'Machinist', 'Metal Man'] },
  { id: 'electrical-trades', name: 'Electricians & Electrical Repairers', category: 'Technical Trades', rawRoleNames: ['Electrician', 'Electrician w/Ropes Access'] },
  { id: 'electrician-oilfield', name: 'Electrician (Oilfield)', category: 'Technical Trades', rawRoleNames: ['Electrician II', 'Electrician III', 'Lead Electrician'] },
  { id: 'instrumentation-tech', name: 'Instrumentation Technician', category: 'Technical Trades', rawRoleNames: [] },
  { id: 'hydraulic-specialist', name: 'Hydraulic Specialist', category: 'Technical Trades', rawRoleNames: ['Hydraulic Technician'] },
  { id: 'rope-access-technician', name: 'Rope Access Technician', category: 'Technical Trades', rawRoleNames: ['Rope Access Plater', 'Rope Access Supervisor', 'Rope Access Technician', 'Rope Access Wind Technician'] },
  { id: 'maintenance-mechanics', name: 'Maintenance & Mechanics', category: 'Technical Trades', rawRoleNames: ['Maintenance Associate', 'Maintenance Engineer', 'Maintenance Technician'] },
  { id: 'construction-trades', name: 'Construction Trades', category: 'Technical Trades', rawRoleNames: ['Carpenter', 'Construction Coordinator', 'Construction Engineer', 'Fireproofer 1', 'Helper', 'Insulator 1', 'Insulator 3', 'Labourer', 'Labourer II', 'Labourer III', 'Painter', 'Painter/Blaster 1', 'Timekeeper', 'Tool Room Attendent', 'Assistant Superintendent'] },
  { id: 'equipment-operators', name: 'Equipment Operators', category: 'Technical Trades', rawRoleNames: ['Equipment Operator', 'Heavy Equipment Operator', 'Machine Operative', 'Equipment Engineer', 'Equipment Specialist'] },
  { id: 'ndt-inspector', name: 'NDT Inspector', category: 'Technical Trades', rawRoleNames: ['NACE', 'NDT Inspector', 'NDT Inspector w/Ropes Access', 'NDT Technician', 'Plant Inspector', 'Radiographer', '3.4U Inspection Coordinator'] },
  { id: 'pipeline-inspector', name: 'Pipeline Inspector', category: 'Technical Trades', rawRoleNames: ['Pipeline & Umbilical Manager', 'Pipeline Engineer', 'Pipeline Operator', 'Pipeline Specialist', 'Pipeline Supervisor'] },
  { id: 'coating-inspector', name: 'Coating Inspector', category: 'Technical Trades', rawRoleNames: ['Coating Surveyor'] },
  { id: 'structural-inspector', name: 'Structural Inspector', category: 'Technical Trades', rawRoleNames: ['Structural Designer', 'Structural Surveyor'] },

  // — Plant & Process Operations (2 roles) —
  { id: 'plant-operators', name: 'Plant & Process Operators', category: 'Plant & Process Operations', rawRoleNames: ['Bolting Operator', 'Bolting Supervisor', 'Bolting Technician', 'Leak Test Operator', 'Leak Test Supervisor', 'N2 Pump Operator', 'N2 Pump Supervisor', 'Nitrogen Operator', 'Nitrogen Supervisor'] },
  { id: 'production-workers', name: 'Production & Process Workers', category: 'Plant & Process Operations', rawRoleNames: ['Production Chemist', 'Production Supervisor', 'Production Technician', 'Production Technologist'] },

  // — Management (3 roles) —
  { id: 'engineering-management', name: 'Engineering & Technical Management', category: 'Management', rawRoleNames: ['Asset Management Specialist', 'Asset Manager', 'Project Controls Manager', 'Project Controls Specialist I', 'Project Manager', 'Senior Project Manager'] },
  { id: 'operations-management', name: 'Operations & General Management', category: 'Management', rawRoleNames: ['Area Manager', 'Director', 'Foreman', 'General Foreman', 'General Manager', 'Operations Accountant', 'Operations Coordinator', 'Operations Director', 'Operations Manager', 'Personnel Manager', 'Regional Manager', 'Senior Operations Coordinator', 'Site Manager'] },
  { id: 'supply-chain-management', name: 'Supply Chain & Logistics Management', category: 'Management', rawRoleNames: ['Buyer', 'Buyer/Planner', 'Category Manager', 'Contracts Advisor', 'Contracts Manager', 'Logistics Admin Coordinator', 'Procurement Assistant', 'Procurement Coordinator', 'Procurement Specialist', 'Purchaser', 'Shipper/Receiver', 'Shipping & Receiving Coordinator', 'Storekeeper', 'Storeman', 'Supply Chain Administrator'] },

  // — Support Functions (7 roles) —
  { id: 'business-analysts', name: 'Business & Financial Analysts', category: 'Support Functions', rawRoleNames: ['AP Clerk', 'Account Co-ordinator', 'Account Officer', 'Accountant', 'Accounts Receivable Specialist', 'Assistant Accountant', 'Billing Manager', 'Chief Accountant', 'Corporate Controller', 'Credit Analyst', 'Credit Manager', 'Finance Director', 'Finance Manager', 'Financial Accountant', 'Financial Analyst', 'Financial Controller', 'Lead Cost Analyst', 'Management Accountant', 'Payroll Manager', 'Project Accountant', 'Project Analyst', 'Project Costs Analyst', 'Purchase Ledger Clerk', 'Senior Financial Analyst', 'Systems Accountant', 'Treasurer', 'Economist'] },
  { id: 'supply-chain-specialists', name: 'Supply Chain & Logistics Specialists', category: 'Support Functions', rawRoleNames: ['Fleet Administrator', 'Material Handler', 'Warehouse Operator', 'Warehouse Technician', 'Warehouse Worker'] },
  { id: 'hr-admin', name: 'HR & Administrative', category: 'Support Functions', rawRoleNames: ['Administrative Assistant', 'Administrative Clerk', 'Administrative Intern', 'Administrative Professional', 'Administrative Specialist', 'Administrative Supervisor', 'Benefits Manager', 'Document Controller', 'HR Generalist', 'HR Manager', 'HR Recruiter', 'Senior Document Controller', 'VP of Human Resources'] },
  { id: 'compliance-safety', name: 'Compliance, Safety & Quality', category: 'Support Functions', rawRoleNames: ['CSWIP Inspector', 'Environmental Advisor', 'Environmental Specialist', 'QAQC Analyst', 'QAQC Coordinator', 'QAQC Manager', 'QC Inspector', 'Safety Engineer', 'Safety Representative', 'Safety Supervisor', 'Senior Environmental Permitting Specialist', 'Senior Safety Engineer'] },
  { id: 'lab-technician', name: 'Laboratory Technician', category: 'Support Functions', rawRoleNames: ['Laboratory Technician', 'Operations Technician', 'Senior Lab Technician'] },
  { id: 'materials-specialist', name: 'Materials Specialist', category: 'Support Functions', rawRoleNames: ['Materials Coordinator', 'Materials Engineer'] },
  { id: 'hse-specialist', name: 'HSE Specialist', category: 'Support Functions', rawRoleNames: ['HSE Advisor', 'HSE Coordinator', 'HSE Inspector', 'HSE Manager', 'Principal Consultant - HSE', 'QHSE Manager'] },

  // — Digital & IT (7 roles) —
  { id: 'scada-engineer', name: 'SCADA Engineer', category: 'Digital & IT', rawRoleNames: [] },
  { id: 'automation-engineer', name: 'Automation Engineer', category: 'Digital & IT', rawRoleNames: ['Automation Engineer', 'Operations Engineer'] },
  { id: 'plc-technician', name: 'PLC Technician', category: 'Digital & IT', rawRoleNames: [] },
  { id: 'data-analyst-energy', name: 'Data Analyst (Energy)', category: 'Digital & IT', rawRoleNames: ['Data Processor Grade I', 'Data Processor Grade II', 'Energy Analyst', 'Senior Data Processor', 'Survey Data Manager'] },
  { id: 'software-developers', name: 'Software Development', category: 'Digital & IT', rawRoleNames: ['Developer - Database', 'Developer - Software', 'Developer - Web', 'Graphic Designer', 'Software Analyst'] },
  { id: 'it-infrastructure', name: 'IT Infrastructure & Support', category: 'Digital & IT', rawRoleNames: ['IT Analyst', 'IT Manager', 'IT Trainer', 'Network Administrator', 'Network Analyst', 'Network Manager', 'Network Specialist', 'PC Specialist', 'Systems Analyst'] },
  { id: 'data-specialists', name: 'Data & Analytics', category: 'Digital & IT', rawRoleNames: [] },

  // — Sales & Marketing (2 roles) —
  { id: 'sales-engineers', name: 'Technical Sales', category: 'Sales & Marketing', rawRoleNames: ['Account Manager', 'Business Development Director', 'Business Development Manager', 'Business Development Representative', 'Commercial Negotiator', 'Estimating Manager', 'Estimator', 'Sales Engineer', 'Technical Sales Representative'] },
  { id: 'marketing-specialists', name: 'Marketing & Communications', category: 'Sales & Marketing', rawRoleNames: ['Marketing Assistant'] },

  // — Renewable & Energy Transition (5 roles) —
  { id: 'wind-turbine-technician', name: 'Wind Turbine Technician', category: 'Renewable & Energy Transition', rawRoleNames: ['Offshore Wind Project Engineer', 'Offshore Wind Supervisor', 'Offshore Wind Technician', 'Wind Site Supervisor', 'Wind Technician - Electrical', 'Wind Turbine Commissioning Technician', 'Wind Turbine Supervisor'] },
  { id: 'blade-technician', name: 'Blade Technician', category: 'Renewable & Energy Transition', rawRoleNames: ['Blade Repair Technician', 'Blade Team Supervisor', 'Blade Technician'] },
  { id: 'ccs-engineer', name: 'CCS Engineer', category: 'Renewable & Energy Transition', rawRoleNames: ['QA/QC Engineer'] },
  { id: 'hydrogen-engineer', name: 'Hydrogen Engineer', category: 'Renewable & Energy Transition', rawRoleNames: ['Hydrogen Manager'] },
  { id: 'hydrogen-technician', name: 'Hydrogen Technician', category: 'Renewable & Energy Transition', rawRoleNames: [] },

  // — Transportation & Logistics (1 role) —
  { id: 'transportation', name: 'Transportation & Logistics', category: 'Transportation & Logistics', rawRoleNames: ['Driver', 'Fork Lift Driver', 'HGV Driver', 'Lineman Forman', 'Lineman II'] },

  // — Other Roles (1 role) —
  { id: 'other', name: 'Other Roles', category: 'Other Roles', rawRoleNames: ['2nd Cook', 'Assembly Manager', 'Authorised Person (AP)', 'Chef', 'Chemical Cleaner', 'Client Representative', 'Consultant', 'Cook', 'Designer', 'Dimensional Control Surveyor', 'Dive Technician', 'Drafter', 'Fibre Optic Technician', 'Flange Manager', 'Gardener', 'HMF Technician', 'Housekeeper', 'Kitchen Porter', 'LBL Technician', 'Leadman', 'Legal Advisor', 'Legal Secretary', 'Lifting Inspector', 'Lifting Supervisor', 'Major Components Manager', 'Manufacturing Technician', 'Offshore Job Template', 'Online Surveyor', 'Para Legal', 'Party Chief', 'Pipefreeze Supervisor', 'Pipefreeze Technician', 'Planner', 'Portfolio Manager', 'Practitioner', 'Quayside Technician', 'Register Nurse', 'Reporting Surveyor', 'Reports Coordinator', 'SAT Supervisor', 'SAT Technician', 'Scheduler', 'Security', 'Senior Designer', 'Senior Drafter', 'Senior Manager', 'Senior Planner', 'Senior Survey Engineer', 'Senior Surveyor', 'Shift Supervisor', 'Shop Lead', 'Shop Manager', 'Shop Technician', 'Sourcing Specialist', 'Specialist Access and Inspection Technician', 'Survey Engineer', 'Survey Engineer Grade I', 'Survey Engineer Grade II', 'Survey Grade I', 'Survey Representative', 'Survey Technician', 'Surveyor', 'Surveyor Grade II', 'Trenching Equipment Superintendent', 'Trenching Supervisor', 'UAV Accountable Manager', 'UAV Pilot Technician', 'Umbilical Operator', 'Umbilical Supervisor', 'Vendor Inspector', 'Waiter / Waitress'] },
];

/** Build grouped categories from the flat role list */
function buildCategories(roles: TaxonomyRole[]): TaxonomyCategory[] {
  const map = new Map<string, TaxonomyRole[]>();
  for (const role of roles) {
    const list = map.get(role.category) ?? [];
    list.push(role);
    map.set(role.category, list);
  }

  const CATEGORY_ORDER = [
    'Drilling & Well Services',
    'Production & Field Operations',
    'Reservoir & Geoscience',
    'Technical Trades',
    'Engineering',
    'Engineering Technicians',
    'Plant & Process Operations',
    'Management',
    'Support Functions',
    'Digital & IT',
    'Sales & Marketing',
    'Renewable & Energy Transition',
    'Transportation & Logistics',
    'Other Roles',
  ];

  return CATEGORY_ORDER
    .filter((name) => map.has(name))
    .map((name) => ({
      name,
      roles: map.get(name)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export const TAXONOMY_ROLES = ROLES;
export const TAXONOMY_CATEGORIES = buildCategories(ROLES);
export const TAXONOMY_ROLE_COUNT = ROLES.length;

/**
 * Build a lookup: raw role name (lowercased) → raw role ID.
 * Used to expand clean role selections to raw API role IDs.
 */
export function buildRawRoleLookup(
  apiRoles: Array<{ id: string; name: string }>
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const role of apiRoles) {
    lookup.set(role.name.trim().toLowerCase(), role.id);
  }
  return lookup;
}

/**
 * Expand selected clean role IDs to the corresponding raw API role IDs.
 *
 * For each selected clean role, finds all its rawRoleNames in the API
 * lookup (case-insensitive match) and returns the union of raw role IDs.
 * If a clean role has no rawRoleNames mapping, it is skipped (no match).
 */
export function expandCleanToRawIds(
  selectedCleanIds: string[],
  rawLookup: Map<string, string>,
): string[] {
  const rawIds = new Set<string>();

  for (const cleanId of selectedCleanIds) {
    const cleanRole = ROLES.find((r) => r.id === cleanId);
    if (!cleanRole) continue;

    for (const rawName of cleanRole.rawRoleNames) {
      const rawId = rawLookup.get(rawName.trim().toLowerCase());
      if (rawId) {
        rawIds.add(rawId);
      }
    }
  }

  return Array.from(rawIds);
}
