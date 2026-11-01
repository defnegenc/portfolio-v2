/* What each project's window says, shared by the homepage and the desktop
   view: a couple of plain sentences, one image, and a link out in the
   project's own colour. */

export type Card = { title: string; accent: string; image?: string; text: string; points?: string[]; link: { href: string; label: string } }
export const CARDS: Record<string, Card> = {
  bloom: {
    title: 'Bloom', accent: '#266C31', image: '/bloom-figure.png',
    text: 'An LLM coach that helps people move more. I co-designed and tested it with Prof. Landay\u2019s lab at Stanford, as second author.',
    points: [
      'Best Paper at CHI 2026, top 1% of submissions.',
      'In a 4-week study with 54 people, the LLM version kept people engaged 5x longer.',
      'What I did: prototyping, UI/UX design, frontend, a Streamlit dashboard, participant onboarding and offboarding, qualitative coding of interviews, and safety and LLM red-teaming.',
      'The system is a ubiquitous computing concept that integrates with your wearable and your weekly goals. The UI/UX was challenging and rewarding to solve.',
    ],
    link: { href: 'https://stanfordhci.github.io/Bloom/', label: 'stanfordhci.github.io/Bloom' },
  },
  mydrift: {
    title: 'Catching My Drift', accent: '#FE00E5', image: '/drift-welcome.png',
    text: 'Speak a messy word dump and get a map of your ideas, in your own words.',
    points: ['Every idea on the map links back to the exact quote it came from.', 'A solo project. I designed and built it.'],
    link: { href: 'https://catchingmydrift.com', label: 'catchingmydrift.com' },
  },
  learningetal: {
    title: 'Learning Et Al.', accent: 'var(--ink)', image: '/learningetal-digest.png',
    text: 'A daily research digest built around one provocative question, from the papers and news that match your interests.',
    points: ['Sources are ranked by keyword search and embeddings together.', 'Interests fade over time, so the digest follows what you care about now.', 'A solo project, from the ranking to the design.'],
    link: { href: 'https://learningetal.com', label: 'learningetal.com' },
  },
  dishcovery: {
    title: 'Dishcovery', accent: '#FF6B35', image: '/dishcovery-hero.png',
    text: 'An app that recognises ingredients from a photo and shows you how to cook with them, across cuisines.',
    points: ['An award-winning project from Stanford\u2019s CS 147 and CS 194H.', 'I did the UI design and the frontend.'],
    link: { href: '/project/dishcovery', label: 'Read more' },
  },
  sponge: {
    title: 'Sponge OS', accent: 'var(--award)', image: '/sponge/assets/sponge-os-social.png',
    text: 'A little Bikini Bottom for your desktop. Rustic app icons, folder designs and scenic wallpapers to download.',
    link: { href: '/sponge/', label: 'Open Sponge OS' },
  },
  kilim: {
    title: 'Kilim', accent: 'var(--award)',
    text: 'A loom in the browser. Weave Anatolian kilim rugs, see what each motif means, and pull motifs out by hand.',
    link: { href: '/kilim/', label: 'Open Kilim' },
  },
}
