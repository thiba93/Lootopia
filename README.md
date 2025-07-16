# 🏴‍☠️ Lootopia - Plateforme Web Immersive de Chasses au Trésor

<div align="center">
  <img src="https://images.pexels.com/photos/2675061/pexels-photo-2675061.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Lootopia Banner" width="600" style="border-radius: 10px;">
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.51.0-3ECF8E.svg)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
  [![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900.svg)](https://leafletjs.com/)
</div>

## 📖 Table des Matières

- [🎯 À Propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies Utilisées](#️-technologies-utilisées)
- [📋 Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏃‍♂️ Démarrage](#️-démarrage)
- [🗄️ Base de Données](#️-base-de-données)
- [👥 Rôles Utilisateurs](#-rôles-utilisateurs)
- [🗺️ Fonctionnalités Cartographiques](#️-fonctionnalités-cartographiques)
- [📱 Interface Utilisateur](#-interface-utilisateur)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [📁 Structure du Projet](#-structure-du-projet)
- [🌐 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🎯 À Propos

**Lootopia** est une plateforme web immersive qui permet aux utilisateurs de créer, participer et gérer des chasses au trésor géolocalisées en temps réel. Inspirée des jeux d'aventure modernes, l'application combine géolocalisation, énigmes interactives et système de récompenses pour offrir une expérience unique d'exploration urbaine.

### 🎮 Concept

- **Joueurs** : Participent aux chasses créées par la communauté
- **Organisateurs** : Créent et gèrent leurs propres aventures
- **Géolocalisation** : Navigation en temps réel avec cartes interactives
- **Gamification** : Système de points, niveaux et achievements

## ✨ Fonctionnalités

### 🔐 Authentification & Profils
- ✅ Inscription/Connexion sécurisée avec Supabase Auth
- ✅ Profils utilisateurs personnalisables
- ✅ Système de rôles (Joueur/Organisateur)
- ✅ Gestion des sessions persistantes

### 🎯 Système de Chasses
- ✅ Création de chasses personnalisées
- ✅ Indices géolocalisés avec validation par proximité
- ✅ Types d'indices variés (texte, énigmes, QR codes, photos)
- ✅ Système de récompenses et points
- ✅ Difficulté ajustable (Facile/Moyen/Difficile)

### 🗺️ Cartographie Avancée
- ✅ Cartes interactives avec OpenStreetMap/Satellite/Terrain
- ✅ Géolocalisation en temps réel
- ✅ Calcul de distances et navigation
- ✅ Zones de validation configurables
- ✅ Marqueurs personnalisés et légendes

### 🏆 Gamification
- ✅ Système de points et niveaux
- ✅ Achievements débloquables
- ✅ Classements et statistiques
- ✅ Notifications en temps réel
- ✅ Historique des participations

### 📱 Interface Responsive
- ✅ Design adaptatif mobile/desktop
- ✅ Navigation intuitive
- ✅ Animations et micro-interactions
- ✅ Mode sombre/clair automatique
- ✅ Accessibilité optimisée

## 🛠️ Technologies Utilisées

### Frontend
- **React 18.3.1** - Framework JavaScript moderne
- **TypeScript 5.5.3** - Typage statique
- **Vite 5.4.2** - Build tool ultra-rapide
- **Tailwind CSS 3.4.1** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes

### Cartographie
- **Leaflet 1.9.4** - Bibliothèque de cartes interactives
- **React Leaflet 4.2.1** - Intégration React pour Leaflet
- **OpenStreetMap** - Données cartographiques libres

### Backend & Base de Données
- **Supabase 2.51.0** - Backend-as-a-Service
- **PostgreSQL** - Base de données relationnelle
- **Row Level Security (RLS)** - Sécurité au niveau des lignes
- **Real-time subscriptions** - Mises à jour en temps réel

### Outils de Développement
- **ESLint** - Linting JavaScript/TypeScript
- **PostCSS** - Traitement CSS
- **Autoprefixer** - Préfixes CSS automatiques

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18.0 ou supérieure)
- **npm** (version 8.0 ou supérieure)
- **Git** pour le clonage du repository
- Un compte **Supabase** (gratuit)

### Vérification des versions
```bash
node --version  # v18.0.0+
npm --version   # 8.0.0+
git --version   # 2.0.0+
```

## 🚀 Installation

### 1. Cloner le Repository
```bash
git clone https://github.com/votre-username/lootopia.git
cd lootopia
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Vérifier l'Installation
```bash
npm run dev
```
L'application devrait se lancer en mode démo sur `http://localhost:5173`

## ⚙️ Configuration

### 1. Configuration Supabase

#### Créer un Projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Configurez votre projet :
   - **Name** : `lootopia-db`
   - **Database Password** : Générez un mot de passe fort
   - **Region** : Choisissez la région la plus proche
6. Cliquez sur "Create new project"

#### Récupérer les Clés API
1. Dans le tableau de bord Supabase, allez dans **Settings** → **API**
2. Notez les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://qazorooyhqpzzxehqyky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhem9yb295aHFwenp4ZWhxeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTA5MDcsImV4cCI6MjA2ODIyNjkwN30.fK0V41vM7ZTUAdfCUTV5g4QP97ZCqfpuDQUAX29bWC8

# Configuration optionnelle
VITE_APP_NAME=Lootopia
VITE_APP_VERSION=1.0.0
```

⚠️ **Important** : Ne jamais commiter le fichier `.env` dans votre repository !

## 🏃‍♂️ Démarrage

### Mode Développement
```bash
npm run dev
```
- Ouvre l'application sur `http://localhost:5173`
- Hot reload activé
- DevTools disponibles

### Mode Production
```bash
npm run build
npm run preview
```

### Vérification du Code
```bash
npm run lint
```

## 🗄️ Base de Données

### Architecture de la Base de Données

L'application utilise PostgreSQL via Supabase avec les tables principales :

#### Tables Principales

**user_profiles**
```sql
- id (uuid, PK) - Référence vers auth.users
- username (text, unique)
- email (text)
- role ('player' | 'organizer')
- points (integer, default: 0)
- level (integer, default: 1)
- avatar_url (text, nullable)
- created_at, updated_at (timestamptz)
```

**treasure_hunts**
```sql
- id (uuid, PK)
- title (text)
- description (text)
- difficulty ('easy' | 'medium' | 'hard')
- category (text)
- location_lat, location_lng (numeric)
- location_address (text)
- duration (integer, minutes)
- max_participants (integer)
- participants_count (integer, default: 0)
- created_by (uuid, FK → user_profiles)
- status ('draft' | 'active' | 'completed')
- image_url (text, nullable)
- rating (numeric)
- is_public (boolean, default: true)
- tags (text[])
- created_at, updated_at (timestamptz)
```

**clues**
```sql
- id (uuid, PK)
- hunt_id (uuid, FK → treasure_hunts)
- order_number (integer)
- text (text)
- hint (text, nullable)
- type ('text' | 'image' | 'qr' | 'riddle' | 'photo')
- answer (text, nullable)
- location_lat, location_lng (numeric)
- points (integer, default: 100)
- radius (integer, default: 50, meters)
- created_at (timestamptz)
```

**game_sessions**
```sql
- id (uuid, PK)
- hunt_id (uuid, FK → treasure_hunts)
- user_id (uuid, FK → user_profiles)
- started_at (timestamptz)
- completed_at (timestamptz, nullable)
- current_clue_index (integer, default: 0)
- score (integer, default: 0)
- status ('active' | 'completed' | 'abandoned')
- completed_clues (uuid[])
- time_spent (integer, seconds)
- hints_used (integer, default: 0)
- created_at, updated_at (timestamptz)
```

### Configuration de la Base de Données

#### 1. Exécuter les Migrations

Les migrations se trouvent dans `supabase/migrations/`. Exécutez-les dans l'éditeur SQL de Supabase :

1. Allez dans **SQL Editor** dans votre tableau de bord Supabase
2. Exécutez chaque fichier de migration dans l'ordre chronologique
3. Vérifiez que toutes les tables sont créées

#### 2. Configurer Row Level Security (RLS)

Les politiques RLS sont automatiquement créées par les migrations :

- **user_profiles** : Les utilisateurs peuvent lire/modifier leur propre profil
- **treasure_hunts** : Lecture publique, modification par le créateur
- **clues** : Lecture pour les chasses publiques, modification par le créateur
- **game_sessions** : Accès limité à l'utilisateur propriétaire

#### 3. Fonctions et Triggers

**Fonctions automatiques** :
- `handle_new_user()` : Crée automatiquement un profil lors de l'inscription
- `update_user_level()` : Met à jour le niveau basé sur les points
- `assign_role_based_on_username()` : Assigne le rôle organisateur si "admin" dans le username

## 👥 Rôles Utilisateurs

### 🎮 Joueur (Player)
**Permissions** :
- ✅ Consulter toutes les chasses publiques
- ✅ Participer aux chasses
- ✅ Voir ses statistiques et achievements
- ✅ Gérer son profil
- ❌ Créer des chasses

**Fonctionnalités** :
- Tableau de bord avec chasses disponibles
- Navigation GPS en temps réel
- Système de points et niveaux
- Historique des participations

### 👑 Organisateur (Organizer)
**Permissions** :
- ✅ Toutes les permissions du joueur
- ✅ Créer et modifier des chasses
- ✅ Gérer les participants
- ✅ Voir les statistiques détaillées

**Fonctionnalités** :
- Interface de création de chasses
- Placement d'indices sur carte
- Gestion des récompenses
- Tableau de bord organisateur

### Attribution des Rôles

**Automatique** :
- Username contenant "admin" → Organisateur
- Autres → Joueur

**Manuel** :
- Modification via l'interface profil
- Mise à jour directe en base de données

## 🗺️ Fonctionnalités Cartographiques

### Providers de Cartes
- **OpenStreetMap** : Cartes standard, données libres
- **Satellite** : Vue satellite haute résolution
- **Terrain** : Relief et topographie

### Navigation
- **Géolocalisation** : Position GPS en temps réel
- **Calcul de distances** : Algorithme de Haversine
- **Zones de validation** : Cercles configurables autour des indices
- **Directions** : Indication de la direction vers l'objectif

### Marqueurs Personnalisés
- **Position utilisateur** : Marqueur bleu avec icône navigation
- **Point de départ** : Marqueur orange avec drapeau
- **Indice actuel** : Marqueur jaune animé
- **Indices complétés** : Marqueurs verts avec checkmark
- **Indices à venir** : Marqueurs violets avec point d'interrogation

### Contrôles Interactifs
- **Zoom** : Boutons +/- et molette souris
- **Centrage** : Boutons pour centrer sur position/indice
- **Vue d'ensemble** : Ajustement automatique pour voir tous les points
- **Sélecteur de couches** : Changement de type de carte

## 📱 Interface Utilisateur

### Design System
- **Couleurs** : Palette purple/pink avec dégradés
- **Typographie** : Police système optimisée
- **Espacement** : Système 8px pour la cohérence
- **Animations** : Transitions fluides et micro-interactions

### Composants Principaux

#### Navigation
- **Header** : Logo, navigation, profil utilisateur
- **Menu mobile** : Drawer responsive pour petits écrans
- **Breadcrumbs** : Navigation contextuelle

#### Cartes
- **TreasureHuntCard** : Aperçu des chasses avec image/carte
- **MapComponent** : Carte interactive complète
- **MapPreview** : Aperçu statique pour les listes

#### Formulaires
- **AuthModal** : Connexion/inscription avec validation
- **CreateHunt** : Formulaire de création de chasse
- **RoleSelector** : Sélection du rôle utilisateur

#### Feedback
- **Toast** : Notifications temporaires
- **LoadingSpinner** : Indicateurs de chargement
- **ErrorBoundary** : Gestion d'erreurs globale

### Responsive Design
- **Mobile First** : Optimisé pour les appareils mobiles
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly** : Boutons et zones tactiles adaptées

## 🔧 Scripts Disponibles

### Développement
```bash
npm run dev          # Démarre le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualise le build de production
npm run lint         # Vérifie le code avec ESLint
```

### Utilitaires
```bash
# Nettoyage
rm -rf node_modules package-lock.json
npm install

# Mise à jour des dépendances
npm update

# Audit de sécurité
npm audit
npm audit fix
```

## 📁 Structure du Projet

```
lootopia/
├── 📁 public/                 # Assets statiques
├── 📁 src/
│   ├── 📁 components/         # Composants React
│   │   ├── AuthModal.tsx      # Modal d'authentification
│   │   ├── Dashboard.tsx      # Tableau de bord principal
│   │   ├── CreateHunt.tsx     # Création de chasses
│   │   ├── MapComponent.tsx   # Carte interactive
│   │   ├── Profile.tsx        # Profil utilisateur
│   │   └── ...
│   ├── 📁 contexts/           # Contextes React
│   │   └── AuthContext.tsx    # Gestion de l'authentification
│   ├── 📁 hooks/              # Hooks personnalisés
│   │   ├── useAuth.ts         # Hook d'authentification
│   │   ├── useGeolocation.ts  # Hook de géolocalisation
│   │   ├── useGameSession.ts  # Hook de session de jeu
│   │   └── ...
│   ├── 📁 lib/                # Utilitaires et configuration
│   │   └── supabase.ts        # Configuration Supabase
│   ├── 📁 types/              # Types TypeScript
│   │   ├── index.ts           # Types principaux
│   │   └── database.ts        # Types de base de données
│   ├── 📁 utils/              # Fonctions utilitaires
│   │   ├── distance.ts        # Calculs de distance
│   │   └── achievements.ts    # Logique des achievements
│   ├── 📁 data/               # Données mockées
│   │   └── mockData.ts        # Données de démonstration
│   ├── App.tsx                # Composant principal
│   ├── main.tsx               # Point d'entrée
│   └── index.css              # Styles globaux
├── 📁 supabase/
│   └── 📁 migrations/         # Migrations de base de données
├── 📄 .env                    # Variables d'environnement
├── 📄 package.json            # Dépendances et scripts
├── 📄 tsconfig.json           # Configuration TypeScript
├── 📄 tailwind.config.js      # Configuration Tailwind
├── 📄 vite.config.ts          # Configuration Vite
└── 📄 README.md               # Documentation
```

### Composants Clés

#### 🔐 Authentification
- **AuthContext** : Gestion globale de l'état d'authentification
- **AuthModal** : Interface de connexion/inscription
- **RoleSelector** : Sélection du rôle après inscription

#### 🎮 Gameplay
- **Dashboard** : Vue d'ensemble des chasses disponibles
- **ImprovedTreasureHuntMap** : Interface de jeu principale
- **GameSession** : Gestion de l'état de la partie

#### 🗺️ Cartographie
- **MapComponent** : Carte interactive avec Leaflet
- **InteractiveMap** : Wrapper avec contrôles avancés
- **LocationPicker** : Sélecteur de position pour création

#### 📱 Interface
- **ResponsiveNavigation** : Navigation adaptative
- **NotificationSystem** : Système de notifications
- **Toast** : Messages temporaires

## 🌐 Déploiement

### Netlify (Recommandé)

#### Déploiement Automatique
1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement :
   ```
   VITE_SUPABASE_URL=https://qazorooyhqpzzxehqyky.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Build command : `npm run build`
4. Publish directory : `dist`

#### Déploiement Manuel
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Configuration des Domaines
1. Configurez votre domaine personnalisé
2. Activez HTTPS automatique
3. Configurez les redirections si nécessaire

### Variables d'Environnement en Production
Assurez-vous de configurer toutes les variables d'environnement sur votre plateforme de déploiement.

## 🔒 Sécurité

### Authentification
- **JWT Tokens** : Gestion sécurisée des sessions
- **Row Level Security** : Isolation des données par utilisateur
- **HTTPS Only** : Chiffrement des communications

### Validation des Données
- **Validation côté client** : Vérification immédiate
- **Validation côté serveur** : Sécurité renforcée
- **Sanitisation** : Protection contre les injections

### Bonnes Pratiques
- Variables d'environnement pour les secrets
- Validation des permissions à chaque requête
- Logs de sécurité et monitoring

## 🐛 Dépannage

### Problèmes Courants

#### L'application ne se connecte pas à Supabase
```bash
# Vérifiez vos variables d'environnement
cat .env

# Redémarrez le serveur de développement
npm run dev
```

#### Erreurs de géolocalisation
- Vérifiez les permissions du navigateur
- Testez sur HTTPS (requis pour la géolocalisation)
- Vérifiez la console pour les erreurs

#### Problèmes de build
```bash
# Nettoyez et réinstallez
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mode Debug
Activez les logs détaillés en ajoutant à votre `.env` :
```env
VITE_DEBUG=true
```

### Support
- **Issues GitHub** : Reportez les bugs
- **Discussions** : Questions et suggestions
- **Wiki** : Documentation détaillée

## 🤝 Contribution

### Comment Contribuer

1. **Fork** le repository
2. **Créez** une branche pour votre fonctionnalité
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```
3. **Committez** vos changements
   ```bash
   git commit -m "Ajout: nouvelle fonctionnalité"
   ```
4. **Push** vers votre branche
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```
5. **Créez** une Pull Request

### Standards de Code

#### TypeScript
- Utilisez des types stricts
- Documentez les interfaces complexes
- Évitez `any` autant que possible

#### React
- Composants fonctionnels avec hooks
- Props typées avec TypeScript
- Gestion d'état avec Context API

#### CSS
- Utilisez Tailwind CSS
- Classes utilitaires plutôt que CSS custom
- Responsive design obligatoire

### Tests
```bash
# Ajoutez des tests pour vos fonctionnalités
npm run test

# Vérifiez la couverture
npm run test:coverage
```

### Commit Messages
Utilisez le format conventionnel :
```
type(scope): description

feat(auth): ajout de l'authentification Google
fix(map): correction du centrage automatique
docs(readme): mise à jour de la documentation
```

## 📈 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Système de chat en temps réel
- [ ] Chasses collaboratives multi-joueurs
- [ ] Mode hors-ligne avec synchronisation
- [ ] Notifications push

### Version 1.2 (Q3 2024)
- [ ] Réalité augmentée (AR)
- [ ] Intégration réseaux sociaux
- [ ] Système de classements globaux
- [ ] API publique pour développeurs

### Version 2.0 (Q4 2024)
- [ ] Application mobile native
- [ ] Mode organisateur avancé
- [ ] Monétisation et marketplace
- [ ] Analytics avancées

## 📊 Métriques et Analytics

### Suivi des Performances
- **Core Web Vitals** : LCP, FID, CLS
- **Bundle Size** : Optimisation continue
- **Load Time** : Temps de chargement < 3s

### Analytics Utilisateur
- Taux de conversion inscription
- Engagement par fonctionnalité
- Rétention utilisateur
- Feedback et satisfaction

## 🌍 Internationalisation

### Langues Supportées
- 🇫🇷 Français (par défaut)
- 🇬🇧 Anglais (planifié)
- 🇪🇸 Espagnol (planifié)

### Configuration i18n
```bash
npm install react-i18next
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 Lootopia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe Lootopia</p>
  <p>
    <a href="https://github.com/votre-username/lootopia">⭐ Star ce projet</a> •
    <a href="https://github.com/votre-username/lootopia/issues">🐛 Reporter un bug</a> •
    <a href="https://github.com/votre-username/lootopia/discussions">💬 Discussions</a>
  </p>
</div>