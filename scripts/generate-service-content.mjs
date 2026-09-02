import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TAGS_DIR = resolve(__dirname, '../src/content/tags');

const FORCE = process.argv.includes('--force');

/**
 * Professional, client-facing starter copy for the individual service tags,
 * written from a PH&C project-manager / principal perspective. Keyed by tag
 * slug. Bodies are only written when a tag's body is currently empty (unless
 * run with --force), so hand-edited content is never clobbered.
 */
const CONTENT = {
  // --- Site Analysis, Property Assessment & Feasibility Studies ---
  'environmental-assessments': `Environmental risk is one of the first questions a lender, buyer, or developer needs answered, and it can make or break a deal. PH&C coordinates Phase I Environmental Site Assessments to review a property's history, prior uses, and surrounding conditions for recognized environmental concerns. When that review flags potential contamination, we manage the Phase II investigation - soil and groundwater sampling and laboratory analysis - to determine whether a problem actually exists and how significant it is.

As your project manager, we make sure the assessment fits your due-diligence timeline, interpret the findings in plain terms, and translate any issues into a remediation scope, budget, and schedule. That gives ownership the information needed to negotiate price, structure escrows, pursue regulatory closure, or walk away from a site whose environmental liabilities outweigh its potential.`,

  'title-survey-reviews': `A clear understanding of what you own - and what others may have a right to - is fundamental before investing in design or construction. PH&C reviews title commitments and boundary, topographic, and ALTA surveys to surface the easements, rights-of-way, deed restrictions, encroachments, and setbacks that shape what can be built on a site.

We coordinate the surveyor and title company, reconcile the survey against the title exceptions, and flag any condition that affects the developable area, access, or utility routing. By resolving these questions early - before design is underway - we help our clients avoid the expensive redesigns and delays that occur when a recorded easement or boundary issue is discovered after the fact.`,

  'highway-access': `For most commercial and retail projects, how vehicles get on and off the site is one of the most consequential and heavily regulated design issues. PH&C evaluates highway access early - identifying the occupancy, driveway, and access permits required by PennDOT, NJDOT, or the local authority, along with the traffic studies, turn lanes, signals, or roadway improvements that may become conditions of approval.

We coordinate the traffic engineer and civil team, engage the governing agency to understand expectations, and fold the resulting requirements and costs into the project budget and schedule. Because access improvements often carry long lead times and significant cost, surfacing them during feasibility protects our clients from approvals that arrive late or budgets that fall short.`,

  'environmental-permitting-requirements': `Environmental permitting can quietly become the critical path of a development if it is not identified early. During feasibility, PH&C determines which environmental approvals a project will require - wetlands and waters of the U.S., stream encroachments, erosion and sediment control, NPDES, and others - based on site conditions and the proposed program.

We coordinate the environmental consultants and engage the reviewing agencies to understand submission requirements, review timelines, and mitigation obligations. Mapping this out up front lets us build a realistic schedule, budget for mitigation and permit fees, and sequence design so that long-lead approvals are started in time - avoiding the costly standstills that occur when permitting is treated as an afterthought.`,

  'land-development-requirements': `Before committing to a site, an owner needs to know what the local ordinances will actually allow and what it will take to get approved. PH&C analyzes the zoning and land development requirements that govern a property - permitted uses, density, height, setbacks, parking, buffers, stormwater, and the subdivision or land development approval process itself.

We identify whether variances, conditional uses, or rezoning will be needed, estimate the approval timeline, and coordinate the design team's response to municipal requirements. This early read lets our clients gauge feasibility accurately, weigh sites against one another, and enter the approval process with a realistic understanding of the time, cost, and risk involved.`,

  'existing-utility-identification': `Adequate utility capacity - or the lack of it - can determine whether a project is viable and what it will cost. PH&C identifies and assesses the existing water, sewer, gas, electric, and telecommunications infrastructure serving a site, confirming location, capacity, and the point and terms of connection.

We coordinate with the utility purveyors and the civil engineer to determine whether existing service is adequate for the proposed program or whether upsizing, extensions, or off-site improvements will be required. Because utility upgrades can be expensive and slow, identifying these needs during feasibility allows us to budget accurately, engage purveyors early, and avoid the schedule surprises that come from discovering capacity constraints late.`,

  'landlord-tenant-lease-requirements': `On leased projects, the lease itself defines the construction scope, cost responsibility, and schedule obligations for both landlord and tenant. PH&C reviews the lease's construction provisions - work letters, delivery conditions, allowances, and critical dates - so our clients understand exactly what they are responsible for building and by when.

We reconcile the lease requirements against the design and budget, flag ambiguities or conflicts before they become disputes, and align the construction schedule with delivery and rent-commencement dates. Whether representing a landlord delivering space or a tenant building out, we make sure the lease obligations are understood and planned for, protecting our clients from the cost and friction of misaligned expectations.`,

  'opinions-of-probable-cost': `Every go/no-go decision ultimately turns on cost, and early cost clarity is one of the most valuable things a project manager can provide. During feasibility, PH&C develops opinions of probable cost and preliminary project budgets that capture hard and soft costs, site work, permitting, and appropriate contingencies for the stage of design.

Drawing on real project experience and current market pricing, we test the concept against the client's proforma and financing assumptions before significant funds are committed. When the numbers don't work, we identify the drivers and explore alternatives; when they do, ownership can proceed with confidence. This disciplined, incremental approach to budgeting keeps our clients from over-investing in projects that were never going to pencil out.`,

  'feasibility-project-schedule': `Time is money in development, and an unrealistic schedule undermines every other assumption in a proforma. During feasibility, PH&C builds a preliminary project schedule that frames the major phases - due diligence, design, entitlements and permitting, procurement, and construction - along with the key milestones and long-lead approvals that drive the timeline.

This early schedule tests whether the project can meet the client's target dates and financing requirements, and it exposes the approvals and dependencies most likely to cause delay. By understanding the realistic timeline before committing funds, our clients can plan financing, coordinate with tenants or lenders, and make informed decisions about whether and how to proceed.`,

  // --- Pre-Construction: Project Planning & Coordination ---
  'initial-program-development': `Great projects begin with a clearly defined program. PH&C works with ownership to translate business goals into a concrete set of requirements - the uses, sizes, adjacencies, quality level, budget targets, and schedule that will guide the entire design and construction effort.

By establishing this program before design begins, we give the architect and engineers a clear brief, reduce the costly redesign driven by shifting requirements, and create the baseline against which we manage scope, cost, and schedule throughout the project. A well-developed program is the foundation that keeps everyone aligned from concept through completion.`,

  'schematic-design-development': `The schematic and design development phases turn the program into a buildable design, and how they are managed determines whether the project stays on budget and on schedule. PH&C guides the architect and engineering consultants through these phases, coordinating the disciplines and keeping design decisions aligned with the program, budget, and schedule.

We review documents at each milestone for completeness, coordination, and cost impact, resolve conflicts between disciplines early, and make sure the owner's priorities are reflected in the evolving design. Active management during design is where the greatest value is created - it is far cheaper to solve a problem on paper than in the field.`,

  'special-construction-design-coordination': `Many projects include specialized systems or unique conditions - complex MEP, refrigeration, process equipment, specialty structures, or demanding tenant requirements - that must be coordinated carefully across the design team. PH&C manages this special coordination so those systems are integrated into the design rather than bolted on later.

We bring the right specialty consultants to the table, coordinate their work with the architect and base-building engineers, and make sure interfaces, clearances, and utility demands are resolved before construction. This attention to specialized scope prevents the field conflicts, change orders, and delays that arise when unique requirements are not fully coordinated during design.`,

  'project-schedule': `A realistic, actively managed schedule is one of the most important tools in pre-construction. PH&C develops the project schedule that ties together design milestones, entitlement and permitting timelines, procurement, and the path to construction, using critical-path logic to identify what truly drives the completion date.

We use the schedule to keep the design team, consultants, and approving agencies moving in coordination, to sequence long-lead decisions and procurement, and to give ownership a clear view of the road ahead. Managing the schedule proactively during pre-construction is how we protect the client's target dates before a single contractor mobilizes.`,

  'proforma-analysis-budgeting': `A project's budget must align with the financial model that justifies it. PH&C develops detailed hard and soft cost budgets and tests them against the client's proforma, so the design being pursued actually supports the returns the project depends on.

We break the budget into its components - site work, building, tenant improvements, soft costs, financing, and contingency - and track it as the design develops, flagging variances before they become problems. By keeping the budget and proforma in sync throughout pre-construction, we help our clients make informed trade-offs and avoid designing a project they cannot finance.`,

  'project-estimating-value-engineering': `Detailed estimating and value engineering are where cost is truly controlled - before procurement, while changes are still inexpensive. PH&C prepares and manages detailed project estimates as the design develops, giving ownership an accurate picture of cost at each milestone rather than a surprise at bid time.

When estimates run ahead of budget, we lead a disciplined value-engineering process - evaluating alternative systems, materials, and methods for cost, quality, schedule, and life-cycle impact - and fold the accepted options into the design before it goes out for pricing. This proactive approach protects the budget without sacrificing the qualities that matter to the project.`,

  'cash-flow-analysis': `Development is as much about the timing of money as the amount. PH&C prepares cash-flow analyses that project when funds will be required across the life of the project, aligning the draw schedule with design, procurement, and construction activities.

This lets ownership and lenders plan financing, coordinate equity and loan draws, and anticipate the periods of greatest capital demand. By modeling cash flow in advance and updating it as the project progresses, we help our clients avoid funding gaps and unnecessary carry costs, and keep the project moving without financial interruption.`,

  'land-development-zoning-approvals': `Securing land development and zoning approvals is often the longest and least predictable phase of a project. PH&C manages this process end to end - guiding the design team through the municipality's subdivision and land development requirements and pursuing the variances, conditional uses, or rezoning a project may need.

We coordinate submissions, represent the project's interests through staff reviews and public hearings, and keep the approval process on the critical path. Our experience navigating municipal processes across the region helps our clients anticipate requirements, respond effectively to conditions, and reach approval as efficiently as the process allows.`,

  'highway-permitting': `Roadway access and improvements are frequently a condition of a project's approval, and the permits involved carry long lead times. PH&C manages highway permitting with PennDOT, NJDOT, and local authorities - highway occupancy permits, driveway and access permits, and the associated traffic studies and roadway improvements.

We coordinate the traffic engineer and civil team, manage submissions and agency review, and integrate the permit requirements and improvement work into the overall budget and schedule. Managing this specialized permitting proactively keeps access - the literal path onto the site - from becoming the bottleneck that holds up construction.`,

  'npdes-permitting': `Stormwater compliance is mandatory on most development sites, and NPDES permitting can gate the start of earthwork. PH&C manages the NPDES permitting process - coordinating the erosion and sediment control and post-construction stormwater management design, and the submissions to the conservation district and DEP.

We keep this permitting on schedule with the broader approval process, coordinate the civil engineer's design with the site plan, and make sure the requirements are understood and budgeted. By managing stormwater permitting proactively, we help our clients avoid the delays and enforcement risks that come from getting compliance wrong.`,

  'environmental-permitting': `When a site touches wetlands, streams, or other regulated resources, environmental permitting becomes a critical-path item. PH&C manages these approvals - stream crossings, wetlands, sewer planning modules, and related environmental permits - coordinating the specialists and agencies involved.

We sequence these long-lead approvals early, coordinate the required studies and mitigation, and integrate the requirements into the design, budget, and schedule. Actively managing environmental permitting keeps these approvals from stalling a project and gives ownership clarity on the time, cost, and obligations involved before construction begins.`,

  'utility-service-coordination': `Delivering adequate water, sewer, gas, electric, phone, and cable service to a site is a coordination effort across multiple purveyors, each with its own process and timeline. PH&C manages this utility coordination - confirming capacity, arranging service, and coordinating the extensions, upgrades, and connections a project requires.

We engage the purveyors early, coordinate their requirements with the civil and building design, and track applications and approvals so service is available when construction needs it. Because utility work often involves long lead times and off-site improvements, proactive coordination protects the project schedule and budget from utility-driven delays.`,

  'building-construction-permits': `No project can proceed without building and construction permits, and the permitting process itself must be managed like any other critical activity. PH&C coordinates the building permit process with the governing authorities - assembling the required submissions, tracking plan review, and resolving reviewer comments to secure permits in time for construction.

We coordinate the design team's responses, anticipate jurisdiction-specific requirements, and keep permitting aligned with the construction schedule. Managing this process actively - rather than reactively - keeps permit issuance from becoming the reason a project can't break ground on time.`,

  'pre-construction-meetings': `The transition from design to construction is a critical handoff, and how it is managed sets the tone for the entire build. PH&C leads pre-construction meetings that bring the owner, design team, and contractors together to align on scope, schedule, logistics, submittals, safety, and communication protocols before work begins.

We use these meetings to confirm everyone shares the same understanding of the project, surface and resolve open issues, and establish the procedures that will govern the construction phase. A well-run pre-construction process prevents the misunderstandings and false starts that otherwise cost time and money once crews are mobilized.`,

  // --- Pre-Construction: Project Contractor Procurement ---
  'rfp-development': `Sound procurement starts with clear, comprehensive bid documents. PH&C develops requests for proposals that define the scope, requirements, schedule, and terms so that every contractor is pricing the same, well-understood project.

By investing in thorough RFP documents, we eliminate the ambiguity that leads to inflated bids, uneven comparisons, and disputes later. Clear expectations up front produce more competitive, more accurate pricing and set the foundation for a successful contractor relationship.`,

  'contractor-bidding-selection': `Selecting the right contractor is about far more than the lowest number. PH&C manages the competitive bidding process - issuing documents, running clarifications, leveling bids, and evaluating contractors on price, qualifications, capacity, and fit for the specific project.

We conduct bid reviews and scope clarifications to ensure proposals are complete and comparable, and we advise ownership on the selection that offers the best overall value and lowest risk. A disciplined, transparent selection process gives our clients confidence that they have the right builder on the right terms.`,

  'contractor-negotiations-contracts': `The contract is where a project's cost, schedule, and risk allocation are locked in, and skilled negotiation protects the owner's interests. PH&C leads contractor negotiations and manages contract development - the price, scope, schedule, terms, and the allocation of risk between owner and contractor.

We negotiate from a position of knowledge, structure agreements that protect ownership while remaining fair and workable, and make sure the contract clearly reflects the agreed scope and expectations. A well-negotiated, well-drafted contract prevents disputes and sets the project up to be delivered on time and on budget.`,

  // --- Construction Management Services ---
  'construction-coordination-supervision': `Once construction begins, consistent on-site coordination and oversight are what keep the work on track. PH&C coordinates and supervises construction activities, monitors progress and quality against the plans and specifications, and maintains thorough documentation of the work as it proceeds.

We serve as the owner's eyes on the project - anticipating conflicts, keeping trades sequenced and coordinated, and ensuring the work is built to the standard the contract requires. Detailed documentation and active supervision protect the owner's interests and provide the record needed to manage issues, billing, and closeout.`,

  'requests-for-information': `Questions and design clarifications are inevitable during construction; managing them quickly is what keeps the project moving. PH&C manages the RFI process - tracking requests, coordinating the design team's responses, and driving timely resolution of the design and constructability issues that arise in the field.

We evaluate proposed resolutions for cost and schedule impact before they are implemented, and we keep RFIs from becoming a source of delay or unwarranted change orders. Proactive management of design issues protects both the schedule and the budget.`,

  'government-agency-coordination': `Construction is subject to ongoing inspections and approvals from building officials and other agencies, and coordinating them is essential to maintaining momentum. PH&C coordinates with the governing agencies throughout construction - scheduling inspections, resolving comments, and keeping approvals aligned with the work in the field.

We manage the relationships and the paperwork so inspections happen when the schedule needs them and so agency requirements are satisfied without rework. Keeping this coordination smooth prevents the stop-work situations and delays that arise when agency approvals fall out of step with construction.`,

  'utility-coordination': `During construction, utility connections and relocations must be coordinated with the purveyors and the construction schedule. PH&C manages this coordination - scheduling service installations, inspections, and connections so utilities are energized and available when the project needs them.

We keep the purveyors, contractors, and schedule aligned, and we manage the long lead times and inspection requirements that utility work often involves. Proactive coordination prevents utility work from becoming the item that holds up occupancy.`,

  'testing-agency-coordination': `Independent testing and inspection verify that critical work meets the specifications, and it must be scheduled to match the pace of construction. PH&C coordinates the materials testing and special inspection agencies - soils, concrete, steel, and other required testing - so inspections occur at the right time without slowing the work.

We manage the testing scope, schedule, and reporting, and we make sure results are addressed promptly and documented for the record. Coordinated testing protects quality and provides the verification needed for agency approvals and closeout.`,

  'tenant-delivery-coordination': `On many projects, delivering space to tenants on time is a contractual obligation with real financial consequences. PH&C coordinates tenant delivery and construction so that base-building work, tenant improvements, and delivery conditions align with the lease and the construction schedule.

We manage the interface between landlord and tenant scopes, coordinate the sequencing of work, and keep delivery milestones on track. Careful coordination protects rent-commencement dates and prevents the disputes that arise when delivery obligations are missed.`,

  'project-schedule-management': `A construction schedule is only valuable if it is actively managed. PH&C manages the project schedule throughout construction - reviewing the contractor's schedule, monitoring progress against milestones, and identifying slippage early enough to act on it.

We hold the team accountable to the schedule, evaluate the impact of changes and delays, and drive recovery when the work falls behind. Active schedule management is how we protect the owner's completion date and the financial commitments that depend on it.`,

  'contract-budget-management': `Controlling cost through completion requires disciplined administration of both the contract and the budget. PH&C manages the construction contract and budget - reviewing and validating payment applications, managing change orders, tracking costs against the budget, and maintaining accurate projections of cost to complete.

We scrutinize change requests for validity and impact, keep contingency under control, and give ownership a clear, current picture of the project's financial status. Rigorous contract and budget management protects the owner from cost overruns and surprises.`,

  'bank-billing-inspection-coordination': `Projects financed by construction loans require careful coordination of draws, inspections, and documentation to keep funding flowing. PH&C manages bank and agency billing and inspection coordination - preparing and supporting payment requisitions, coordinating lender and agency inspections, and providing the documentation each draw requires.

We keep the billing process aligned with actual progress and the lender's requirements so draws are approved without delay. Smooth coordination of financing and inspections keeps the project funded and the contractors paid on schedule.`,

  'escrow-letter-of-credit-reductions': `Development often requires escrows and letters of credit posted with municipalities and lenders, and recovering that capital as work is completed matters to the bottom line. PH&C manages escrow and letter-of-credit reductions - coordinating the inspections, certifications, and documentation required to release funds as improvements are completed and accepted.

We track the requirements, engage the agencies, and pursue reductions promptly so our clients' capital is not tied up longer than necessary. Actively managing these releases returns money to ownership as milestones are met.`,
};

async function main() {
  let written = 0;
  let skipped = 0;
  let missing = 0;

  for (const [slug, body] of Object.entries(CONTENT)) {
    const filePath = resolve(TAGS_DIR, `${slug}.md`);
    if (!existsSync(filePath)) {
      missing += 1;
      console.warn(`missing: ${slug}.md (no such tag)`);
      continue;
    }
    const raw = await readFile(filePath, 'utf-8');
    const parsed = matter(raw);
    if (!FORCE && parsed.content.trim().length > 0) {
      skipped += 1;
      console.log(`skip (has body): ${slug}.md`);
      continue;
    }
    const contents = matter.stringify(`\n${body.trim()}\n`, parsed.data);
    await writeFile(filePath, contents);
    written += 1;
    console.log(`write: ${slug}.md`);
  }

  console.log(
    `\nDone. Wrote ${written}, skipped ${skipped}, missing ${missing}, total ${Object.keys(CONTENT).length}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
