/**
 * "Career-Ready: ICT Basics" interactive course content (first real Learn content).
 * Built from the SAQA Unit Standard 14921 learner workbook ("Demonstrate an understanding of
 * computer systems", FETC: IT Technical Support, NQF L4). Content is the teaching text; the
 * workbook's "answer in the spaces" become interactive questions. English only, like career
 * content (D-032); UI chrome is translated via next-intl. Pure data + answer checking so it is
 * unit-tested (Vitest cannot load .tsx).
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
    };

export interface Block {
  /** A short readable teaching passage. */
  text?: string;
  /** A callout/definition highlighted in the UI. */
  define?: { term: string; meaning: string };
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
  blocks: Block[];
}

/** The SAQA unit standard this course delivers and assesses. */
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

export interface IctCourse {
  slug: string;
  code: string;
  title: string;
  intro: string;
  standard: string;
  unit: UnitStandard;
  /** Name for the one learning unit these sessions make up. */
  learningUnit: string;
  topics: Topic[];
}

export const ICT_BASICS: IctCourse = {
  slug: "cr-ict",
  code: "CR-ICT",
  title: "Career-Ready: ICT Basics",
  intro:
    "Work through the learning unit one session at a time. Read each part, then answer the assessment questions. Your answers are saved on this device as you go.",
  standard: "Based on SAQA Unit Standard 14921 — Demonstrate an understanding of computer systems.",
  learningUnit: "Learning Unit 1 — Understanding computer systems",
  unit: {
    id: "14921",
    title: "Demonstrate an understanding of computer systems",
    nqfLevel: 4,
    credits: 5,
    qualification: "FETC: Information Technology (Technical Support)",
    provider: "Bantsho – Management and Marketing Strategies",
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
            explain: "Midrange computers fall between large mainframes and small microcomputers.",
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
            prompt: "A network where all the nodes share one single cable is a ______ topology.",
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
};

export function totalQuestions(course: IctCourse = ICT_BASICS): number {
  return course.topics.reduce((n, t) => n + t.blocks.filter((b) => b.question).length, 0);
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Pure answer check. `answer` is: option index (choice), boolean, string (blank), or a
 * term→def map (match). Returns whether every part is correct.
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
    case "match": {
      if (typeof answer !== "object") return false;
      const picks = answer as Record<string, string>;
      return q.pairs.every((p) => picks[p.term] === p.def);
    }
  }
}
