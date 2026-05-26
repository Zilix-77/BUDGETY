# 📊 Budgety — Intelligent Family Budget Tracker

Budgety is a professional, high-performance, and legally-compliant multi-user household financial planner designed for smart family expense tracking. Crafted intentionally with an elegant Swiss-Minimalist visual design, it addresses realistic financial patterns (such as hand-to-hand loans, peak seasonal spikes, tea & snacks budgets, and school reopening goals) with robust background database synchronization.

---

## 🚀 Core Architectural Concepts

### 1. Hybrid Offline-First Storage Engine
Rather than blocking interactions with slow network requests, **Budgety** implements a **Hybrid Offline-First Sync reconciler** inside `/src/storage.ts`:
* **Instantaneous UI Rendering**: Read actions load instantly from client-side `localStorage`.
* **Asynchronous Reconciled Writes**: Write actions update the local cache instantly, and trigger background, transactional batched updates to high-scale **Google Cloud Firestore** databases.
* **Smart Reconciliation**: The synchronization engine compares incoming changes against existing documents, batch-deleting orphaned or deleted entries, and setting new changes under a safe, single Firestore transaction.
* **On-Login Catch Up**: When users sign in with Google, the engine fetches historical records from cloud collections (`expenses`, `categories`, `goals`, `iotracker`, `bills`, `notes`, `specialmonths`, `monthhistory`), restores them inside their localized cache, and updates their active state seamlessly.

### 2. No-Secret Client Architecture (Git Safe)
It is **100% safe to commit this application to public Git repositories**. 
* **Public Client Configuration**: The client credentials loaded inside `/firebase-applet-config.json` (apiKey, appId, projectId) are meant to be public by design in Firebase architectures. They define where to route traffic and do not provide backend administrative permissions.
* **Firestore Security Rules**: The security and access enforcement does not reside in your client source code. It is ruled safely by the deployed `/firestore.rules` on Google Firebase's cloud endpoints, which assert that only authenticated users holding the specific `uid` matching `request.auth.uid` can retrieve, add, update, or remove records under `users/{userId}/**`.
* **Safeguarded Backend Logic**: The custom Express server `/server.ts` does not contain hardcoded credentials. It lazy-loads its `TELEGRAM_BOT_TOKEN` from server environment variables and protects the public endpoint `/api/notify` with strict `zod` input schemas and a robust IP rate-limiter.

---

## ✨ Features Breakdown

* 🛡️ **Dual-Authentication Paths**: Step inside instantly using our offline local sandboxed Profile, or secure your dashboard across all screens with **Google Single-Sign-On** powered by Firebase Authentication.
* 📊 **Interactive Category Envelopes**: Leverage standard envelopes (such as Groceries, Petrol, KSEB/BESCOM Bills, Tea & Snacks, and School and Education) and set direct monthly targets to receive visual alarms when approaching peak boundaries.
* 💳 **IOTracker Ledger**: Track hand-to-hand money given to neighbors, friends, or family with customizable timelines and active statuses.
* 🔒 **Legal & Privacy-First Policy Pages**: Dedicated, high-contrast, accessible static pages for privacy policies, service terms, storage notices, and financial disclaimers—compliant with the **DPDP Act 2023 (India)** and **GDPR (EU)**.
* ✍️ **Dynamic Scratchpad**: Keep temporary active notes with an automated background check that cleans and moves old inputs into a historic rolling 3-day deep archive.
* 🗓️ **Recurring Bills**: Manage necessary monthly household commitments (e.g., rent, domestic wages, school fees, insurance) and track their payment statuses.

---

## 🎨 Visual Identity

Designed around the **Swiss Editorial & Clean Slate Theme**:
* **Aesthetic Margins & Layout**: Generous, uniform negative space paired with high-contrast neutral-50 backgrounds and dark slate buttons.
* **Typography Pairing**: Clear display headings styled globally with adaptive, ultra-readable weights, paired with **JetBrains Mono** font arrays for numbers and transaction indicators to simulate precision checkbooks.
* **Micro-Animations**: Clean structural page entry and modal transitions using responsive, hardware-accelerated motion boundaries.

---

## 🛠️ Installation & Active Setup

Follow these steps to deploy, run, and modify this project locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your workstation.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root workspace to house server-side configurations. Do not run with precompiled credentials:
```env
# Server Runtime Environment
NODE_ENV=development

# Telegram Integration Secrets (Server-Only, never committed on Git)
TELEGRAM_BOT_TOKEN=your_real_telegram_bot_token_here
```

### 4. Provide Firebase Credentials
Verify that a secure `/firebase-applet-config.json` containing your project credentials is created in the root directory:
```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-auth-domain.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-storage-bucket.appspot.com",
  "messagingSenderId": "your-sender-id",
  "appId": "your-app-id",
  "firestoreDatabaseId": "(default)"
}
```

### 5. Start Development Servers
Run the unified multi-bundle server directly binded:
```bash
npm run dev
```
Visit http://localhost:3000 to interact with the frontend SPA served alongside live hot module updates.

### 6. Production Builds
Build and compile the static React assets into high-performance distribution paths alongside the server:
```bash
npm run build
npm start
```

---

## 🔒 Security Audit & Safe Practices Summary

| Vulnerability Vector | Current Protection Status | Implementation Detail |
| --- | --- | --- |
| **XSS (Cross-Site Scripting)** | 🟢 PASS | Input rendering escaped via standard React hooks; Telegram payload sanitized to strip raw HTML tags. |
| **Data Hijacking (IDOR)** | 🟢 PASS | Enforced server-side via deployed Firestore Cloud rules checking `request.auth.uid == userId`. |
| **SQL/NoSQL Injections** | 🟢 PASS | Firestore documents referenced natively; Server inputs parsed via robust strict type-coercion schemas on Express handlers. |
| **API Abuse (DoS)** | 🟢 PASS | `/api/notify` limited to a strict, configurable window (max 5 requests per minute) per origin IP. |
| **Credential Exposure** | 🟢 PASS | Keys kept in environment layers. Client Firebase variables represent safely structured, non-secret endpoint parameters. |

---

## ⚖️ Compliance & Grievance Disclosures
In accordance with India's **DPDP Act 2023** and **IT Intermediary Rules 2021**:
* Data collected (strictly restricted to budget transactions and system profiles) is stored securely on decentralized Google Cloud Firestore instances with active user permissions to clear or delete history at any time from Settings.
* Standard compliance views are fully linked from the footer and accessible directly on-hash without forcing pre-authenticated user sessions.
