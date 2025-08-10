# 📝 Job Tracker

> Application web moderne de gestion collaborative de tâches avec géolocalisation et équipes

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-green.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-blue.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

## 🚀 Fonctionnalités (Phase 1 MVP)

### ✅ **Authentification complète**
- 🔐 Connexion/inscription email + mot de passe
- 🔗 OAuth Google intégré
- 🔒 Sessions sécurisées avec Supabase
- 🛡️ Navigation protégée

### ✅ **Gestion des Jobs**
- ➕ **Créer** des tâches avec formulaire complet
- 📋 **Lister** avec vue en cartes responsives
- ✏️ **Modifier** via formulaire modal
- 🗑️ **Supprimer** avec confirmation
- ✅ **Marquer terminé** en un clic

### ✅ **7 Statuts de Jobs**
- 🔵 `not_started` - Non démarré
- 🟡 `in_progress` - En cours  
- 🟢 `completed` - Terminé
- 🔴 `blocked` - Bloqué
- ⚫ `cancelled` - Annulé
- 🟠 `cancelled_by_client` - Annulé par client
- 🟣 `no_parking` - Pas de parking

### ✅ **Interface avancée**
- 🔍 **Recherche temps réel** (titre + description)
- 🎛️ **Filtres par statut**
- 📱 **Design responsive** (mobile/tablet/desktop)
- 🎨 **UI moderne** avec Tailwind CSS
- ⚡ **Performance optimisée** (React Query)

## 🛠️ Stack Technique

**Frontend :**
- **React 18** + TypeScript - Interface utilisateur
- **Vite 4.5** - Build tool ultra-rapide
- **Tailwind CSS 3.4** - Styling moderne
- **React Router** - Navigation SPA
- **React Query** - État et cache optimisé
- **React Hook Form + Zod** - Validation formulaires
- **date-fns** - Formatage dates français

**Backend :**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL avec Row Level Security (RLS)
  - Authentification + OAuth
  - API REST auto-générée
  - Realtime subscriptions

**Outils :**
- **TypeScript strict** - Typage fort
- **ESLint + Prettier** - Qualité code
- **Lucide React** - Icônes modernes

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation

```bash
# Clone le repository
git clone https://github.com/votre-username/JobTrackerD.git
cd JobTrackerD

# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp env.example .env.local
# Modifier .env.local avec vos clés Supabase
```

### Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le schéma SQL depuis `database-schema.sql`
3. Configurez OAuth Google (optionnel)
4. Récupérez vos clés API

### Variables d'environnement

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### Lancement

```bash
# Développement
npm run dev

# Build production
npm run build

# Aperçu build
npm run preview
```

L'application sera disponible sur `http://localhost:5173`

## 📱 Captures d'écran

### Dashboard Principal
![Dashboard](docs/dashboard.png)

### Création de Job
![Formulaire](docs/job-form.png)

### Vue Mobile
![Mobile](docs/mobile-view.png)

## 🏗️ Architecture

```
src/
├── components/
│   ├── auth/          # Connexion, inscription
│   ├── jobs/          # Gestion des jobs
│   └── ui/            # Composants réutilisables
├── hooks/             # Hooks personnalisés
├── lib/               # Configuration (Supabase, utils)
├── pages/             # Pages principales
└── types/             # Types TypeScript
```

## 🗄️ Modèle de données

### Jobs
- **Titre*** (obligatoire)
- **Description** (optionnelle)
- **Statut** (7 options)
- **Priorité** (low/medium/high)
- **Date d'échéance**
- **Localisation** (Phase 2)
- **Récurrence** (Phase 3)

### Équipes (Phase 2)
- Gestion multi-utilisateurs
- Rôles (admin/editor/viewer)
- Partage de jobs

## 🚢 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel --prod
```

### Variables d'environnement Vercel
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🗺️ Roadmap

### 🔄 Phase 2 - Collaboration (Prochaine)
- 📍 Géolocalisation GPS + Google Maps
- 👥 Gestion d'équipes complète
- 💬 Système de commentaires
- 🔄 Synchronisation temps réel

### 🔄 Phase 3 - Fonctionnalités Avancées
- ♻️ Jobs récurrents automatiques
- 🔔 Notifications push + email
- 📊 Tableaux de bord analytics
- 📥 Export CSV/JSON

### 🔄 Phase 4 - Enterprise
- 📱 Mode offline complet
- 🔍 Recherche avancée
- 📈 Métriques de performance
- 🔐 SSO Enterprise

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'feat: Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus de détails.

## 📞 Support

- 📧 Email : votre-email@example.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/JobTrackerD/issues)
- 📖 Documentation : [Wiki](https://github.com/votre-username/JobTrackerD/wiki)

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend génial
- [Tailwind CSS](https://tailwindcss.com) - CSS utility-first
- [Lucide](https://lucide.dev) - Icônes magnifiques
- [React](https://reactjs.org) - Library frontend

---

**Fait avec ❤️ en TypeScript**