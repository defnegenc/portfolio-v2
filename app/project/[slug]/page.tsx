import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import CopyBlock from './CopyBlock'

// ─── Project Data ─────────────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const HL = 'var(--hairline)'

type Section =
  | { type: 'text'; label: string; body: string }
  | { type: 'pullquote'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string; aspect?: string }
  | { type: 'images'; items: { src: string; alt: string; caption?: string }[]; aspect?: string }
  | { type: 'phones'; items: { src: string; alt: string; caption?: string }[]; label?: string }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | { type: 'list'; label: string; items: string[] }
  | { type: 'subheader'; text: string; id?: string }

interface Project {
  slug: string
  no: string
  name: string
  tagline: string
  year: string
  role: string
  team?: string
  citation?: string
  duration?: string
  tools?: string
  awards?: string
  accentColor: string
  tags: string[]
  icon?: string
  externalLink?: { href: string; label: string }
  secondaryLink?: { href: string; label: string }
  jumpTo?: { anchor: string; label: string }
  sections: Section[]
}


const PROJECTS: Record<string, Project> = {
  bloom: {
    slug: 'bloom',
    no: '01',
    name: 'Bloom',
    tagline: 'At Stanford with Prof. Landay, I co-designed and evaluated Bloom, an LLM-based physical activity coaching intervention. My contributions spanned early-stage design through full-stack implementation. CHI 2026, accepted.',
    year: '2025',
    role: 'UI/UX Design · Safety Engineering · Frontend · Second Author',
    citation: 'Jörke, J., Genç, D., Teutschbein, M., Sapkota, S., Chung, J., Schmiedmayer, H.-B., Campero, A., King, A. C., Brunskill, E., & Landay, J. A. (2026). Bloom: Designing for LLM-Augmented Behavior Change Interactions. CHI \'26. ACM. https://arxiv.org/abs/2510.05449',
    duration: '4-week randomized field study · N=54',
    tools: 'Figma, React Native, LLM red-teaming, qualitative coding',
    accentColor: '#266C31',
    tags: ['HCI Research', 'Safety', 'Design'],
    externalLink: { href: 'https://stanfordhci.github.io/Bloom/', label: 'View the Bloom website ↗' },
    secondaryLink: { href: '/bloom-app-guide.pdf', label: 'App Guide PDF ↗' },
    sections: [
      {
        type: 'text',
        label: 'What it is',
        body: 'Bloom is an LLM-augmented physical activity coaching app built on Stanford\'s validated Active Choices Program. It integrates a conversational AI coach ("Beebo") with evidence-based behavior change UI, including an ambient garden display that grows as you complete your weekly exercise goals. The central question: can LLM coaching complement, not replace, established digital health interaction patterns? We ran a 4-week randomized field study with 54 participants to find out.',
      },
      {
        type: 'stats',
        items: [
          { value: '5×', label: 'Longer app engagement in LLM condition' },
          { value: '+1.2', label: 'Mindset shift vs +0.8 in control' },
          { value: '600', label: 'Example safety benchmark' },
          { value: '>96%', label: 'Recall across harm categories' },
        ],
      },
      {
        type: 'subheader',
        text: 'The App',
      },
      {
        type: 'text',
        label: 'Garden Ambient Display',
        body: 'The core design concept I led: a garden that lives on your homescreen and lockscreen and grows as you complete your weekly activity plan — in 20% increments. Every walk adds a bee (size proportional to duration); every other activity adds a butterfly (color varies by type). The garden resets if you don\'t hit 100% by week\'s end, and evolves to a new plant when you do. The goal was to make progress feel gradual and accumulative rather than binary, reducing the goal-fixation anxiety that metrics-forward health apps tend to produce. This was one of the central design decisions we made as a team.',
      },
      {
        type: 'text',
        label: 'Two Conditions',
        body: 'We designed both conditions — treatment (with Beebo, the LLM coach) and control (without). Both used the same garden ambient display, plan-setting, and wearable integration. The only difference was the conversational AI layer, which let us isolate the effect of LLM coaching on engagement, mindset shift, and behavior change.',
      },
      {
        type: 'subheader',
        text: 'My Contributions',
      },
      {
        type: 'text',
        label: 'UI/UX Design',
        body: 'I had the most influence on UI design across the app — from the garden metaphor and ambient lockscreen display to the activity logging interface, onboarding flows, and overall app architecture. I also designed and built the Bloom website. This wasn\'t a design handoff role: I made key decisions on app architecture and user experience end to end, working closely with the team to ensure the UI served the study\'s behavior change hypotheses.',
      },
      {
        type: 'text',
        label: 'Safety Engineering',
        body: 'I led red-teaming for the LLM coaching agent across a vulnerable participant population — adults with existing activity barriers, including chronic pain and mental health considerations. I created a taxonomy of harm categories and validated a 600-example benchmark achieving >96% recall across risk categories. This was domain-expert red-teaming, not automated, and it was critical: Beebo regularly encountered sensitive topics that required nuanced, harm-aware guardrails to keep responses safe and within scope.',
      },
      {
        type: 'text',
        label: 'Frontend & Research Execution',
        body: 'I had the most influence on frontend implementation decisions, building in React Native alongside the team. I was heavily involved in participant recruitment for the 54-person study, managed onboarding logistics, and completed qualitative coding of all offboarding interviews. Second author on the published paper (CHI 2026, accepted).',
      },
      {
        type: 'subheader',
        text: 'Study Results',
      },
      {
        type: 'text',
        label: 'What we found',
        body: 'Both conditions doubled weekly goal achievement (36% to 72% meeting 150 min/week). Treatment participants showed larger mindset shifts (+1.2 vs +0.8 points in beliefs about activity benefits), with greater improvements in exercise enjoyment and self-compassion. No single conversational strategy drove these shifts consistently. The system\'s flexibility was the mechanism: different participants benefited from different aspects, whether activity reframing, goal alignment, or acknowledgment of existing efforts. Even those with shallow engagement showed meaningful changes, suggesting that adaptive, personalized representations can shift self-perception without requiring deep conversational interaction.',
      },
      {
        type: 'pullquote',
        text: 'LLM coaching\'s primary value is psychological, not behavioral — surfacing behaviors people already do so they realize they\'re doing more than they\'ve given themselves credit for.',
      },
      {
        type: 'list',
        label: 'Key Findings',
        items: [
          'Even participants with shallow engagement showed meaningful mindset changes — the garden display made progress feel real even without deep conversational interaction.',
          'Highlights of existing behaviors (gardening, walking to work) counted as exercise, enabling participants to discover they were already doing more than they realized.',
          'Safety filtering was essential: participants raised chronic pain, mental health struggles, and grief — requiring nuanced, harm-aware responses that the red-teamed guardrails handled correctly.',
        ],
      },
    ],
  },

  menuto: {
    slug: 'menuto',
    no: '03',
    name: 'Menuto',
    tagline: 'Personalized restaurant dish recommendations powered by an LLM agent that learns your taste over time, using your favorites from other restaurants to inform what you\'ll love at new ones. Solo-built end to end: product, design, React Native frontend, FastAPI backend, and deployment.',
    year: '2026',
    role: 'Solo — Product · Design · Full-Stack',
    duration: 'Personal Project · End-to-End Ownership',
    tools: 'React Native · Expo 53 · FastAPI · Google Gemini 2.5 Flash · Supabase · PostgreSQL · Google Places API',
    accentColor: '#D8131F',
    tags: ['Full-Stack', 'AI', 'Mobile'],
    icon: '/menuto-icon.png',
    externalLink: { href: 'https://testflight.apple.com/join/SZY7qqtY', label: 'Try on TestFlight ↗' },
    secondaryLink: { href: 'https://github.com/defnegenc/menuto', label: 'View on GitHub ↗' },
    sections: [
      {
        type: 'text',
        label: 'The Problem',
        body: 'You\'re at a restaurant. You don\'t know what to order. Reviews tell you where to eat, but nothing tells you what to order once you\'re there. Menuto reads the menu, understands your preferences, and picks dishes for you, with personal explanations like "You mentioned you\'re craving something rich, and the reviewers specifically call out the truffle cream on this one." The more you use it, the smarter it gets.',
      },
      {
        type: 'pullquote',
        text: 'Rate a dish, and the system learns not just that you liked it, but why, extracting taste signals from your feedback text and adjusting future recommendations accordingly.',
      },
      {
        type: 'stats',
        items: [
          { value: '8', label: 'Signal sources per recommendation' },
          { value: '5', label: 'Pipeline stages: parse → filter → enrich → select → learn' },
          { value: '2', label: 'Codebases: FastAPI + React Native' },
          { value: '0', label: 'Team members — fully solo' },
        ],
      },
      {
        type: 'subheader',
        text: 'The App',
      },
      {
        type: 'phones',
        label: 'Search for a restaurant by name or browse nearby. Tap into one to see its full menu.',
        items: [
          { src: '/choosedish2.png', alt: 'Restaurant search results', caption: 'Find a restaurant' },
          { src: '/restaurantdetailscreen.png', alt: 'Restaurant detail with menu', caption: 'Browse the full menu' },
        ],
      },
      {
        type: 'phones',
        label: 'Set your mood: how hungry you are, how adventurous, what you\'re craving, and how you\'re dining.',
        items: [
          { src: '/choosedish3.png', alt: 'Preference sliders', caption: 'Hunger and taste sliders' },
          { src: '/choosedish4.png', alt: 'Craving and dining style', caption: 'Cravings and dining context' },
        ],
      },
      {
        type: 'phones',
        label: 'The agent reasons about your signals and returns personalized picks with explanations.',
        items: [
          { src: '/dishesloading.png', alt: 'Agent thinking', caption: 'Browsing the kitchen' },
          { src: '/chosendishes.png', alt: 'Recommended dishes', caption: 'Your picks with reasons' },
        ],
      },
      {
        type: 'phones',
        label: 'Rate dishes after your meal. Your favorites carry across restaurants for future visits.',
        items: [
          { src: '/ratedishes.png', alt: 'Rate your dishes', caption: 'Rate and save favorites' },
          { src: '/Your-Restaurants.png', alt: 'Saved restaurants', caption: 'Your restaurant list' },
        ],
      },
      {
        type: 'subheader',
        text: 'The Recommendation Engine',
      },
      {
        type: 'text',
        label: 'Agent-First Architecture',
        body: 'Rather than rigid scoring formulas, a Gemini agent receives all available signals about the user and reasons about what to recommend. An earlier version used 10 hand-tuned scoring components (personal taste: 0.30, sentiment: 0.17, etc.). The weights were identical for everyone and couldn\'t reason about context.',
      },
      {
        type: 'list',
        label: 'The Pipeline',
        items: [
          'Data Gathering: 8 signal sources per dish. Parsed menu items, Google Places reviews (cached 14 days), review-based dish popularity via mention frequency, cross-user order counts, past ratings, behavioral signals (views/orders/favorites), Gemini-extracted taste keywords from feedback text, and embedding-based taste similarity (cosine similarity computed in 2 batch API calls).',
          'Dietary Filtering: The only rigid step. LLM-generated dietary flags per dish, with explicit instructions to catch hidden ingredients (anchovy in Caesar dressing, fish sauce in Pad Thai, parmesan in pesto). Falls back to a 30+ term keyword list for menus parsed before LLM tagging was added.',
          'Signal Enrichment: Each candidate gets readable flags attached. MATCHES YOUR TASTE, POPULAR (60%), WELL-REVIEWED, LOOKED AT BUT NEVER ORDERED, HAS FLAVORS YOU LIKE. No numerical scoring, just facts the agent can reason about.',
          'Agent Selection: The agent receives the full user narrative. Taste profile, spice tolerance, learned flavor preferences, hunger level, cravings, adventure-vs-safe slider, dining occasion, free-text mood input, history at this restaurant, and what\'s popular. It reasons about meal composition, honors cravings, and writes personal explanations per dish.',
          'Feedback Loop: After ordering, the user rates dishes with quick-tap tags and optional free-text notes. Gemini extracts taste signals from the text. "Loved the cream sauce" becomes a liked: ["cream", "rich sauce"] signal that boosts similar dishes in future visits.',
        ],
      },
      {
        type: 'text',
        label: 'Research Foundations',
        body: 'Informed by Microsoft\'s RecAI framework (Zhao et al., ACM Web Conference 2024): the "LLM-as-brain, traditional-models-as-tools" pattern where traditional signals handle candidate generation and the LLM handles final reasoning. The serendipity slot draws from the SERAL paper on filter bubble mitigation (Feb 2025). The implicit negative feedback model follows Hu, Koren & Volinsky\'s foundational work on collaborative filtering for implicit feedback datasets.',
      },
      {
        type: 'subheader',
        text: 'How It Learns',
      },
      {
        type: 'text',
        label: 'Thompson Sampling for Weight Learning',
        body: 'The 8-component scoring algorithm doesn\'t use fixed weights. Each user has Bayesian priors (alpha/beta per component) that update every time they rate a dish. Over time, the system learns whether a specific user responds more to popularity signals vs. personal taste matching vs. craving alignment, without needing a cold-start dataset. After ~10 ratings, the weights diverge meaningfully from the uniform prior.',
      },
      {
        type: 'text',
        label: 'Embedding-Based Taste Compatibility',
        body: 'Both the user\'s taste profile and each dish description are embedded into the same vector space via gemini-embedding-001, then scored by cosine similarity. Someone who likes "creamy burrata" will score well on "stracciatella with olive oil" even though no keywords overlap. Two API calls total: one for the taste profile, one batch for all candidates.',
      },
      {
        type: 'text',
        label: 'Review Sentiment Decomposition',
        body: 'Google Places reviews are processed through Gemini to extract per-dish sentiment. "The cacio e pepe was transcendent but the tiramisu was dry" gets decomposed into dish-level praise and criticism scores that feed directly into the recommendation\'s customer_praise component. Cached 14 days in Supabase to stay within the Places API free tier.',
      },
      {
        type: 'subheader',
        text: 'System Design',
      },
      {
        type: 'list',
        label: 'Architecture Decisions',
        items: [
          'Multi-modal menu ingestion: Three input paths (URL/HTML scraping, PDF extraction via PyMuPDF, camera photo via Gemini Vision) all normalize into the same ParsedDish schema. Auto-detects content type from response headers with byte-sniffing fallback.',
          'Composite scoring with 8 independent components: Personal taste (embedding similarity), craving match, hunger appropriateness, popularity/sentiment, dietary compliance, cuisine affinity, price fit, and friend boost. The system can explain exactly why a dish was recommended by surfacing which components dominated.',
          'Behavioral signals as separate normalized tables: dish_views, dish_ratings, dish_orders, dish_favorites are separate tables rather than a single interactions table. Enables efficient per-signal queries and signal-specific columns (hunger_level_when_ordered on orders, taste_signals JSONB on ratings).',
          'Cold start via cross-user popularity: New users with no history get recommendations weighted toward what other users ordered and review sentiment. Free-text mood input ("celebrating tonight") gives the agent rich context even without rating history.',
        ],
      },
    ],
  },

  learningetal: {
    slug: 'learningetal',
    no: '02',
    name: 'Learning Et Al.',
    tagline: 'Learning Et Al. ("learning it all"). A daily research digest that finds, synthesizes, and contrasts academic papers and news articles based on your interests. Not an abstract delivery service. More like a curious friend explaining something over coffee.',
    year: '2026',
    role: 'Solo — Product · Design · Full-Stack',
    duration: 'Personal Project · End-to-End Ownership',
    tools: 'Next.js 16 · Turso/libsql · Drizzle ORM · Tailwind + shadcn/ui · ONNX Embeddings · Vercel',
    accentColor: '#1a1a1a',
    tags: ['Solo Project', 'RecSys', 'LLM Agents'],
    externalLink: { href: 'https://learningetal.com', label: 'Visit learningetal.com ↗' },
    sections: [
      {
        type: 'image',
        src: '/learningetal-cover.png',
        alt: 'Learning Et Al. interface',
        aspect: '16/9',
      },
      {
        type: 'text',
        label: 'The Core Idea',
        body: 'The algorithm is backwards on purpose. Most recommendation systems find content first, then label it. This one generates a provocative central question before searching for a single paper: "Can AI agents be fashionable?" or "What if buildings could sense your mood?" Then it finds papers and news articles that serve as tools to think with in relation to that question. Papers don\'t need to answer it. They need to offer a surprising lens on it.',
      },
      {
        type: 'pullquote',
        text: 'Papers don\'t need to answer the question. They need to offer a surprising lens on it.',
      },
      {
        type: 'subheader',
        text: 'The Synthesis Pipeline',
      },
      {
        type: 'text',
        label: '15+ LLM Calls Per Digest',
        body: 'Each digest goes through a multi-stage pipeline: metadata extraction, skeleton building (identifying paper roles, tensions, argument arcs as structured JSON), prose generation, self-critique, revision, and a hard coverage gate that verifies every paper actually appears in bold in the final output. This came from iterating through a single-call approach (too shallow), then a 7-call pipeline (still produced book reports), landing on a skeleton-first architecture inspired by Yao 2023\'s Tree of Thoughts and Madaan 2023\'s Self-Refine.',
      },
      {
        type: 'subheader',
        text: 'How Papers Are Found',
      },
      {
        type: 'text',
        label: 'Hybrid Ranking via Reciprocal Rank Fusion',
        body: 'Candidate papers are scored by both BM25 (keyword) and local embeddings (semantic), then fused via RRF, which elegantly sidesteps the problem of combining signals with incompatible scales. On top of that, venue/institution quality boosts and Maximal Marginal Relevance (\u03BB=0.6) ensure diversity: no two papers from the same lab making the same point.',
      },
      {
        type: 'text',
        label: 'In-Process Embeddings with Graceful Degradation',
        body: 'Runs all-MiniLM-L6-v2 locally via ONNX/transformers.js. Zero API cost, zero external dependency. When ONNX can\'t load (e.g. serverless cold starts), a sentinel value triggers a keyword-overlap fallback transparently, keeping the same API surface. An isEmbeddingDegraded() flag surfaces the mode for logging.',
      },
      {
        type: 'subheader',
        text: 'Staying Interesting',
      },
      {
        type: 'text',
        label: 'Theme Novelty Enforcement',
        body: 'Each generated question is compared against the last 5 digests\' themes via embedding similarity. If cosine similarity exceeds 0.5, the system triggers a novelty rewrite with explicit instructions to pick different interest combinations. Without this, LLMs converge to a predictable question template within weeks.',
      },
      {
        type: 'text',
        label: 'Interest Learning with Decay',
        body: 'Interests decay daily (\u00D70.95), recently-used topics get a frequency penalty from the last 5 digests, and selection is weighted random, not top-N, so even low-weight interests surface occasionally. Engagement signals are intentionally microscopic (+0.1 per star, +0.05 per question) after discovering that a single starred paper could pollute an entire feed.',
      },
      {
        type: 'text',
        label: 'Prompt Engineering by Antipattern',
        body: 'Instead of vague tone instructions, the synthesis prompts ban specific bad patterns by example: "The question of whether X isn\'t just about Y, it\'s about Z" (the worst one). Plus a hard banned-words list (demonstrates, reveals, highlights, nuanced, multifaceted), data-driven from observing every synthesis sounding identical.',
      },
      {
        type: 'subheader',
        text: 'Things I Reworked',
      },
      {
        type: 'list',
        label: 'Iterations',
        items: [
          'Anchor-paper to theme-first: Original approach derived themes from a "best paper." Highly-cited papers dominated and pulled in wrong-field methodology papers. Eliminated the anchor entirely.',
          'Paper selection went through 4 iterations: Citation graph (cross-field contamination), keyword matching (terrible precision), embedding-only (missed specifics), BM25+embedding RRF with MMR diversity.',
          'Synthesis structure: Paper-by-paper paragraphs (book reports), single LLM call (too shallow), 7-call pipeline, current 6-stage skeleton-first approach with coverage gating.',
          'Theme revision: Tried letting the LLM decide whether to revise. It always said "no change needed." Made revision mandatory. Output quality jumped.',
          'News sources: Hardcoded RSS, then DuckDuckGo scraping (broke on one CSS change), then Serper/DDG with User-Agent rotation and field-specific RSS fallback chain.',
        ],
      },
      {
        type: 'text',
        label: 'The Vault',
        body: 'Past digests live in a searchable archive where you can browse themes over time and compare any two papers side by side. Brutalist research archive aesthetic: hard borders, box shadows, crosshair cursor, accent colors only in tags.',
      },
    ],
  },

  dishcovery: {
    slug: 'dishcovery',
    no: '04',
    name: 'Dishcovery',
    tagline: 'An image-recognition app that helps you recognise, learn about, and cook with ingredients from cultures around the world.',
    year: '2024',
    role: 'UI Designer · Frontend Engineer',
    team: 'V2: Amrita Palaparthi, Janet Zhong, Kyla Guru · V3: Kayla Kelly, Sharon Wambu, Abena Ofosu',
    duration: '20 weeks · Two iterations (CS 147 + CS 194H)',
    tools: 'Figma, React Native, Clarifai AI, Paper prototypes',
    awards: 'Best Project · Best Design · Best Concept',
    accentColor: '#FF6B35',
    tags: ['UI Design', 'Frontend', 'UX Research'],
    jumpTo: { anchor: 'final-design', label: 'Jump to Final Design ↓' },
    sections: [
      {
        type: 'text',
        label: 'Overview',
        body: 'Dishcovery helps you recognise, learn about, and cook with foods from around the world. It is a consumer app using image recognition to scan foreign ingredients and learn about their cultural and culinary contexts. The app allows users to scan an ingredient, explore recipes by cuisine or ingredient, and save recipes for later.',
      },
      {
        type: 'image',
        src: '/dishcovery-hero.png',
        alt: 'Dishcovery App Overview',
        aspect: '16/9',
      },
      {
        type: 'stats',
        items: [
          { value: '60', label: 'Ideas generated in brainstorming' },
          { value: '20wks', label: 'Across two class iterations' },
          { value: '6', label: 'Personas from Bay Area needfinding' },
          { value: '3×', label: 'Awards at CS 147 showcase' },
        ],
      },
      {
        type: 'subheader',
        text: 'User Research',
      },
      {
        type: 'text',
        label: 'Problem Space',
        body: 'Exploring the culinary terrain, we sought to understand the barriers that prevent individuals from engaging with and cooking cultural foods. Our goal was to identify these challenges and transform them into opportunities for deeper cultural connections through food.',
      },
      {
        type: 'text',
        label: 'Need-finding Interviews',
        body: 'Our need-finding mission involved face-to-face dialogues with a diverse demographic in the Bay Area — ranging from tech professionals and small business owners to artists and educators. These non-student adults, engaged in various vocations, provided a rich, nuanced understanding of the day-to-day culinary practices and the cultural significance of food in their lives.',
      },
      {
        type: 'list',
        label: 'Personas',
        items: [
          'Martin — In his 30s, lacking strong cultural culinary connections, not primarily motivated by food.',
          'Grace — Taiwanese immigrant and owner of an Asian grocery store, insights into customers\' quests for authenticity in Asian cooking.',
          'Jaclyn — Immigrant from Peru and head chef at Comida Peruana, professional perspective on cultural cuisine.',
          'Sofia — Immigrant from Mexico and chef at Stanford, personal and professional tie to her cultural culinary roots.',
          'Amy — Server at Stanford\'s Decadence, deep sentimental connection to family recipes but faces emotional barriers to recreating them.',
          'Jeson — Malaysian immigrant and founder of OpenChefs, startup viewpoint on delivering authentic cultural food experiences.',
        ],
      },
      {
        type: 'image',
        src: "/dishcovery-empathy.png",
        alt: 'Empathy Map for Dishcovery',
        caption: 'Empathy map capturing user sentiments about cultural food experiences',
        aspect: '16/9',
      },
      {
        type: 'list',
        label: 'Key Insights',
        items: [
          'Cultural Connection — Participants like Martin expressed a desire to reconnect with their heritage, seeking authentic culinary experiences as a bridge to their cultural roots.',
          'Learning Preferences — Users such as Sofia showed a clear preference for hands-on, interactive learning methods.',
          'Authenticity in Ingredients — There\'s a discernible trend towards valuing the authenticity of ingredients, not just in taste but in the cultural stories they tell.',
          'Accessibility and Convenience — The ease of obtaining the right ingredients and understanding their use was a notable concern.',
          'Community and Sharing — Many expressed that food is a communal experience, highlighting the potential for shared learnings and cultural exchange within a digital platform.',
        ],
      },
      {
        type: 'subheader',
        text: 'Solution Generation',
      },
      {
        type: 'list',
        label: 'How Might We\'s',
        items: [
          '"How might we create a system where ingredients can showcase their uses and cultural significance?"',
          '"How might we use unfamiliarity itself to make cooking more exciting?"',
          '"How might we make it so that unfamiliar ingredients speak for themselves?"',
        ],
      },
      {
        type: 'text',
        label: 'Experience Prototype: Cultural Context Map',
        body: 'Objective: gauge whether additional context about a dish\'s cultural and historical background enhances its appeal. Participants viewed images of culturally specific dishes, initially without, then with historical and cultural narratives. Positives: visualization on a map increased appreciation for the ingredient\'s popularity. Negatives: some confusion over variant dishes — led us to move context to the recipe page rather than the ingredient page.',
      },
      {
        type: 'image',
        src: "/dishcovery-context.png",
        alt: 'Cultural Context Research',
        caption: 'Testing how cultural context enhances food appreciation',
        aspect: '16/9',
      },
      {
        type: 'text',
        label: 'Experience Prototype: Grocery Shopping Assistant',
        body: 'Objective: test if ingredient background information demystifies unfamiliar items and influences purchase decisions. Participants ranked likelihood of purchasing certain foreign ingredients before and after being provided comprehensive ingredient information. Positives: additional information positively impacted willingness to consider purchasing. Negatives: tendency for convenience to trump novelty in real shopping scenarios.',
      },
      {
        type: 'image',
        src: "/dishcovery-grocery.png",
        alt: 'Ingredient Information Prototype',
        caption: 'Prototype testing how ingredient information influences purchasing decisions',
        aspect: '16/9',
      },
      {
        type: 'text',
        label: 'Ideation',
        body: 'After synthesizing insights from our experience prototypes, we moved into ideation. Our team members independently proposed a total of 60 solutions, which we compiled and analyzed for common themes. Final solution: a grocery shopping companion with image recognition — scan an ingredient in-store and receive immediate information on its origins, recipes, and usage tips.',
      },
      {
        type: 'subheader',
        text: 'Design Evolution',
      },
      {
        type: 'text',
        label: 'Low-fi & Med-fi Prototypes',
        body: 'Our initial low-fi and med-fi prototypes were aimed at testing core functionalities without the commitment to high-fidelity assets, allowing us to iterate quickly based on user feedback. The higher-level functionality envisioned: scan a foreign ingredient, learn about its cultural and geographical context, find recipes using that ingredient, and save any recipe for later.',
      },
      {
        type: 'images',
        aspect: '16/9',
        items: [
          { src: "/dishcovery-lofi.png", alt: 'Low-fidelity sketches', caption: 'Low-fi sketches exploring key app features' },
          { src: "/dishcovery-wireframes.png", alt: 'Wireframe navigation flows', caption: 'Wireframes showing navigation flows' },
        ],
      },
      {
        type: 'list',
        label: 'Heuristic Evaluation Findings',
        items: [
          'Task 1 (Scan): Improved clarity and confirmation feedback for successful scans and errors; simplified color schemes for accessibility.',
          'Task 2 (Learn): Increased visibility of navigation elements; standardization of UI components; added "Request recipe" feature for inclusivity.',
          'Task 3 (Cook): Consistent font usage; confirmation step before un-saving; religious dietary preferences; improved search within liked recipes.',
        ],
      },
      {
        type: 'subheader',
        text: 'Final Design',
        id: 'final-design',
      },
      {
        type: 'text',
        label: 'V3 Redesign',
        body: 'The V3 followed usability tests on the working version of V2 on Expo (built in React Native) in order to pinpoint where the user experience could be enhanced. Key changes: swipeable recipe steps replaced scrolling after watching someone try to cook with soiled hands; cultural context relocated to the recipe page; Ramadan Specials and cultural events added to the home screen.',
      },
      {
        type: 'image',
        src: "/dishcovery-onboarding.png",
        alt: 'User onboarding screens',
        caption: 'Onboarding — different welcome screens for new and existing users',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-prefs.png",
        alt: 'User preferences screens',
        caption: 'Customizable dietary preferences, allergies, and cuisine interests',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-explore.png",
        alt: 'Explore and search screens',
        caption: 'Advanced filtering with ingredient inclusion/exclusion and personalized recommendations',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-scan.png",
        alt: 'Ingredient scanning process',
        caption: 'Scanning — progress indicators, success/failure states, ingredient information',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-recipe.png",
        alt: 'Recipe screens',
        caption: 'Recipe steps and cultural context with expandable sections',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-saved.png",
        alt: 'Saved recipes screens',
        caption: 'Liked recipes with multi-select unsave functionality and filtering',
        aspect: '16/9',
      },
      {
        type: 'pullquote',
        text: '"Recipe steps as story" — switching from scroll to swipe after watching someone try to cook with soiled hands.',
      },
      {
        type: 'list',
        label: 'Key Takeaways',
        items: [
          'Embracing Iteration — Each prototype, shaped by user feedback, was a step towards a more refined product. The iterative cycle mirrored my own growth as a designer.',
          'The Human-Centered Approach — Engaging with users from diverse backgrounds taught me to see design through the lens of empathy — beyond aesthetics to the core human experience.',
          'Valuing User Voices — Feedback became the cornerstone of Dishcovery\'s design process. Learning to solicit, interpret, and act on user input was a humbling process that reinforced my belief in collaborative development.',
        ],
      },
    ],
  },

  flock: {
    slug: 'flock',
    no: '04',
    name: 'Flock',
    tagline: 'A social app designed to make it easier for close friends to hang out in small groups.',
    year: '2024',
    role: 'Design · Frontend · Backend',
    team: 'Elena Recaldini, Malina Calarco, Pedro Civita, Defne Genç',
    duration: 'CS 278: Social Computing',
    tools: 'React Native, Supabase, TypeScript',
    accentColor: '#7C9EE0',
    tags: ['Full-Stack', 'Social Computing'],
    sections: [
      {
        type: 'pullquote',
        text: '"Calendars mark when we\'re busy professionally, but we don\'t have a system of translucence for when we\'re free socially."',
      },
      {
        type: 'text',
        label: 'Overview',
        body: 'Flock is a social app designed to make it easier for close friends to hang out in small groups. By letting users share when they\'re free and see what their friends are up to, Flock helps create spontaneous plans without the awkwardness of asking around. The app is inspired by social science theories about how transparency and shared awareness can bring people closer, and every feature is designed to make connecting with friends simple and natural.',
      },
      {
        type: 'text',
        label: 'Technical Implementation',
        body: 'Flock was built with React Native to create a seamless and fully functional social networking app. We implemented dynamic routing, real-time updates, and optimized backend fetching, with native calendar integration and OAuth authentication.',
      },
      {
        type: 'images',
        aspect: '9/16',
        items: [
          { src: '/flock-1.png', alt: 'Flock app feed', caption: 'Event feed' },
          { src: '/flock-2.png', alt: 'Flock create event', caption: 'Create event' },
          { src: '/flock-3.png', alt: 'Flock event detail', caption: 'Event detail' },
        ],
      },
      {
        type: 'text',
        label: 'What I Did',
        body: 'I contributed to both the design and development of Flock, creating a user-friendly interface for key features like the event feed, adding friends, and scheduling plans. I also worked on the backend, ensuring smooth functionality for features like creating events and RSVP-ing to hangouts.',
      },
      {
        type: 'stats',
        items: [
          { value: '100%', label: 'Task completion in pilot study' },
          { value: '5×', label: 'More likely to join with social proof' },
          { value: '0', label: 'Hardcoded data — fully live' },
          { value: '4/6', label: 'Went to Profile to add friends in minute one' },
        ],
      },
      {
        type: 'text',
        label: 'Theory → Implementation',
        body: 'Every design decision maps to a CS 278 social computing concept. Feed as first screen enforces social translucence. Participant limits set strong-tie norms. Event details showing who\'s going leverages social proof. Adding friends from Event Details reduces friction in natural context.',
      },
      {
        type: 'list',
        label: 'Technical Highlights',
        items: [
          'Real-time Supabase subscriptions — Insert/Update/Delete events reflect instantly in both users\' UIs without refresh',
          'Protected routing — login and onboarding detached from Tab Navigator; inner tabs require auth',
          'Nested navigation — Stack inside Tab for deep navigation (user profile from event detail)',
          'OAuth + Apple Sign In with SQL triggers for auto-insert and username policy checks',
          'Feed filtering — events grouped Today/Tomorrow/date, filtered via .gte("event_end", nowUTC)',
        ],
      },
      {
        type: 'text',
        label: 'What I Learned',
        body: 'I deepened my understanding of designing for social systems, particularly the importance of social proof in driving engagement and the challenges of mitigating context collapse. Through iterative testing, I honed my ability to align technical implementations with theoretical goals, ensuring the app effectively strengthened trust and close social bonds.',
      },
    ],
  },

  tailor: {
    slug: 'tailor',
    no: '06',
    name: 'Tailor',
    tagline: 'A platform concept addressing the needs of Turkey\'s small textile producers through streamlined communication and order management.',
    year: '2024',
    role: 'Solo — Needfinding · Research · UI Design',
    duration: 'SYMSYS 161 · Solo Project',
    tools: 'Figma, Stakeholder Interviews',
    accentColor: '#B36A5E',
    tags: ['UX Research', 'Product', 'Solo'],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        body: 'Tailor conceptually addresses the needs of Turkey\'s small textile producers by proposing a digital platform that facilitates streamlined communication and order management, reducing reliance on traditional, costly methods like phone calls. The platform\'s design integrates user insights, featuring real-time messaging, order tracking, and demand aggregation to assist producers in meeting minimum quantity requirements.',
      },
      {
        type: 'image',
        src: '/tailor-main.png',
        alt: 'Tailor platform overview',
        aspect: '16/9',
      },
      {
        type: 'text',
        label: 'Research',
        body: 'In the exploration of Tailor\'s potential, I delved into the core challenges facing small Turkish textile producers. By conducting need-finding interviews with industry stakeholders — including small fashion brands, suppliers, and a textile export VP — I gathered crucial user insights into the operational inefficiencies and communication barriers prevalent in the sector. My role also included analyzing the competitive landscape, assessing integration challenges with legacy tech systems, and exploring cybersecurity concerns. Personal roots in Istanbul were a research asset: cultural nuance informed question framing and enabled conversations that no secondary source could replicate.',
      },
      {
        type: 'list',
        label: 'Key Themes',
        items: [
          'Relationship-driven culture — trust built over years, not platforms. WhatsApp as de facto business tool.',
          'Minimum quantity problem — small brands can\'t meet MOQs alone; demand aggregation is the key lever.',
          'Non-technical users — interface must be frictionless to replace phone calls for a generation that negotiates by voice note.',
          'Legacy system friction — any digital layer must integrate with existing WhatsApp workflows, not replace them.',
        ],
      },
      {
        type: 'text',
        label: 'What I Did',
        body: 'I designed a mockup of what the platform could look like (in English for presentation). Once I knew what features I wanted to integrate, the interface was designed to surface real-time messaging, order tracking, and demand aggregation as primary actions — reducing the phone-call surface area without removing the relationship layer that the industry runs on.',
      },
      {
        type: 'images',
        aspect: '4/3',
        items: [
          { src: '/tailor-hom.png', alt: 'Tailor Home Mockup', caption: 'Home' },
          { src: '/tailor-orders.png', alt: 'Tailor Orders Mockup', caption: 'Orders' },
        ],
      },
      {
        type: 'list',
        label: 'What I Learned',
        items: [
          'Navigating Cultural Nuances — Leveraged my personal connection to Turkey to navigate a completely new industry, effectively bridging an 11-hour time difference and academic commitments to engage with local professionals.',
          'Building New Relationships — Cultivated a network from the ground up, initiating conversations with industry insiders and leveraging introductory meetings to expand my understanding of the textile market\'s dynamics.',
          'Synthesizing Local Knowledge — Developed a keen sense for blending familiar cultural knowledge with newly acquired industry-specific insights, crucial for conducting meaningful interviews and fostering trust with Turkish textile professionals.',
        ],
      },
      {
        type: 'pullquote',
        text: 'Personal background as a research asset — Istanbul roots enabled cultural navigation that no secondary source could provide.',
      },
    ],
  },

  hercules: {
    slug: 'hercules',
    no: '07',
    name: 'Hercules',
    tagline: 'A fully functional AI agent built to guide you through a customized journey to tracking and understanding your mobility.',
    year: '2024',
    role: 'Product Scoping · UX · UI Design',
    team: 'Mohammed Khalil, Aaron Choi, Defne Genç',
    duration: 'TreeHacks 2024 (Stanford)',
    tools: 'Figma',
    accentColor: '#C4621D',
    tags: ['UX', 'AI Agent', 'Hackathon'],
    sections: [
      {
        type: 'text',
        label: 'The Problem',
        body: 'Life expectancy has increased by three decades since the mid-twentieth century. Parallel "healthspan" expansion, however, has not followed. In the myriad of possible pathologies that could manifest in the "healthspan-lifespan gap", we\'re tackling a universal issue — loss of mobility.',
      },
      {
        type: 'image',
        src: '/hercules-cover.png',
        alt: 'Hercules app overview',
        aspect: '16/9',
      },
      {
        type: 'stats',
        items: [
          { value: '30yr', label: 'Growth in life expectancy since mid-20th century' },
          { value: '2', label: 'Input modalities: voice + image' },
          { value: '2', label: 'Modes: follow-up or new symptom' },
          { value: '24h', label: 'Build time at TreeHacks' },
        ],
      },
      {
        type: 'text',
        label: 'The Solution',
        body: 'Hercules is a fully functional AI agent built to guide you through a customized journey to tracking and understanding your mobility. Hercules can successfully understand and log your pain based on speech recognition and images alone. Users can tell Hercules they want to either (1) follow up on a previous pain/discomfort or (2) report a new one by pointing to where they\'re experiencing pain or describing it verbally — Hercules will ask follow-up questions and reflect your symptoms in your log.',
      },
      {
        type: 'text',
        label: 'What I Did',
        body: 'I owned (1) product scoping, (2) UX journey, (3) UI design for this project. I created mockups using Figma for the pain logging flow and dashboard, getting them ready for development and testing.',
      },
      {
        type: 'images',
        aspect: '9/16',
        items: [
          { src: '/hercules-1.png', alt: 'Hercules pain logging', caption: 'Pain logging' },
          { src: '/hercules-2.png', alt: 'Hercules follow-up', caption: 'Follow-up flow' },
          { src: '/hercules-3.png', alt: 'Hercules dashboard', caption: 'Dashboard' },
          { src: '/hercules-4.png', alt: 'Hercules history', caption: 'History' },
        ],
      },
      {
        type: 'text',
        label: 'What I Learned',
        body: 'Making UX decisions that not only address immediate health concerns but also promote long-term well-being. I learned to prioritize features and design elements that encourage proactive health monitoring and early intervention. By focusing on intuitive pain logging and symptom tracking, I aimed to empower users to take control of their health journey, making it easier to identify patterns and potential issues before they become severe.',
      },
      {
        type: 'pullquote',
        text: 'Designing with a forward-thinking mindset — ensuring that the user experience not only resolves current discomforts but also contributes to sustained mobility and overall health longevity.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(PROJECTS).map(slug => ({ slug }))
}

// ─── Nav helper ───────────────────────────────────────────────────────────────

const ALL_SLUGS = ['bloom', 'learningetal', 'menuto', 'dishcovery', 'flock', 'tailor', 'hercules']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = PROJECTS[slug]
  if (!project) notFound()

  const currentIdx = ALL_SLUGS.indexOf(slug)
  const prevSlug = currentIdx > 0 ? ALL_SLUGS[currentIdx - 1] : null
  const nextSlug = currentIdx < ALL_SLUGS.length - 1 ? ALL_SLUGS[currentIdx + 1] : null

  return (
    <main data-theme="light" style={{ background: 'var(--bg)', color: 'var(--ink)', height: '100vh', fontFamily: 'var(--font-main)', overflowY: 'auto' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(244,242,236,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${HL}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 2rem' }}>
        <Link href="/" style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          ← Work
        </Link>
        <span style={{ ...mono, fontSize: '0.72rem', color: 'rgba(136,136,128,0.4)', letterSpacing: '0.1em' }}>
          {project.no} / {project.name.toUpperCase()}
        </span>
        <Link href="/resume" style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Résumé →
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 6rem' }}>

        {/* Hero */}
        <div style={{ padding: '4rem 0 3rem', borderBottom: `1px solid ${HL}` }}>
          <div style={{ ...mono, fontSize: '0.72rem', color: project.accentColor, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.25rem' }}>
            {project.tags.join(' · ')}
          </div>
          {project.icon && (
            <Image src={project.icon} alt={project.name + ' icon'} width={56} height={56}
              style={{ borderRadius: 14, marginBottom: '1.25rem', display: 'block' }} />
          )}
          <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: '1.5rem' }}>
            {project.name}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', fontWeight: 300, lineHeight: 1.6, color: 'var(--ink-dim)', maxWidth: 600, marginBottom: '2.5rem' }}>
            {project.tagline}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {project.externalLink && (
              <a href={project.externalLink.href} target="_blank" rel="noreferrer"
                style={{ ...mono, display: 'inline-block', fontSize: '0.75rem', color: '#fff', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', background: project.accentColor, padding: '0.7rem 1.5rem', fontWeight: 600 }}>
                {project.externalLink.label}
              </a>
            )}
            {project.secondaryLink && (
              <a href={project.secondaryLink.href} target="_blank" rel="noreferrer"
                style={{ ...mono, display: 'inline-block', fontSize: '0.75rem', color: 'var(--ink)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', border: '1px solid var(--hairline)', padding: '0.7rem 1.5rem', fontWeight: 600 }}>
                {project.secondaryLink.label}
              </a>
            )}
            {project.jumpTo && (
              <a href={`#${project.jumpTo.anchor}`}
                style={{ ...mono, display: 'inline-block', fontSize: '0.75rem', color: 'var(--bg)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'var(--ink)', padding: '0.7rem 1.5rem', fontWeight: 600 }}>
                {project.jumpTo.label}
              </a>
            )}
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem 2rem' }}>
            {[
              { label: 'Year', value: project.year },
              { label: 'Role', value: project.role },
              project.team ? { label: 'Team', value: project.team } : null,
              project.duration ? { label: 'Context', value: project.duration } : null,
              project.tools ? { label: 'Tools', value: project.tools } : null,
              project.awards ? { label: 'Awards', value: project.awards } : null,
            ].filter(Boolean).map(item => item && (
              <div key={item.label}>
                <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', opacity: 0.6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--ink-dim)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Citation (full-width, copyable) */}
          {project.citation && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem', opacity: 0.6 }}>
                Citation
              </div>
              <CopyBlock text={project.citation} />
            </div>
          )}
        </div>

        {/* Sections */}
        <div style={{ paddingTop: '3rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {project.sections.map((section, i) => (
            <SectionBlock key={i} section={section} accent={project.accentColor} />
          ))}
        </div>

        {/* Prev / Next */}
        <div style={{ borderTop: `1px solid ${HL}`, marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          {prevSlug ? (
            <Link href={`/project/${prevSlug}`} style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              ← {PROJECTS[prevSlug].name}
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link href={`/project/${nextSlug}`} style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink-dim)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {PROJECTS[nextSlug].name} →
            </Link>
          ) : <div />}
        </div>

      </div>
    </main>
  )
}

// ─── Section components ────────────────────────────────────────────────────────

function ExternalOrLocalImage({ src, alt, aspect = '16/9' }: { src: string; alt: string; aspect?: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, background: 'rgba(26,25,24,0.04)', overflow: 'hidden' }}>
      <Image src={src} alt={alt} fill style={{ objectFit: 'contain' }} />
    </div>
  )
}

// Parse "Key — description" or "Key: description" format and bold the key
function ListItem({ text, accent }: { text: string; accent: string }) {
  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
  const emMatch = text.match(/^(.+?)\s*—\s*(.+)$/)
  const colonMatch = text.match(/^(.+?):\s*(.+)$/)
  const match = emMatch || colonMatch
  const sep = emMatch ? ' — ' : ': '
  return (
    <li style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink-dim)', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.65rem' }}>
      <span style={{ ...mono, fontSize: '0.7rem', color: accent, flexShrink: 0, paddingTop: '0.2rem' }}>—</span>
      <span>
        {match
          ? <><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{match[1]}</strong>{sep}{match[2]}</>
          : text
        }
      </span>
    </li>
  )
}

function SectionBlock({ section, accent }: { section: Section; accent: string }) {
  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
  const HL = 'var(--hairline)'

  switch (section.type) {
    case 'subheader':
      return (
        <div id={section.id} style={{ borderTop: `2px solid ${accent}`, paddingTop: '1.25rem', marginBottom: '-1rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
            {section.text}
          </h2>
        </div>
      )

    case 'text':
      return (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '0.6rem' }}>
            {section.label}
          </h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 700 }}>
            {section.body}
          </p>
        </div>
      )

    case 'pullquote':
      return (
        <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '1.5rem', margin: '0.5rem 0', background: 'rgba(26,25,24,0.03)', padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', fontWeight: 400, lineHeight: 1.65, color: 'var(--ink)', fontStyle: 'italic', letterSpacing: '-0.01em' }}>
            {section.text}
          </p>
        </div>
      )

    case 'stats':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem', padding: '1.75rem 0', borderTop: `1px solid ${HL}`, borderBottom: `1px solid ${HL}` }}>
          {section.items.map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 300, letterSpacing: '-0.05em', color: accent, lineHeight: 1, marginBottom: '0.4rem' }}>
                {item.value}
              </div>
              <div style={{ ...mono, fontSize: '0.68rem', color: 'var(--ink-dim)', lineHeight: 1.4 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )

    case 'list':
      return (
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '1rem' }}>
            {section.label}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {section.items.map((item, i) => (
              <ListItem key={i} text={item} accent={accent} />
            ))}
          </ul>
        </div>
      )

    case 'image':
      return (
        <div style={{ margin: '0 -2rem' }}>
          <ExternalOrLocalImage src={section.src} alt={section.alt} aspect={section.aspect} />
          {section.caption && (
            <div style={{ ...mono, fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.6rem', paddingLeft: '2rem' }}>
              {section.caption}
            </div>
          )}
        </div>
      )

    case 'images': {
      const cols = Math.min(section.items.length, 3)
      return (
        <div style={{ margin: '0 -2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.5rem' }}>
            {section.items.map((item, i) => (
              <div key={i}>
                <ExternalOrLocalImage src={item.src} alt={item.alt} aspect={section.aspect} />
                {item.caption && (
                  <div style={{ ...mono, fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '0.4rem', textAlign: 'center' }}>
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'phones':
      return (
        <div>
          {section.label && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink-dim)', marginBottom: '1.5rem', maxWidth: 700 }}>
              {section.label}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap' }}>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: '1 1 0', maxWidth: 380, minWidth: 200 }}>
                <div style={{
                  width: '100%',
                  background: '#000',
                  borderRadius: 'clamp(28px, 4vw, 44px)',
                  padding: 'clamp(7px, 1vw, 12px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)',
                  position: 'relative' as const,
                }}>
                  {/* Dynamic Island */}
                  <div style={{
                    position: 'absolute' as const,
                    top: 'clamp(10px, 1.4vw, 16px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'clamp(60px, 8vw, 84px)',
                    height: 'clamp(16px, 2.2vw, 24px)',
                    background: '#000',
                    borderRadius: 999,
                    zIndex: 2,
                  }} />
                  {/* Screen */}
                  <div style={{
                    borderRadius: 'clamp(21px, 3vw, 34px)',
                    overflow: 'hidden',
                    position: 'relative' as const,
                    aspectRatio: '9/19.5',
                  }}>
                    <Image src={item.src} alt={item.alt} fill style={{ objectFit: 'cover' }} />
                  </div>
                </div>
                {item.caption && (
                  <div style={{ ...mono, fontSize: '0.68rem', color: 'var(--ink-dim)', textAlign: 'center' as const }}>
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
