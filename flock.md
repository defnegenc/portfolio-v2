# Flock — Project Context

**Type**: Stanford CS 278 (Social Computing) class project
**Tags**: Full-Stack, Social Computing, React Native
**Team**: Elena Recaldini, Malina Calarco, Pedro Civita, Defne Genç

## The Insight (use this as the hook)

> "Calendars mark when we're busy professionally, but we don't have a system of translucence for when we're free socially."

The problem: assuming your friends are busy — and them assuming the same about you — means hangouts that could happen, don't. Texting everyone one-by-one has friction. Group chats suffer from social loafing (someone responds, so everyone else stays quiet assuming it's handled). Flock makes availability opt-in and visible to close friends only.

## What Flock Is

A social mobile app for spontaneous, small-group hangouts with close friends. Users post availability as "Events" (e.g. "free for lunch Thursday noon, first friend to claim it joins me"). Events disappear from the feed once the participant limit is reached. The Feed — sorted by date, color-coded with 5 rotating colors — is the primary surface; it's the first thing you see when you open the app.

Core flows: post an event → friends see it in their feed → claim it → it's scheduled. Friend requests, profiles, calendar view, and real-time notifications all fully implemented.

## Defne's Contributions

Design + development across:
- UI for event feed, create event screen, event details, notifications
- Backend: event creation, RSVP logic, friend relations

## End-to-End Implementation (what makes this stand out)

One of the few class projects that reached full working implementation with zero hardcoding. The entire social graph is live:
- **Real-time subscriptions** via Supabase: friend requests update instantly (Insert/Update/Delete events handled individually — so accepting a request reflects immediately in both users' UIs without refresh)
- **Protected routing**: login and onboarding detached from the main Tab Navigator; inner tabs only accessible post-authentication
- **Nested navigation**: Stack inside Tab for deep navigation (e.g. visiting another user's profile from an event detail)
- **Feed sorting**: events grouped by Today / Tomorrow / date, filtered to exclude past events via `.gte("event_end", nowUTC)`
- **OAuth + Apple Sign In**: single-click account creation, with SQL triggers to auto-insert new user rows and username policy checks
- **Native date/time picker**: iOS 14-style picker replaced a text field that was causing consistent input errors in early testing

## Theory-Grounded Design Decisions

Every design decision maps to a social computing concept:

- **Feed as first screen** → social translucence: make others' availability visible by default, not buried
- **Participant limits** → strong tie norm-setting: Flock is for intimate hangouts, not parties. Onboarding shows examples of small events (movie night, lunch) to establish descriptive norms
- **Event details show who's going** → social proof: users were 5× more likely to join events with a familiar attendee or host (10 sign-ups with social proof vs. 2 without, in pilot study)
- **Add friends from Event Details, not just Friends screen** → reduces friction for network building in a natural context
- **Profile picture mandatory in onboarding** → 100% of pilot users added one; 66% added a bio. Identity investment increases commitment

## Validation

**Piggyback prototype first**: Added ~20 friends to a group chat, posted availability, asked people to "like" to claim. Resulted in real hangouts — validated the core dynamic before writing any code. Also revealed: two people tried to claim the same spot not by accident but because they wanted to go together — which led to the participant limit feature.

**Pilot study (6 users)**:
- 100% completed all tasks (create account, add friends, create event, join event, check calendar) without errors
- Social proof confirmed: 10 signups for events with familiar host/attendees vs. 2 for unfamiliar ones
- 4/6 went to Profile to add friends within the first minute — value of network was immediately understood
- Cold start problem surfaced: users without existing friends on the app struggled to envision using it — led to recommendation for invite mechanism on event creation

## What Didn't Ship (honest)

- **Groups feature** (to prevent context collapse) was scoped but cut — proved too complex for the timeline. Without it, users bear full responsibility for only adding friends they'd show all events to, which created some hesitation
- Norm ambiguity: some users interpreted Flock as a large-event app, not an intimate one — needs more users on platform to establish descriptive norms through observed behavior

## Portfolio Framing

Flock is rare: a class project that actually works, end-to-end, with a real social graph. It demonstrates:
- Full-stack React Native (frontend + Supabase backend, real-time, auth, complex routing)
- Theory-to-implementation: CS 278 concepts (social translucence, social proof, atomic networks, cold start) directly shaped product decisions — not just cited in a writeup
- Honest product thinking: scoped features that were cut, reflected on what norms need more users to emerge
- Pilot-validated: real behavioral data supporting the core social dynamic
