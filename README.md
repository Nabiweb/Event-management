Event Management App (AXICOM assessment)

A lightweight React single-page application scaffolded for the AXICOM assessment. Built with Vite, Tailwind CSS and Firebase for authentication/storage. The app provides basic user, vendor, admin, and membership pages and demonstrates context-based state management and modular service layers.

## Features
- React + Vite development setup
- Tailwind CSS for utility-first styling
- Firebase integration (auth / data)
- Context-based state management (`AuthContext`, `CartContext`)
- Pages for Admin, User, Vendor, Login, Membership form

## Tech stack
- React 18
- Vite
- Tailwind CSS
- Firebase
- React Router

## Project structure (key files)
- [src/main.jsx](src/main.jsx)
- [src/App.jsx](src/App.jsx)
- [src/index.css](src/index.css)
- [src/firebase/firebaseConfig.js](src/firebase/firebaseConfig.js)
- [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)
- [src/contexts/CartContext.jsx](src/contexts/CartContext.jsx)
- [src/pages/Home.jsx](src/pages/Home.jsx)
- [src/pages/Login.jsx](src/pages/Login.jsx)
- [src/pages/MembershipForm.jsx](src/pages/MembershipForm.jsx)

## Prerequisites
- Node.js (recommended v16+)
- npm (or yarn)

## Installation
1. Install dependencies:

```bash
npm install
```

2. Configure Firebase:
- Edit [src/firebase/firebaseConfig.js](src/firebase/firebaseConfig.js) and replace the placeholder config with your Firebase project's credentials (apiKey, authDomain, projectId, etc.).

If you prefer environment variables, add a local env loader and reference them in the config file.

## Available scripts
From the project root run the scripts defined in `package.json`:

```bash
npm run dev    # starts Vite dev server
npm run build  # builds the production bundle
npm run preview# locally preview production build
```

## Running locally (quickstart)
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open the URL shown by Vite (usually http://localhost:5173)

## Notes on configuration
- Firebase: ensure you enabled the services used by the app (Authentication, Firestore, Storage) in your Firebase console.
- Tailwind: configuration is in `tailwind.config.cjs`; CSS entry is [src/index.css](src/index.css).

## Contributing
- Fork the repo, create a feature branch, and open a PR with a clear description.

## License
This repository is provided for the AXICOM assessment. Add a license as needed (e.g., MIT).

## Contact
- Questions or improvements: open an issue or contact the project owner.
