# Menuto — Project Context

**Type**: Personal project — AI-powered dish recommendation app
**Repo**: https://github.com/defnegenc/menuto
**Stack**: React Native (TypeScript, Expo) + FastAPI + Supabase/PostgreSQL + OpenAI + Google Places API

## The Problem (personal)

"I could never decide what to eat at restaurants." The obvious fix — ask AI — hits an immediate wall: what does AI know about *your* preferences? Menuto solves this by building a preference engine that learns from your own order history and uses it to make the call for you.

## Core Insight

Most food apps tell you *where* to go. None tell you *what to order once you're there*. Menuto closes that gap by making the menu itself machine-readable and matchable against your personal taste profile.

## How It Works

**1. Restaurant library**
Integrates with Google Places API so you can search and add any restaurant. Your library is your preference universe.

**2. Menu ingestion (four paths)**
The hard problem: menus exist in every format imaginable. Menuto handles all of them:
- **HTML parse** — give it a URL, it scrapes the menu
- **PDF parse** — upload the PDF
- **Image parse** — photograph the menu (OCR + GPT-4 for structure extraction)
- **Plaintext fallback** — paste it in if nothing else works

The LLM backend turns raw menu data into structured dish objects, which render as interactive UI components — tap to add any dish to your favorites.

**3. The recommendation flow**
Pick a restaurant → Menuto checks if the menu is already there (if not, add it via any of the 4 paths) → answer 3 quick questions:
- How hungry are you?
- Are you sharing?
- What are you in the mood for? (light / crispy / fresh / etc.)

Menuto returns a dish recommendation informed by your favorites.

**4. Feedback loop**
After eating, rate how much you liked it. The system keeps learning. Over time it knows not just what you've ordered but what you actually enjoyed.

**5. Personalization layer**
- Favorite cuisines
- Home city (for relevant restaurant suggestions)
- Dietary restrictions (filters recommendations accordingly)
- Social signal: choose between "go with what others liked" (social proof mode) or "be more adventurous" (exploration mode)

## What Makes This Hard (technically)

Menu parsing is the crux. Menus are unstructured, inconsistently formatted, and come in hostile formats (scanned PDFs, handwritten specials, image-heavy restaurant sites). Building a pipeline that handles all four input types and produces consistent structured output — dish name, description, price, category — required real engineering: HTML scraping, Tesseract OCR, GPT-4 for semantic parsing and normalization, and a fallback chain so something always works.

## Stack

**Backend**: FastAPI, Supabase/PostgreSQL, OpenAI GPT-4, Google Places API, Tesseract OCR
**Frontend**: React Native, TypeScript, Expo, Zustand

## Status

Backend API, recommendation engine, and menu parsing pipeline: complete. Mobile app UI and backend integration: in progress.

## Portfolio Framing

Menuto demonstrates:
- Starting from a real personal frustration and shipping real infrastructure to solve it
- Product insight: the gap isn't "where to eat" — it's "what to order" — and closing it requires making menus machine-readable
- Technical depth: four-path menu ingestion pipeline, LLM-powered normalization, preference learning loop
- Full-stack ownership: FastAPI backend, React Native frontend, designed and built solo
