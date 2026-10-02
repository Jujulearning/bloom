# Amara Health · Interactive prototype

**Every kitchen tells a story. Nourished by culture. Rooted in science.**

A high-fidelity, clickable mobile prototype of Amara Health, a culturally responsive maternal nutrition companion for the first 1,000 days. Live demo: https://bloom-three-pi.vercel.app

Follow **Maya**, 24 weeks pregnant: she checks in feeling tired, discovers iron-rich foods she already loves, asks **Afya** to build a quick dinner, joins **Working Mamas** in **The Village**, saves a question for her next visit, and sees it all reflected in **My Journey**.

## What's inside

| Area | Highlights |
| --- | --- |
| Home ("Today") | Week indicator, Afya check-in that tunes suggestions, nutrition focus, saved meal, Village preview |
| Explore | Cultural Food Library, "What can I eat?" search, food pages, recipes, Build My Plate, budget planner, grocery list |
| Afya | Personalized nutrition companion with suggested prompts, actions, provider questions and safety escalation |
| The Village | For You feed, rooms, live Working Mamas chat, threads, anonymous posting, events, safety tools |
| Journey | Weekly focus, reflection, check-ins, For My Visit, visit summary, Support Near You |
| Profile | Preferences, notifications, community settings, My Data controls |

**Roadmap shown in the prototype:** MVP = Food Library + Afya. Early expansion = Village, recipes, planning tools, Journey. Long-term = provider tools, clinical integration, postpartum and infant feeding, resource integration.

## Notes

- Afya uses built-in sample responses. No AI API key is used or exposed in the browser.
- Content is educational sample content, not medical advice. Images are illustrative concept images from the Amara Health website.
- Demo state is saved in the browser. Use Profile → Reset demo to start over.

## Run locally

```bash
npm install
npm run dev
```

Main code lives in `src/`: `App.jsx` (shell and navigation), `Home.jsx`, `Explore.jsx`, `Afya.jsx`, `Village.jsx`, `Journey.jsx`, `Onboarding.jsx`, `data.js` (content) and `styles.css` (design system).
