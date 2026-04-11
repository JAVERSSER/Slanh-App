# ❤️ Slanh App — ស្រលាញ់
### Cambodian Dating App 🇰🇭

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Getting Started](#3-getting-started)
4. [Pages & Features](#4-pages--features)
5. [Connecting to a Backend](#5-connecting-to-a-backend)
6. [Environment Variables](#6-environment-variables)
7. [Customization Guide](#7-customization-guide)
8. [Tech Stack](#8-tech-stack)

---

## 1. Project Overview

**Slanh App** (ស្រលាញ់ = Love in Khmer) is a dating app built exclusively for Cambodia.

**Key Features:**
- 🔥 Swipe left/right to like or skip profiles
- 💞 Matches page to see who liked you back
- 💬 Chat with matches
- 👤 Profile page with stats
- 🇰🇭 Full Cambodian theme (Khmer script, flag colors, Angkor Wat design)

---

## 2. Folder Structure

```
src/
├── App.jsx              ← Main router (add new pages here)
├── main.jsx             ← App entry point
├── index.css            ← Global styles & Cambodian theme colors
│
├── pages/               ← One file per screen
│   ├── Landing.jsx      ← Welcome / Login screen
│   ├── Discover.jsx     ← Swipe cards screen
│   ├── Matches.jsx      ← Your matches list
│   ├── Messages.jsx     ← Chat screen
│   └── Profile.jsx      ← Your profile & settings
│
├── components/          ← Reusable UI pieces
│   └── Navbar.jsx       ← Bottom navigation bar
│
├── data/                ← Mock data (replace with API later)
│   └── profiles.js      ← Fake Cambodian profiles for testing
│
└── services/            ← Backend connection
    └── api.js           ← All API calls in one place
```

---

## 3. Getting Started

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up environment file
```bash
cp .env.example .env
```

### Step 3 — Start the development server
```bash
npm run dev
```

### Step 4 — Open in browser
```
http://localhost:5173
```

### Step 5 — Build for production
```bash
npm run build
```

---

## 4. Pages & Features

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Welcome screen with login/register buttons |
| `/discover` | Discover | Swipe cards — drag left to skip, right to like |
| `/matches` | Matches | See all your mutual matches |
| `/messages` | Messages | Chat with your matches |
| `/profile` | Profile | View & edit your profile |

---

## 5. Connecting to a Backend

All backend calls live in **one file**: `src/services/api.js`

### Step 1 — Set your backend URL in `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 2 — Use the API in any page
```jsx
import api from "../services/api";

// Login
const result = await api.auth.login("012xxxxxx", "password");
api.auth.saveToken(result.token);

// Get profiles to display
const profiles = await api.profiles.getAll();

// Send a swipe (like or nope)
await api.swipes.send(profileId, "like");

// Send a chat message
await api.messages.send(matchId, "ជំរាបសួរ!");
```

### Step 3 — Replace mock data in pages
```jsx
// Before (mock data — for testing)
import { profiles } from "../data/profiles";

// After (real API data)
import { useEffect, useState } from "react";
import api from "../services/api";

const [profiles, setProfiles] = useState([]);
useEffect(() => {
  api.profiles.getAll().then(setProfiles);
}, []);
```

### Backend API Endpoints Expected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with phone + password |
| POST | `/api/auth/register` | Create new account |
| GET | `/api/profiles` | Get nearby profiles |
| GET | `/api/profiles/:id` | Get single profile |
| PUT | `/api/profiles/me` | Update your profile |
| POST | `/api/swipes` | Send like or nope |
| GET | `/api/matches` | Get your matches |
| GET | `/api/messages/:matchId` | Get chat history |
| POST | `/api/messages/:matchId` | Send a message |

---

## 6. Environment Variables

Create a `.env` file in the root folder (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

> **Note:** All Vite environment variables must start with `VITE_`

---

## 7. Customization Guide

### Change theme colors
Edit `src/index.css` — look for the `:root` block:
```css
:root {
  --kh-blue:  #032EA1;  /* Cambodian flag blue */
  --kh-red:   #E00025;  /* Cambodian flag red */
  --kh-gold:  #F5A623;  /* Gold / Angkor Wat */
  --kh-cream: #FDF8F0;  /* Background */
}
```

### Add a new page
1. Create `src/pages/NewPage.jsx`
2. Add a route in `src/App.jsx`:
```jsx
<Route path="/newpage" element={<Layout><NewPage /></Layout>} />
```
3. Optionally add a link in `src/components/Navbar.jsx`

---

## 8. Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Page routing |
| Tailwind CSS v3 | Styling |
| Khmer fonts (Google Fonts) | Khmer script display |

---

Made with ❤️ for Cambodia 🇰🇭  
**Slanh App** — រក​ដៃ​គូ​ស្មោះ​ ក្នុង​ប្រទេស​កម្ពុជា
