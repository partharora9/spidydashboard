# SpidyDashboard — Automated OSINT & Attack Surface Management

SpidyDashboard is a high-performance, modern reconnaissance and OSINT threat intelligence platform built with React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and Node.js.

---

## 🚀 Features

- **Attack Surface Mapping:** Automated asset discovery, exposed subdomains, and DNS enumeration.
- **Threat Intelligence:** Cross-correlated threat feeds from 200+ intelligence sources.
- **Interactive UI:** Glassmorphism dashboard with responsive desktop and mobile views, animated data cards, and vector SVG iconography.
- **Developer Direct Contact:** Integrated direct-email communication with instant copy, Gmail Web compose, and on-page messaging.
- **Production Ready:** Optimized for Vercel deployment with zero-error builds and clean SPA rewrites.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, TypeScript, Nodemailer, Imap-Simple
- **Deployment:** Vercel (Frontend SPA) + Node.js (API Server)

---

## 📦 Quick Start & Local Development

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/partharora9/spidydashboard.git
cd spidydashboard

# Install dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```
Fill in the necessary values in `.env` (never commit this file).

### 4. Run Development Servers
```bash
# Start Vite frontend (runs on http://localhost:5173)
npm run dev

# (Optional) In another terminal, start the backend server (runs on http://localhost:4000)
npm run server
```

---

## 🏗️ Production Build

To build the static frontend for production:
```bash
npm run build
```
The compiled output will be generated in the `dist/` directory.

To test the production build locally:
```bash
npm run preview
```

---

## ☁️ Deployment on Vercel

1. Import the repository in [Vercel](https://vercel.com/new).
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add any required environment variables in **Project Settings > Environment Variables**.
4. Click **Deploy**. The included `vercel.json` automatically handles SPA routing and rewrites.

---

## 🔒 Security & Privacy

- Sensitive environment variables are kept strictly out of git version control via `.gitignore`.
- Contact: [parthxcore@gmail.com](mailto:parthxcore@gmail.com)
