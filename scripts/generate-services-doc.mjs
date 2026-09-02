import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  Document,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../docs/PHC-Services-Content.docx');

const BRAND = 'PH&C';

/**
 * Polished, client-facing marketing copy for each PH&C service. Source wording
 * preserved in meaning and specifics; grammar/typos corrected and prose
 * tightened. Every listed capability is retained.
 */
const services = [
  {
    title: 'Pre-Construction Services',
    paragraphs: [
      'A successful project begins long before ground is broken. It requires meticulous planning and the careful coordination of many disciplines. PH&C brings the expertise and the broad, experienced perspective needed to manage the design, entitlement, constructability, and cost processes that set a project up to succeed.',
      'PH&C delivers value during pre-construction by focusing on several key areas. First, we help clients assemble the right team for their specific project, drawing on a large network of experienced consultants across every discipline. Next, by proactively guiding the design and entitlement process against critical-path milestones, we reduce delays and save valuable time and money. At the same time, we gather cost feedback on critical design decisions and fold value-engineering suggestions into the design before procurement begins, managing cost and expectations before construction starts.',
      'PH&C guides clients through the demanding process of design and land development, including:',
    ],
    sections: [
      {
        heading: 'Project Planning & Coordination',
        bullets: [
          'Initial Program Development',
          'Schematic Design and Design Development Documents',
          'Special Construction Design Coordination',
          'Project Schedule',
          'Proforma Analysis / Hard & Soft Cost Budgeting',
          'Detailed Project Estimating and Value Engineering',
          'Cash Flow Analysis',
          'Land Development & Zoning Approvals',
          'Highway Permitting',
          'NPDES Permitting',
          'Other Environmental: Stream Crossing / Sewer Modules',
          'Utility Service Coordination: Water / Sewer / Gas / Phone / Electric / Cable',
          'Building / Construction Permits',
          'Pre-Construction Meetings',
        ],
      },
      {
        heading: 'Project Contractor Procurement',
        bullets: [
          'RFP Development',
          'Contractor Bidding / Clarification / Selection',
          'Contractor Negotiations / Contract Development',
        ],
      },
    ],
  },
  {
    title: 'Construction Management Services',
    paragraphs: [
      'Once a project moves into construction, PH&C manages every activity to ensure a successful completion. Construction begins with a detailed plan, aggressively executed, and adapts to changes as they arise. Our experienced staff works alongside contractors to anticipate issues and solve problems before they occur.',
      'PH&C serves as the link between clients and contractors, giving our clients the expertise to engage contractors on equal footing. We understand the intricacies of complex design and construction issues and develop innovative solutions that work for both owner and contractor, avoiding excess cost and schedule delays.',
      'Detailed construction services include:',
    ],
    sections: [
      {
        bullets: [
          'Construction Coordination, Supervision, and Documentation',
          'Requests for Information / Design Issue Recommendation / Resolution',
          'Government Agency Coordination',
          'Utility Coordination',
          'Testing Agency Coordination',
          'Tenant Delivery / Construction Coordination',
          'Project Schedule Management',
          'Contract Management / Budget Management',
          'Bank Billing & Inspection Coordination / Government Agency',
          'Escrow & Letter of Credit Reductions',
        ],
      },
    ],
  },
  {
    title: "Owner's Representation / Project Management Oversight",
    paragraphs: [
      "PH&C's services include complete program management, or owner's representative, services. Acting as the owner's agent and single point of control, PH&C oversees, manages, and administers the entire project, or any portion you choose to delegate.",
      'Our program management consulting functions as if PH&C were the real estate and construction department within your firm. In that capacity, we report, coordinate, oversee, and work within the goals and parameters you define. PH&C provides the development, design, and construction expertise you need to achieve your goals, without the overhead costs of in-house personnel.',
    ],
    sections: [],
  },
  {
    title: 'Drone Technologies',
    paragraphs: [
      'PH&C employs drone aircraft technology at every step of the process to provide insight and a different perspective on a project\u2019s overview and possibilities. Documenting site conditions with high-resolution imagery from beginning to end is an invaluable tool across a wide range of scenarios.',
    ],
    sections: [],
  },
];

const NUMBERING_REF = 'phc-bullets';

function buildChildren() {
  const children = [];

  children.push(
    new Paragraph({
      text: `${BRAND} Services`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
    })
  );

  for (const service of services) {
    children.push(
      new Paragraph({
        text: service.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 160 },
      })
    );

    for (const paragraph of service.paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun(paragraph)],
          spacing: { after: 160 },
        })
      );
    }

    for (const section of service.sections) {
      if (section.heading) {
        children.push(
          new Paragraph({
            text: section.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          })
        );
      }
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            children: [new TextRun(bullet)],
            numbering: { reference: NUMBERING_REF, level: 0 },
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  return children;
}

async function main() {
  const doc = new Document({
    creator: BRAND,
    title: `${BRAND} Services`,
    description: `${BRAND} services content draft`,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: NUMBERING_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 480, hanging: 240 } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `${BRAND} Services`, color: '888888', size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: buildChildren(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, buffer);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
