import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TAGS_DIR = resolve(__dirname, '../src/content/tags');

const parentRef = (slug) => `src/content/tags/${slug}.md`;

/**
 * The Services tag tree. Level 2 entries are children of the `services` root;
 * their children (and grandchildren) become nested service sub-pages. Portfolio
 * items can be tagged with any node, and each tag's body/description drives the
 * content of its landing page.
 */
const tree = [
  {
    slug: 'site-analysis-feasibility',
    label: 'Site Analysis, Property Assessment & Feasibility Studies',
    description:
      'Full site analysis, facility assessment, feasibility studies, and due diligence so owners understand risks and costs before committing project funds.',
    body: `Developers need to fully understand the risks and costs of their projects before they commit their funds. PH&C leads the full site analysis, facility assessment, feasibility studies, and due diligence services tailored to each project, giving our clients the critical information they need to either move forward with confidence or, just as importantly, identify and pass on projects that do not meet their criteria.

PH&C prioritizes and guides clients through the maze of information required to make an initial determination of a project's feasibility. This incremental approach provides value by limiting extraneous spending and allowing our clients to focus their initial investments on the most promising opportunities.`,
    children: [
      {
        slug: 'geotechnical-investigations',
        label: 'Geotechnical Investigations',
        description:
          'Subsurface and soils investigations that reveal geotechnical conditions affecting foundation design and cost.',
      },
      {
        slug: 'environmental-assessments',
        label: 'Environmental Assessments',
        description:
          'Phase I and II environmental assessments that identify contamination risks before acquisition or development.',
      },
      {
        slug: 'hazardous-material-surveys',
        label: 'Hazardous Material Surveys',
        description:
          'Surveys for asbestos, lead, and other hazardous materials that must be managed prior to renovation or demolition.',
      },
      {
        slug: 'title-survey-reviews',
        label: 'Title & Survey Reviews',
        description:
          'Review of title and boundary/topographic surveys to surface easements, encumbrances, and site constraints.',
      },
      {
        slug: 'highway-access',
        label: 'Highway Access',
        description:
          'Assessment of highway access and occupancy requirements that shape site circulation and permitting.',
      },
      {
        slug: 'environmental-permitting-requirements',
        label: 'Environmental Permitting Requirements',
        description:
          'Early identification of the environmental permits a project will require and their impact on schedule.',
      },
      {
        slug: 'land-development-requirements',
        label: 'Land Development Requirements',
        description:
          'Analysis of the land development and zoning requirements that govern what can be built on a site.',
      },
      {
        slug: 'existing-utility-identification',
        label: 'Existing Utility Identification and Assessments',
        description:
          'Identification and assessment of existing utilities to determine available capacity and connection needs.',
      },
      {
        slug: 'landlord-tenant-lease-requirements',
        label: 'Landlord and Tenant Lease Construction Requirements',
        description:
          'Review of landlord and tenant lease construction obligations to align scope, cost, and responsibility.',
      },
      {
        slug: 'opinions-of-probable-cost',
        label: 'Opinions of Probable Cost / Project Budgeting',
        description:
          'Early opinions of probable cost and project budgeting to test feasibility before committing funds.',
      },
      {
        slug: 'feasibility-project-schedule',
        label: 'Project Schedule',
        description:
          'A preliminary project schedule that frames the timeline and key milestones during feasibility.',
      },
    ],
  },
  {
    slug: 'pre-construction-services',
    label: 'Pre-Construction Services',
    description:
      'Meticulous planning and coordination of design, entitlement, constructability, and cost before ground is broken.',
    body: `A successful project begins long before ground is broken. It requires meticulous planning and the careful coordination of many disciplines, from architects and engineers to municipal authorities and utility providers. PH&C brings the expertise and the broad, experienced perspective needed to manage the design, entitlement, constructability, and cost processes that set a project up to succeed.

PH&C delivers value during pre-construction by focusing on several key areas. First, we help clients assemble the right team for their specific project, drawing on a large network of experienced consultants across every discipline. Next, by proactively guiding the design and entitlement process against critical-path milestones, we reduce delays and save valuable time and money. At the same time, we gather cost feedback on critical design decisions and fold value-engineering suggestions into the design before procurement begins, managing cost and expectations before construction starts.`,
    children: [
      {
        slug: 'project-planning-coordination',
        label: 'Project Planning & Coordination',
        description:
          'Program development, design coordination, budgeting, scheduling, entitlements, and permitting that lay the groundwork for a successful build.',
        body: 'PH&C guides clients through the demanding process of design and land development, coordinating every discipline and approval that must fall into place before construction can begin.',
        children: [
          {
            slug: 'initial-program-development',
            label: 'Initial Program Development',
            description:
              "Defining the project's goals, scope, and requirements to establish a clear program before design begins.",
          },
          {
            slug: 'schematic-design-development',
            label: 'Schematic Design and Design Development Documents',
            description:
              'Guiding the architect and engineers through schematic and design-development phases to translate the program into buildable documents.',
          },
          {
            slug: 'special-construction-design-coordination',
            label: 'Special Construction Design Coordination',
            description:
              "Coordinating specialty systems and unique design requirements across the project's disciplines.",
          },
          {
            slug: 'project-schedule',
            label: 'Project Schedule',
            description:
              'Building and maintaining a critical-path schedule that keeps design, approvals, and procurement on track.',
          },
          {
            slug: 'proforma-analysis-budgeting',
            label: 'Proforma Analysis / Hard & Soft Cost Budgeting',
            description:
              'Developing and testing project budgets, including hard and soft costs, against the financial proforma.',
          },
          {
            slug: 'project-estimating-value-engineering',
            label: 'Detailed Project Estimating and Value Engineering',
            description:
              'Detailed cost estimating and value engineering to control cost and maximize value before procurement.',
          },
          {
            slug: 'cash-flow-analysis',
            label: 'Cash Flow Analysis',
            description:
              'Projecting and managing project cash flow so funding aligns with the construction timeline.',
          },
          {
            slug: 'land-development-zoning-approvals',
            label: 'Land Development & Zoning Approvals',
            description:
              'Navigating land development and zoning approvals with municipal authorities to secure entitlements.',
          },
          {
            slug: 'highway-permitting',
            label: 'Highway Permitting',
            description:
              'Securing highway occupancy and access permits required for site access and roadway improvements.',
          },
          {
            slug: 'npdes-permitting',
            label: 'NPDES Permitting',
            description:
              'Managing NPDES stormwater permitting to keep the project compliant and on schedule.',
          },
          {
            slug: 'environmental-permitting',
            label: 'Environmental: Stream Crossing / Sewer Modules',
            description:
              'Coordinating environmental approvals such as stream crossings and sewer planning modules.',
          },
          {
            slug: 'utility-service-coordination',
            label: 'Utility Service Coordination',
            description:
              'Coordinating water, sewer, gas, phone, electric, and cable service to the site.',
          },
          {
            slug: 'building-construction-permits',
            label: 'Building / Construction Permits',
            description:
              'Obtaining building and construction permits from the governing authorities.',
          },
          {
            slug: 'pre-construction-meetings',
            label: 'Pre-Construction Meetings',
            description:
              'Leading pre-construction meetings that align the owner, design team, and contractors before work begins.',
          },
        ],
      },
      {
        slug: 'project-contractor-procurement',
        label: 'Project Contractor Procurement',
        description:
          'RFP development, competitive bidding, and contractor negotiation to secure the right builder on the right terms.',
        body: 'PH&C manages the procurement process end to end, from preparing bid documents to negotiating and executing contracts that protect the owner.',
        children: [
          {
            slug: 'rfp-development',
            label: 'RFP Development',
            description:
              'Preparing clear, comprehensive requests for proposals that set expectations for bidding contractors.',
          },
          {
            slug: 'contractor-bidding-selection',
            label: 'Contractor Bidding / Clarification / Selection',
            description:
              'Managing competitive bidding, clarifying scope, and selecting the right contractor for the project.',
          },
          {
            slug: 'contractor-negotiations-contracts',
            label: 'Contractor Negotiations / Contract Development',
            description:
              "Negotiating terms and developing contracts that protect the owner's interests.",
          },
        ],
      },
    ],
  },
  {
    slug: 'construction-management-services',
    label: 'Construction Management Services',
    description:
      'Hands-on management of every construction activity to keep your project on schedule, on budget, and built to standard.',
    body: `Once a project moves into construction, PH&C manages every activity to ensure a successful completion. Construction begins with a detailed plan, aggressively executed, and adapts to changes as they inevitably arise. Our experienced staff works alongside contractors to anticipate issues and solve problems before they occur, keeping the project moving and the budget intact.

PH&C serves as the link between clients and contractors, giving our clients the expertise to engage contractors on equal footing. We understand the intricacies of complex design and construction issues and develop innovative solutions that work for both owner and contractor, avoiding the excess cost and schedule delays that come from miscommunication or adversarial relationships.`,
    children: [
      {
        slug: 'construction-coordination-supervision',
        label: 'Construction Coordination, Supervision, and Documentation',
        description:
          'On-site coordination, supervision, and thorough documentation of construction progress.',
      },
      {
        slug: 'requests-for-information',
        label: 'Requests for Information / Design Issue Recommendation / Resolution',
        description:
          'Managing RFIs and resolving design issues quickly to keep construction moving.',
      },
      {
        slug: 'government-agency-coordination',
        label: 'Government Agency Coordination',
        description:
          'Coordinating inspections and approvals with the governing agencies throughout construction.',
      },
      {
        slug: 'utility-coordination',
        label: 'Utility Coordination',
        description: 'Coordinating utility providers and connections during construction.',
      },
      {
        slug: 'testing-agency-coordination',
        label: 'Testing Agency Coordination',
        description: 'Scheduling and coordinating materials testing and inspection agencies.',
      },
      {
        slug: 'tenant-delivery-coordination',
        label: 'Tenant Delivery / Construction Coordination',
        description:
          'Coordinating tenant delivery requirements and build-out with the construction schedule.',
      },
      {
        slug: 'project-schedule-management',
        label: 'Project Schedule Management',
        description: 'Actively managing the construction schedule to keep the project on time.',
      },
      {
        slug: 'contract-budget-management',
        label: 'Contract Management / Budget Management',
        description:
          'Administering contracts and managing the budget to control cost through completion.',
      },
      {
        slug: 'bank-billing-inspection-coordination',
        label: 'Bank Billing & Inspection Coordination / Government Agency',
        description:
          'Coordinating bank and agency billing, draws, and inspections throughout construction.',
      },
      {
        slug: 'escrow-letter-of-credit-reductions',
        label: 'Escrow & Letter of Credit Reductions',
        description:
          'Managing escrow and letter-of-credit reductions as project milestones are met.',
      },
    ],
  },
  {
    slug: 'owners-representation',
    label: "Owner's Representation / Project Management Oversight",
    description:
      "Complete program management as your agent and point of control - your real estate construction department without the overhead.",
    body: `PH&C's services include complete program management, or owner's representative, services. Acting as the owner's agent and single point of control, PH&C oversees, manages, and administers the entire project, or any portion you choose to delegate. For owners without an in-house construction team, or for those whose teams are already stretched, we become the trusted authority who ensures the project is delivered exactly as intended.

Our program management consulting functions as if PH&C were the real estate and construction department within your firm. In that capacity, we report, coordinate, oversee, and work within the goals and parameters you define. You set the vision, the budget, and the priorities; we handle the day-to-day management, decision-making, and coordination required to bring them to life.

This model gives you the development, design, and construction expertise you need to achieve your goals, without the overhead costs of in-house personnel.`,
    children: [],
  },
  {
    slug: 'drone-technologies',
    label: 'Drone Technologies',
    description:
      'High-resolution aerial imagery that documents site conditions and progress from a different perspective at every phase.',
    body: `PH&C employs drone aircraft technology at every step of the process to provide insight and a different perspective on a project's overview and possibilities. From the earliest site evaluation through final closeout, aerial imagery reveals context, scale, and detail that cannot be captured from the ground.

Documenting site conditions with high-resolution imagery from beginning to end is an invaluable tool across a wide range of scenarios. The result is greater transparency, better communication, and a comprehensive visual history of your project from the ground up.`,
    children: [],
  },
];

function flatten(nodes, parentSlug) {
  const out = [];
  nodes.forEach((node, index) => {
    out.push({
      slug: node.slug,
      label: node.label,
      description: node.description,
      body: node.body ?? '',
      parent: parentSlug,
      order: index + 1,
    });
    if (node.children?.length) {
      out.push(...flatten(node.children, node.slug));
    }
  });
  return out;
}

async function main() {
  const records = flatten(tree, 'services');
  let created = 0;
  let skipped = 0;

  for (const record of records) {
    const filePath = resolve(TAGS_DIR, `${record.slug}.md`);
    if (existsSync(filePath)) {
      skipped += 1;
      console.log(`skip (exists): ${record.slug}.md`);
      continue;
    }
    const frontmatter = {
      label: record.label,
      description: record.description,
      parent: parentRef(record.parent),
      order: record.order,
    };
    const contents = matter.stringify(record.body ? `\n${record.body}\n` : '', frontmatter);
    await writeFile(filePath, contents);
    created += 1;
    console.log(`create: ${record.slug}.md`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}, total ${records.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
