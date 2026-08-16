import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import CopyBlock from './CopyBlock'
import ExpandableTile from './ExpandableTile'
import { PAGE_MAX, heroTitle, sectionHeading } from '@/components/layout'

// ─── Project Data ─────────────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const HL = 'var(--hairline)'

type Section =
  | { type: 'text'; label?: string; body: string }
  | { type: 'pullquote'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string; aspect?: string }
  | { type: 'images'; items: { src: string; alt: string; caption?: string }[]; aspect?: string }
  | { type: 'phones'; items: { src: string; alt: string; caption?: string }[]; label?: string }
  | { type: 'diagram'; id: string }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | { type: 'list'; label: string; items: string[]; numbered?: boolean }
  | { type: 'tiles'; items: { title: string; rows: { label?: string; body: string }[]; featured?: boolean; palette?: boolean }[] }
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
  heroAside?: { src: string; alt: string; width?: number }
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
    tagline: 'At Stanford with Prof. Landay, I co-designed and evaluated Bloom, an LLM-based physical activity coaching intervention. My contributions spanned early-stage design through full-stack implementation.',
    year: '2025',
    role: 'UI/UX Design · Safety Engineering · Frontend · Second Author',
    citation: 'Jörke, J., Genç, D., Teutschbein, M., Sapkota, S., Chung, J., Schmiedmayer, H.-B., Campero, A., King, A. C., Brunskill, E., & Landay, J. A. (2026). Bloom: Designing for LLM-Augmented Behavior Change Interactions. CHI \'26. ACM. https://arxiv.org/abs/2510.05449',
    duration: '4-week randomized field study · N=54',
    tools: 'Figma · React Native · TypeScript · Swift/HealthKit · Python/FastAPI · Firebase · OpenAI · LLM red-teaming · Qualitative coding',
    accentColor: '#266C31',
    tags: ['CHI 2026', 'Best Paper', 'Top 1%'],
    awards: 'Best Paper Award · Top 1% of submissions',
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
        type: 'pullquote',
        text: 'I\u2019m always indecisive at restaurants, and when I do decide, it\u2019s always the wrong thing.',
      },
      {
        type: 'tiles',
        items: [{
          title: 'Why Not Just Ask an LLM?',
          rows: [{
            body: 'You could send a model a photo of the menu and ask \u201cwhat should I order?\u201d You\u2019d get a generic answer: no memory of what you\u2019ve liked, no awareness of what reviewers say about this restaurant, no way to learn that you loved the cacio e pepe but hated the carbonara. Every conversation starts from zero. I wanted a system with state: one that tracks your favorites across restaurants, extracts taste signals from your ratings, and runs an 8-component scoring algorithm with Bayesian weight learning that adapts to how you decide.',
          }],
        }],
      },
      {
        type: 'stats',
        items: [
          { value: '~50', label: 'Dishes scored per request across 8 signal sources' },
          { value: '3', label: 'Menu input modes: photo, URL, paste' },
          { value: '4', label: 'LLM calls per recommendation (embeddings + agent reasoning)' },
          { value: '6', label: 'LLM-analyzed dietary flags per dish (catches hidden ingredients)' },
        ],
      },
      {
        type: 'subheader',
        text: 'The App',
      },
      {
        type: 'phones',
        label: 'Find a restaurant and browse its full menu, then set your mood: how hungry you are, how adventurous, what you’re craving, and how you’re dining.',
        items: [
          { src: '/choosedish2.png', alt: 'Restaurant search results', caption: 'Find a restaurant' },
          { src: '/restaurantdetailscreen.png', alt: 'Restaurant detail with menu', caption: 'Browse the full menu' },
          { src: '/choosedish3.png', alt: 'Preference sliders', caption: 'Hunger and taste sliders' },
          { src: '/choosedish4.png', alt: 'Craving and dining style', caption: 'Cravings and dining context' },
        ],
      },
      {
        type: 'phones',
        label: 'The agent reasons about your signals and returns personalized picks with explanations. Rate dishes after your meal; your favorites carry across restaurants for future visits.',
        items: [
          { src: '/dishesloading.png', alt: 'Agent thinking', caption: 'Browsing the kitchen' },
          { src: '/chosendishes.png', alt: 'Recommended dishes', caption: 'Your picks with reasons' },
          { src: '/ratedishes.png', alt: 'Rate your dishes', caption: 'Rate and save favorites' },
          { src: '/Your-Restaurants.png', alt: 'Saved restaurants', caption: 'Your restaurant list' },
        ],
      },
      {
        type: 'subheader',
        text: 'The Recommendation Engine',
      },
      {
        type: 'diagram',
        id: 'menuto-pipeline',
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'Agent-First Architecture',
            rows: [{
              body: 'Rather than rigid scoring formulas, an LLM agent receives every signal about the user and reasons about what to recommend. An earlier version used 10 hand-tuned components (personal taste: 0.30, sentiment: 0.17, etc.), but the weights were identical for everyone and couldn\'t reason about context.',
            }],
          },
          {
            title: 'Research Foundations',
            rows: [{
              body: 'Informed by Microsoft\u2019s RecAI framework (Zhao et al., 2024): the \u201cLLM-as-brain, models-as-tools\u201d pattern where traditional signals generate candidates and the LLM handles final reasoning. The serendipity slot draws on SERAL (Chen et al., 2025) for filter-bubble mitigation, and the implicit negative feedback model follows Hu, Koren & Volinsky (2008) on collaborative filtering for implicit feedback.',
            }],
          },
        ],
      },
      {
        type: 'tiles',
        items: [{
          title: 'The Pipeline',
          rows: [
            { label: 'Data Gathering', body: '8 signal sources per dish: parsed menu items, Google Places reviews (cached 14 days), review-based popularity, cross-user order counts, past ratings, behavioral signals (views/orders/favorites), LLM-extracted taste keywords, and embedding-based taste similarity (2 batch API calls).' },
            { label: 'Dietary Filtering', body: 'The only rigid step. LLM-generated dietary flags per dish, prompted to catch hidden ingredients (anchovy in Caesar dressing, fish sauce in Pad Thai). Falls back to a 30+ term keyword list for older menus.' },
            { label: 'Signal Enrichment', body: 'Each candidate gets readable flags: MATCHES YOUR TASTE, POPULAR (60%), WELL-REVIEWED, LOOKED AT BUT NEVER ORDERED. No numerical scoring, just facts the agent can reason about.' },
            { label: 'Agent Selection', body: 'The agent receives the full user narrative: taste profile, spice tolerance, hunger, cravings, the adventure-vs-safe slider, dining occasion, free-text mood, and history here. It reasons about meal composition, honors cravings, and writes a personal explanation per dish.' },
            { label: 'Feedback Loop', body: 'After ordering, the user rates dishes with quick-tap tags and optional notes. The LLM extracts taste signals from the text: \u201cLoved the cream sauce\u201d becomes liked: [\u201ccream\u201d, \u201crich sauce\u201d], boosting similar dishes next time.' },
          ],
        }],
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'How It Learns',
            rows: [
              {
                label: 'Thompson Sampling for Weight Learning',
                body: 'The 8-component algorithm doesn\'t use fixed weights. Each user has Bayesian priors (alpha/beta per component) that update on every rating, so the system learns whether they respond more to popularity, taste matching, or craving alignment, with no cold-start dataset. After ~10 ratings the weights diverge meaningfully from the uniform prior.',
              },
              {
                label: 'Embedding-Based Taste Compatibility',
                body: 'The user\'s taste profile and each dish description are embedded into the same vector space, then scored by cosine similarity. Someone who likes "creamy burrata" scores well on "stracciatella with olive oil" even with no keyword overlap. Two API calls total: one for the profile, one batch for all candidates.',
              },
              {
                label: 'Review Sentiment Decomposition',
                body: 'The LLM extracts per-dish sentiment from Google Places reviews. \u201cThe cacio e pepe was transcendent but the tiramisu was dry\u201d decomposes into dish-level praise and criticism scores feeding the customer_praise component. Cached 14 days to stay within the Places API free tier.',
              },
            ],
          },
          {
            title: 'System Design',
            rows: [
              {
                label: 'Multi-modal menu ingestion',
                body: 'Three input paths (URL/HTML scraping, PDF via PyMuPDF, camera photo via LLM vision) normalize into the same ParsedDish schema. Content type is auto-detected from response headers with a byte-sniffing fallback.',
              },
              {
                label: 'Composite scoring, 8 components',
                body: 'Personal taste (embedding similarity), craving match, hunger fit, popularity/sentiment, dietary compliance, cuisine affinity, price fit, and friend boost. The system explains each recommendation by surfacing which components dominated.',
              },
              {
                label: 'Behavioral signals as separate tables',
                body: 'dish_views, dish_ratings, dish_orders, dish_favorites are separate normalized tables rather than a single interactions table. Enables efficient per-signal queries and signal-specific columns (hunger_level_when_ordered on orders, taste_signals JSONB on ratings).',
              },
              {
                label: 'Cold start via cross-user popularity',
                body: 'New users get recommendations weighted toward what others ordered and review sentiment. Free-text mood ("celebrating tonight") gives the agent context even without rating history.',
              },
            ],
          },
        ],
      },
    ],
  },

  learningetal: {
    slug: 'learningetal',
    no: '02',
    name: 'Learning Et Al.',
    tagline: 'Learning Et Al. (\u201clearning it all\u201d). A daily research digest that finds, synthesizes, and contrasts academic papers and news articles based on your interests.',
    year: '2026',
    role: 'Solo — Product · Design · Full-Stack',
    duration: 'Personal Project · End-to-End Ownership',
    tools: 'Next.js 16 · Turso/libsql · Drizzle ORM · Tailwind · ONNX embeddings (all-MiniLM-L6-v2) · OpenAlex · Auth.js · Resend · Vercel · Paper',
    accentColor: '#1a1a1a',
    tags: ['Solo Project', 'RecSys', 'LLM Agents'],
    icon: '/learningetal-icon.png',
    heroAside: { src: '/learningetal-share.png', alt: 'Learning Et Al. share card', width: 260 },
    externalLink: { href: 'https://learningetal.com', label: 'Visit learningetal.com ↗' },
    sections: [
      {
        type: 'pullquote',
        text: 'After leaving research, I didn\u2019t want to stray from the literature, but I didn\u2019t want to read entire papers either. I wanted to see what\u2019s out there and find new things to be curious about.',
      },
      {
        type: 'images',
        aspect: '1280/1014',
        items: [
          { src: '/learningetal-digest.png', alt: 'Today\u2019s digest on learningetal.com: the central question, a one-line answer, and the first source card' },
          { src: '/learningetal-card.png', alt: 'A single source card: title, byline, TL;DR, and findings beside a takeaway' },
        ],
      },
      {
        type: 'stats',
        items: [
          { value: '10\u201312', label: 'LLM calls per digest' },
          { value: '~$0.015', label: 'Cost per digest' },
          { value: '91 \u2192 28', label: 'Design tokens after the system pass' },
          { value: '769 KB', label: 'First-load JS, down from 932' },
        ],
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'The Core Idea',
            featured: true,
            rows: [{
              body: 'Every digest starts from a real research topic, not a keyword. The system walks the live OpenAlex taxonomy from one of your interests down to a specific topic, skips anything used in the last eight digests, and hands that topic to the model as grounding for a central question. Papers are then found as **tools to think with**, ranked for relevance and diversity, and the two or three that argue best together are the ones you get.',
            }],
          },
          {
            title: 'One Digest Per Day',
            featured: true,
            rows: [{
              body: 'One digest each morning, generated by a queued cron job while you sleep. You can regenerate, but you have to say what was wrong with the one you got. The constraint is the product: engage with today\u2019s sources or wait for tomorrow. The value is curation, not volume.',
            }],
          },
        ],
      },
      {
        type: 'subheader',
        text: 'Why Not Just Summarize Papers?',
      },
      {
        type: 'text',
        body: 'Because a summary of papers from different fields just lists them side by side; the interesting part is the argument between them, and that has to be built, not summarized.',
      },
      {
        type: 'diagram',
        id: 'learningetal-pipeline',
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'The Synthesis Pipeline',
            rows: [{
              body: 'So the synthesis writes a **structured skeleton first**: which source supports the thread, which complicates it, where the tension is. Only then is prose written, checked for factual accuracy, scored across five dimensions, and revised. A typical digest costs 10 to 12 model calls and about a cent and a half. The skeleton-first approach draws on Yao 2023\u2019s Tree of Thoughts and Madaan 2023\u2019s Self-Refine.',
            }],
          },
          {
            title: 'Self-Correcting Loops',
            rows: [{
              body: 'Each stage assumes the previous one may have erred. Summaries are checked against the abstract they came from. Drafts are checked for **factual accuracy** before style is critiqued at all. A final **coverage gate** verifies every source still appears by name, re-inserting any that a revision quietly dropped.',
            }],
          },
        ],
      },
      {
        type: 'subheader',
        text: 'How a Digest Gets Made',
      },
      {
        type: 'tiles',
        items: [{
          title: 'The Pipeline, Step by Step',
          palette: true,
          rows: [
            { label: 'Topic seed', body: 'A weighted sample picks the day\u2019s interest, then the system resolves it against the live OpenAlex taxonomy: field to subfield to topic. Topics used in the last eight digests are excluded, anything under 3,000 works is skipped, and sampling inside the vetted pool uses a square-root rank discount so lower-ranked topics still surface. Novelty stays bounded by a real research neighborhood instead of randomness.' },
            { label: 'Central question', body: 'The model builds a working question from the seeded topic (eight words is the target, ten the ceiling) plus three search queries. The last twelve queries it wrote are shown back to it with instructions not to reuse them.' },
            { label: 'Retrieval', body: 'Queries route deterministically through OpenAlex topic IDs: the first scoped tight for precision, the rest wider so papers where the topic is secondary still qualify. A scoped query that underfills widens to the subfield, then goes unscoped. Semantic Scholar and arXiv are the fallbacks. Anything shown in any past digest is dropped by ID and by normalized title.' },
            { label: 'Scoring', body: 'Candidates are scored on BM25 and embedding similarity, fused by Reciprocal Rank Fusion, measured against whichever is closer: the theme or the query that found the paper. The theme is deliberately jargon-free, so strong papers under-score against it alone. Predatory venues are dropped, recent work and strong venues get a small boost, and everything below threshold is cut.' },
            { label: 'Diversity pool', body: 'Six papers are picked by Maximal Marginal Relevance, so each addition maximizes relevance while minimizing overlap with what is already in. It stops six variations of the same finding.' },
            { label: 'Complementarity', body: 'The model picks the two or three that argue best together: ones that support, complicate, or explain each other. A second pass re-ranks them and drops anything that only fits by climbing to a generic umbrella. Two coherent sources beat three where one has to be narrated as filler.' },
            { label: 'Foundational lane', body: 'Separately, the system asks what today\u2019s papers were built on. It reads their reference lists for a shared ancestor at least eight years old with more than 500 citations, and when references turn up nothing it searches for the canon and verifies each named work against OpenAlex, so a hallucinated title dies at lookup. A gate then asks whether the candidate is genuinely field-defining or just an old survey. Most days the answer is no, which is what keeps the gold card meaningful.' },
            { label: 'News (parallel)', body: 'While papers are scored, it searches for recent coverage of the same thread. The count is dynamic: three strong papers and news is skipped, thin papers and news fills the gap. Snippets are too short for embeddings to judge alone, so a word guard runs alongside.' },
            { label: 'Editorial pass', body: 'The working question was retrieval scaffolding, not the headline. Once the final sources are set, an editor pass names the one thread they share, gives every kept source its connection, sets the reading order so understanding is cumulative, drafts three headlines and picks one. A deterministic gate checks that headline for vague subjects and paraphrased jargon before it ships, because it is also the email subject line.' },
          ],
        }],
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'Staying Interesting',
            palette: true,
            rows: [
              {
                label: 'Topic and theme novelty',
                body: 'The day\u2019s topic is excluded from the last eight digests before the question is even written, and the question itself is checked for shared words against the last five. Without this, themes converge to a template within weeks.',
              },
              {
                label: 'The headline gate',
                body: 'Headlines kept coming out as riddles: \u201cCan technology read your mind without touching it?\u201d The cause was a prompt asking for a title you cannot tell the subject of. Now a deterministic check runs after the model. A placeholder noun in subject position sinks the headline outright, and a regex catches de-jargoning that describes a property instead of naming the object, so \u201cwithout touching it\u201d fails while \u201cwithout soil\u201d ships. One rewrite is allowed and it has to clear the same gate.',
              },
              {
                label: 'Interest decay',
                body: 'Topics lose weight daily (\u00D70.95) with a penalty for recent use, counted by exact match against what actually seeded past digests rather than word overlap with their themes, which used to punish \u201cmachine learning\u201d because a theme said \u201cmachines\u201d. A coverage floor forces in an interest that has been starved for ten digests. Engagement signals stay small: one starred paper once dominated the feed.',
              },
              {
                label: 'Antipattern prompting',
                body: 'Models route around banned strings: banning \u201chere\u2019s where it gets interesting\u201d produces \u201chere\u2019s where it gets messier.\u201d So the self-critique scans for pattern shapes, not literal phrases. Vague claims (\u201cbarriers\u201d, \u201climitations\u201d) need a concrete example in the same sentence or they\u2019re dropped. Em dashes are banned in every string the metadata call returns, which was easier to enforce than to explain.',
              },
            ],
          },
          {
            title: 'Things I Reworked',
            palette: true,
            rows: [
              {
                label: 'Theme generation',
                body: 'Started with a \u201cbest paper\u201d anchor, scrapped when highly-cited papers pulled in wrong-field methods. Mandatory revision helped, then backfired when the model warped themes to fit weak papers. The question is now written last, from the final sources outward, and the retrieval question gets no keep-by-default privilege.',
              },
              {
                label: 'Paper selection and filtering',
                body: 'Citation graph \u2192 keyword matching \u2192 embedding-only \u2192 BM25+embedding RRF with MMR diversity. Retrieval now routes through real OpenAlex topic IDs rather than field labels the model invented, since an invented label was never actually a filter. Hard blocklists for predatory publishers, soft penalties for high-volume journals.',
              },
              {
                label: 'Where questions live',
                body: 'Every digest used to pre-generate follow-up questions and answers, most of which nobody read. Questions moved to where reading happens, on saved papers, grounded in the full text. Then the reading view itself was cut back to a gist and what has cited the paper since.',
              },
              {
                label: 'The card',
                body: 'TL;DR only, then stat chunks, then a 2\u00D72 tile grid behind a toggle, then ten candidates rendered against the real component. The one that won has no expand control at all.',
              },
              {
                label: 'Weight',
                body: 'A dead-code pass removed about 5,700 lines, including three abandoned reading modes I had kept \u201cto compare against\u201d. First-load JS came down 17.5% by loading the surviving legacy view dynamically, and the public digest is now CDN-cached, which took a cold visit from 1.9 seconds to roughly 0.2.',
              },
              {
                label: 'News sources',
                body: 'Hardcoded RSS \u2192 DuckDuckGo scraping (broke on one CSS change) \u2192 Serper/DDG with User-Agent rotation and field-specific RSS fallback.',
              },
            ],
          },
        ],
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
        body: 'Dishcovery is a consumer app that uses image recognition to help you recognise, learn about, and cook with foods from around the world. Scan an unfamiliar ingredient to see its cultural and culinary context, explore recipes by cuisine or ingredient, and save what you want to try.',
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
        <Link href="/" style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.8, textDecoration: 'none' }}>
          ← Work
        </Link>
        <span style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.45 }}>
          {project.name}
        </span>
        <Link href="/resume" style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.8, textDecoration: 'none' }}>
          Résumé →
        </Link>
      </nav>

      <div style={{ maxWidth: PAGE_MAX, margin: '0 auto', padding: '0 2.5rem 6rem' }}>

        {/* Hero */}
        <div style={{ padding: '3rem 0 2.5rem', borderBottom: `1px solid ${HL}` }}>
          {/* Eyebrow tags (full width, above both columns) */}
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: project.accentColor, marginBottom: '1.5rem' }}>
            {project.tags.join(' · ')}
          </div>

          <div className="section-row" style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Left: name + description */}
          <div>
          <h1 style={{ ...heroTitle, marginBottom: '1.25rem' }}>
            {project.name}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.08rem)', fontWeight: 300, lineHeight: 1.6, color: 'var(--ink-dim)', marginBottom: '2rem' }}>
            {project.tagline}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {project.externalLink && (
              <a href={project.externalLink.href} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', fontSize: '0.95rem', color: '#fff', textDecoration: 'none', background: project.accentColor, borderRadius: 999, padding: '0.65rem 1.5rem', fontWeight: 500 }}>
                {project.externalLink.label}
              </a>
            )}
            {project.secondaryLink && (
              <a href={project.secondaryLink.href} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', fontSize: '0.95rem', color: 'var(--ink)', textDecoration: 'none', border: '2px solid var(--ink-dim)', borderRadius: 999, padding: '0.65rem 1.5rem', fontWeight: 500 }}>
                {project.secondaryLink.label}
              </a>
            )}
            {project.jumpTo && (
              <a href={`#${project.jumpTo.anchor}`}
                style={{ display: 'inline-block', fontSize: '0.95rem', color: 'var(--bg)', textDecoration: 'none', background: 'var(--ink)', borderRadius: 999, padding: '0.65rem 1.5rem', fontWeight: 500 }}>
                {project.jumpTo.label}
              </a>
            )}
          </div>
          </div>

          {/* Right: optional aside image + meta spec sheet */}
          <div>
          {project.heroAside && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <Image
                src={project.heroAside.src}
                alt={project.heroAside.alt}
                width={project.heroAside.width ?? 240}
                height={Math.round((project.heroAside.width ?? 240) * 0.525)}
                style={{ width: project.heroAside.width ?? 240, height: 'auto', display: 'block' }}
              />
            </div>
          )}
          <div style={{ borderTop: `1px solid ${HL}` }}>
            {[
              { label: 'Year', value: project.year },
              { label: 'Role', value: project.role },
              project.team ? { label: 'Team', value: project.team } : null,
              project.duration ? { label: 'Context', value: project.duration } : null,
              project.tools ? { label: 'Tools', value: project.tools } : null,
              project.awards ? { label: 'Awards', value: project.awards } : null,
            ].filter(Boolean).map(item => item && (
              <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '4.75rem 1fr', gap: '1rem', padding: '0.7rem 0', borderBottom: `1px solid ${HL}`, alignItems: 'baseline' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink)', opacity: 0.62 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.45, color: 'var(--ink)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          </div>
          </div>

          {/* Citation (full-width, copyable) */}
          {project.citation && (
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)', opacity: 0.7, marginBottom: '0.4rem' }}>
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
            <Link href={`/project/${prevSlug}`} style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.8, textDecoration: 'none' }}>
              ← {PROJECTS[prevSlug].name}
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link href={`/project/${nextSlug}`} style={{ fontSize: '0.95rem', color: 'var(--ink)', opacity: 0.8, textDecoration: 'none' }}>
              {PROJECTS[nextSlug].name} →
            </Link>
          ) : <div />}
        </div>

      </div>
    </main>
  )
}

// ─── Section components ────────────────────────────────────────────────────────

function renderBody(text: string): React.ReactNode {
  const parts = text.split('**')
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: 'var(--ink)', fontWeight: 600 }}>{part}</strong>
      : part
  )
}

function ExternalOrLocalImage({ src, alt, aspect = '16/9' }: { src: string; alt: string; aspect?: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, background: 'rgba(26,25,24,0.04)', overflow: 'hidden' }}>
      <Image src={src} alt={alt} fill style={{ objectFit: 'contain' }} />
    </div>
  )
}

// Parse "Key — description" or "Key: description" format and bold the key
function ListItem({ text, accent, index }: { text: string; accent: string; index?: number }) {
  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
  const emMatch = text.match(/^(.+?)\s*—\s*(.+)$/)
  const colonMatch = text.match(/^(.+?):\s*(.+)$/)
  const match = emMatch || colonMatch
  const sep = emMatch ? ' — ' : ': '
  return (
    <li style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink-dim)', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.65rem' }}>
      <span style={{ ...mono, fontSize: '0.7rem', color: accent, flexShrink: 0, paddingTop: '0.2rem', minWidth: index !== undefined ? '1.2rem' : 'auto' }}>{index !== undefined ? `${index + 1}.` : '—'}</span>
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
          <h2 style={sectionHeading}>
            {section.text}
          </h2>
        </div>
      )

    case 'text':
      return (
        <div>
          {section.label && (
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '0.6rem' }}>
              {section.label}
            </h3>
          )}
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--ink-dim)', maxWidth: 760 }}>
            {renderBody(section.body)}
          </p>
        </div>
      )

    case 'pullquote':
      return (
        <figure style={{ margin: '1.5rem auto', maxWidth: 820, textAlign: 'center' }}>
          <div aria-hidden="true" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(3rem, 5vw, 4rem)', lineHeight: 0.5, color: accent, fontWeight: 700, marginBottom: '1rem', userSelect: 'none' }}>
            “
          </div>
          <blockquote style={{ margin: 0, fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)', fontWeight: 400, lineHeight: 1.45, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {section.text}
          </blockquote>
        </figure>
      )

    case 'stats':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', padding: '2rem 0', borderTop: `1px solid ${HL}`, borderBottom: `1px solid ${HL}` }}>
          {section.items.map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, letterSpacing: '-0.05em', color: accent, lineHeight: 1, marginBottom: '0.5rem' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ink)', opacity: 0.72, lineHeight: 1.45 }}>
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
              <ListItem key={i} text={item} accent={accent} index={section.numbered ? i : undefined} />
            ))}
          </ul>
        </div>
      )

    case 'image':
      return (
        <div style={{ margin: '0 -2rem' }}>
          <ExternalOrLocalImage src={section.src} alt={section.alt} aspect={section.aspect} />
          {section.caption && (
            <div style={{ fontSize: '0.88rem', color: 'var(--ink)', opacity: 0.65, marginTop: '0.6rem', paddingLeft: '2rem' }}>
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
                  <div style={{ fontSize: '0.88rem', color: 'var(--ink)', opacity: 0.65, marginTop: '0.4rem', textAlign: 'center' }}>
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'phones': {
      // Bigger screens, 4 across, centered in a wider band than the text column.
      return (
        <div style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: 'min(1320px, 92vw)' }}>
          {section.label && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink-dim)', fontWeight: 300, maxWidth: 760, margin: '0 auto 1.75rem', textAlign: 'center' as const }}>
              {section.label}
            </p>
          )}
          <div style={{ display: 'flex', gap: 'clamp(1.25rem, 2vw, 2rem)', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
            {section.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', flex: '1 1 0', maxWidth: 270, minWidth: 150 }}>
                <div style={{
                  width: '100%',
                  background: '#000',
                  borderRadius: 'clamp(20px, 2.5vw, 30px)',
                  padding: 'clamp(4px, 0.4vw, 6px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)',
                  position: 'relative' as const,
                }}>
                  <div style={{
                    borderRadius: 'clamp(16px, 2vw, 25px)',
                    overflow: 'hidden',
                    position: 'relative' as const,
                    aspectRatio: '9/19.5',
                  }}>
                    <Image src={item.src} alt={item.alt} fill sizes="270px" style={{ objectFit: 'cover' }} />
                  </div>
                </div>
                {item.caption && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-dim)', textAlign: 'center' as const, lineHeight: 1.4, maxWidth: 200 }}>
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'tiles':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: section.items.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {section.items.map((item, i) => (
            <ExpandableTile key={i} title={item.title} rows={item.rows} accent={accent} featured={item.featured} palette={item.palette} />
          ))}
        </div>
      )

    case 'diagram':
      if (section.id === 'menuto-pipeline') return <MenutoPipelineDiagram />
      if (section.id === 'learningetal-pipeline') return <LearningEtAlPipelineDiagram />
      return null

    default:
      return null
  }
}

// ─── Menuto Pipeline Diagram ──────────────────────────────────────────────────

function MenutoPipelineDiagram() {
  const mono = "'Fragment Mono', monospace"
  const c = { bg: '#F7CACA', accent: '#D8131F', accentLight: '#F0A9A9', border: '#E89B9B', text: '#1A1918', dim: '#5A5955' }
  const stages = [
    { label: 'Menu Parse', sub: '3 input modes', detail: 'URL · Photo · Text' },
    { label: 'Dietary Filter', sub: 'LLM-analyzed', detail: '6 flags per dish' },
    { label: 'Signal Enrich', sub: '8 sources', detail: 'Reviews · History · Embeddings' },
    { label: 'Agent Select', sub: 'LLM reasoning', detail: 'Full user narrative' },
    { label: 'Feedback Loop', sub: 'Taste extraction', detail: 'Bayesian weight update' },
  ]
  const W = 980, stageW = 168, stageH = 88, gap = 22
  const totalW = stages.length * stageW + (stages.length - 1) * gap
  const startX = (W - totalW) / 2

  return (
    <div style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: 'min(1400px, 94vw)', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} 160`} style={{ width: '100%', maxWidth: '100%', display: 'block', margin: '0 auto' }}>
        <defs>
          <marker id="arrow-menuto" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={c.accent} />
          </marker>
        </defs>
        {stages.map((s, i) => {
          const x = startX + i * (stageW + gap)
          const y = 20
          return (
            <g key={i}>
              <rect x={x} y={y} width={stageW} height={stageH} rx={6} fill={c.bg} stroke={c.accent} strokeWidth={1.5} />
              <text x={x + stageW / 2} y={y + 24} textAnchor="middle" fontFamily={mono} fontSize={10} fontWeight={600} fill={c.text} letterSpacing="0.03em">
                {s.label.toUpperCase()}
              </text>
              <text x={x + stageW / 2} y={y + 42} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={c.accent} letterSpacing="0.02em">
                {s.sub}
              </text>
              <text x={x + stageW / 2} y={y + 60} textAnchor="middle" fontFamily={mono} fontSize={7.5} fill={c.dim} letterSpacing="0.02em">
                {s.detail}
              </text>
              {i < stages.length - 1 && (
                <line x1={x + stageW + 2} y1={y + stageH / 2} x2={x + stageW + gap - 2} y2={y + stageH / 2} stroke={c.accent} strokeWidth={1.5} markerEnd="url(#arrow-menuto)" />
              )}
            </g>
          )
        })}
        {/* Feedback return arrow */}
        <path
          d={`M ${startX + 4 * (stageW + gap) + stageW / 2} ${20 + stageH + 4} L ${startX + 4 * (stageW + gap) + stageW / 2} ${20 + stageH + 28} L ${startX + stageW / 2} ${20 + stageH + 28} L ${startX + stageW / 2} ${20 + stageH + 4}`}
          fill="none" stroke={c.accentLight} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrow-menuto)"
        />
        <text x={W / 2} y={20 + stageH + 42} textAnchor="middle" fontFamily={mono} fontSize={7} fill={c.dim} letterSpacing="0.06em">
          TASTE SIGNALS FEED BACK INTO SCORING
        </text>
      </svg>
    </div>
  )
}

// ─── Learning Et Al. Pipeline Diagram ─────────────────────────────────────────

function LearningEtAlPipelineDiagram() {
  const mono = "'Fragment Mono', monospace"
  const c = { bg: '#D8CBF0', accent: '#6D28D9', accentLight: '#B49DE6', border: '#AE97E0', text: '#1A1918', dim: '#5A5955' }

  const topRow = [
    { label: 'Topic Seed', sub: 'OpenAlex taxonomy', detail: 'Last 8 excluded' },
    { label: 'Question Gen', sub: 'Theme-first', detail: 'Grounded in topic' },
    { label: 'Retrieval', sub: 'BM25 + Embeddings', detail: 'RRF + MMR diversity' },
    { label: 'Selection', sub: 'Complementarity', detail: 'Re-rank + drop' },
  ]
  const botRow = [
    { label: 'Editorial Pass', sub: 'Evidence-outward', detail: 'Headline + order' },
    { label: 'Skeleton', sub: 'Roles + tensions', detail: 'Structured JSON' },
    { label: 'Prose', sub: 'Argument arc', detail: 'Not summaries' },
    { label: 'Critique + Revise', sub: 'Self-refine', detail: 'Coverage gate' },
  ]

  const W = 980, stageW = 168, stageH = 82, gap = 18
  const topTotalW = topRow.length * stageW + (topRow.length - 1) * gap
  const botTotalW = botRow.length * stageW + (botRow.length - 1) * gap
  const topStartX = (W - topTotalW) / 2
  const botStartX = (W - botTotalW) / 2
  const topY = 16, botY = 130

  return (
    <div style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: 'min(1400px, 94vw)', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} 248`} style={{ width: '100%', maxWidth: '100%', display: 'block', margin: '0 auto' }}>
        <defs>
          <marker id="arrow-lea" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={c.accent} />
          </marker>
        </defs>

        {/* Top label */}
        <text x={topStartX} y={10} fontFamily={mono} fontSize={7.5} fill={c.dim} letterSpacing="0.1em">DISCOVERY</text>

        {topRow.map((s, i) => {
          const x = topStartX + i * (stageW + gap)
          return (
            <g key={`t${i}`}>
              <rect x={x} y={topY} width={stageW} height={stageH} rx={6} fill={c.bg} stroke={c.accent} strokeWidth={1.5} />
              <text x={x + stageW / 2} y={topY + 22} textAnchor="middle" fontFamily={mono} fontSize={10} fontWeight={600} fill={c.text} letterSpacing="0.03em">
                {s.label.toUpperCase()}
              </text>
              <text x={x + stageW / 2} y={topY + 40} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={c.accent} letterSpacing="0.02em">
                {s.sub}
              </text>
              <text x={x + stageW / 2} y={topY + 56} textAnchor="middle" fontFamily={mono} fontSize={7.5} fill={c.dim} letterSpacing="0.02em">
                {s.detail}
              </text>
              {i < topRow.length - 1 && (
                <line x1={x + stageW + 2} y1={topY + stageH / 2} x2={x + stageW + gap - 2} y2={topY + stageH / 2} stroke={c.accent} strokeWidth={1.5} markerEnd="url(#arrow-lea)" />
              )}
            </g>
          )
        })}

        {/* Connecting arrow from top row to bottom row */}
        <path
          d={`M ${topStartX + 2 * (stageW + gap) + stageW / 2} ${topY + stageH + 2} L ${topStartX + 2 * (stageW + gap) + stageW / 2} ${topY + stageH + 14} L ${botStartX + stageW / 2} ${topY + stageH + 14} L ${botStartX + stageW / 2} ${botY - 2}`}
          fill="none" stroke={c.accent} strokeWidth={1.5} markerEnd="url(#arrow-lea)"
        />

        {/* Bottom label (right-aligned to clear the connecting arrow) */}
        <text x={botStartX + botTotalW} y={botY - 8} textAnchor="end" fontFamily={mono} fontSize={7.5} fill={c.dim} letterSpacing="0.1em">SYNTHESIS (10-12 LLM CALLS)</text>

        {botRow.map((s, i) => {
          const x = botStartX + i * (stageW + gap)
          return (
            <g key={`b${i}`}>
              <rect x={x} y={botY} width={stageW} height={stageH} rx={6} fill={c.bg} stroke={c.accent} strokeWidth={1.5} />
              <text x={x + stageW / 2} y={botY + 22} textAnchor="middle" fontFamily={mono} fontSize={10} fontWeight={600} fill={c.text} letterSpacing="0.03em">
                {s.label.toUpperCase()}
              </text>
              <text x={x + stageW / 2} y={botY + 40} textAnchor="middle" fontFamily={mono} fontSize={8.5} fill={c.accent} letterSpacing="0.02em">
                {s.sub}
              </text>
              <text x={x + stageW / 2} y={botY + 56} textAnchor="middle" fontFamily={mono} fontSize={7.5} fill={c.dim} letterSpacing="0.02em">
                {s.detail}
              </text>
              {i < botRow.length - 1 && (
                <line x1={x + stageW + 2} y1={botY + stageH / 2} x2={x + stageW + gap - 2} y2={botY + stageH / 2} stroke={c.accent} strokeWidth={1.5} markerEnd="url(#arrow-lea)" />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
