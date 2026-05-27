<p align="center">
  <img src="src/lib/assets/velvet%20audio.png" width="240" alt="Velvet Audio Logo">
</p>

<h1 align="center">Velvet Audio</h1>

<p align="center">
  <strong>Sophisticated. Electric. Cinematic.</strong><br>
  <em>A premium, immersive audio management experience for the modern enthusiast.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/LibSQL-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="LibSQL">
</p>

---

Velvet Audio is engineered for power users who value a focused, low-distraction environment. By leveraging a **Minimalist** approach with **Glassmorphism** accents, it makes your podcast cover art the centerpiece of a vibrant, high-energy interface.

## ✨ Key Features

- 🎧 **Immersive Playback**: A sophisticated playback bar designed for deep focus.
- 🌌 **Infinite Depth**: Dark-mode palette (`#121212`) creating a cinematic canvas.
- ⚡ **Electric Accents**: High-contrast purple (`#9D4EDD`) indicators for active states.
- 📂 **Smart Library**: Effortless management of shows and episodes with advanced metadata tracking.
- 🚀 **High-Performance**: Lightning-fast transitions powered by SvelteKit 5 and Vite.

## 🛠️ Technology

- **Core**: [SvelteKit](https://kit.svelte.dev/) (using Svelte 5 Runes)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Database**: [LibSQL](https://turso.tech/libsql) (SQLite compatible)
- **Utilities**: `rss-parser` for feed ingestion, `node-id3` for metadata management.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.x or higher
- **pnpm** (or your preferred package manager)

### Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/velvet-audio.git
   cd velvet-audio
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with your local configuration
   ```

3. **Database Initialization**
   ```bash
   pnpm db:push
   ```

4. **Launch Development**
   ```bash
   pnpm dev
   ```

## 🎨 Design Philosophy

The brand personality is **Sophisticated, Electric, and Cinematic**. 

- **Typography**: Utilizing **Inter** for exceptional legibility and a modern, neutral character.
- **Shapes**: A rounded language (16px cards, 8px buttons) to evoke a professional yet approachable feel.
- **Layers**: Depth achieved through tonal layering and subtle 1px outlines rather than heavy shadows.

> Explore the full design specifications in [DESIGN.md](./DESIGN.md).

---

<p align="center">
  Built with passion by the Velvet Audio team.
</p>
