/**
 * All site copy lives here. Sourced from Karthik's real public profile
 * (LinkedIn / GitHub) — real roles, dates, certifications and shipped work.
 * Public-safe: no private keys, infra, addresses or client secrets.
 */

export const profile = {
  name: "Karthik",
  fullName: "Karthikeyan Govindan",
  role: "Blockchain Engineer & Security Researcher",
  location: "Kolkata, India",
  available: true,
  github: "https://github.com/karthikeh02",
  linkedin: "https://www.linkedin.com/in/karthikeyan-govindan/",
  headlineTop: "BLOCKCHAIN",
  headlineBottom: "ENGINEER",
  // Hero hook — one sharp line that earns the scroll.
  intro:
    "I'm a smart-contract auditor and full-stack web3 engineer — I build DeFi, ZK and multi-chain systems, then try to break them before anyone else can.",
  cta: {
    primary: { label: "See the work", href: "#work" },
    secondary: { label: "Start a project", href: "#contact" },
  },
  // Real tech, surfaced in the marquee.
  keywords: [
    "Smart Contract Auditing",
    "Solidity",
    "Foundry",
    "DeFi",
    "ZK Proofs",
    "Noir",
    "Ethereum",
    "Multi-chain",
    "Security Research",
    "Web3",
    "Cryptography",
    "EVM",
  ],
} as const;

// Real numerals — the gradient-neon slot should carry weight.
export const stats = [
  { value: "2.5+ yrs", label: "Shipping web3, contract to client", sub: "since 2024" },
  { value: "8", label: "Certifications earned", sub: "Cyfrin · IBM · Binance · KBA" },
  { value: "Mainnet", label: "Swap protocol live on Ethereum", sub: "designed + deployed" },
  { value: "5+", label: "Chains worked across", sub: "ETH · BSC · TRON · Solana · AVAX" },
] as const;

export const about = {
  eyebrow: "Who I am",
  heading: "I make software that doesn't ask you to trust it.",
  body: [
    "I'm a blockchain engineer and smart-contract auditor. I spend half my time building DeFi, ZK and multi-chain systems, and the other half trying to break them before an attacker does — the second half is what keeps the first half honest.",
    "I came into web3 the hard way: a B.Com and a CMA, then self-taught through Cyfrin, the Kerala Blockchain Academy and a lot of mainnet — and turned it into real roles. Blockchain developer, then full-stack, now Senior Blockchain Developer at Zan Services.",
    "Along the way I've shipped a swap protocol to Ethereum mainnet, built a multi-chain wallet with encrypted in-app calls, written zero-knowledge circuits in Noir, and found critical bugs in other people's contracts — including a slippage exploit that could drain half a pool.",
    "Onchain there's no undo and nowhere to hide a bug, so I care about the unglamorous parts — threat-modelling, testing, and reasoning carefully about every way a thing can fail. That's the whole job.",
  ],
} as const;

export const manifesto = {
  lead: "Most software asks you to trust it.",
  punch: "I build the kind you never have to.",
} as const;

export type Capability = {
  id: string;
  title: string;
  blurb: string;
  glyph: "security" | "contract" | "defi" | "crypto" | "network" | "stack";
};

export const capabilities: Capability[] = [
  {
    id: "audit",
    title: "Smart Contract Auditing",
    blurb:
      "I read contracts the way an attacker would — hunting replay bugs, broken approvals, slippage exploits and the assumptions that quietly break under real money. Then I write the fix, not just the finding.",
    glyph: "security",
  },
  {
    id: "solidity",
    title: "Solidity Engineering",
    blurb:
      "Production Solidity for tokens, governance, swaps and upgradeable proxies — designed safety-first and tested with Foundry and Hardhat, because once it's deployed it's public and permanent.",
    glyph: "contract",
  },
  {
    id: "defi",
    title: "DeFi & Protocols",
    blurb:
      "Swap protocols, AMMs and DeFi mechanics — the contracts, the economics and the cross-chain bridging — built to hold real value and behave under adversarial conditions, not just in the demo.",
    glyph: "defi",
  },
  {
    id: "zk",
    title: "ZK & Cryptography",
    blurb:
      "Zero-knowledge circuits in Noir for privacy-preserving transactions, plus end-to-end encryption and key management — so the right people can verify, and absolutely nobody else can read.",
    glyph: "crypto",
  },
  {
    id: "multichain",
    title: "Multi-chain Web3",
    blurb:
      "Comfortable across EVM and beyond — Ethereum, BSC, TRON, Solana and Avalanche — including multi-chain wallets, swaps and bridging where the principles travel but the footguns don't.",
    glyph: "network",
  },
  {
    id: "fullstack",
    title: "Full-stack dApps",
    blurb:
      "From the contract to the wallet to the interface — Solidity, Ethers/web3.js, real-time encrypted calls and AWS infra. One person who can reason about the cryptography and still sweat the pixels.",
    glyph: "stack",
  },
];

export type Project = {
  index: string;
  name: string;
  status: "Live" | "In development" | "Shipped" | "Ongoing";
  tagline: string;
  description: string;
  role?: string;
  longline?: string;
  highlights: string[];
  accent: "cyan" | "violet" | "magenta";
  motif: "audit" | "engine" | "messages" | "lab";
};

export const projects: Project[] = [
  {
    index: "01",
    name: "Smart Contract Auditing",
    status: "Ongoing",
    tagline: "I break contracts before attackers do.",
    description:
      "Security research and auditing of Solidity contracts — DeFi, swaps, tokens. Real finds: a missing chainId in an ERC-20 meta-transaction domain separator (a replay risk), broken relayer authorization, and a slippage exploit on a Uniswap-fork that could drain 50%+ of a pool in a migration by calling the contract directly past the UI's protections.",
    role: "What I own: the full audit — threat-model, working exploit, and the fix.",
    longline:
      "Finding the bug is the easy half. The job is being certain there isn't a second one.",
    highlights: [
      "Critical vulnerabilities found",
      "ERC-20 replay & approval bugs",
      "Slippage / liquidity-drain exploits",
      "DeFi & swap audits",
      "Foundry · Hardhat",
      "First paid bug — Oct 2025",
    ],
    accent: "magenta",
    motif: "audit",
  },
  {
    index: "02",
    name: "DeFi Swap Protocol",
    status: "Live",
    tagline: "A swap protocol, live on Ethereum mainnet.",
    description:
      "Designed and shipped a decentralized swap protocol to Ethereum mainnet — the contracts, the swap logic and the safety rails. The kind of system where a single wrong assumption is a public, permanent, on-chain mistake, so it gets audited (by me) before it ships.",
    role: "What I own: the contracts, the swap math, and the mainnet deploy.",
    longline:
      "Mainnet is the only test environment that tells the truth.",
    highlights: [
      "Live on Ethereum mainnet",
      "AMM / swap logic",
      "Gas-aware execution",
      "Self-audited",
      "Solidity · Foundry",
    ],
    accent: "violet",
    motif: "engine",
  },
  {
    index: "03",
    name: "De Messenger",
    status: "In development",
    tagline: "A messenger nobody can eavesdrop on. Not even me.",
    description:
      "A fully decentralized, end-to-end encrypted messenger built at Zan Services. No central company holds your messages and no server can read them — only you and the person you're talking to. Identity is a key you own, with encrypted real-time chat and calls over a peer-to-peer layer.",
    role: "What I own: the cryptography, the protocol, and the client.",
    longline:
      "Privacy that doesn't depend on a promise in a terms-of-service page — it's enforced by math.",
    highlights: [
      "End-to-end encrypted",
      "No server can read you",
      "Self-custodial identity",
      "Encrypted real-time calls",
      "Peer-to-peer delivery",
    ],
    accent: "cyan",
    motif: "messages",
  },
  {
    index: "04",
    name: "Shards of Avaxia",
    status: "In development",
    tagline: "An onchain card-battler on Avalanche.",
    description:
      "A Web3 NFT card / battle game on Avalanche (Fuji testnet) — cards are NFTs you actually own, and battles settle onchain. A playground for getting onchain game economies and ownership right while keeping it fun.",
    role: "What I own: the game contracts and the onchain economy.",
    highlights: [
      "NFT cards you own",
      "Onchain battles",
      "Avalanche (Fuji)",
      "Game economy design",
    ],
    accent: "violet",
    motif: "lab",
  },
];

export type JourneyEntry = {
  period: string;
  title: string;
  note: string;
  accent: "cyan" | "violet" | "magenta";
};

export const journey = {
  eyebrow: "The work so far",
  heading: "A real trajectory.",
  entries: [
    {
      period: "Nov 2025 — Now",
      title: "Senior Blockchain Developer · Zan Services",
      note: "Building privacy-first, end-to-end encrypted web3 products — leading smart-contract and full-stack work in Kolkata.",
      accent: "cyan",
    },
    {
      period: "2025",
      title: "Full-stack Blockchain Developer · Tritrix Technologies",
      note: "Upgradeable proxy contracts, a multi-chain wallet (ETH / BSC / TRON), in-app E2EE chat and encrypted WebRTC calls, and Push Protocol notifications — backed by AWS.",
      accent: "violet",
    },
    {
      period: "2024 — 25",
      title: "Blockchain Developer · Tritrix Technologies",
      note: "Zero-knowledge proofs for private transactions, smart-contract audits, Solidity for tokens & governance, and cross-chain swaps & bridging.",
      accent: "magenta",
    },
    {
      period: "2024",
      title: "Freelance Blockchain Developer & Auditor",
      note: "Audited DeFi and swap contracts on Ethereum — including my first paid vulnerability find — and built fast for early clients.",
      accent: "cyan",
    },
    {
      period: "2020 — 24",
      title: "From commerce to code",
      note: "Finished a B.Com and CMA, then went all-in on web3 — self-taught through Cyfrin Updraft, the Kerala Blockchain Academy and a lot of hands-on mainnet.",
      accent: "violet",
    },
  ] as JourneyEntry[],
} as const;

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  accent: "cyan" | "violet" | "magenta";
};

export const certifications = {
  eyebrow: "Credentials",
  heading: "Earned, not assumed.",
  body:
    "A standing habit of learning the hard parts properly — from ZK circuits to supply-chain blockchain to regulatory frameworks.",
  items: [
    { name: "Claude Code in Action", issuer: "Anthropic", date: "Mar 2026", accent: "cyan" },
    { name: "BNB Chain Developer Specialization", issuer: "Binance Academy", date: "Jan 2026", accent: "violet" },
    { name: "IoT Blockchain Network for a Supply Chain", issuer: "IBM · Cognitive Class", date: "Dec 2025", accent: "magenta" },
    { name: "Regulatory Risks & Frameworks", issuer: "Binance Academy", date: "Nov 2025", accent: "violet" },
    { name: "Noir Programming & ZK Circuits", issuer: "Cyfrin Updraft", date: "Oct 2025", accent: "cyan" },
    { name: "Certified Ethereum Blockchain Developer", issuer: "Udemy", date: "2024", accent: "magenta" },
    { name: "Hyperledger Fabric Fundamentals", issuer: "Kerala Blockchain Academy", date: "2024", accent: "violet" },
    { name: "Blockchain Basics", issuer: "Great Learning", date: "2024", accent: "cyan" },
  ] as Certification[],
} as const;

export type SkillGroup = { label: string; items: string[] };

export const skills = {
  eyebrow: "The toolkit",
  heading: "What I build with.",
  groups: [
    { label: "Languages", items: ["Solidity", "JavaScript", "Noir"] },
    { label: "Security", items: ["Auditing", "Vulnerability Research", "Threat Modelling", "Exploit Dev"] },
    { label: "Frameworks & Tools", items: ["Foundry", "Hardhat", "Ethers.js", "web3.js", "Trust Wallet Core", "Git"] },
    { label: "ZK & Crypto", items: ["ZK Circuits", "Public-key Crypto", "E2E Encryption"] },
    { label: "Chains", items: ["Ethereum", "BSC", "TRON", "Solana", "Avalanche", "Hyperledger Fabric"] },
    { label: "Infra", items: ["AWS (EC2 · S3 · RDS)", "MongoDB", "PostgreSQL", "WebRTC", "Push Protocol"] },
  ] as SkillGroup[],
} as const;

export const approach = {
  eyebrow: "How I work",
  heading: "Trustless by default, careful by habit.",
  steps: [
    {
      no: "01",
      title: "Threat-model",
      text: "Before writing a line, I ask how it gets attacked. The exploit is the spec — if I can't break it on paper, it has a chance onchain.",
    },
    {
      no: "02",
      title: "Decentralize",
      text: "If a system can run without a trusted middleman, it should. Fewer people to trust means fewer people who can let you down — or be compelled to.",
    },
    {
      no: "03",
      title: "Encrypt",
      text: "Privacy isn't a setting you toggle on later. It's the default — built in at the protocol level, where it can't be quietly walked back.",
    },
    {
      no: "04",
      title: "Verify",
      text: "Onchain there's no undo. Everything gets tested, threat-modelled and stress-checked before it ever touches a cent of real value.",
    },
  ],
} as const;

export const proof = {
  eyebrow: "Don't trust — verify",
  heading: "Everything here is checkable.",
  body:
    "I build software you don't have to take on faith, and audit the kind that asks for it. The same goes for this page — go look.",
  links: [
    { label: "GitHub", value: "@karthikeh02", href: "https://github.com/karthikeh02" },
    {
      label: "LinkedIn",
      value: "Karthikeyan Govindan",
      href: "https://www.linkedin.com/in/karthikeyan-govindan/",
    },
    { label: "Zan Services", value: "zanservices.com", href: "https://zanservices.com" },
  ],
} as const;

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Do you do smart-contract audits?",
    a: "Yes — it's a core part of what I do. I audit Solidity contracts for DeFi, swaps and tokens, hunting replay/approval bugs, slippage exploits and broken assumptions. You get a working proof-of-concept for each finding and a concrete fix, not just a severity label.",
  },
  {
    q: "What kind of work do you take on?",
    a: "Anything onchain that has to be done carefully — audits, smart contracts, DeFi/swap protocols, ZK circuits, multi-chain wallets and full dApps. I'm happiest where correctness actually matters and money is on the line.",
  },
  {
    q: "Which chains do you build on?",
    a: "EVM is home turf — Ethereum and BSC — and I've shipped on TRON, Solana and Avalanche too, plus Hyperledger Fabric. The principles travel; I'm comfortable getting up to speed on a new ecosystem fast.",
  },
  {
    q: "Can you take something from idea to production?",
    a: "Yes — that's the point of being full-stack. Protocol design, contracts, the audit, the autonomous logic, and the interface a person actually uses. One mind across the whole pipeline means fewer seams for bugs to hide in.",
  },
  {
    q: "Do my keys or data ever touch your servers?",
    a: "No. I build self-custodial and zero-access by default — users hold their own keys, and systems are designed so that even I can't read what isn't mine to read. If a design requires me to be trusted, I treat that as a design to fix.",
  },
  {
    q: "How do we start?",
    a: "Send me the rough idea — or the contract you want audited. I'll reply with the honest version: what's hard, what's risky, what I'd do differently, and whether it's a fit. If it is, we go from there.",
  },
];

export const contact = {
  eyebrow: "Let's build",
  heading: "Got something onchain in mind?",
  body: "A protocol to build, a contract to audit, or something nobody's tried yet — if it lives on a blockchain, I want to hear about it. No idea is too early to talk through.",
  availability: "Available for contract builds, audits and protocol advisory.",
  email: "karthiraj453@gmail.com",
  socials: [
    { label: "GitHub", handle: "@karthikeh02", href: "https://github.com/karthikeh02" },
    {
      label: "LinkedIn",
      handle: "Karthikeyan Govindan",
      href: "https://www.linkedin.com/in/karthikeyan-govindan/",
    },
  ],
} as const;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Approach", href: "#approach" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;
