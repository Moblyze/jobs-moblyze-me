import type { PublicJob } from '@/types';

const GC_LOGO_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' rx='12' fill='%230d9488'/%3E%3Ctext x='48' y='56' text-anchor='middle' font-family='system-ui,sans-serif' font-size='36' font-weight='600' fill='white'%3EGC%3C/text%3E%3C/svg%3E";

/**
 * Full PublicJob objects for all 7 demo carousel jobs.
 * These are the jobs a user can tap on from the confirmation page carousels.
 */
export const DEMO_JOBS = new Map<string, PublicJob>([
  // ─── Employer jobs (Gulf Coast Energy Services — white-label) ───────────────

  [
    'master-electrician-dallas',
    {
      id: 'demo-emp-1',
      slug: 'master-electrician-dallas',
      title: 'Master Electrician',
      employerName: 'Gulf Coast Energy Services',
      employerLogoUrl: GC_LOGO_URL,
      location: 'Dallas, TX',
      employmentTypeText: 'Full-time',
      payRateText: '$48–55/hr',
      startDateText: 'March 10, 2026',
      whiteLabel: true,
      roles: [
        { id: 'role-electrician', name: 'Electrician' },
        { id: 'role-master-electrician', name: 'Master Electrician' },
        { id: 'role-electrical-lead', name: 'Electrical Lead' },
      ],
      requiredCertifications: [
        { name: 'Texas Master Electrician License', required: true },
        { name: 'OSHA 30', required: true },
        { name: 'NFPA 70E Arc Flash', required: true },
        { name: 'First Aid / CPR', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Valid Texas Master Electrician license</li>' +
        '<li>Minimum 8 years of commercial/industrial electrical experience</li>' +
        '<li>Ability to read and interpret blueprints, schematics, and NEC code</li>' +
        '<li>Experience with 480V 3-phase systems and motor controls</li>' +
        '<li>OSHA 30 certification current within the last 5 years</li>' +
        '<li>Must pass background check and pre-employment drug screen</li>' +
        '<li>Valid driver\u2019s license and reliable transportation</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Install, maintain, and repair electrical systems in commercial and industrial facilities</li>' +
        '<li>Plan and lay out wiring, conduit runs, and panel installations from blueprints</li>' +
        '<li>Troubleshoot and diagnose electrical faults using metering and testing equipment</li>' +
        '<li>Supervise and mentor journeyman and apprentice electricians on site</li>' +
        '<li>Ensure all work meets NEC, local codes, and company safety standards</li>' +
        '<li>Coordinate with project managers and other trades on scheduling and scope</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Comprehensive health, dental, and vision insurance</li>' +
        '<li>401(k) with 4% employer match</li>' +
        '<li>Paid time off (3 weeks) plus paid holidays</li>' +
        '<li>Company truck and fuel card provided</li>' +
        '<li>Tool allowance: $1,500/year</li>' +
        '<li>Ongoing training and professional development</li>' +
        '</ul>',
      createdAt: '2026-02-15T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z',
    },
  ],

  [
    'apprentice-electrician-houston',
    {
      id: 'demo-emp-2',
      slug: 'apprentice-electrician-houston',
      title: 'Apprentice Electrician',
      employerName: 'Gulf Coast Energy Services',
      employerLogoUrl: GC_LOGO_URL,
      location: 'Houston, TX',
      employmentTypeText: 'Full-time',
      payRateText: '$22–28/hr',
      startDateText: 'March 17, 2026',
      whiteLabel: true,
      roles: [
        { id: 'role-electrician', name: 'Electrician' },
        { id: 'role-apprentice-electrician', name: 'Apprentice Electrician' },
      ],
      requiredCertifications: [
        { name: 'OSHA 10', required: true },
        { name: 'Texas Electrical Apprentice Registration', required: true },
        { name: 'First Aid / CPR', required: false },
        { name: 'Forklift Certification', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Currently enrolled in or willing to enroll in a state-approved electrical apprenticeship program</li>' +
        '<li>Valid Texas Electrical Apprentice registration</li>' +
        '<li>OSHA 10 certification (or ability to obtain within 30 days of hire)</li>' +
        '<li>Basic knowledge of hand and power tools used in the electrical trade</li>' +
        '<li>Ability to lift 50 lbs and work on ladders and scaffolding</li>' +
        '<li>Must pass background check and pre-employment drug screen</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Assist journeyman and master electricians with installations, maintenance, and repairs</li>' +
        '<li>Pull wire, bend conduit, and mount electrical boxes and fixtures</li>' +
        '<li>Learn to read blueprints and electrical schematics under supervision</li>' +
        '<li>Maintain clean and organized work areas and job sites</li>' +
        '<li>Track apprenticeship hours and attend required classroom instruction</li>' +
        '<li>Follow all safety protocols and report hazards immediately</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Full tuition reimbursement for apprenticeship program</li>' +
        '<li>Health and dental insurance after 90 days</li>' +
        '<li>Structured pay increases tied to apprenticeship milestones</li>' +
        '<li>Tools provided during apprenticeship</li>' +
        '<li>Clear path to Journeyman licensure</li>' +
        '</ul>',
      createdAt: '2026-02-14T00:00:00Z',
      updatedAt: '2026-02-14T00:00:00Z',
    },
  ],

  [
    'electrical-foreman-austin',
    {
      id: 'demo-emp-3',
      slug: 'electrical-foreman-austin',
      title: 'Electrical Foreman',
      employerName: 'Gulf Coast Energy Services',
      employerLogoUrl: GC_LOGO_URL,
      location: 'Austin, TX',
      employmentTypeText: 'Contract',
      payRateText: '$55–62/hr',
      startDateText: 'April 1, 2026',
      whiteLabel: true,
      roles: [
        { id: 'role-electrician', name: 'Electrician' },
        { id: 'role-electrical-foreman', name: 'Electrical Foreman' },
        { id: 'role-construction-foreman', name: 'Construction Foreman' },
      ],
      requiredCertifications: [
        { name: 'Texas Journeyman or Master Electrician License', required: true },
        { name: 'OSHA 30', required: true },
        { name: 'NFPA 70E Arc Flash', required: true },
        { name: 'First Aid / CPR', required: true },
        { name: 'Confined Space Entry', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Texas Journeyman or Master Electrician license</li>' +
        '<li>Minimum 10 years of electrical experience, with 3+ years in a foreman or supervisory role</li>' +
        '<li>Proven ability to manage crews of 10\u201325 electricians on commercial/industrial projects</li>' +
        '<li>Strong knowledge of NEC code, project scheduling, and material takeoffs</li>' +
        '<li>Experience with BIM coordination and digital plan review</li>' +
        '<li>OSHA 30 and NFPA 70E certifications required</li>' +
        '<li>Proficient with project management and reporting tools</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Lead and coordinate daily activities of electrical crews on large commercial projects</li>' +
        '<li>Review drawings, specifications, and change orders; delegate tasks to crew members</li>' +
        '<li>Maintain project schedules and ensure milestones are met on time</li>' +
        '<li>Conduct daily toolbox talks and enforce safety compliance on site</li>' +
        '<li>Track labor hours, materials, and productivity; report to project manager</li>' +
        '<li>Mentor journeymen and apprentices and manage crew performance</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Per diem: $125/day for non-local candidates</li>' +
        '<li>Weekly pay via direct deposit</li>' +
        '<li>Health benefits available through staffing partner</li>' +
        '<li>Long-term contract with potential for permanent hire</li>' +
        '<li>Company vehicle provided for project duration</li>' +
        '</ul>',
      createdAt: '2026-02-13T00:00:00Z',
      updatedAt: '2026-02-13T00:00:00Z',
    },
  ],

  // ─── Preview page jobs (entry points from /preview) ────────────────────────

  [
    'journeyman-electrician-houston-tx-12345',
    {
      id: 'preview-001',
      slug: 'journeyman-electrician-houston-tx-12345',
      title: 'Journeyman Electrician',
      employerName: 'Gulf Coast Energy Services',
      employerLogoUrl: GC_LOGO_URL,
      location: 'Houston, TX',
      employmentTypeText: 'Full-time',
      payRateText: '$38–45/hr',
      startDateText: 'March 3, 2026',
      whiteLabel: true,
      roles: [
        { id: 'r1', name: 'Electrician' },
        { id: 'r2', name: 'Industrial Electrician' },
        { id: 'r3', name: 'Commercial Electrician' },
      ],
      requiredCertifications: [
        { name: 'Journeyman Electrician License', required: true },
        { name: 'OSHA 30', required: true },
        { name: 'First Aid/CPR', required: true },
        { name: 'TWIC Card', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>3+ years of commercial/industrial experience</li>' +
        '<li>Experience with 480V 3-phase systems</li>' +
        '<li>Ability to read and interpret electrical blueprints and schematics</li>' +
        '<li>Must pass background check and drug screening</li>' +
        '<li>Valid driver\u2019s license and reliable transportation</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Install, maintain, and repair electrical systems in commercial and industrial facilities</li>' +
        '<li>Troubleshoot electrical malfunctions using diagnostic equipment</li>' +
        '<li>Perform conduit bending, wire pulling, and panel terminations</li>' +
        '<li>Ensure all work complies with NEC and local electrical codes</li>' +
        '<li>Coordinate with project managers and other trades on job sites</li>' +
        '<li>Mentor apprentice electricians and verify their work quality</li>' +
        '<li>Complete daily work reports and maintain material logs</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Health, dental, and vision insurance</li>' +
        '<li>401(k) with 4% employer match</li>' +
        '<li>Paid time off (2 weeks first year, 3 weeks after)</li>' +
        '<li>Tool allowance: $500/year</li>' +
        '<li>Per diem for travel projects ($85/day)</li>' +
        '<li>Overtime available — most weeks are 50-55 hours</li>' +
        '</ul>' +
        '<p>We are an equal opportunity employer. Veterans strongly encouraged to apply.</p>',
      createdAt: '2026-02-15T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z',
    },
  ],

  [
    'pipefitter-midland-tx-22345',
    {
      id: 'preview-002',
      slug: 'pipefitter-midland-tx-22345',
      title: 'Pipefitter — Upstream Oil & Gas',
      employerName: 'Permian Basin Contractors',
      employerLogoUrl: null,
      location: 'Midland, TX',
      employmentTypeText: 'Contract',
      payRateText: '$42–52/hr + per diem',
      startDateText: 'March 17, 2026',
      whiteLabel: false,
      roles: [
        { id: 'r4', name: 'Pipefitter' },
        { id: 'r5', name: 'Steamfitter' },
      ],
      requiredCertifications: [
        { name: 'H2S Alive', required: true },
        { name: 'OSHA 10', required: true },
        { name: 'Confined Space Entry', required: true },
        { name: 'Fall Protection', required: true },
        { name: 'CDL Class A', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>3+ years of commercial/industrial experience</li>' +
        '<li>Experience with 480V 3-phase systems</li>' +
        '<li>Ability to read and interpret electrical blueprints and schematics</li>' +
        '<li>Must pass background check and drug screening</li>' +
        '<li>Valid driver\u2019s license and reliable transportation</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Install, maintain, and repair electrical systems in commercial and industrial facilities</li>' +
        '<li>Troubleshoot electrical malfunctions using diagnostic equipment</li>' +
        '<li>Perform conduit bending, wire pulling, and panel terminations</li>' +
        '<li>Ensure all work complies with NEC and local electrical codes</li>' +
        '<li>Coordinate with project managers and other trades on job sites</li>' +
        '<li>Mentor apprentice electricians and verify their work quality</li>' +
        '<li>Complete daily work reports and maintain material logs</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Health, dental, and vision insurance</li>' +
        '<li>401(k) with 4% employer match</li>' +
        '<li>Paid time off (2 weeks first year, 3 weeks after)</li>' +
        '<li>Tool allowance: $500/year</li>' +
        '<li>Per diem for travel projects ($85/day)</li>' +
        '<li>Overtime available — most weeks are 50-55 hours</li>' +
        '</ul>' +
        '<p>We are an equal opportunity employer. Veterans strongly encouraged to apply.</p>',
      createdAt: '2026-02-14T00:00:00Z',
      updatedAt: '2026-02-14T00:00:00Z',
    },
  ],

  // ─── Similar jobs (various employers) ──────────────────────────────────────

  [
    'electrician-calgary',
    {
      id: 'demo-sim-1',
      slug: 'electrician-calgary',
      title: 'Journeyman Electrician',
      employerName: 'Vertex Energy Services',
      employerLogoUrl: null,
      location: 'Calgary, AB',
      employmentTypeText: 'Full-time',
      payRateText: '$45–55/hr',
      startDateText: 'March 3, 2026',
      whiteLabel: false,
      roles: [
        { id: 'role-electrician', name: 'Electrician' },
        { id: 'role-journeyman-electrician', name: 'Journeyman Electrician' },
        { id: 'role-industrial-electrician', name: 'Industrial Electrician' },
      ],
      requiredCertifications: [
        { name: 'Alberta Journeyman Electrician Certificate', required: true },
        { name: 'CSTS-2020 (Construction Safety Training)', required: true },
        { name: 'H2S Alive', required: true },
        { name: 'Fall Protection', required: false },
        { name: 'Confined Space Entry', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Valid Alberta Journeyman Electrician Certificate (or Red Seal interprovincial)</li>' +
        '<li>Minimum 5 years of industrial or oil &amp; gas electrical experience</li>' +
        '<li>Experience with VFDs, PLCs, motor controls, and power distribution systems</li>' +
        '<li>CSTS-2020 and H2S Alive certifications current</li>' +
        '<li>Ability to work in harsh weather conditions and remote job sites</li>' +
        '<li>Valid Class 5 driver\u2019s license and clean driving abstract</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Install, troubleshoot, and maintain electrical systems in industrial and energy facilities</li>' +
        '<li>Perform preventive maintenance on switchgear, MCCs, and transformer systems</li>' +
        '<li>Read and interpret P&amp;IDs, single-line diagrams, and loop drawings</li>' +
        '<li>Conduct testing and commissioning of new electrical installations</li>' +
        '<li>Complete work orders and documentation in CMMS (Maximo / SAP)</li>' +
        '<li>Participate in safety meetings and hazard assessments</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Comprehensive benefits package (health, dental, vision, life insurance)</li>' +
        '<li>RRSP matching program</li>' +
        '<li>Annual boot and tool allowance</li>' +
        '<li>Overtime available at 1.5x after 8 hours</li>' +
        '<li>Employee referral bonus program</li>' +
        '</ul>',
      createdAt: '2026-02-15T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z',
    },
  ],

  [
    'pipefitter-fort-mcmurray',
    {
      id: 'demo-sim-2',
      slug: 'pipefitter-fort-mcmurray',
      title: 'Pipefitter \u2014 Turnaround',
      employerName: 'Clearstream Energy',
      employerLogoUrl: null,
      location: 'Fort McMurray, AB',
      employmentTypeText: 'Contract',
      payRateText: '$52/hr + LOA',
      startDateText: 'March 24, 2026',
      whiteLabel: false,
      roles: [
        { id: 'role-pipefitter', name: 'Pipefitter' },
        { id: 'role-steamfitter', name: 'Steamfitter' },
        { id: 'role-turnaround-pipefitter', name: 'Turnaround Pipefitter' },
      ],
      requiredCertifications: [
        { name: 'Alberta Journeyman Pipefitter/Steamfitter Certificate', required: true },
        { name: 'CSTS-2020 (Construction Safety Training)', required: true },
        { name: 'H2S Alive', required: true },
        { name: 'Confined Space Entry', required: true },
        { name: 'Fall Protection', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Valid Alberta Journeyman Pipefitter/Steamfitter Certificate (or Red Seal)</li>' +
        '<li>Minimum 5 years of experience in turnaround and shutdown environments</li>' +
        '<li>Proficient in reading isometric drawings, P&amp;IDs, and piping specs</li>' +
        '<li>Experience with high-pressure steam, process piping, and ASME B31.3</li>' +
        '<li>All safety tickets current: CSTS-2020, H2S Alive, Confined Space</li>' +
        '<li>Must be available for 10/4 or 14/7 turnaround schedule</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Fabricate, install, and repair piping systems during scheduled turnarounds</li>' +
        '<li>Perform bolt-up, torquing, and flange management per site procedures</li>' +
        '<li>Conduct hydrostatic and pneumatic pressure testing on completed assemblies</li>' +
        '<li>Work with rigging crews to position and set heavy pipe spools</li>' +
        '<li>Complete all turnaround documentation including redlines and quality checklists</li>' +
        '<li>Adhere to site-specific safety plans and participate in daily JHAs</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Living Out Allowance (LOA): $185/day</li>' +
        '<li>Travel allowance provided for out-of-province workers</li>' +
        '<li>Overtime: double time after 10 hours</li>' +
        '<li>Camp accommodation available if preferred over LOA</li>' +
        '<li>Safety bonus upon turnaround completion</li>' +
        '</ul>',
      createdAt: '2026-02-14T00:00:00Z',
      updatedAt: '2026-02-14T00:00:00Z',
    },
  ],

  [
    'welder-b-pressure',
    {
      id: 'demo-sim-3',
      slug: 'welder-b-pressure',
      title: 'B-Pressure Welder',
      employerName: 'Aecon Industrial',
      employerLogoUrl: null,
      location: 'Edmonton, AB',
      employmentTypeText: 'Full-time',
      payRateText: '$48–58/hr',
      startDateText: 'April 7, 2026',
      whiteLabel: false,
      roles: [
        { id: 'role-welder', name: 'Welder' },
        { id: 'role-pressure-welder', name: 'Pressure Welder' },
        { id: 'role-pipefitter-welder', name: 'Pipefitter/Welder' },
      ],
      requiredCertifications: [
        { name: 'ABSA B-Pressure Welding Ticket', required: true },
        { name: 'CWB Certification (SMAW, GTAW, FCAW)', required: true },
        { name: 'CSTS-2020 (Construction Safety Training)', required: true },
        { name: 'H2S Alive', required: false },
        { name: 'Fall Protection', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Valid ABSA B-Pressure welding ticket</li>' +
        '<li>CWB certified in SMAW, GTAW, and FCAW processes on carbon and stainless steel</li>' +
        '<li>Minimum 5 years of pressure welding experience in industrial or oil &amp; gas settings</li>' +
        '<li>Ability to weld in all positions (6G) on pipe 2\u2033 and up</li>' +
        '<li>Experience reading WPS, isometric drawings, and weld maps</li>' +
        '<li>Must pass weld test prior to start date</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Perform pressure welds on process piping systems per ASME and ABSA codes</li>' +
        '<li>Set up and operate SMAW, GTAW, and FCAW welding equipment</li>' +
        '<li>Prepare weld joints including beveling, fit-up, tacking, and preheat</li>' +
        '<li>Ensure all welds pass visual and NDE inspection (X-ray, UT, MT)</li>' +
        '<li>Maintain welding logs and traceability documentation</li>' +
        '<li>Keep work area clean and organized; follow all PPE requirements</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Comprehensive benefits: health, dental, vision, and life insurance</li>' +
        '<li>RRSP matching up to 5%</li>' +
        '<li>Annual welding ticket renewal paid by employer</li>' +
        '<li>Overtime available: 1.5x after 8 hrs, 2x after 10 hrs</li>' +
        '<li>Employee Share Ownership Plan (ESOP)</li>' +
        '</ul>',
      createdAt: '2026-02-13T00:00:00Z',
      updatedAt: '2026-02-13T00:00:00Z',
    },
  ],

  [
    'heavy-equipment-operator',
    {
      id: 'demo-sim-4',
      slug: 'heavy-equipment-operator',
      title: 'Heavy Equipment Operator',
      employerName: 'North American Construction',
      employerLogoUrl: null,
      location: 'Grande Prairie, AB',
      employmentTypeText: 'Rotational',
      payRateText: '$42/hr + camp',
      startDateText: 'March 15, 2026',
      whiteLabel: false,
      roles: [
        { id: 'role-heavy-equipment-operator', name: 'Heavy Equipment Operator' },
        { id: 'role-equipment-operator', name: 'Equipment Operator' },
        { id: 'role-earthworks-operator', name: 'Earthworks Operator' },
      ],
      requiredCertifications: [
        { name: 'Heavy Equipment Operator Certification (AHEO or equivalent)', required: true },
        { name: 'CSTS-2020 (Construction Safety Training)', required: true },
        { name: 'Ground Disturbance Level II', required: true },
        { name: 'First Aid / CPR', required: false },
        { name: 'H2S Alive', required: false },
      ],
      requirementsDescription:
        '<ul>' +
        '<li>Heavy Equipment Operator certification (AHEO or provincial equivalent)</li>' +
        '<li>Minimum 3 years of experience operating excavators, dozers, and graders</li>' +
        '<li>Experience with GPS/machine control systems (Trimble, Topcon, or Leica)</li>' +
        '<li>Ground Disturbance Level II certification</li>' +
        '<li>Ability to work a 14/7 or 21/7 rotational schedule in remote camps</li>' +
        '<li>Valid Class 5 driver\u2019s license with clean abstract</li>' +
        '<li>Comfortable working in all weather conditions including extreme cold</li>' +
        '</ul>',
      responsibilitiesDescription:
        '<ul>' +
        '<li>Operate excavators, bulldozers, graders, and other heavy equipment for earthworks and site preparation</li>' +
        '<li>Perform grading, trenching, backfilling, and compaction to project specifications</li>' +
        '<li>Conduct daily pre-trip and post-trip equipment inspections</li>' +
        '<li>Work with survey crews and GPS systems to maintain grade accuracy</li>' +
        '<li>Report equipment deficiencies and coordinate with mechanics for maintenance</li>' +
        '<li>Follow all site safety plans, traffic management plans, and environmental protocols</li>' +
        '</ul>',
      otherDescription:
        '<ul>' +
        '<li>Camp accommodation and meals provided at no cost</li>' +
        '<li>Travel allowance for fly-in/fly-out rotation</li>' +
        '<li>Comprehensive benefits (health, dental, vision) from day one</li>' +
        '<li>RRSP matching program</li>' +
        '<li>Overtime: 1.5x after 8 hrs daily</li>' +
        '<li>Annual safety performance bonus</li>' +
        '</ul>',
      createdAt: '2026-02-12T00:00:00Z',
      updatedAt: '2026-02-12T00:00:00Z',
    },
  ],
]);

/** Check if a slug belongs to a demo job */
export function isDemoSlug(slug: string): boolean {
  return DEMO_JOBS.has(slug);
}
