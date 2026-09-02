# 🤝 Contributing to Pokémon Tracker Indonesia

Thank you for your interest in contributing to **Pokémon Tracker Indonesia**! We welcome bug reports, feature requests, documentation improvements, and code contributions from the community.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Firebase](https://firebase.google.com/) account (optional for local mock/dev or connect your own project)

### Local Setup
1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pokemon-tracker.git
   cd pokemon-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase project configuration if you want to use your own Firebase backend.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

---

## 🛠️ Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/nama-fitur-kamu
   ```
2. Make your modifications following our code style.
3. Test your changes locally:
   ```bash
   npm run lint
   npm run build
   ```
4. Commit your changes with a clear, descriptive commit message:
   ```bash
   git commit -m "feat: tambah filter rarity baru di katalog"
   ```
5. Push to your branch and open a Pull Request (PR) against the `main` branch.

---

## 📐 Project Structure

```
src/
├── assets/          # Icons and images
├── components/      # Modular React UI components
│   ├── auth/        # Login and user authentication modals
│   ├── common/      # Reusable Modal, Badge, etc.
│   ├── dashboard/   # Net worth, stat cards, Chart.js cash flow
│   ├── inventory/   # Catalog cards, Add/Edit modal, OCR Camera Scanner
│   ├── layout/      # Navbar, BottomNav, Footer
│   ├── transactions/# Cash ledger table and transaction modal
│   └── wishlist/    # Target items and 1-click buy action
├── context/         # AuthContext and TrackerContext (Firestore real-time sync)
├── services/        # Firebase client, TCGdex ID API, and Tesseract.js OCR
├── types/           # TypeScript data interfaces
└── utils/           # IDR formatters, E-Commerce search links, CSV exports
```

---

## 📜 Code of Conduct
Please be respectful, collaborative, and constructive when participating in discussions, issue threads, and pull requests.
