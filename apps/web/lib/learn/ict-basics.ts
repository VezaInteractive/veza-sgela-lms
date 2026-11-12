/**
 * "Career-Ready: ICT Basics" interactive course content (first real Learn content).
 * Built from two SAQA learner workbooks for the IT sector:
 *   - Unit Standard 14921 "Demonstrate an understanding of computer systems" (theory + checks).
 *   - Unit Standard 14963 "Describe the management and use of computers in an organisation"
 *     (a workplace project: plan, cost, describe and build a portfolio of evidence).
 * Content is the teaching text; the workbooks' "answer in the spaces" become interactive
 * questions (choice, true/false, fill-the-blank, match, short-answer fields and costing
 * numbers). English only, like career content (D-032); UI chrome is next-intl. Pure data +
 * answer checking so it is unit-tested (Vitest cannot load .tsx).
 */

export type Question =
  | {
      id: string;
      kind: "choice";
      prompt: string;
      options: string[];
      /** index of the correct option */
      answer: number;
      explain: string;
    }
  | {
      id: string;
      kind: "boolean";
      prompt: string;
      answer: boolean;
      explain: string;
    }
  | {
      id: string;
      kind: "blank";
      prompt: string;
      /** accepted answers, compared case-insensitively after trimming */
      accept: string[];
      /** shown in the input as a hint of what to type */
      placeholder: string;
      explain: string;
    }
  | {
      id: string;
      kind: "match";
      prompt: string;
      /** each left term maps to exactly one right definition */
      pairs: { term: string; def: string }[];
      explain: string;
    }
  | {
      id: string;
      kind: "number";
      prompt: string;
      /** correct value; the learner's number must be within `tolerance` (default 0) */
      answer: number;
      tolerance?: number;
      /** unit shown before the field, e.g. "R" */
      prefix?: string;
      placeholder: string;
      explain: string;
    }
  | {
      id: string;
      /** A short-answer field the learner fills in (their own work; no single right answer). */
      kind: "text";
      prompt: string;
      placeholder: string;
      /** completed when at least this many words are entered (default 1) */
      minWords?: number;
      explain: string;
    };

export interface Block {
  /** A short readable teaching passage. */
  text?: string;
  /** A callout/definition highlighted in the UI. */
  define?: { term: string; meaning: string };
  /** A small reference list (e.g. a price list) rendered as rows. */
  list?: { label: string; value: string }[];
  question?: Question;
}

export interface Topic {
  slug: string;
  /** "Session 1", etc. — this session's label in the learning unit. */
  session: string;
  title: string;
  summary: string;
  /** minutes, shown on the card and for progress */
  minutes: number;
  /** id of the inline illustration to show (see ict-illustrations.tsx) */
  illus: string;
  blocks: Block[];
}

/** The SAQA unit standard this learning unit delivers and assesses. */
export interface UnitStandard {
  id: string;
  title: string;
  nqfLevel: number;
  credits: number;
  qualification: string;
  provider: string;
  purpose: string;
  /** Specific outcomes the learner is assessed against. */
  outcomes: string[];
}

export interface LearningUnit {
  /** e.g. "Learning Unit 1 — Understanding computer systems". */
  name: string;
  unit: UnitStandard;
  topics: Topic[];
}

export interface IctCourse {
  slug: string;
  code: string;
  title: string;
  intro: string;
  units: LearningUnit[];
}

const PROVIDER = "Bantsho – Management and Marketing Strategies";

export const ICT_BASICS: IctCourse = {
  slug: "ict-basics",
  code: "CR-ICT",
  title: "Career-Ready: ICT Basics",
  intro:
    "Two learning units from the IT sector workbooks. Work through each session, read the parts, then answer the assessment questions and fill in your own project. Your answers are saved on this device as you go.",
  units: [
    {
      name: "Learning Unit 1 — Understanding computer systems",
      unit: {
        id: "14921",
        title: "Demonstrate an understanding of computer systems",
        nqfLevel: 4,
        credits: 5,
        qualification: "FETC: Information Technology (Technical Support)",
        provider: PROVIDER,
        purpose:
          "This unit gives you conceptual knowledge of computer systems for working in, or entering, Information Systems & Technology. By the end you can describe how computers are configured and the main categories of computer applications.",
        outcomes: [
          "Describe past, present and future computer hardware configurations.",
          "Describe the categories of computer system applications.",
        ],
      },
      topics: [
        {
          slug: "hardware-configurations",
          session: "Session 1",
          title: "Computer hardware configurations",
          summary: "Stand-alone, networked, midrange and client-server computers.",
          minutes: 12,
          illus: "hardware",
          blocks: [
            {
              text: "Computers can be set up on their own or joined together. How they are connected is called their configuration. Knowing the main types helps you choose the right setup for a home, a school or a business.",
            },
            {
              define: {
                term: "Stand-alone computer",
                meaning: "A computer that works on its own, without being connected to a network.",
              },
            },
            {
              define: {
                term: "Networked computer",
                meaning:
                  "A computer that is connected to other computers in a network so they can share files, printers and an internet connection.",
              },
            },
            {
              question: {
                id: "q-standalone",
                kind: "boolean",
                prompt: "A stand-alone computer must be connected to a network to work.",
                answer: false,
                explain:
                  "A stand-alone computer works on its own. A networked one is joined to others.",
              },
            },
            {
              define: {
                term: "Midrange computer",
                meaning:
                  "A class of computer that sits between large mainframe computers and small microcomputers (desktops). Businesses use them to serve many users at once.",
              },
            },
            {
              define: {
                term: "Client–server",
                meaning:
                  "A setup where client computers request a service and a server provides it. The client starts the conversation; the server waits for requests and answers them.",
              },
            },
            {
              text: "Everyday examples of client–server are email, the World Wide Web and network printing: your device (the client) asks a server for the page, message or print job.",
            },
            {
              question: {
                id: "q-midrange",
                kind: "choice",
                prompt: "Which type of computer sits between a mainframe and a microcomputer?",
                options: ["Stand-alone computer", "Midrange computer", "Client", "Tablet"],
                answer: 1,
                explain:
                  "Midrange computers fall between large mainframes and small microcomputers.",
              },
            },
            {
              question: {
                id: "q-clientserver-blank",
                kind: "blank",
                prompt:
                  "In a ______–server setup, this side requests a service and starts the conversation.",
                accept: ["client", "a client", "the client"],
                placeholder: "one word",
                explain: "The client requests; the server provides. Clients initiate the session.",
              },
            },
            {
              question: {
                id: "q-hardware-match",
                kind: "match",
                prompt: "Match each setup to its description.",
                pairs: [
                  { term: "Stand-alone", def: "Works on its own, not connected to a network" },
                  { term: "Networked", def: "Connected to other computers to share resources" },
                  { term: "Midrange", def: "Between a mainframe and a microcomputer" },
                  { term: "Client–server", def: "A client requests and a server provides" },
                ],
                explain:
                  "Stand-alone is alone; networked shares; midrange is in the middle; client–server splits request and reply.",
              },
            },
          ],
        },
        {
          slug: "network-topologies",
          session: "Session 2",
          title: "Network topologies",
          summary: "How computers are wired together: bus, ring and star.",
          minutes: 12,
          illus: "topology",
          blocks: [
            {
              text: "A topology is the shape of a network — how the computers (nodes) are joined by cable. The three classic shapes are bus, ring and star.",
            },
            {
              define: {
                term: "Bus topology",
                meaning:
                  "All nodes connect to one single cable (the bus). Simple and cheap, but if the main cable fails the whole network goes down.",
              },
            },
            {
              define: {
                term: "Ring topology",
                meaning:
                  "Each device connects to two others so the data path forms a circle. Data travels around the ring from device to device.",
              },
            },
            {
              define: {
                term: "Star topology",
                meaning:
                  "Every node connects on its own cable to one central point, like a hub or switch. It uses more cable, but if one cable fails only that one node is lost.",
              },
            },
            {
              question: {
                id: "q-topology-central",
                kind: "choice",
                prompt: "Which topology connects every computer to one central hub or switch?",
                options: ["Bus", "Ring", "Star", "Mesh"],
                answer: 2,
                explain: "In a star, each node has its own cable to a central hub or switch.",
              },
            },
            {
              question: {
                id: "q-topology-bus-blank",
                kind: "blank",
                prompt:
                  "A network where all the nodes share one single cable is a ______ topology.",
                accept: ["bus"],
                placeholder: "one word",
                explain: "A bus topology joins every node to a single shared cable.",
              },
            },
            {
              question: {
                id: "q-topology-star-bool",
                kind: "boolean",
                prompt: "A star topology uses less cable than a bus topology.",
                answer: false,
                explain:
                  "A star uses more cable (one per node), but a single cable fault only drops one node.",
              },
            },
            {
              question: {
                id: "q-topology-match",
                kind: "match",
                prompt: "Match each topology to its shape.",
                pairs: [
                  { term: "Bus", def: "All nodes on one shared cable" },
                  { term: "Ring", def: "Each device links to two others, forming a circle" },
                  { term: "Star", def: "Each node has its own cable to a central hub" },
                ],
                explain: "Bus = one line, ring = a circle, star = spokes to a hub.",
              },
            },
          ],
        },
        {
          slug: "application-categories",
          session: "Session 3",
          title: "Types of computer applications",
          summary: "Embedded, desktop, web, web services and console programs.",
          minutes: 12,
          illus: "apps",
          blocks: [
            {
              text: "An application (app) is software that does a job for the user. Apps come in several categories depending on where and how they run.",
            },
            {
              define: {
                term: "Embedded system",
                meaning:
                  "A small program built into a chip inside a device — like the software inside a phone, a microwave or a car — that does one specific job.",
              },
            },
            {
              define: {
                term: "Desktop (Windows) application",
                meaning:
                  "A program you install and run on a computer, such as a word processor. Also called a desktop application.",
              },
            },
            {
              define: {
                term: "Web application",
                meaning:
                  "A set of web pages hosted on a web server and used in a browser. A website is also a web application.",
              },
            },
            {
              define: {
                term: "Web service",
                meaning:
                  "A web application that provides a service to other applications over the internet, rather than to a person directly.",
              },
            },
            {
              define: {
                term: "Console application",
                meaning:
                  "A light program that runs inside a command prompt (text window). Often used to test ideas quickly.",
              },
            },
            {
              question: {
                id: "q-app-console",
                kind: "choice",
                prompt: "Which type of application runs inside a command prompt (a text window)?",
                options: [
                  "Web application",
                  "Console application",
                  "Embedded system",
                  "Desktop application",
                ],
                answer: 1,
                explain:
                  "Console applications run in the command prompt and are often used for testing.",
              },
            },
            {
              question: {
                id: "q-app-web-blank",
                kind: "blank",
                prompt: "A website is also called a web ____________.",
                accept: ["application", "app"],
                placeholder: "a word",
                explain: "A website is a web application — pages hosted on a web server.",
              },
            },
            {
              question: {
                id: "q-app-webservice-bool",
                kind: "boolean",
                prompt: "A web service provides a service to other applications over the internet.",
                answer: true,
                explain:
                  "Web services serve other applications (machine to machine), not a person directly.",
              },
            },
            {
              question: {
                id: "q-app-match",
                kind: "match",
                prompt: "Match each application type to its description.",
                pairs: [
                  { term: "Embedded", def: "Built into a chip inside a device" },
                  { term: "Desktop", def: "Installed and run on a computer" },
                  { term: "Web", def: "Pages used in a browser from a web server" },
                  { term: "Console", def: "Runs in a command prompt text window" },
                ],
                explain:
                  "Embedded is inside a device; desktop runs on a PC; web runs in a browser; console runs in text.",
              },
            },
          ],
        },
        {
          slug: "environments-and-information-systems",
          session: "Session 4",
          title: "Environments & information systems",
          summary: "Development vs production environments, and what an information system is.",
          minutes: 10,
          illus: "environments",
          blocks: [
            {
              text: "The same software often runs in more than one place. A team usually has a development environment to build in, a staging (testing) environment to try things safely, and a production environment that real users use.",
            },
            {
              define: {
                term: "Environment properties",
                meaning:
                  "Settings that differ per environment, such as the database details, file paths and domain names. The code stays the same; these settings change.",
              },
            },
            {
              question: {
                id: "q-env-property",
                kind: "choice",
                prompt:
                  "Which of these is an environment property that changes between development and production?",
                options: [
                  "The company logo",
                  "The database connection details",
                  "The user's name",
                  "The keyboard layout",
                ],
                answer: 1,
                explain: "Database details, file paths and domain names differ per environment.",
              },
            },
            {
              define: {
                term: "Information system",
                meaning:
                  "A set of interrelated computer parts that collect, process and store data and provide useful output for business purposes.",
              },
            },
            {
              question: {
                id: "q-infosys-blank",
                kind: "blank",
                prompt:
                  "A set of parts that collects, processes and stores data and gives output for business is an information ____________.",
                accept: ["system"],
                placeholder: "one word",
                explain: "That is the definition of an information system.",
              },
            },
            {
              question: {
                id: "q-env-count-bool",
                kind: "boolean",
                prompt:
                  "Development, staging and production are three different environments the same app can run in.",
                answer: true,
                explain:
                  "Teams build in development, test in staging and serve real users in production.",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Learning Unit 2 — Computers in an organisation (project)",
      unit: {
        id: "14963",
        title: "Describe the management and use of computers in an organisation",
        nqfLevel: 4,
        credits: 5,
        qualification: "FETC: Information Technology (Technical Support)",
        provider: PROVIDER,
        purpose:
          "This unit is a short workplace project. You choose a real organisation, plan and carry out an investigation of how it uses computers, work out some costs, and gather your evidence. Fill in your own answers as you go — this is your portfolio of evidence.",
        outcomes: [
          "Plan an investigation of the use of computer technology in an organisation.",
          "Conduct the investigation and describe how the organisation uses computers.",
          "Work out the cost of a computer solution for the organisation.",
        ],
      },
      topics: [
        {
          slug: "plan-investigation",
          session: "Session 1",
          title: "Plan your investigation",
          summary: "Choose an organisation and plan what you will find out.",
          minutes: 15,
          illus: "organisation",
          blocks: [
            {
              text: "For this project you pick one real organisation that agrees to be investigated — a shop, a clinic, a school, a spaza or a family business. You then plan what you want to learn about how they use computers, and who your contact person is.",
            },
            {
              define: {
                term: "Investigation plan",
                meaning:
                  "A short plan that names the organisation, says what you will investigate, names the contact person who agreed, and sets dates (milestones) for when you will report back.",
              },
            },
            {
              question: {
                id: "q14963-org-name",
                kind: "text",
                prompt: "Which organisation will you investigate? (Example: Deli Cakes)",
                placeholder: "Name of the organisation",
                explain: "Good — you have chosen the organisation for your project.",
              },
            },
            {
              question: {
                id: "q14963-contact",
                kind: "text",
                prompt:
                  "Who is your contact person there, and have they agreed? Write their name and role.",
                placeholder: "e.g. Mr Dlamini, manager — agreed",
                minWords: 2,
                explain:
                  "The plan must be accepted by a primary contact person from the organisation.",
              },
            },
            {
              question: {
                id: "q14963-plan-what",
                kind: "text",
                prompt:
                  "What will you investigate about their computer use? List two or three things.",
                placeholder: "e.g. how many PCs, what software, their internet",
                minWords: 3,
                explain:
                  "A clear plan lists what you want to find out and when you will report progress.",
              },
            },
            {
              question: {
                id: "q14963-agreed-bool",
                kind: "boolean",
                prompt:
                  "Your plan must be accepted by a contact person at the organisation before you start.",
                answer: true,
                explain: "Yes — the organisation must agree to the investigation first.",
              },
            },
          ],
        },
        {
          slug: "cost-a-computer",
          session: "Session 2",
          title: "Cost a computer",
          summary: "Add up the parts and price a solution for the organisation.",
          minutes: 15,
          illus: "costing",
          blocks: [
            {
              text: "Part of describing computer use is knowing what the hardware costs. Below is a parts list the organisation was quoted. Add the prices to find the cost of one computer.",
            },
            {
              list: [
                { label: "Pentium 4 processor", value: "R1 199" },
                { label: "100 GB hard drive", value: "R170" },
                { label: "2 GB RAM", value: "R240" },
                { label: "Sound card", value: "R180" },
                { label: "17-inch monitor", value: "R450" },
                { label: "Graphics card", value: "R500" },
                { label: "USB mouse", value: "R110" },
                { label: "Keyboard", value: "R140" },
                { label: "ADSL line", value: "R300" },
              ],
            },
            {
              text: "Add the whole list: Pentium 4 + hard drive + RAM + sound card + monitor + graphics card + mouse + keyboard + ADSL line.",
            },
            {
              question: {
                id: "q14963-one-pc",
                kind: "number",
                prompt: "What does ONE computer cost in total?",
                answer: 4038,
                prefix: "R",
                placeholder: "e.g. 4038",
                explain: "R1 199 + R170 + R240 + R180 + R450 + R500 + R110 + R140 + R300 = R4 038.",
              },
            },
            {
              text: "The organisation wants ten of these computers.",
            },
            {
              question: {
                id: "q14963-ten-pc",
                kind: "number",
                prompt: "At R4 038 each, what do TEN computers cost?",
                answer: 40380,
                prefix: "R",
                placeholder: "e.g. 40380",
                explain: "R4 038 × 10 = R40 380.",
              },
            },
            {
              question: {
                id: "q14963-discount-bool",
                kind: "boolean",
                prompt:
                  "The supplier gives a 10% discount for buying ten computers. A discount makes the total lower.",
                answer: true,
                explain: "A discount reduces the price — buying in bulk is cheaper per unit.",
              },
            },
          ],
        },
        {
          slug: "describe-and-internet",
          session: "Session 3",
          title: "Describe the computer use",
          summary: "Write up how the organisation uses computers and the internet.",
          minutes: 12,
          illus: "internet",
          blocks: [
            {
              text: "Now describe, in your own words, how your chosen organisation uses computers day to day — for example tills, stock, email, printing or keeping records.",
            },
            {
              question: {
                id: "q14963-describe-use",
                kind: "text",
                prompt: "How does your organisation use computers? Write two or three sentences.",
                placeholder: "They use computers for...",
                minWords: 6,
                explain:
                  "This is the heart of the unit: describing the use of computer technology in the organisation.",
              },
            },
            {
              define: {
                term: "ADSL vs ISDN internet",
                meaning:
                  "Two ways to connect an office to the internet. ADSL takes about 6 weeks to install and costs around R850 per month. ISDN takes less time to install but is charged per hour. The organisation must weigh cost against speed of install.",
              },
            },
            {
              question: {
                id: "q14963-adsl-choice",
                kind: "choice",
                prompt:
                  "From the notes, which option takes about 6 weeks to install and costs around R850 per month?",
                options: ["ISDN", "ADSL", "A USB mouse", "A graphics card"],
                answer: 1,
                explain: "ADSL takes about 6 weeks to install and costs around R850 per month.",
              },
            },
            {
              question: {
                id: "q14963-improve",
                kind: "text",
                prompt: "Suggest one way the organisation could use computers better.",
                placeholder: "e.g. back up files to the cloud",
                minWords: 3,
                explain: "A good investigation ends with a useful recommendation.",
              },
            },
          ],
        },
        {
          slug: "portfolio-of-evidence",
          session: "Session 4",
          title: "Your Portfolio of Evidence",
          summary: "Check off the evidence you have gathered for assessment.",
          minutes: 10,
          illus: "portfolio",
          blocks: [
            {
              text: "Your Portfolio of Evidence (PoE) is the proof that you did the project. For this unit it should contain your investigation plan, your interview or visit notes, the costing, and your written description of how the organisation uses computers.",
            },
            {
              define: {
                term: "Portfolio of Evidence (PoE)",
                meaning:
                  "The collection of your completed work — plan, notes, costing and description — that an assessor reviews to decide you are competent.",
              },
            },
            {
              question: {
                id: "q14963-poe-plan",
                kind: "boolean",
                prompt:
                  "My portfolio includes my investigation plan (organisation, contact, what I investigated).",
                answer: true,
                explain: "The plan is the first piece of evidence in your portfolio.",
              },
            },
            {
              question: {
                id: "q14963-poe-costing",
                kind: "boolean",
                prompt: "My portfolio includes my costing (one computer and ten computers).",
                answer: true,
                explain: "The costing shows you can price a computer solution.",
              },
            },
            {
              question: {
                id: "q14963-poe-reflection",
                kind: "text",
                prompt: "In one sentence, what did you learn from investigating this organisation?",
                placeholder: "I learned that...",
                minWords: 4,
                explain: "A short reflection completes your portfolio of evidence.",
              },
            },
          ],
        },
      ],
    },
  ],
};

/** All sessions across every unit, in order. */
export function allTopics(course: IctCourse = ICT_BASICS): Topic[] {
  return course.units.flatMap((u) => u.topics);
}

export function totalQuestions(course: IctCourse = ICT_BASICS): number {
  return allTopics(course).reduce((n, t) => n + t.blocks.filter((b) => b.question).length, 0);
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Pure answer check. `answer` is: option index (choice), boolean, string (blank), number
 * (number), a term→def map (match), or the entered string (text). For a text field "correct"
 * means the learner wrote enough words (their own work), so the portfolio can be marked done.
 */
export function isCorrect(
  q: Question,
  answer: number | boolean | string | Record<string, string> | null | undefined,
): boolean {
  if (answer === null || answer === undefined) return false;
  switch (q.kind) {
    case "choice":
      return answer === q.answer;
    case "boolean":
      return answer === q.answer;
    case "blank":
      return typeof answer === "string" && q.accept.some((a) => norm(a) === norm(answer));
    case "number": {
      const n = typeof answer === "number" ? answer : Number(String(answer).replace(/[\s,]/g, ""));
      return Number.isFinite(n) && Math.abs(n - q.answer) <= (q.tolerance ?? 0);
    }
    case "text": {
      if (typeof answer !== "string") return false;
      const words = answer.trim().split(/\s+/).filter(Boolean);
      return words.length >= (q.minWords ?? 1);
    }
    case "match": {
      if (typeof answer !== "object") return false;
      const picks = answer as Record<string, string>;
      return q.pairs.every((p) => picks[p.term] === p.def);
    }
  }
}
