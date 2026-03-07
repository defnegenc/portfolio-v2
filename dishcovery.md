# Dishcovery — Project Context

**Type**: Stanford class project, two iterations
**Category**: Design (portfolio)
**Tags**: UI Design, Front-End Engineering, UX Research
**Accent color**: #FF6B35 (orange)

## What Dishcovery Is

A consumer app that helps users recognize, learn about, and cook with ingredients from other cultures. Uses image recognition to scan foreign ingredients and surface their cultural and culinary context (origins, flavor profile, health benefits, recipes).

Core flows: scan ingredient → get cultural context + recipes. Also: browse by cuisine, search by ingredient, save favorites.

## Defne's Role

- **UI Designer** — designed entire UI, task flows, and wireframes in Figma
- **Front-End Engineer** — React Native implementation

## Teams

- **V2** (CS 147): Amrita Palaparthi, Janet Zhong, Kyla Guru
- **V3** (CS 194H): Kayla Kelly, Sharon Wambu, Abena Ofosu

## Classes

- CS 147: Human-Computer Interaction Design
- CS 194H: UX Design Project

## Duration

20 weeks

## Tools

Figma, React Native, paper prototypes, Clarifai AI (food image recognition API)

## Awards

- Best Project
- Best Design (one of three)
- Best Concept (one of three)

## Research Process

Needfinding with diverse Bay Area non-student adults — tech professionals, small business owners, artists, educators. Key personas:
- **Grace**: Taiwanese grocery store owner, insights into customers seeking authenticity in Asian cooking
- **Jeson**: Malaysian immigrant, founder of OpenChefs, startup POV on authentic food delivery
- **Amy**: Server with deep sentimental connection to family recipes but emotional barriers to recreating them
- **Sofia/Jaclyn**: Immigrant chefs with professional + personal ties to cultural cuisine

Key insights: cultural connection through food, preference for hands-on learning, authenticity of ingredients matters beyond taste (the stories they tell), accessibility/convenience as a barrier, communal dimension of food.

## Experience Prototypes (pre-design)

Two prototypes tested before designing:

1. **Cultural Context Map**: Showed dish images without then with historical/cultural context → visualization on a map increased appreciation, but caused confusion over dish variants. Led to decision to move cultural context to the recipe page (not the scan result).

2. **Grocery Shopping Cultural Assistant**: Ranked likelihood to buy foreign ingredients before/after seeing ingredient info → additional context positively impacted willingness to purchase, but convenience still trumps novelty for some users.

Generated 60 ideas in brainstorming before converging on the image recognition companion concept.

## Key Design Decisions (V2 → V3)

Usability tests on the working V2 Expo build drove V3 changes:

- **Recipe steps as story**: Switched from scroll to swipe-through steps after observing that scrolling while cooking with soiled hands was hard for users
- **Scan border removed**: Had no actual functionality in the API — removed as it was misleading
- **Cultural context relocated**: Moved from ingredient scan result page to recipe page, so context is encountered at the moment of cooking, not shopping
- **"ABOUT THIS DISH" / "BACK TO RECIPE" toggle**: Single button to jump between cooking steps and cultural context
- **Religious dietary preferences added**: Surfaced a gap from usability testing
- **Confirmation before un-saving**: Small friction added to prevent accidental deletion
- **Ramadan Specials and cultural events on Home**: Noticed opportunity to celebrate cultural occasions

## Portfolio Framing

Dishcovery demonstrates:
- Full Stanford HCI methodology executed over 20 weeks: needfinding → personas → experience prototypes → ideation (60 ideas) → lo-fi → heuristic eval → working build → usability test → redesign
- Specific, user-grounded design decisions (recipe steps as story came from watching someone cook with messy hands)
- End-to-end ownership: sole designer (Figma, task flows, wireframes) + React Native frontend engineer
- Award-winning: Best Project, Best Design, Best Concept
