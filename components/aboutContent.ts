/* The About copy, shared by the /about page and the homepage's About tile so
   the two never drift apart. */

/* Defne's own words, verbatim. [GUI] and [CLI] are links to the other side
   of the site: on the terminal [GUI] opens the desk, on the desk [CLI] opens
   the terminal. Each side leaves the word for itself as plain text. */
export const ABOUT_PARAS = [
  "At my day job I’m a product manager, on paper I’m an engineer, and people like to call me a designer. I’m all and none of those things. And today, I would argue, those distinctions don’t matter. What does matter is how we turn new technology into something useful. That takes product vision, design taste, and engineering knowledge. What I actually like is building systems I’d actually want to interact with, which is an overwhelming rarity given the chattification of every interface.",
  "HCI is responsible for more than one technological revolution. The thinking that gave us the [GUI], the mouse and the touchscreen came out of it. The chat interface is to LLMs what the [CLI] was to personal computers: still useful, but not the final interface. We need to make the leap to find AI’s GUI.",
  "I’m a humanist obsessed with AI interfaces. I grew up in Istanbul, Turkey. I’m about to obtain my third computer science degree from Stanford University (or drop out, third time’s the charm) and have decided to devote it solely to thinking about the next interface revolution. And maybe finally learn how to code.",
]

// where each linked word goes
export const ABOUT_LINKS: Record<string, string> = { GUI: '/star', CLI: '/' }

export const ABOUT_FACTS: [string, string][] = [
  ['Based', 'New York City'],
  ['Education', 'Stanford CS PhD (deferred) · MS CS (HCI) · BS SymSys'],
  ['Languages', 'Turkish (native), English (fluent), French (conversational), Arabic (elementary), Spanish (elementary)'],
]
