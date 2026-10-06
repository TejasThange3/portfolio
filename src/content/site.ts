// Every fact here comes from Tejas's résumé or his GitHub READMEs. Nothing invented.

export const person = {
  nameEn: "Tejas Thange",
  nameMr: "तेजस ठाणगे",
  email: "tejasthange3@gmail.com", // for recruiters: shown in the Contact section
  inbox: "tejasankushthange@gmail.com", // for everyone else: the Space form's messages and its fallback
  linkedin: "https://www.linkedin.com/in/tejas03/",
  github: "https://github.com/TejasThange3",
  resume: "/tejas-thange-resume.pdf",
};

export type Effect = {
  kind: "embers" | "shimmer" | "twinkle" | "fireflies" | "motes" | "petals" | "seeds" | "heat";
  /** Region in painting coordinates (0-1): x0, y0, x1, y1 */
  area: [number, number, number, number];
  count: number;
  /** RGB tint sampled from the painting, so the light belongs to the scene */
  tint?: [number, number, number];
};

export type Painting = {
  src: string; w: number; h: number; title: string; artist: string; year?: string;
  /** object-position, chosen so the subject stays in frame */
  pos: string; effects: Effect[];
};

/** Public-domain paintings (Wikimedia Commons). Night set for dark mode, day set for light mode. */
export const paintings: { dark: Painting[]; light: Painting[] } = {
  dark: [
    { src: "/art/vesuvius.webp", w: 1920, h: 1532, title: "Vesuvius in Eruption", artist: "Joseph Wright of Derby", year: "c. 1777", pos: "50% 64%",
      effects: [
        { kind: "heat", area: [0.44, 0.42, 0.66, 0.64], count: 1, tint: [255, 170, 90] },
        { kind: "embers", area: [0.51, 0.56, 0.59, 0.61], count: 46 },
      ] },
    { src: "/art/aurora.webp", w: 1629, h: 1230, title: "Aurora Borealis", artist: "Étienne Léopold Trouvelot", year: "1872", pos: "50% 72%",
      effects: [
        { kind: "twinkle", area: [0.02, 0.02, 0.98, 0.6], count: 16, tint: [232, 240, 255] },
        { kind: "heat", area: [0.3, 0.5, 0.7, 0.95], count: 1, tint: [196, 228, 214] },
      ] },
    { src: "/art/orrery.webp", w: 1600, h: 1184, title: "A Philosopher Lecturing on the Orrery", artist: "Joseph Wright of Derby", year: "c. 1766", pos: "50% 22%",
      effects: [
        { kind: "heat", area: [0.28, 0.42, 0.62, 0.86], count: 1, tint: [255, 196, 120] },
        { kind: "motes", area: [0.3, 0.3, 0.62, 0.75], count: 16, tint: [255, 224, 170] },
      ] },
    { src: "/art/twilight.webp", w: 1874, h: 1150, title: "Twilight in the Wilderness", artist: "Frederic Edwin Church", year: "1860", pos: "50% 55%",
      effects: [{ kind: "fireflies", area: [0.05, 0.64, 0.95, 0.97], count: 18 }] },
    { src: "/art/rhone.webp", w: 1600, h: 1240, title: "Starry Night Over the Rhône", artist: "Vincent van Gogh", year: "1888", pos: "50% 30%",
      effects: [
        { kind: "twinkle", area: [0.02, 0.02, 0.98, 0.42], count: 10, tint: [255, 246, 196] },
        { kind: "shimmer", area: [0.12, 0.52, 0.92, 0.7], count: 26, tint: [250, 214, 110] },
      ] },
  ],
  light: [
    { src: "/art/whip.webp", w: 1920, h: 1148, title: "Snap the Whip", artist: "Winslow Homer", year: "1872", pos: "50% 70%",
      effects: [{ kind: "seeds", area: [0, 0.15, 1, 0.85], count: 18 }] },
    { src: "/art/poppies.webp", w: 1600, h: 1183, title: "Poppy Fields near Argenteuil", artist: "Claude Monet", year: "1875", pos: "50% 62%",
      effects: [{ kind: "petals", area: [0, 0.4, 1, 0.95], count: 22 }] },
    { src: "/art/sierra-nevada.webp", w: 1600, h: 956, title: "Among the Sierra Nevada, California", artist: "Albert Bierstadt", year: "1868", pos: "50% 40%",
      effects: [{ kind: "motes", area: [0.3, 0.05, 0.75, 0.7], count: 34, tint: [255, 246, 222] }] },
    { src: "/art/rye.webp", w: 1600, h: 906, title: "Rye", artist: "Ivan Shishkin", year: "1878", pos: "50% 60%",
      effects: [{ kind: "motes", area: [0, 0.48, 1, 0.92], count: 26, tint: [255, 240, 190] }] },
    { src: "/art/cypresses.webp", w: 1600, h: 1272, title: "Wheat Field with Cypresses", artist: "Vincent van Gogh", year: "1889", pos: "50% 55%",
      effects: [{ kind: "motes", area: [0, 0.55, 1, 0.95], count: 30, tint: [255, 232, 160] }] },
  ],
};

export type CaseStudy = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  tools: string[];
  techniques: string[];
  code?: string;
  live?: string;
  problem: string;
  approach: string[];
  result?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "docqa",
    title: "DocQA",
    kind: "Retrieval-augmented generation",
    summary: "Upload a PDF and ask it questions, including about its tables and images. Each answer points back to the page it came from.",
    tools: ["Python", "LangGraph", "Gemini", "FastAPI", "Streamlit"],
    techniques: ["Docling", "ChromaDB", "BGE reranker", "BM25 hybrid", "Corrective RAG", "RAGAS"],
    code: "https://github.com/TejasThange3/docqa",
    problem:
      "Most PDF chatbots read only the text layer and answer confidently even when the document never says the thing. Real documents hide half their meaning in tables, diagrams and formulas.",
    approach: [
      "Docling parses each PDF into typed elements (text, tables, images) with page numbers. Gemini vision describes diagrams and turns formulas into LaTeX, cached so nothing is captioned twice.",
      "Four chunking strategies (fixed, recursive, semantic, structure-aware), with tables and captions always kept whole, embedded into a persistent ChromaDB store.",
      "Retrieval goes wide then narrow: dense top-k, a BGE cross-encoder rerank, optional BM25 hybrid fusion.",
      "A LangGraph corrective-RAG graph grades the retrieved context, rewrites the query once if it isn't enough, and otherwise answers only from the document, falling back to \"I don't know based on this document.\"",
    ],
    result: "Served over FastAPI with a Streamlit chat UI, and evaluated with RAGAS on faithfulness, answer relevancy, context precision and context recall.",
  },
  {
    slug: "ganscape",
    title: "GanScape",
    kind: "Generative models",
    summary: "A GAN that turns a segmentation mask into a height map, which I then render as 3D terrain.",
    tools: ["Python", "PyTorch", "NumPy", "SciPy"],
    techniques: ["Attention U-Net", "PatchGAN", "Spectral norm", "AMP", "PyVista"],
    code: "https://github.com/TejasThange3/GANSCAPE-3D-TERRAIN-GENERATION",
    problem:
      "Sculpting terrain by hand is slow. GanScape learns the mapping from a simple segmentation mask to a height map with believable detail, so a rough layout becomes a landscape you can render in 3D.",
    approach: [
      "An attention-gated U-Net generator translates segmentation masks into height maps, with a PatchGAN discriminator judging local realism.",
      "Spectral normalization and instance normalization keep adversarial training stable; mixed-precision (AMP) training speeds up convergence.",
      "OpenSimplex adds fractal detail, SciPy filters the output, and PyVista renders it as a 3D surface.",
    ],
  },
  {
    slug: "pest-detection",
    title: "Pest detection on a Raspberry Pi",
    kind: "Embedded computer vision",
    summary: "A YOLOv5n model with attention that spots crop pests in real time on a Raspberry Pi. I quantized and pruned it so it would run fast enough on the Pi.",
    tools: ["Python", "PyTorch", "Ultralytics", "Raspberry Pi"],
    techniques: ["YOLOv5n", "Attention", "Quantization", "Pruning", "Segmentation"],
    code: "https://github.com/TejasThange3/Pest-Detection-Using-Embedded-AI",
    problem:
      "Pests are small, often hidden behind leaves, and the hardware in a field is cheap. The model has to be accurate on tiny, occluded objects and still run in real time on a Raspberry Pi.",
    approach: [
      "Started from YOLOv5n and added attention mechanisms so the model focuses on small, partially hidden pests.",
      "Quantized and pruned the network for embedded deployment, cutting the compute load while keeping accuracy.",
      "Combined detection with segmentation to handle occluded pests in cluttered scenes.",
    ],
  },
  {
    slug: "bipedal-agents",
    title: "Bipedal walking agents",
    kind: "Reinforcement learning",
    summary: "I trained PPO, TD3 and SAC agents to walk in BipedalWalker-v3 and compared how each one learned.",
    tools: ["Python", "PyTorch"],
    techniques: ["OpenAI Gym", "Box2D", "PPO", "TD3", "SAC", "Behaviour cloning", "Reward shaping"],
    code: "https://github.com/TejasThange3/Bipedal-Rl-agents",
    problem:
      "BipedalWalker-v3 asks a two-legged robot to learn balance and gait from nothing. Different algorithms get there at very different speeds, and some never get there cleanly.",
    approach: [
      "Trained PPO, TD3 and SAC on the same environment and tracked the running average reward for each.",
      "Used behaviour cloning for a head start and reward shaping to push agents towards stable walking.",
      "Compared where each algorithm stalled or collapsed, and tuned the reward structure from that.",
    ],
    result: "SAC crossed a running average reward of 300 in about 330 episodes. TD3 got there in about 1,240, after collapsing once on the way. PPO peaked near 286 after more than 5,000.",
  },
];

export const builds = [
  {
    title: "Zineps, reimagined",
    kind: "Design challenge entry",
    summary: "My entry for Zineps' public redesign challenge: a 15-page site for a shipping platform, with an animated route globe, a carrier comparison and a pricing estimator.",
    tools: ["React", "TypeScript", "Vite"],
    image: "/work/zineps-reimagined.webp",
    live: "https://zineps-reimagined.vercel.app",
    code: "https://github.com/TejasThange3/Zineps-Reimagined",
  },
  {
    title: "takeUforward, reimagined",
    kind: "Unofficial design concept",
    summary: "A design concept for takeUforward, a DSA learning platform, with guided walkthroughs, a learner workspace and ⌘K search.",
    tools: ["React", "TypeScript", "Vite", "Motion"],
    image: "/work/takeuforward-reimagined.webp",
    live: "https://takeuforward-reimagined.vercel.app",
    code: "https://github.com/TejasThange3/takeuforward-reimagined",
  },
];

export type Job = {
  org: string; role: string; period: string; place: string; url: string;
  /** Logo file in /public/logos, and the tile it sits on so it reads in both themes */
  logo: { src: string; tile: string; pad: string };
  summary: string; points: string[]; tools: string[];
};

export const experience: Job[] = [
  {
    org: "Mimic Productions",
    role: "AI Programming Intern",
    period: "Jul 2026 - Present",
    place: "Remote",
    url: "https://www.mimicproductions.com",
    logo: { src: "/logos/mimic.png", tile: "#000000", pad: "7px" },
    summary: "Working on the RAG backend for Mimic Minds, their AI avatar product.",
    points: [
      "Moving the document ingestion part of the Brain Service, the RAG backend for Mimic Minds, from Node.js to Python. This covers parsing, chunking, embeddings and vector indexing.",
      "Building a scraping service that pulls a client's website into the same pipeline, so they don't have to upload documents by hand.",
      "Tested open-source speech-to-text and text-to-speech models on my laptop to see which could run on edge devices.",
      "Redesigned a website and deployed it on WordPress.",
    ],
    tools: ["Python", "WordPress"],
  },
  {
    org: "Upbringing Technologies",
    role: "Digital and Online Marketing Trainee",
    period: "Dec 2025 - Mar 2026",
    place: "Pune",
    url: "https://www.upbringingindia.com",
    logo: { src: "/logos/upbringing.png", tile: "#ffffff", pad: "8px" },
    summary: "Built the company website and set up its chatbot and CRM.",
    points: [
      "Built and deployed the company's official website with Next.js on Vercel.",
      "Wrote the product knowledge base for the website's chatbot.",
      "Connected Zoho CRM and Zoho Mail so leads and customer enquiries get routed automatically.",
      "Handled technical SEO and B2B work on IndiaMART and the GeM portal, including official bid submissions.",
    ],
    tools: ["Next.js", "Vercel", "Zoho"],
  },
];

export const stackRows = [
  ["Python", "PyTorch", "Scikit-learn", "OpenCV", "Ultralytics", "NumPy", "Pandas", "Matplotlib", "SciPy", "ONNX Runtime", "Hugging Face", "Jupyter", "Colab", "LangChain", "LangGraph", "Gemini", "Claude"],
  ["FastAPI", "Streamlit", "Next.js", "React", "TypeScript", "Vite", "Tailwind CSS", "Motion", "Vercel", "AWS", "WordPress", "Git", "GitHub", "VS Code", "Cursor", "Claude Code", "Codex", "MySQL", "MongoDB", "Raspberry Pi", "Jira", "Zoho"],
];
