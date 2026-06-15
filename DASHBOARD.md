# Code Review Metrics Dashboard

> Dashboard de monitoring pour le pipeline openCode d'analyse de PR.
> Permet de suivre les coûts, la consommation de tokens, et l'impact
> énergétique de chaque analyse de code.

---

## 1. Architecture globale

```
REPO ExcalidrawX                              REPO excalidrawx-dashboard
├── .github/workflows/                        ├── src/ (Vue.js 3 + Vite + TS)
│   └── opencode-pr.yaml                      ├── package.json
│       ├── Step: openCode PR Review          ├── .github/workflows/deploy.yml
│       └── Step: Metrics Collector (NEW)     └── public/
│             │                                       │
│             │  POST /rest/v1/runs                   │  GET /rest/v1/runs
│             │  POST /rest/v1/token_usage            │  GET /rest/v1/token_usage
│             ▼                                       ▼
│       ┌──────────────────────────────────────────────────┐
│       │                  Supabase                        │
│       │   Tables: review_runs, token_usage, profiles     │
│       │   Auth: email/password (RLS activé)              │
│       └──────────────────────┬───────────────────────────┘
│                              │
│                       ┌──────▼───────┐
│                       │ GitHub Pages  │
│                       │ (dashboard)   │
│                       └──────────────┘
```

**Principe** : Le repo ExcalidrawX **écrit** les métriques dans Supabase.  
Le repo `excalidrawx-dashboard` (dédié) **lit** et affiche.  
Les deux sont indépendants, connectés via la même base Supabase.

---

## 2. Stack technique

| Composant            | Technologie                         | Justification                        |
|----------------------|-------------------------------------|--------------------------------------|
| Pipeline CI          | GitHub Actions + openCode           | Existant, à enrichir                 |
| Collecte métriques   | Script Node.js (post-step workflow) | Léger, exécuté dans le runner existant |
| Base de données      | Supabase (PostgreSQL, free tier)    | 500 MB, REST API, Auth intégrée      |
| Frontend dashboard   | Vue.js 3 + Vite + TypeScript        | Demandé, rapide, Composition API     |
| Graphiques           | Chart.js (vue-chartjs)              | Simple, bien intégré à Vue           |
| State management     | Pinia                               | Officiel Vue 3, léger                |
| Routing              | Vue Router 4                        | SPA nécessaire pour les vues         |
| Auth frontend        | Supabase Auth UI / custom form      | Intégré avec Supabase                |
| Hébergement          | GitHub Pages                        | Gratuit, HTTPS, déploiement CI       |

---

## 3. Structure des projets

### 3.1 Repo `excalidrawx-dashboard` (à créer)

```
excalidrawx-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Build + déploiement GitHub Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── main.ts                     # createApp + router + pinia
│   ├── App.vue                     # Layout principal
│   ├── router/
│   │   └── index.ts                # Routes (/login, /, /pr/:number)
│   ├── views/
│   │   ├── LoginView.vue           # Auth email/mdp Supabase
│   │   ├── OverviewView.vue        # Dashboard global (KPIs + graphs)
│   │   └── PRDetailView.vue        # Détail par PR
│   ├── components/
│   │   ├── KpiCard.vue             # Carte KPI (titre, valeur, tendance)
│   │   ├── TokenChart.vue          # Bar chart : tokens par jour
│   │   ├── CostChart.vue           # Line chart : coût cumulé
│   │   ├── EnergyChart.vue         # Bar chart : kWh par run
│   │   ├── RunsTable.vue           # Tableau des derniers runs
│   │   └── AppHeader.vue           # Navbar + user menu
│   ├── composables/
│   │   ├── useSupabase.ts          # Client Supabase (singleton)
│   │   ├── useMetrics.ts           # Fetch KPIs + agrégations
│   │   └── useAuth.ts              # Login/logout/session
│   └── supabase.ts                 # Configuration Supabase (URL, anon key)
├── package.json
├── vite.config.ts                  # base: '/excalidrawx-dashboard/'
├── tsconfig.json
└── README.md
```

### 3.2 Modifications Repo `ExcalidrawX`

```
ExcalidrawX/
├── .github/
│   └── workflows/
│       └── opencode-pr.yaml        # MODIFIÉ : + step metrics collector
├── scripts/
│   └── collect-metrics.js          # NOUVEAU : script de collecte
└── DASHBOARD.md                    # NOUVEAU : ce document
```

---

## 4. Schéma de base de données (Supabase)

### 4.1 Table `review_runs`

| Colonne              | Type          | Description                                     |
|----------------------|---------------|-------------------------------------------------|
| `id`                 | `uuid`        | PK, auto-généré                                 |
| `repo_name`          | `text`        | Nom du repo source (ex: "Elyothe/ExcalidrawX") |
| `pr_number`          | `integer`     | Numéro de la PR                                 |
| `pr_title`           | `text`        | Titre de la PR                                  |
| `pr_author`          | `text`        | Auteur de la PR                                 |
| `github_run_id`      | `bigint`      | ID du run GitHub Actions                        |
| `status`             | `text`        | "success" / "failure" / "cancelled"             |
| `duration_seconds`   | `integer`     | Durée du run                                    |
| `runner_os`          | `text`        | "ubuntu-latest"                                 |
| `estimated_cost_usd` | `numeric(8,6)`| Coût estimé en $                                |
| `estimated_energy_kwh`| `numeric(8,6)`| Énergie estimée en kWh                          |
| `commit_sha`         | `text`        | SHA du commit analysé                           |
| `created_at`         | `timestamptz` | Timestamp du run                                |

**Row Level Security (RLS)** :

```sql
-- Lecture : tout utilisateur authentifié
CREATE POLICY "Authenticated users can read runs"
ON review_runs FOR SELECT USING (auth.role() = 'authenticated');

-- Écriture : service_role uniquement (depuis le workflow)
CREATE POLICY "Service can insert runs"
ON review_runs FOR INSERT WITH CHECK (true); -- limité par la clé service_role
```

### 4.2 Table `token_usage`

| Colonne              | Type          | Description                         |
|----------------------|---------------|-------------------------------------|
| `id`                 | `uuid`        | PK, auto-généré                     |
| `run_id`             | `uuid`        | FK → `review_runs.id`               |
| `model`              | `text`        | ex: "deepseek-v4-flash"             |
| `prompt_tokens`      | `integer`     | Tokens d'entrée                     |
| `completion_tokens`  | `integer`     | Tokens de sortie                    |
| `total_tokens`       | `integer`     | Total                               |
| `estimated_remaining`| `integer`     | Contexte restant estimé du modèle   |
| `created_at`         | `timestamptz` | Timestamp                           |

**RLS** : mêmes règles que `review_runs`.

### 4.3 Table `repositories` (optionnelle, pour multi-projets)

| Colonne    | Type   | Description                     |
|------------|--------|---------------------------------|
| `id`       | `uuid` | PK                              |
| `full_name`| `text` | "Elyothe/ExcalidrawX"           |
| `name`     | `text` | Nom affiché                     |

---

## 5. Métriques collectées et calculs

### 5.1 Coût runner GitHub Actions

Basé sur la [tarification GitHub officielle](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions) :

| Runner        | $/min (public) | $/min (privé) |
|---------------|----------------|---------------|
| ubuntu-latest | $0.008         | $0.016        |
| windows-latest| $0.016         | $0.032        |
| macos-latest  | $0.08          | $0.16         |

```
coût = durée_minutes × taux_runner
```

### 5.2 Énergie estimée

Basé sur une estimation moyenne de consommation des runners CI :

```
ubuntu-latest : ~0.0003 kWh / minute
énergie = durée_minutes × 0.0003
```

> Source : estimation basée sur les données du Green Software Foundation / SCI.

### 5.3 Tokens

Extraction depuis les logs openCode. Plusieurs stratégies possibles :

1. **Si openCode a un flag `--verbose`** : parser la sortie stdout
2. **Wrapper API direct** : appeler l'API DeepSeek/OpenCode et capturer `usage.prompt_tokens`, `usage.completion_tokens`
3. **Post-analyse** : parser le fichier de log si openCode écrit dans un fichier

```
contexte_max = 128000 (DeepSeek v4)
restant_estimé = contexte_max - total_tokens
```

---

## 6. Workflow modifié (`opencode-pr.yaml`)

```yaml
name: opencode-pr-review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
      pull-requests: write
      issues: read

    outputs:
      duration: ${{ steps.metrics.outputs.duration }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # ─── Étape existante (inchangée) ───
      - name: Review PR with OpenCode
        id: review
        uses: anomalyco/opencode/github@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
        with:
          model: vars.DEEPSEEKV4FLASHFREE
          use_github_token: true
          prompt: |
            (prompt existant inchangé)

      # ─── NOUVEAU : Collecte des métriques ───
      - name: Collect metrics
        if: always()  # Même si le step précédent échoue
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/collect-metrics.js
```

---

## 7. Script de collecte (`scripts/collect-metrics.js`)

```javascript
// Pseudocode — sera implémenté en phase 2
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 1. Récupérer les métadonnées du run GitHub
const runId = process.env.GITHUB_RUN_ID;
const duration = /* calculé depuis GITHUB_RUN_STARTED_AT */;
const cost = (duration / 60) * 0.008; // ubuntu-latest, public repo
const energy = (duration / 60) * 0.0003;

// 2. Insérer dans review_runs
const { data: run } = await supabase
  .from('review_runs')
  .insert({
    repo_name: context.repo,
    pr_number: context.prNumber,
    pr_title: context.prTitle,
    github_run_id: runId,
    status: context.jobStatus,
    duration_seconds: duration,
    runner_os: 'ubuntu-latest',
    estimated_cost_usd: cost,
    estimated_energy_kwh: energy,
  })
  .select()
  .single();

// 3. Parser les tokens depuis la sortie openCode
//    (stratégie à déterminer selon ce qu'openCode expose)
const tokens = extractTokensFromOpenCodeOutput();
if (tokens) {
  await supabase.from('token_usage').insert({
    run_id: run.id,
    model: 'deepseek-v4-flash',
    prompt_tokens: tokens.prompt,
    completion_tokens: tokens.completion,
    total_tokens: tokens.prompt + tokens.completion,
    estimated_remaining: 128000 - (tokens.prompt + tokens.completion),
  });
}
```

---

## 8. Écrans du dashboard

### 8.1 Login (`/login`)

- Formulaire email + mot de passe
- Auth via `supabase.auth.signInWithPassword()`
- Redirection vers `/` après succès
- Lien "Créer un compte" si besoin
- Gestion des erreurs (mauvais MDP, email non vérifié)

### 8.2 Vue d'ensemble (`/`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header]   ExcalidrawX Metrics    👤 user@email.com  [Logout]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 42 runs  │ │ $0.87    │ │ 156K     │ │ 0.12 kWh │          │
│  │  totaux  │ │ coût     │ │ tokens   │ │ énergie  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌─────────────────────────┐ ┌──────────────────────────┐      │
│  │  Tokens / jour          │ │  Coût cumulé ($)         │      │
│  │  ██ ██ ████ ██ ██ ████ │ │    ╱╱╱╱╱╱╱                 │      │
│  │  ██ ██ ████ ██ ██ ████ │ │   ╱                         │      │
│  │  ██ ██ ████ ██ ██ ████ │ │  ╱                          │      │
│  └─────────────────────────┘ └──────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dernières analyses                          [Tout voir] │   │
│  │  PR#42 │ Bug fix drawer │ ✅ │ 32s │ $0.01 │ 4.2K tok │   │
│  │  PR#41 │ Add dark mode  │ ❌ │ 18s │ $0.01 │ 1.8K tok │   │
│  │  PR#40 │ Refactor bloc  │ ✅ │ 45s │ $0.01 │ 6.1K tok │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Détail d'une PR (`/pr/:number`)

- Métriques détaillées du run associé à cette PR
- Graphique camembert : prompt vs completion tokens
- Barres : durée vs moyenne
- Lien vers la PR GitHub
- Historique si la PR a été ré-analysée plusieurs fois

---

## 9. Déploiement

### 9.1 Workflow de déploiement du dashboard

```yaml
# excalidrawx-dashboard/.github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 9.2 Secrets GitHub nécessaires

| Secret (ExcalidrawX)         | Valeur                                        |
|------------------------------|-----------------------------------------------|
| `SUPABASE_URL`               | URL du projet Supabase                        |
| `SUPABASE_SERVICE_KEY`       | Clé `service_role` (écriture)                 |

| Secret (excalidrawx-dashboard) | Valeur                                      |
|--------------------------------|---------------------------------------------|
| `VITE_SUPABASE_URL`            | URL du projet Supabase                      |
| `VITE_SUPABASE_ANON_KEY`       | Clé `anon` (lecture, limitée par RLS)       |

---

## 10. Plan d'exécution

### Phase 1 — Setup Supabase (1 jour)
- [ ] Créer projet Supabase (free tier)
- [ ] Créer les tables `review_runs`, `token_usage`
- [ ] Configurer RLS policies
- [ ] Créer un utilisateur admin pour le dashboard
- [ ] Ajouter les secrets dans les repos GitHub

### Phase 2 — Collecte de métriques ExcalidrawX (2 jours)
- [ ] Créer `scripts/collect-metrics.js`
- [ ] Implémenter la capture de durée/coût/énergie
- [ ] Investiguer comment openCode expose les tokens (verbose flag / wrapper API)
- [ ] Implémenter l'extraction des tokens
- [ ] Ajouter le step `Collect metrics` dans `opencode-pr.yaml`
- [ ] Tester sur une PR réelle

### Phase 3 — Dashboard Vue.js (3-4 jours)
- [ ] Créer le repo `excalidrawx-dashboard`
- [ ] Scaffold Vue.js 3 + Vite + TypeScript
- [ ] Installer dépendances (vue-router, pinia, chart.js, @supabase/supabase-js)
- [ ] Configurer le client Supabase
- [ ] Implémenter `LoginView.vue` (auth Supabase)
- [ ] Implémenter `OverviewView.vue` avec KPIs et graphiques
- [ ] Implémenter `PRDetailView.vue`
- [ ] Créer le workflow de déploiement GitHub Pages
- [ ] Déployer et tester

### Phase 4 — Polish (1-2 jours)
- [ ] Dark mode
- [ ] Responsive design
- [ ] Filtres par période (date picker)
- [ ] Gestion des erreurs et états de chargement (skeleton UI)
- [ ] Tests unitaires (Vitest)

---

## 11. Questions ouvertes / À investiguer

1. **Tokens openCode** : Comment exactement récupérer `prompt_tokens` et `completion_tokens` ?
   - openCode expose-t-il ces infos en stdout avec un flag `--verbose` ?
   - Faut-il wrapper l'API DeepSeek directement plutôt que passer par l'action GitHub ?
   - Réponse attendue en phase 2.

2. **Multi-repo** : Le dashboard doit-il afficher les métriques d'un seul repo ou de plusieurs ?
   - La colonne `repo_name` dans `review_runs` permet déjà le multi-repo.
   - Ajouter un filtre "Repository" dans le dashboard si besoin.

3. **Notifications** : Faut-il des alertes (email/Slack) quand le coût dépasse un seuil ?
   - À étudier en phase 4.

4. **Rétention des données** : Combien de temps garder les métriques ?
   - Le free tier Supabase a 500 MB, ce qui est large pour des métriques texte.

---

## 12. Références

- [GitHub Actions billing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Supabase JS client](https://supabase.com/docs/reference/javascript)
- [Vue.js 3 docs](https://vuejs.org/)
- [Chart.js docs](https://www.chartjs.org/)
- [Green Software Foundation - Software Carbon Intensity](https://sci.greensoftware.foundation/)
