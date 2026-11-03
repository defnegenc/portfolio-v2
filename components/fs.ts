/* The site's files, shared by the terminal (the main site) and the desktop
   (/star): the same folders, read as a CLI on one and a GUI on the other. */

/* The Projects folder: each project is a folder, each tidbit a file. */
export type Kind = 'folder' | 'doc' | 'link' | 'image' | 'pdf'
export const ITEMS: { id: string; kind: Kind; type: string; year: string }[] = [
  { id: 'bloom', kind: 'folder', type: 'Research', year: '2025' },
  { id: 'mydrift', kind: 'folder', type: 'Web app', year: '2026' },
  { id: 'learningetal', kind: 'folder', type: 'Website', year: '2026' },
  { id: 'dishcovery', kind: 'folder', type: 'iOS app', year: '2024' },
  { id: 'sponge', kind: 'doc', type: 'Desktop kit', year: '2026' },
  { id: 'kilim', kind: 'doc', type: 'Web toy', year: '2026' },
]

/* What's inside each project folder: Description (the short version with its
   pictures), the live site, and any papers. `file` is the name the terminal
   shows. */
export type Entry = { name: string; kind: Kind; href?: string; file: string }
export const FOLDERS: Record<string, Entry[]> = {
  bloom: [
    { name: 'Bloom website', kind: 'link', href: 'https://stanfordhci.github.io/Bloom/', file: 'site.url' },
    { name: 'Description', kind: 'doc', file: 'description.txt' },
    { name: 'paper.pdf', kind: 'pdf', href: 'https://arxiv.org/abs/2510.05449', file: 'paper.pdf' },
    { name: 'app-guide.pdf', kind: 'pdf', href: '/bloom-app-guide.pdf', file: 'app-guide.pdf' },
  ],
  mydrift: [
    { name: 'catchingmydrift.com', kind: 'link', href: 'https://catchingmydrift.com', file: 'site.url' },
    { name: 'Description', kind: 'doc', file: 'description.txt' },
  ],
  learningetal: [
    { name: 'learningetal.com', kind: 'link', href: 'https://www.learningetal.com', file: 'site.url' },
    { name: 'Description', kind: 'doc', file: 'description.txt' },
  ],
  dishcovery: [
    { name: 'case study', kind: 'link', href: '/project/dishcovery', file: 'case-study.url' },
    { name: 'Description', kind: 'doc', file: 'description.txt' },
  ],
}

// the name a project's folder or file has in the terminal
export const dirName = (id: string, title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

// the pictures in each project, with captions; the GUI sets them in the
// Description, the terminal lists them as image files you can imgcat
export const PICTURES: Record<string, [string, string][]> = {
  bloom: [['/bloom-figure.png', 'The LLM coach, the Today home screen, the weekly summary, a push notification and the lockscreen display.']],
  mydrift: [['/drift-welcome.png', 'The welcome page: a sample map of three topics, each with the quote it came from.']],
  learningetal: [['/learningetal-digest.png', 'Today\u2019s digest: the central question, a one-line answer and the first source.'], ['/learningetal-card.png', 'A source card: title, byline, TL;DR and findings.']],
  dishcovery: [['/dishcovery-hero.png', 'Dishcovery.'], ['/dishcovery-onboarding.png', 'Onboarding.'], ['/dishcovery-scan.png', 'Scanning an ingredient.'], ['/dishcovery-explore.png', 'Exploring dishes.'], ['/dishcovery-recipe.png', 'A recipe.'], ['/dishcovery-saved.png', 'Saved dishes.'], ['/dishcovery-grocery.png', 'The grocery list.']],
}
export const picFile = (src: string) => src.split('/').pop() ?? src
