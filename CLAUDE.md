# Portfolio v2 — Claude Context

## Project Goal

Build a dynamic personal portfolio that showcases creativity, design skills, and technical depth. This is not a generic dev portfolio — it should feel alive, intentional, and reflect a strong design sensibility alongside real research and engineering chops.

## About the Owner

Defne Genç — Stanford MS (CS HCI), researcher-turned-PM. Worked with Prof. James Landay's lab.

Background: started in wet lab research (Stanford Medicine, Kuo Lab — ovarian cancer organoids), then pivoted to HCI. Brings rigorous experimental methodology + strong design taste + real engineering ability.

Core strengths for the portfolio to convey:
- HCI research (study design, qualitative coding, paper authorship)
- Safety engineering (LLM red-teaming, harm taxonomy, benchmark validation)
- UI/UX design (led all design decisions on Bloom)
- Frontend development (implementation decisions and execution)
- Product sense (bridging research goals with real user experience)

> Resume lives in the repo (add path here once added). Update this file with resume contents when available.

## Projects

See individual project files for full context. Source portfolio at `/Users/defnegenc/Desktop/defne-portfolio/`.

Projects are not split by design vs. dev — most span both. Present as a unified list.

- **Bloom** (anchor project) — `bloom.md` — Stanford HCI research, second author, LLM coaching app; research + safety + design + frontend
- **Learning Et Al.** — learningetal.com — Solo project, daily research digest; Next.js 16 + Turso + Drizzle + ONNX embeddings + Vercel; hybrid ranking (BM25+embedding RRF), multi-stage synthesis pipeline, interest decay, theme novelty enforcement
- **Menuto** — `menuto.md` — Solo project, AI dish recommendation; React Native + Expo + FastAPI + Gemini + Supabase; 8-component composite scoring with Bayesian weight learning, embedding-based taste compatibility
- **Dishcovery** — `dishcovery.md` — CS 147 + CS 194H, award-winning; food/culture app; UI design + frontend
- **Flock** — `flock.md` — CS 278 (Social Computing), React Native social app; design + full-stack
- **Spiritwood** — `spiritwood.md` — CS 247G (Design for Play), Unity puzzle-platformer; narrative + visual + game design
- **Tailor** — `tailor.md` — SYMSYS 161, solo UX research; Turkish textile SME platform concept

## Bloom Summary (anchor project)

Second author. MS thesis work with Prof. Landay. LLM-augmented physical activity coaching app. **Won Best Paper at CHI 2026 (top 1% of submissions).**
- Full details in `bloom.md`
- Key stat: 5x longer engagement, +1.2 vs +0.8 mindset shift in LLM condition
- Safety system: 600-example benchmark, >96% recall across harm categories
- Contributions: UI design (most influence), safety filters (led red-teaming), frontend (most influence), recruitment, qualitative coding, paper

## Defne's Writing Style

When writing copy for this portfolio, match these characteristics:

- **Direct and confident.** No hedging, no filler. Lead with the claim, then support it.
- **No em dashes.** Use commas, periods, or colons instead.
- **No staccato ad-copy sentences.** "You're at a restaurant. You don't know what to order." reads as cringe. Flow naturally.
- **Curly quotes (\u201c\u201d) not straight quotes** in all portfolio copy.
- **Don\u2019t name-drop LLM providers (Gemini, ChatGPT, OpenAI) in body copy.** Say "LLM" or "the model." Brand names only in the Tools metadata field.
- **Solo projects use "I", never "we".**
- **No cringe transitions.** Avoid "that sounds like a left turn", "in that order", meta-commentary about her own career arc.
- **First person, not third.** "I led" not "she led."
- **Research work: use "we" for team effort, "I" for specific individual contributions.**
- **Concrete over vague.** Specific numbers, named tools, named people. "600-example benchmark" not "extensive testing."
- **Intellectually serious.** She cares about ideas. Copy about her research interests should read like a smart person's genuine thinking, not a mission statement.
- **Understated ambition.** Don't oversell. The facts are strong. Let them speak.
- **Short sentences when making strong claims.** Longer sentences for nuance and context.
- **No generic PM/designer speak.** Avoid "user-centric", "leverage", "drive impact", "stakeholders."

## Portfolio Design Direction

- Showcase the intersection of research rigor + design taste + technical ability
- Feel: editorial, confident, not a template — the portfolio itself should be proof of design skill
- Highlight the unusual combination: HCI research + safety engineering + product sense + visual design
- Dynamic, not static — interactive moments, thoughtful motion, strong hierarchy
- Audience: design-forward PM/research roles, top-tier tech companies, academic labs

## Stack / Technical Notes

- Next.js 15 App Router, static export (`output: 'export'`, `images: { unoptimized: true }`)
- All project data lives in `app/project/[slug]/page.tsx` as a single `PROJECTS` record with typed `Section` union
- Section types: text, pullquote, image, images, phones (iPhone mockup CSS frames), diagram (inline SVG), stats, list, subheader
- Homepage project data (order, tags, previews, badge) lives in `app/page.tsx` PROJECTS array
- Hover previews use alpha PNGs (`*-0alpha.png`) shown at 85% opacity via CSS class `.pt-preview`
- File casing matters: deploy target is case-sensitive Linux. Always use lowercase extensions (.png not .PNG)
- `ListItem` component parses both "Key — description" and "Key: description" formats for bold keys
- Apercu Pro font files in `public/fonts/`, Fragment Mono via next/font
