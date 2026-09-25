/* Project data for the project pages (/project/[slug]).
   Kept apart from the view so the copy can be edited without touching layout. */

export type Section =
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

export interface Project {
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
  /** A wide figure runs full width under the hero instead of in the aside. */
  heroWide?: { src: string; alt: string; ratio: number; plate?: boolean }
  /** A row of app screens across the bottom of the page. */
  heroRow?: { src: string; alt: string }[]
  /** Full-width screens stacked down the page, scrolled rather than fitted. */
  heroStack?: { src: string; alt: string; ratio: number }[]
  externalLink?: { href: string; label: string }
  secondaryLink?: { href: string; label: string }
  jumpTo?: { anchor: string; label: string }
  sections: Section[]
}

export const PROJECTS: Record<string, Project> = {
  bloom: {
    slug: 'bloom',
    heroWide: { src: '/bloom-figure.png', alt: 'Bloom: the LLM coach, the Today home screen, the weekly summary, a push notification, and the ambient lockscreen display', ratio: 4860 / 2374, plate: true },
    no: '01',
    name: 'Bloom',
    tagline: 'At Stanford with Prof. Landay, I co-designed and evaluated Bloom, an LLM-based physical activity coaching intervention.',
    year: '2025',
    role: 'UI/UX Design · Safety Engineering · Frontend · Second Author',
    citation: 'Jörke, J., Genç, D., Teutschbein, M., Sapkota, S., Chung, J., Schmiedmayer, H.-B., Campero, A., King, A. C., Brunskill, E., & Landay, J. A. (2026). Bloom: Designing for LLM-Augmented Behavior Change Interactions. CHI \'26. ACM. https://arxiv.org/abs/2510.05449',
    duration: '4-week randomized field study · N=54',
    tools: 'Figma · React Native · TypeScript · Swift/HealthKit · Python/FastAPI · Firebase · OpenAI · LLM red-teaming · Qualitative coding',
    accentColor: '#266C31',
    tags: ['CHI 2026', 'Best Paper', 'Top 1%'],
    awards: 'ACM SIGCHI Best Paper Award',
    externalLink: { href: 'https://stanfordhci.github.io/Bloom/', label: 'View the Bloom website ↗' },
    secondaryLink: { href: '/bloom-app-guide.pdf', label: 'App Guide PDF ↗' },
    sections: [
      {
        type: 'subheader',
        text: 'The App',
      },
      {
        type: 'text',
        label: 'Garden Ambient Display',
        body: 'The core design concept I led: a garden that lives on your homescreen and lockscreen and grows as you complete your weekly activity plan, in 20% increments. Every walk adds a bee (size proportional to duration); every other activity adds a butterfly (color varies by type). The garden resets if you don\'t hit 100% by week\'s end, and evolves to a new plant when you do. The goal was to make progress feel gradual and accumulative rather than binary, reducing the goal-fixation anxiety that metrics-forward health apps tend to produce. This was one of the central design decisions we made as a team.',
      },
      {
        type: 'text',
        label: 'Two Conditions',
        body: 'We designed both conditions: treatment (with Beebo, the LLM coach) and control (without). Both used the same garden ambient display, plan-setting, and wearable integration. The only difference was the conversational AI layer, which let us isolate the effect of LLM coaching on engagement, mindset shift, and behavior change.',
      },
      {
        type: 'subheader',
        text: 'My Contributions',
      },
      {
        type: 'text',
        label: 'UI/UX Design',
        body: 'I had the most influence on UI design across the app, from the garden metaphor and ambient lockscreen display to the activity logging interface, onboarding flows, and overall app architecture. I also designed and built the Bloom website. This wasn\'t a design handoff role: I made key decisions on app architecture and user experience end to end, working closely with the team to ensure the UI served the study\'s behavior change hypotheses.',
      },
      {
        type: 'text',
        label: 'Safety Engineering',
        body: 'I led red-teaming for the LLM coaching agent across a vulnerable participant population: adults with existing activity barriers, including chronic pain and mental health considerations. I created a taxonomy of harm categories and validated a 600-example benchmark achieving >96% recall across risk categories. This was domain-expert red-teaming, not automated, and it was critical: Beebo regularly encountered sensitive topics that required nuanced, harm-aware guardrails to keep responses safe and within scope.',
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
        text: 'LLM coaching\'s primary value is psychological, not behavioral: surfacing behaviors people already do so they realize they\'re doing more than they\'ve given themselves credit for.',
      },
      {
        type: 'list',
        label: 'Key Findings',
        items: [
          'Even participants with shallow engagement showed meaningful mindset changes. The garden display made progress feel real even without deep conversational interaction.',
          'Highlights of existing behaviors (gardening, walking to work) counted as exercise, enabling participants to discover they were already doing more than they realized.',
          'Safety filtering was essential: participants raised chronic pain, mental health struggles, and grief, which required nuanced, harm-aware responses that the red-teamed guardrails handled correctly.',
        ],
      },
    ],
  },

  menuto: {
    slug: 'menuto',
    heroRow: [
      { src: '/choosedish2.png', alt: 'Menuto: choosing a dish' },
      { src: '/dishesloading.png', alt: 'Menuto: dishes loading' },
      { src: '/chosendishes.png', alt: 'Menuto: chosen dishes' },
      { src: '/Your-Restaurants.png', alt: 'Menuto: your restaurants' },
    ],
    no: '03',
    name: 'Menuto',
    tagline: 'Dish recommendations from an LLM agent that learns your taste, using your favorites from other restaurants to predict what you\'ll love at new ones. Solo-built end to end.',
    year: '2026',
    role: 'Solo · Product · Design · Full-Stack',
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
        text: 'I’m always indecisive at restaurants, and when I do decide, it’s always the wrong thing.',
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
        text: 'How It Works',
      },
      {
        type: 'diagram',
        id: 'menuto-pipeline',
      },
      {
        type: 'tiles',
        items: [{
          title: 'The Recommendation Engine',
          rows: [
            { label: 'An agent, not a formula', body: 'An LLM agent gets every signal about you and the menu and reasons about what you should order. My first version used 10 hand-tuned weights, but they were the same for everyone and couldn’t reason about context.' },
            { label: 'It learns you', body: 'Each user has Bayesian priors that update on every rating, so the system learns whether you follow popularity, taste match, or cravings. After about 10 ratings your weights pull away from the default.' },
            { label: 'Taste that travels', body: 'Your taste profile and every dish live in the same embedding space, so someone who loves creamy burrata scores well on stracciatella with olive oil, with no shared keywords.' },
            { label: 'One hard rule', body: 'Dietary filtering is the only rigid step. The model flags hidden ingredients, like anchovy in Caesar dressing or fish sauce in Pad Thai.' },
          ],
        }],
      },
    ],
  },

  learningetal: {
    slug: 'learningetal',
    heroRow: [
      { src: '/learningetal-digest.png', alt: 'Today’s digest: the central question, a one-line answer, and the first source card' },
      { src: '/learningetal-card.png', alt: 'A single source card: title, byline, TL;DR, and findings beside a takeaway' },
    ],
    no: '02',
    name: 'Learning Et Al.',
    tagline: 'Learning Et Al. (\u201clearning it all\u201d). A daily research digest around a provocative question, built from the papers and news that match your interests.',
    year: '2026',
    role: 'Solo · Product · Design · Full-Stack',
    duration: 'Personal Project · End-to-End Ownership',
    tools: 'Next.js 16 · Turso/libsql · Drizzle ORM · Tailwind · ONNX embeddings (all-MiniLM-L6-v2) · OpenAlex · Auth.js · Resend · Vercel · Paper',
    accentColor: '#1a1a1a',
    tags: ['Solo Project', 'RecSys', 'LLM Agents'],
    icon: '/learningetal-icon.png',
    externalLink: { href: 'https://learningetal.com', label: 'Visit learningetal.com ↗' },
    sections: [
      {
        type: 'pullquote',
        text: 'After leaving research, I didn’t want to stray from the literature, but I didn’t want to read entire papers either. I wanted to see what’s out there and find new things to be curious about.',
      },
      {
        type: 'images',
        aspect: '1280/1014',
        items: [
          { src: '/learningetal-digest.png', alt: 'Today’s digest on learningetal.com: the central question, a one-line answer, and the first source card' },
          { src: '/learningetal-card.png', alt: 'A single source card: title, byline, TL;DR, and findings beside a takeaway' },
        ],
      },
      {
        type: 'tiles',
        items: [
          {
            title: 'The Core Idea',
            featured: true,
            rows: [{
              body: 'Every digest starts from a real research topic, not a keyword. The system walks the OpenAlex taxonomy from one of your interests down to a specific topic, writes a provocative question around it, and gives you the two or three papers that argue best together.',
            }],
          },
          {
            title: 'One Digest Per Day',
            featured: true,
            rows: [{
              body: 'One digest each morning, generated while you sleep. You can regenerate, but you have to say what was wrong with the one you got. The value is curation, not volume.',
            }],
          },
        ],
      },
      {
        type: 'subheader',
        text: 'How a Digest Gets Made',
      },
      {
        type: 'diagram',
        id: 'learningetal-pipeline',
      },
      {
        type: 'tiles',
        items: [{
          title: 'What Makes It Work',
          rows: [
            { label: 'Structure before prose', body: 'A summary of papers from different fields just lists them side by side. So the synthesis first decides which source supports the question, which complicates it, and where the tension is, then writes, fact-checks, and revises. A digest costs about a cent and a half.' },
            { label: 'Relevant, not redundant', body: 'Candidates are ranked with BM25 and embeddings fused by Reciprocal Rank Fusion, then picked by Maximal Marginal Relevance so you never get six versions of the same finding.' },
            { label: 'Staying interesting', body: 'Topics from the last eight digests are excluded and interests decay daily, so themes don’t converge to a template within weeks.' },
            { label: 'No riddle headlines', body: 'A deterministic check rejects headlines like “Can technology read your mind without touching it?” before they ship, because the headline is also the email subject line.' },
          ],
        }],
      },
    ],
  },

  dishcovery: {
    slug: 'dishcovery',
    heroWide: { src: '/dishcovery-hero.png', alt: 'Dishcovery', ratio: 3200 / 2515 },
    heroStack: [
      { src: '/dishcovery-onboarding.png', alt: 'Dishcovery: onboarding', ratio: 2000 / 904 },
      { src: '/dishcovery-scan.png', alt: 'Dishcovery: scanning ingredients', ratio: 2000 / 971 },
      { src: '/dishcovery-explore.png', alt: 'Dishcovery: exploring dishes', ratio: 2000 / 1015 },
      { src: '/dishcovery-recipe.png', alt: 'Dishcovery: a recipe', ratio: 2000 / 834 },
      { src: '/dishcovery-saved.png', alt: 'Dishcovery: saved dishes', ratio: 2000 / 971 },
      { src: '/dishcovery-grocery.png', alt: 'Dishcovery: the grocery list', ratio: 1600 / 622 },
    ],
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
        type: 'subheader',
        text: 'Research',
      },
      {
        type: 'text',
        label: 'What We Heard',
        body: 'We interviewed non-student adults across the Bay Area, from a Peruvian head chef to the owner of an Asian grocery store. They wanted to reconnect with food from their cultures, learned best hands-on, and cared about authentic ingredients. What got in the way was finding the right ingredients and knowing how to use them.',
      },
      {
        type: 'image',
        src: "/dishcovery-empathy.png",
        alt: 'Empathy Map for Dishcovery',
        caption: 'Empathy map capturing user sentiments about cultural food experiences',
        aspect: '16/9',
      },
      {
        type: 'text',
        label: 'Prototyping',
        body: 'Two experience prototypes shaped the product. Cultural context on a map made people appreciate an ingredient more, and background information in a grocery store made them more willing to buy one, though convenience usually won. Out of 60 ideas we chose a grocery companion: scan an ingredient and see where it comes from, what to cook, and how to use it.',
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
        type: 'subheader',
        text: 'Final Design',
        id: 'final-design',
      },
      {
        type: 'text',
        label: 'V3 Redesign',
        body: 'We usability-tested the working React Native build and redesigned from what we saw. Recipe steps became swipeable, cultural context moved to the recipe page, and the home screen picked up cultural events like Ramadan specials.',
      },
      {
        type: 'image',
        src: "/dishcovery-scan.png",
        alt: 'Ingredient scanning process',
        caption: 'Scanning: progress, success and failure states, and ingredient information',
        aspect: '16/9',
      },
      {
        type: 'image',
        src: "/dishcovery-recipe.png",
        alt: 'Recipe screens',
        caption: 'Recipe steps and cultural context',
        aspect: '16/9',
      },
      {
        type: 'pullquote',
        text: '“Recipe steps as story”: we switched from scroll to swipe after watching someone try to cook with soiled hands.',
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
        label: 'Theory → Implementation',
        body: 'Every design decision maps to a CS 278 social computing concept. Feed as first screen enforces social translucence. Participant limits set strong-tie norms. Event details showing who\'s going leverages social proof. Adding friends from Event Details reduces friction in natural context.',
      },
      {
        type: 'list',
        label: 'Technical Highlights',
        items: [
          'Real-time Supabase subscriptions: Insert/Update/Delete events reflect instantly in both users\' UIs without refresh',
          'Protected routing: login and onboarding detached from Tab Navigator; inner tabs require auth',
          'Nested navigation: Stack inside Tab for deep navigation (user profile from event detail)',
          'OAuth + Apple Sign In with SQL triggers for auto-insert and username policy checks',
          'Feed filtering: events grouped Today/Tomorrow/date, filtered via .gte("event_end", nowUTC)',
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
    role: 'Solo · Needfinding · Research · UI Design',
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
        body: 'In the exploration of Tailor\'s potential, I delved into the core challenges facing small Turkish textile producers. By conducting need-finding interviews with industry stakeholders, including small fashion brands, suppliers, and a textile export VP, I gathered crucial user insights into the operational inefficiencies and communication barriers prevalent in the sector. My role also included analyzing the competitive landscape, assessing integration challenges with legacy tech systems, and exploring cybersecurity concerns. Personal roots in Istanbul were a research asset: cultural nuance informed question framing and enabled conversations that no secondary source could replicate.',
      },
      {
        type: 'list',
        label: 'Key Themes',
        items: [
          'Relationship-driven culture: trust built over years, not platforms. WhatsApp as de facto business tool.',
          'Minimum quantity problem: small brands can\'t meet MOQs alone; demand aggregation is the key lever.',
          'Non-technical users: interface must be frictionless to replace phone calls for a generation that negotiates by voice note.',
          'Legacy system friction: any digital layer must integrate with existing WhatsApp workflows, not replace them.',
        ],
      },
      {
        type: 'text',
        label: 'What I Did',
        body: 'I designed a mockup of what the platform could look like (in English for presentation). Once I knew what features I wanted to integrate, the interface was designed to surface real-time messaging, order tracking, and demand aggregation as primary actions, reducing the phone-call surface area without removing the relationship layer that the industry runs on.',
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
          'Navigating Cultural Nuances: Leveraged my personal connection to Turkey to navigate a completely new industry, effectively bridging an 11-hour time difference and academic commitments to engage with local professionals.',
          'Building New Relationships: Cultivated a network from the ground up, initiating conversations with industry insiders and leveraging introductory meetings to expand my understanding of the textile market\'s dynamics.',
          'Synthesizing Local Knowledge: Developed a keen sense for blending familiar cultural knowledge with newly acquired industry-specific insights, crucial for conducting meaningful interviews and fostering trust with Turkish textile professionals.',
        ],
      },
      {
        type: 'pullquote',
        text: 'Personal background as a research asset: Istanbul roots enabled cultural navigation that no secondary source could provide.',
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
        body: 'Life expectancy has increased by three decades since the mid-twentieth century. Parallel "healthspan" expansion, however, has not followed. In the myriad of possible pathologies that could manifest in the "healthspan-lifespan gap", we\'re tackling a universal issue: loss of mobility.',
      },
      {
        type: 'text',
        label: 'The Solution',
        body: 'Hercules is a fully functional AI agent built to guide you through a customized journey to tracking and understanding your mobility. Hercules can successfully understand and log your pain based on speech recognition and images alone. Users can tell Hercules they want to either (1) follow up on a previous pain/discomfort or (2) report a new one by pointing to where they\'re experiencing pain or describing it verbally, and Hercules will ask follow-up questions and reflect your symptoms in your log.',
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
        text: 'Designing with a forward-thinking mindset: ensuring that the user experience not only resolves current discomforts but also contributes to sustained mobility and overall health longevity.',
      },
    ],
  },
}

/* The four projects the homepage lists, and the only ones that get a page.
   Flock, Tailor and Hercules still have data below but are not routed: the
   prev/next chain was walking visitors into them from Dishcovery. */
export const ALL_SLUGS = ['bloom', 'learningetal', 'menuto', 'dishcovery']

/* What the homepage table says about each project, for listings outside it. */
export const KIND: Record<string, string> = {
  bloom: 'Research',
  learningetal: 'Website',
  menuto: 'iOS app',
  dishcovery: 'iOS app',
}

/* The pipeline diagrams as data, so the page can draw them
   as ruled HTML at reading size rather than as a fixed SVG. */
export type Stage = { label: string; sub: string; detail: string }
export const DIAGRAMS: Record<string, { groups: { title?: string; stages: Stage[] }[]; loop?: string }> = {
  'menuto-pipeline': {
    groups: [{
      stages: [
        { label: 'Menu Parse', sub: '3 input modes', detail: 'URL · Photo · Text' },
        { label: 'Dietary Filter', sub: 'LLM-analyzed', detail: '6 flags per dish' },
        { label: 'Signal Enrich', sub: '8 sources', detail: 'Reviews · History · Embeddings' },
        { label: 'Agent Select', sub: 'LLM reasoning', detail: 'Full user narrative' },
        { label: 'Feedback Loop', sub: 'Taste extraction', detail: 'Bayesian weight update' },
      ],
    }],
    loop: 'Taste signals feed back into scoring',
  },
  'learningetal-pipeline': {
    groups: [
      {
        title: 'Discovery',
        stages: [
          { label: 'Topic Seed', sub: 'OpenAlex taxonomy', detail: 'Last 8 excluded' },
          { label: 'Question Gen', sub: 'Theme-first', detail: 'Grounded in topic' },
          { label: 'Retrieval', sub: 'BM25 + Embeddings', detail: 'RRF + MMR diversity' },
          { label: 'Selection', sub: 'Complementarity', detail: 'Re-rank + drop' },
        ],
      },
      {
        title: 'Synthesis (10-12 LLM calls)',
        stages: [
          { label: 'Editorial Pass', sub: 'Evidence-outward', detail: 'Headline + order' },
          { label: 'Skeleton', sub: 'Roles + tensions', detail: 'Structured JSON' },
          { label: 'Prose', sub: 'Argument arc', detail: 'Not summaries' },
          { label: 'Critique + Revise', sub: 'Self-refine', detail: 'Coverage gate' },
        ],
      },
    ],
  },
}
