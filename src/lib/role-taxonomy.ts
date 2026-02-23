/**
 * Curated role taxonomy for the apply wizard.
 *
 * Source: Moblyze role-backfill-taxonomy Google Sheet, cleaned and
 * reorganized from the raw data (which had 73% of roles miscategorized
 * under "Subsea"). Categories are designed around Moblyze's market:
 * skilled trades, energy, and industrial sectors.
 *
 * For production, the API returns roles via CANDIDATE_ROLES_QUERY.
 * This file provides the demo dataset and can serve as a reference
 * taxonomy for future database cleanup.
 */

export interface TaxonomyRole {
  id: string;
  name: string;
  category: string;
}

export interface TaxonomyCategory {
  name: string;
  roles: TaxonomyRole[];
}

const ROLES: TaxonomyRole[] = [
  // — Electrical —
  { id: 'tx-001', name: 'Electrician', category: 'Electrical' },
  { id: 'tx-002', name: 'Industrial Electrician', category: 'Electrical' },
  { id: 'tx-003', name: 'Commercial Electrician', category: 'Electrical' },
  { id: 'tx-004', name: 'Master Electrician', category: 'Electrical' },
  { id: 'tx-005', name: 'Apprentice Electrician', category: 'Electrical' },
  { id: 'tx-006', name: 'Instrument Technician', category: 'Electrical' },
  { id: 'tx-007', name: 'Instrument Fitter', category: 'Electrical' },
  { id: 'tx-008', name: 'E&I Technician', category: 'Electrical' },
  { id: 'tx-009', name: 'Control Systems Technician', category: 'Electrical' },
  { id: 'tx-010', name: 'PLC Technician', category: 'Electrical' },
  { id: 'tx-011', name: 'High Voltage Electrician', category: 'Electrical' },
  { id: 'tx-012', name: 'Cable Jointer', category: 'Electrical' },
  { id: 'tx-013', name: 'Electrical Foreman', category: 'Electrical' },
  { id: 'tx-014', name: 'Electrical Superintendent', category: 'Electrical' },
  { id: 'tx-015', name: 'Lineman', category: 'Electrical' },

  // — Mechanical —
  { id: 'tx-020', name: 'Pipefitter', category: 'Mechanical' },
  { id: 'tx-021', name: 'Steamfitter', category: 'Mechanical' },
  { id: 'tx-022', name: 'Welder', category: 'Mechanical' },
  { id: 'tx-023', name: 'Combo Welder', category: 'Mechanical' },
  { id: 'tx-024', name: 'TIG Welder', category: 'Mechanical' },
  { id: 'tx-025', name: 'Structural Welder', category: 'Mechanical' },
  { id: 'tx-026', name: 'Millwright', category: 'Mechanical' },
  { id: 'tx-027', name: 'Boilermaker', category: 'Mechanical' },
  { id: 'tx-028', name: 'Mechanic', category: 'Mechanical' },
  { id: 'tx-029', name: 'Diesel Mechanic', category: 'Mechanical' },
  { id: 'tx-030', name: 'Heavy Equipment Mechanic', category: 'Mechanical' },
  { id: 'tx-031', name: 'Rotating Equipment Technician', category: 'Mechanical' },
  { id: 'tx-032', name: 'Valve Technician', category: 'Mechanical' },
  { id: 'tx-033', name: 'Mechanical Fitter', category: 'Mechanical' },
  { id: 'tx-034', name: 'Plumber', category: 'Mechanical' },
  { id: 'tx-035', name: 'HVAC Technician', category: 'Mechanical' },
  { id: 'tx-036', name: 'Mechanical Foreman', category: 'Mechanical' },
  { id: 'tx-037', name: 'Pipe Welder', category: 'Mechanical' },

  // — Construction —
  { id: 'tx-040', name: 'Carpenter', category: 'Construction' },
  { id: 'tx-041', name: 'Ironworker', category: 'Construction' },
  { id: 'tx-042', name: 'Scaffolder', category: 'Construction' },
  { id: 'tx-043', name: 'Painter', category: 'Construction' },
  { id: 'tx-044', name: 'Industrial Painter', category: 'Construction' },
  { id: 'tx-045', name: 'Concrete Finisher', category: 'Construction' },
  { id: 'tx-046', name: 'Mason', category: 'Construction' },
  { id: 'tx-047', name: 'Roofer', category: 'Construction' },
  { id: 'tx-048', name: 'Insulator', category: 'Construction' },
  { id: 'tx-049', name: 'Glazier', category: 'Construction' },
  { id: 'tx-050', name: 'Sheet Metal Worker', category: 'Construction' },
  { id: 'tx-051', name: 'General Foreman', category: 'Construction' },
  { id: 'tx-052', name: 'Site Superintendent', category: 'Construction' },
  { id: 'tx-053', name: 'Construction Manager', category: 'Construction' },
  { id: 'tx-054', name: 'Craftsman', category: 'Construction' },

  // — General Labor & Helper —
  { id: 'tx-060', name: 'Laborer', category: 'General Labor' },
  { id: 'tx-061', name: 'Helper', category: 'General Labor' },
  { id: 'tx-062', name: 'Pipefitter Helper', category: 'General Labor' },
  { id: 'tx-063', name: 'Electrician Helper', category: 'General Labor' },
  { id: 'tx-064', name: 'Welder Helper', category: 'General Labor' },
  { id: 'tx-065', name: 'Leadman', category: 'General Labor' },
  { id: 'tx-066', name: 'Utility Worker', category: 'General Labor' },
  { id: 'tx-067', name: 'Equipment Operator', category: 'General Labor' },

  // — Heavy Equipment & Transportation —
  { id: 'tx-070', name: 'Crane Operator', category: 'Heavy Equipment' },
  { id: 'tx-071', name: 'Rigger', category: 'Heavy Equipment' },
  { id: 'tx-072', name: 'Forklift Operator', category: 'Heavy Equipment' },
  { id: 'tx-073', name: 'Heavy Equipment Operator', category: 'Heavy Equipment' },
  { id: 'tx-074', name: 'CDL Driver', category: 'Heavy Equipment' },
  { id: 'tx-075', name: 'Truck Driver', category: 'Heavy Equipment' },
  { id: 'tx-076', name: 'Excavator Operator', category: 'Heavy Equipment' },
  { id: 'tx-077', name: 'Dozer Operator', category: 'Heavy Equipment' },
  { id: 'tx-078', name: 'Signal Person', category: 'Heavy Equipment' },

  // — Operations & Process —
  { id: 'tx-080', name: 'Plant Operator', category: 'Operations' },
  { id: 'tx-081', name: 'Process Operator', category: 'Operations' },
  { id: 'tx-082', name: 'Control Room Operator', category: 'Operations' },
  { id: 'tx-083', name: 'Field Operator', category: 'Operations' },
  { id: 'tx-084', name: 'Production Operator', category: 'Operations' },
  { id: 'tx-085', name: 'Refinery Operator', category: 'Operations' },
  { id: 'tx-086', name: 'Gas Plant Operator', category: 'Operations' },
  { id: 'tx-087', name: 'Water Treatment Operator', category: 'Operations' },
  { id: 'tx-088', name: 'Power Plant Operator', category: 'Operations' },
  { id: 'tx-089', name: 'Operations Supervisor', category: 'Operations' },

  // — Drilling & Well Services —
  { id: 'tx-090', name: 'Driller', category: 'Drilling & Wells' },
  { id: 'tx-091', name: 'Derrickhand', category: 'Drilling & Wells' },
  { id: 'tx-092', name: 'Floorhand', category: 'Drilling & Wells' },
  { id: 'tx-093', name: 'Mud Engineer', category: 'Drilling & Wells' },
  { id: 'tx-094', name: 'Mudlogger', category: 'Drilling & Wells' },
  { id: 'tx-095', name: 'Well Test Operator', category: 'Drilling & Wells' },
  { id: 'tx-096', name: 'Completions Technician', category: 'Drilling & Wells' },
  { id: 'tx-097', name: 'Coiled Tubing Operator', category: 'Drilling & Wells' },
  { id: 'tx-098', name: 'Wireline Operator', category: 'Drilling & Wells' },
  { id: 'tx-099', name: 'Tool Pusher', category: 'Drilling & Wells' },
  { id: 'tx-100', name: 'Rig Manager', category: 'Drilling & Wells' },

  // — Subsea & Marine —
  { id: 'tx-110', name: 'ROV Pilot Technician', category: 'Subsea & Marine' },
  { id: 'tx-111', name: 'ROV Supervisor', category: 'Subsea & Marine' },
  { id: 'tx-112', name: 'Commercial Diver', category: 'Subsea & Marine' },
  { id: 'tx-113', name: 'Saturation Diver', category: 'Subsea & Marine' },
  { id: 'tx-114', name: 'Subsea Engineer', category: 'Subsea & Marine' },
  { id: 'tx-115', name: 'Marine Mechanic', category: 'Subsea & Marine' },
  { id: 'tx-116', name: 'Marine Engineer', category: 'Subsea & Marine' },
  { id: 'tx-117', name: 'Deckhand', category: 'Subsea & Marine' },
  { id: 'tx-118', name: 'Captain / Master', category: 'Subsea & Marine' },

  // — Inspection & QC —
  { id: 'tx-120', name: 'NDT Technician', category: 'Inspection & QC' },
  { id: 'tx-121', name: 'Welding Inspector', category: 'Inspection & QC' },
  { id: 'tx-122', name: 'QC Inspector', category: 'Inspection & QC' },
  { id: 'tx-123', name: 'Coating Inspector', category: 'Inspection & QC' },
  { id: 'tx-124', name: 'Piping Inspector', category: 'Inspection & QC' },
  { id: 'tx-125', name: 'Structural Inspector', category: 'Inspection & QC' },
  { id: 'tx-126', name: 'API Inspector', category: 'Inspection & QC' },
  { id: 'tx-127', name: 'Radiographer', category: 'Inspection & QC' },
  { id: 'tx-128', name: 'QA/QC Manager', category: 'Inspection & QC' },

  // — HSE & Safety —
  { id: 'tx-130', name: 'Safety Officer', category: 'HSE & Safety' },
  { id: 'tx-131', name: 'HSE Manager', category: 'HSE & Safety' },
  { id: 'tx-132', name: 'HSE Coordinator', category: 'HSE & Safety' },
  { id: 'tx-133', name: 'Safety Technician', category: 'HSE & Safety' },
  { id: 'tx-134', name: 'Industrial Hygienist', category: 'HSE & Safety' },
  { id: 'tx-135', name: 'Fire Watch', category: 'HSE & Safety' },
  { id: 'tx-136', name: 'Hole Watch', category: 'HSE & Safety' },
  { id: 'tx-137', name: 'Environmental Specialist', category: 'HSE & Safety' },

  // — Maintenance —
  { id: 'tx-140', name: 'Maintenance Technician', category: 'Maintenance' },
  { id: 'tx-141', name: 'Maintenance Planner', category: 'Maintenance' },
  { id: 'tx-142', name: 'Maintenance Supervisor', category: 'Maintenance' },
  { id: 'tx-143', name: 'Turnaround Planner', category: 'Maintenance' },
  { id: 'tx-144', name: 'Reliability Engineer', category: 'Maintenance' },
  { id: 'tx-145', name: 'Preventive Maintenance Tech', category: 'Maintenance' },

  // — Engineering —
  { id: 'tx-150', name: 'Mechanical Engineer', category: 'Engineering' },
  { id: 'tx-151', name: 'Electrical Engineer', category: 'Engineering' },
  { id: 'tx-152', name: 'Civil Engineer', category: 'Engineering' },
  { id: 'tx-153', name: 'Structural Engineer', category: 'Engineering' },
  { id: 'tx-154', name: 'Process Engineer', category: 'Engineering' },
  { id: 'tx-155', name: 'Pipeline Engineer', category: 'Engineering' },
  { id: 'tx-156', name: 'Petroleum Engineer', category: 'Engineering' },
  { id: 'tx-157', name: 'Project Engineer', category: 'Engineering' },
  { id: 'tx-158', name: 'Design Engineer', category: 'Engineering' },
  { id: 'tx-159', name: 'Commissioning Engineer', category: 'Engineering' },
  { id: 'tx-160', name: 'Instrumentation Engineer', category: 'Engineering' },

  // — Project Management —
  { id: 'tx-170', name: 'Project Manager', category: 'Project Management' },
  { id: 'tx-171', name: 'Construction Manager', category: 'Project Management' },
  { id: 'tx-172', name: 'Project Coordinator', category: 'Project Management' },
  { id: 'tx-173', name: 'Scheduler', category: 'Project Management' },
  { id: 'tx-174', name: 'Cost Engineer', category: 'Project Management' },
  { id: 'tx-175', name: 'Commissioning Manager', category: 'Project Management' },
  { id: 'tx-176', name: 'Turnaround Manager', category: 'Project Management' },

  // — Wind & Renewables —
  { id: 'tx-180', name: 'Wind Turbine Technician', category: 'Renewables' },
  { id: 'tx-181', name: 'Solar Installer', category: 'Renewables' },
  { id: 'tx-182', name: 'Solar Technician', category: 'Renewables' },
  { id: 'tx-183', name: 'Battery Storage Technician', category: 'Renewables' },
  { id: 'tx-184', name: 'Wind Site Supervisor', category: 'Renewables' },

  // — Transmission & Distribution —
  { id: 'tx-190', name: 'Transmission Lineman', category: 'Transmission & Power' },
  { id: 'tx-191', name: 'Substation Technician', category: 'Transmission & Power' },
  { id: 'tx-192', name: 'Cable Splicer', category: 'Transmission & Power' },
  { id: 'tx-193', name: 'Relay Technician', category: 'Transmission & Power' },
  { id: 'tx-194', name: 'Power Line Technician', category: 'Transmission & Power' },

  // — Warehouse & Logistics —
  { id: 'tx-200', name: 'Warehouse Worker', category: 'Logistics' },
  { id: 'tx-201', name: 'Material Handler', category: 'Logistics' },
  { id: 'tx-202', name: 'Logistics Coordinator', category: 'Logistics' },
  { id: 'tx-203', name: 'Inventory Specialist', category: 'Logistics' },
  { id: 'tx-204', name: 'Procurement Specialist', category: 'Logistics' },

  // — Admin & Business Support —
  { id: 'tx-210', name: 'Administrative Assistant', category: 'Admin & Support' },
  { id: 'tx-211', name: 'Document Controller', category: 'Admin & Support' },
  { id: 'tx-212', name: 'HR Coordinator', category: 'Admin & Support' },
  { id: 'tx-213', name: 'Recruiter', category: 'Admin & Support' },
  { id: 'tx-214', name: 'Estimator', category: 'Admin & Support' },
  { id: 'tx-215', name: 'Accountant', category: 'Admin & Support' },
];

/** Build grouped categories from the flat role list */
function buildCategories(roles: TaxonomyRole[]): TaxonomyCategory[] {
  const map = new Map<string, TaxonomyRole[]>();
  for (const role of roles) {
    const list = map.get(role.category) ?? [];
    list.push(role);
    map.set(role.category, list);
  }

  // Sort categories: trades first, then support roles
  const CATEGORY_ORDER = [
    'Electrical',
    'Mechanical',
    'Construction',
    'General Labor',
    'Heavy Equipment',
    'Operations',
    'Drilling & Wells',
    'Subsea & Marine',
    'Inspection & QC',
    'HSE & Safety',
    'Maintenance',
    'Engineering',
    'Project Management',
    'Renewables',
    'Transmission & Power',
    'Logistics',
    'Admin & Support',
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

/** Total role count for display */
export const TAXONOMY_ROLE_COUNT = ROLES.length;
