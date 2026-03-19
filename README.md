# Query Fan-Out Generator

A production-ready tool that simulates how AI search systems (ChatGPT, Perplexity, Google AI Mode) expand a single user query into multiple semantically diverse sub-queries for retrieval.

## Features

- **AI-powered fan-out** using OpenAI GPT-4o-mini (falls back to mock mode without an API key)
- **3 AI model simulations**: ChatGPT, Perplexity, Google AI Mode
- **Deep mode**: generates 30+ sub-queries
- **Intent clustering**: groups queries by informational, commercial, comparison, troubleshooting, navigational
- **SERP buttons**: search each query on Google or Bing in one click
- **Export**: JSON, CSV, or copy all to clipboard
- **Search history**: last 10 searches stored in localStorage
- **Analytics**: total queries generated, confidence scores, intent distribution chart

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Without an API Key

The tool works in **mock mode** — it generates realistic-looking sub-queries using rule-based expansion (modifiers, intent templates). No API key needed to try it out.

## Architecture

```
├── app/
│   ├── api/fanout/route.ts    # POST /api/fanout — main API endpoint
│   ├── layout.tsx
│   └── page.tsx               # Main client page
├── components/
│   ├── query-card.tsx         # Individual query card with SERP buttons
│   ├── query-input.tsx        # Search input + model selector + deep mode
│   ├── results-section.tsx    # Clustered results with stats
│   ├── history-sidebar.tsx    # localStorage-based search history
│   ├── export-buttons.tsx     # Copy/JSON/CSV export
│   ├── skeleton-loader.tsx    # Loading skeletons
│   └── ui/                    # shadcn/ui base components
├── lib/
│   ├── types.ts               # Shared TypeScript types
│   ├── llm.ts                 # OpenAI integration
│   ├── fanout.ts              # Grouping, export, stats utilities
│   ├── mock.ts                # Mock query generator
│   └── utils.ts               # cn() helper
```

## API

### `POST /api/fanout`

**Request:**
```json
{
  "query": "best project management software",
  "model_type": "chatgpt",
  "deep_mode": false
}
```

**Response:**
```json
{
  "original_query": "best project management software",
  "fanout_queries": [
    {
      "query": "what is the best project management software for small teams",
      "type": "informational",
      "intent": "User wants to understand what options exist for small teams",
      "confidence": 0.92
    }
  ],
  "model_type": "chatgpt",
  "generated_at": "2026-03-18T12:00:00.000Z",
  "total_count": 15,
  "is_mock": false
}
```

## Extending

The architecture is designed for future additions:
- **Search volume prediction**: add a `/api/volume` route calling SEMrush/Ahrefs API
- **Competitor analysis**: add competitor extraction per query
- **AI citation tracking**: track which queries lead to AI citations
- **Content gap detection**: compare fanout queries against existing content
