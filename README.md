# AI-Powered Adaptive Creative Layout Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5_Flash-8E75B2?logo=google)](https://deepmind.google/technologies/gemini/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-FCC72B?logo=vitest)](https://vitest.dev/)

> Built for the **Software Engineering Internship** at **Flam**, a company pioneering AI-native, interactive, and visual content experiences.

---

## 1. Problem Statement

Creating digital advertisements across modern marketing channels requires adapting creative assets for heterogeneous screen surfaces—from ultra-compact mobile feeds (9:16 vertical stories) to tablet display units and expansive desktop billboards (16:9). 

Historically, platforms have relied on two flawed paradigms:
1. **Simple CSS Media Queries**: Shrinking desktop banners down for mobile screens leads to microscopic unreadable text, degraded visual hierarchy, and cramped CTA touch-targets.
2. **Hardcoded Templates**: Static templates fail to respect the intrinsic nuances of individual campaigns (e.g. text length, image aspect ratios, luxury vs urgency messaging, and color contrast).

---

## 2. Solution Overview

The **Adaptive Creative Layout Engine** is an intelligent visual synthesis system that transforms raw copy, imagery, and brand guidelines into mathematically balanced, visually appealing creatives.

Instead of generating arbitrary, unconstrained HTML/CSS or raw code, the engine utilizes a **Structured Layout Decision Pipeline**:

```mermaid
flowchart LR
    A["User / Copywriter Input\n(Headline, Desc, Brand, CTA)"] --> B["Content Analysis &\nContrast Computation"]
    B --> C["Creative Decision\n(Gemini AI or Fallback)"]
    C --> D["LayoutConfig (JSON Contract)\n(Validated via Zod)"]
    D --> E["Adaptive Renderer\n(CSS Grid & Flexbox)"]
    E --> F["Multi-Surface Canvas\n(Mobile | Tablet | Desktop)"]
    F --> G["High-Res Export\n(Retina PNG / JPG)"]
```

---

## 3. Key Features

- **Multi-Surface Structural Adaptation**:
  - **Mobile (390 × 680 px)**: Vertical orientation flow, hero image elevated above headline, full-width thumb-zone CTA buttons, optimized touch targets.
  - **Tablet (768 × 600 px)**: Balanced 50/50 dual-column proportion, condensed margins, reflowed badge headers.
  - **Desktop (1080 × 600 px)**: Expansive horizontal grid, dual-column typography, floating glass badges, aligned CTAs.
- **8 Distinct Creative Layout Archetypes**:
  1. `image-left-content-right`: High-converting classic split hero.
  2. `image-right-content-left`: Feature launches and editorial storytelling.
  3. `centered-product`: Symmetrical spotlight on flagship products.
  4. `full-background-image`: Immersive billboard with glassmorphic text card.
  5. `split-screen`: Dynamic contrasting color blocks for high-urgency promotions.
  6. `minimal-editorial`: Luxury serif typography and generous negative space.
  7. `product-focused`: Hero imagery dominates 65-70% of canvas with streamlined pill CTA.
  8. `text-focused`: Bold typographic banner and high-converting message emphasis.
- **Gemini AI Layout Assistant**:
  - Leverages Google Gemini (`gemini-1.5-flash`) to analyze brand tone, audience psychology, and copy length.
  - Generates structured JSON adhering to a strict schema.
  - Formulates design rationale: Visual Hierarchy, Color Harmony, Responsive Strategy, and Art Director Tips.
- **Deterministic Fallback Layout Engine**:
  - 100% resilient offline capability without external API dependencies.
  - Implements an algorithmic decision tree evaluating copy density, discount signals, and campaign objectives.
  - Automated WCAG AA contrast ratio calculation ensuring readable typography.
- **Bidirectional Live Studio Inspector**:
  - Real-time manual overrides for layout archetypes, typography scale, font weight, letter spacing, alignment, image fit, and canvas colors.
  - Changes instantly update the preview canvas without page reloads.
- **Image Upload & Curated Presets**:
  - Drag-and-drop file upload with client-side base64 preview.
  - Instant pre-loaded campaign presets (Fashion Sale, Food Delivery, SaaS Copilot, Luxury Perfume, Solstice Festival).
- **Retina Canvas Export**:
  - Generates 2x pixel-ratio PNG and JPG downloads preserving typography sharpness and color fidelity.

---

## 4. Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (Vite + React 18 + Tailwind CSS)"]
        UI["Top Header & Device Switcher"]
        InputPanel["Studio Input Panel\n(Copy, Upload, Brand Colors)"]
        Inspector["Live Tweaker & AI Rationale Inspector"]
        Canvas["Multi-Surface Viewport Canvas"]
        Renderer["Adaptive Layout Renderer\n(8 Template Strategies)"]
        Export["High-Res Exporter\n(html-to-image)"]
        ClientFallback["Client Fallback Engine"]
    end

    subgraph Backend["Backend (Node.js + Express + TypeScript)"]
        Router["/api/generate-layout"]
        InVal["Input Zod Validator"]
        DecisionEngine{"Gemini Key Present?"}
        GeminiService["Gemini 1.5 Flash AI Assistant"]
        OutVal["LayoutConfig Zod Validator"]
        ServerFallback["Deterministic Fallback Engine\n(WCAG AA Contrast + Heuristics)"]
    end

    InputPanel --> Router
    Router --> InVal
    InVal --> DecisionEngine
    DecisionEngine -- Yes --> GeminiService
    GeminiService --> OutVal
    OutVal -- Valid --> Router
    OutVal -- Invalid / Error --> ServerFallback
    DecisionEngine -- No --> ServerFallback
    ServerFallback --> Router
    Router --> UI
    UI --> Renderer
    Inspector --> Renderer
    Renderer --> Canvas
    Canvas --> Export
    UI -. Network Fail .- -> ClientFallback
    ClientFallback -. Fallback Layout .- -> Renderer
```

---

## 5. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS | High-density, professional SaaS creative studio |
| **Icons & Design** | Lucide React | Modern, minimalist interface iconography |
| **Canvas Export** | `html-to-image` | High-DPI (2x retina) PNG and JPG export |
| **Backend API** | Node.js, Express, TypeScript, `tsx` | RESTful layout generation microservice |
| **Generative AI** | `@google/generative-ai` (Gemini 1.5 Flash) | Context-aware layout reasoning & structured JSON generation |
| **Schema Validation** | Zod | Runtime validation for both client input & AI JSON |
| **Testing** | Vitest | Fast unit testing for schema contracts and heuristics |

---

## 6. Folder Structure

```
creative-layout-engine/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Express route controllers
│   │   │   └── layoutController.ts
│   │   ├── routes/           # REST endpoints (/api/generate-layout)
│   │   │   └── layoutRoutes.ts
│   │   ├── schemas/          # Zod validation schemas
│   │   │   └── layout.schema.ts
│   │   ├── services/         # AI service & fallback decision tree
│   │   │   ├── aiService.ts
│   │   │   └── fallbackEngine.ts
│   │   ├── tests/            # Vitest unit test suite
│   │   │   └── fallbackEngine.test.ts
│   │   └── index.ts          # Server entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, InputPanel, PreviewCanvas, InspectorPanel
│   │   ├── constants/        # Device specifications, presets, templates
│   │   ├── renderer/         # CreativeRenderer & 8 layout template strategies
│   │   ├── services/         # API client & client-side fallback
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Canvas exporter
│   │   ├── App.tsx           # Master state & layout orchestrator
│   │   ├── main.tsx          # DOM root mount
│   │   └── index.css         # Tailwind directives & typography
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── shared/
│   └── types.ts              # Shared domain models
├── package.json              # Monorepo root scripts
├── .gitignore
└── README.md
```

---

## 7. Setup & Local Development

### Prerequisites
- Node.js `v18.0.0+` (Tested on `v22.16.0`)
- npm `v9.0.0+`

### Step 1: Install Dependencies
From the project root:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2: Environment Configuration
Copy `.env.example` in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Contents of `backend/.env`:
```env
PORT=5000
# Optional: Provide Google Gemini API Key.
# If omitted, the engine automatically uses the Deterministic Fallback Engine.
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

> **Note on AI Mode**: The system functions completely out-of-the-box even without a `GEMINI_API_KEY`. When no key is provided, the deterministic rule-based engine generates high-quality responsive designs automatically.

### Step 3: Run the Servers

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Studio):**
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

Visit **`http://localhost:3000`** in your browser.

---

## 8. Automated Testing

Run the Vitest test suite on backend:
```bash
cd backend
npm test
```

Verified test coverage includes:
- Schema validation against malformed or missing fields.
- Deterministic fallback engine layout decisions based on headline length, discount tags, and campaign tone.
- WCAG AA contrast preservation and auto-text luminance correction.
- Comprehensive test validation for all 5 diverse campaign archetypes (Fashion Sale, Food Delivery, SaaS Product, Festival, E-commerce).

---

## 9. Production Build

```bash
# Build backend TypeScript
cd backend && npm run build

# Build frontend production bundle
cd ../frontend && npm run build
```

---

## 10. Deployment Instructions

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Push repository to GitHub.
2. Link repository to **Vercel**.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Add environment variable `VITE_API_URL` pointing to the deployed backend URL if deployed separately.

### Backend (Render / Railway / Fly.io)
1. Set **Root Directory** to `backend`.
2. Set **Build Command** to `npm install && npm run build`.
3. Set **Start Command** to `npm start`.
4. Configure environment variable: `GEMINI_API_KEY`.

---

## 11. Future Enhancements

- **Vector SVG & Canvas Export**: Direct SVG/Canvas code generation for print and programmatic video ad animation.
- **Multimodal Image Analysis**: Using Gemini Vision to extract dominant palette swatches and focal points directly from uploaded product photos.
- **Animation & Micro-interactions**: View Transitions API for animated device switches and layout morphing.
