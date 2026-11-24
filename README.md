> 🌐 **Démo Interactive Déployée en Ligne :** [**https://collesyll0607.github.io/e-depot-plateforme/**](https://collesyll0607.github.io/e-depot-plateforme/)
>
> 📄 **Rapport Technique Officiel (PDF, 13 pages) :** [**docs/P10_EDepot_Rapport.pdf**](docs/P10_EDepot_Rapport.pdf)
>
> 📊 **Présentation de Soutenance (PowerPoint, 15 slides) :** [**docs/P10_EDepot_Presentation.pptx**](docs/P10_EDepot_Presentation.pptx)
>
> 🔌 **Contrat d'API OpenAPI 3.0 & Postman :** [**docs/openapi.yaml**](docs/openapi.yaml) | [**docs/EDEPOT_Postman_Collection.json**](docs/EDEPOT_Postman_Collection.json)

---

# E-DÉPÔT — Plateforme Logistique & Séquestre de Fret (Casamance)

> **Projet 10** — Gestion de Projet Informatique Avancée (L3 Ingénierie Informatique, Université Assane Seck de Ziguinchor — UASZ).  
> Auteure : **Collé SYLL** (Matricule 202300489) — Année Académique 2025/2026.

---

## 📋 Tableau Récapitulatif des 7 Livrables Officiels (Conformité Barème L3-IR)

| N° | Livrable Exigé | Format & Spécification | Emplacement / Lien | Statut |
|:--:|:---|:---|:---|:---:|
| **1** | **Dépôt Git** | Branches `main`, `develop`, `feature/*`, historique propre | [GitHub Repository](https://github.com/Collesyll0607/e-depot-plateforme) | ✅ **100% Conforme** |
| **2** | **README.md** | Guide setup < 5 min, variables d'env, comptes démo, architecture | [README.md](README.md) | ✅ **100% Conforme** |
| **3** | **Contrat d'API** | OpenAPI 3.0 (YAML/JSON) + Collection Postman (100% endpoints) | [docs/openapi.yaml](docs/openapi.yaml) & [Postman](docs/EDEPOT_Postman_Collection.json) | ✅ **100% Conforme** |
| **4** | **Tests & Qualité** | JUnit 5 + JaCoCo (**70.86%** d'instructions couvertes $\ge 60\%$) | 17/17 tests réussis (`backend/target/site/jacoco`) | ✅ **100% Conforme** |
| **5** | **App Déployée** | Déploiement public interactif en ligne 24/7 | [GitHub Pages Live Demo](https://collesyll0607.github.io/e-depot-plateforme/) | ✅ **100% Conforme** |
| **6** | **Rapport Technique** | PDF 10-20 pages (`P10_EDepot_Rapport.pdf`, 13 pages, plan officiel) | [P10_EDepot_Rapport.pdf](docs/P10_EDepot_Rapport.pdf) | ✅ **100% Conforme** |
| **7** | **Présentation** | Support de soutenance 12-15 slides (`P10_EDepot_Presentation.pptx`) | [P10_EDepot_Presentation.pptx](docs/P10_EDepot_Presentation.pptx) | ✅ **100% Conforme** |

---

---

## 1. Contexte & Problématique

En Casamance et dans les zones rurales du Sénégal :
- Les **commerçants et agriculteurs** rencontrent d'immenses difficultés pour acheminer leurs récoltes (mangues, riz de vallée, agrumes, légumes, noix d'anacarde) vers les marchés urbains (Marché Tilène de Ziguinchor, Bignona, Dakar).
- Les **camionneurs** effectuent très souvent des trajets **à vide au retour**, dégradant leur rentabilité.
- Les litiges tarifaires et les défauts de paiement à l'arrivée fragilisent les relations économiques.

**E-Dépôt** résout cette équation en assurant la mise en relation directe, la négociation des prix et la **sécurisation financière par séquestre Wave Sandbox à 5 %**, avec déblocage conditionné à la saisie d'un **code SMS OTP** par le destinataire final.

---

## 2. Direction Artistique : African Logistics Tech

L'application a été entièrement conçue selon une identité visuelle moderne, distinctive et rassurante :

* **Vert forêt profond** : `#123B2A` (Couleur primaire, boutons principaux, sidebar)
* **Vert secondaire** : `#236B4A` (Actions secondaires, repères cartographiques)
* **Ivoire clair** : `#F8F7F2` (Fond d'écran chaleureux)
* **Orange terre cuite** : `#E88945` (Accents, statuts actifs, indicateurs d'attention)
* **Blanc** : `#FFFFFF` (Surfaces de cartes et tableaux)
* **Gris ardoise discret** : `#202820` (Texte principal) / `#727A72` (Sous-titres)
* **Bordures fines** : `#E6E8E1`
* **Typographie** : Manrope (titres forts) & Inter (lisibilité parfaite des chiffres et tableaux)
* **Logo typographique E-Dépôt** accompagné de son symbole vectoriel du colis et de la route.
* **Illustration vectorielle sur-mesure** représentant un camion de fret sur un axe verdoyant de Casamance sans recours à des photos inauthentiques.
* **Aucun emoji dans l'UI** : utilisation rigoureuse des icônes SVG Lucide.

---

## 3. Architecture & Rôles Étanches (Application 100 % Fonctionnelle)

L'application fonctionne désormais de bout en bout avec un **backend Spring Boot 3** et une **base de données relationnelle persistante** (PostgreSQL / compatibilité H2 disque `./data/edepot_db`). **Aucun mode démo, aucune donnée fictive et aucun faux bouton d'authentification ne subsistent.**

1. **Espace Public** (`/`) :
   - Page d'accueil professionnelle avec hero, présentation du fret en 4 étapes, section sécurité du séquestre et footer complet.
   - **L'administration ne figure jamais sur la page d'accueil publique.**
   - Page explicative du modèle opérationnel (`/fonctionnement`).
   - Page publique de recherche et suivi d'expédition (`/suivi`).
   - Connexion (`/connexion`) et Inscription avec choix de rôle (`/inscription`).
   - Mentions légales et confidentialité (`/cgu`).

2. **Espace Commerçant / Agriculteur** (`/commercant`) :
   - Publication de demandes de transport avec calcul kilométrique et durée estimée.
   - Suivi des demandes publiées et annulation si ouverte.
   - Comparaison des offres de camionneurs, négociation (contre-propositions) et acceptation.
   - Dépôt de garantie en séquestre via Wave Sandbox (5 % retenus pour la plateforme, 95 % garantis au transporteur).
   - Signalement d'anomalies et ouverture de litiges.

3. **Espace Camionneur / Transporteur** (`/camionneur`) :
   - Commutateur de disponibilité pour le fret.
   - Consultation des demandes compatibles avec son tonnage et ses axes géographiques.
   - Soumission d'offres de transport personnalisées.
   - Gestion des étapes de route (*Marchandise chargée*, *En route*, *Arrivé à destination*).
   - Saisie du code OTP destinataire pour déblocage des fonds.
   - Consultation et mise à jour de son profil et des informations de son camion (Type de véhicule, Tonnage en kg, Immatriculation).

4. **Espace Destinataire** (`/destinataire`) :
   - Vue simplifiée optimisée pour smartphone.
   - Contrôle du chargement à l'arrivée.
   - **Validation par code OTP** avec confirmation explicite du déblocage des fonds.
   - Option de déclaration d'anomalie gelant le paiement.

5. **Espace Administrateur** (`/admin`) :
   - Tableau de bord consolidé basé sur les données réelles de la base : utilisateurs enregistrés, fret en transit, volume FCFA consigné, commissions 5 % perçues.
   - Graphique de répartition du fret.
   - Gestion des comptes utilisateurs enregistrés.
   - **Chambre d'arbitrage des litiges** : libération au chauffeur, remboursement partiel ou remboursement total du commerçant.

---

## 4. Sécurité & Authentification

### Règles Strictes d'Inscription
- Les utilisateurs créent un vrai compte via `/inscription` avec validation des formats :
  - Nom complet.
  - Adresse email valide (vérification d'unicité en base de données).
  - Numéro de téléphone sénégalais normalisé (`+221...`).
  - Mot de passe sécurisé (minimum 6 caractères) avec confirmation.
  - Rôle métier au choix : **Commerçant / Agriculteur**, **Transporteur / Camionneur**, ou **Destinataire**.
- **Protection Admin absolue** : Le formulaire d'inscription public ne propose JAMAIS le rôle Administrateur. Toute tentative de falsifier la requête avec `role: "ADMIN"` est interceptée et rejetée par le backend avec un code HTTP 400.
- Les mots de passe sont hachés avec l'algorithme fort **BCrypt** côté serveur (aucun mot de passe en clair).
- L'authentification délivre un jeton standard **JWT (JSON Web Token)** signé avec HMAC-SHA, transmis dans les en-têtes `Authorization: Bearer <token>`.

### Initialisation Sécurisée du Compte Administrateur
L'administrateur système est provisionné automatiquement au démarrage par un `CommandLineRunner` Spring Boot si aucun compte admin n'existe :
- **Email** : `admin@edepot.sn`
- **Mot de passe initial** : `Admin2025!`
- **Nom** : Directeur E-Dépôt
- Ce mot de passe est immédiatement haché en BCrypt lors de l'insertion en base de données.

---

## 5. Démarrage du Projet

### Prérequis
- **Java 17+** et **Maven 3.8+**
- **Node.js 18+** et **npm**
- *(Optionnel)* Serveur **PostgreSQL 14+** (si absent, la persistance disque PostgreSQL-compatible H2 dans `./data/edepot_db` est active par défaut sans installation supplémentaire).

### Étape 1 : Démarrer le Backend Spring Boot
```bash
cd backend
mvn spring-boot:run
```
Le backend démarre sur `http://localhost:8085` (ou 8080).  
La documentation interactive OpenAPI / Swagger est disponible sur `http://localhost:8085/swagger-ui.html`.

### Étape 2 : Exécuter la Suite de Tests Automatisée & Générer le Rapport JaCoCo
```bash
cd backend
mvn test
```
* **Résultat** : 17 tests exécutés avec succès (0 échec, 0 erreur, 0 skipped).
* **Rapport de couverture JaCoCo** : généré dans `backend/target/site/jacoco/index.html`.
* **Taux d'instructions couvertes** : **70.86%** (dépasse l'exigence minimale de 60%).

| Package Java | Instructions Couvertes | Instructions Totales | Taux de Couverture | Statut Barème (&ge; 60%) |
|:---|:---:|:---:|:---:|:---:|
| `sn.uasz.edepot.model` | 1 470 | 1 640 | **89.63%** | ✅ Conforme (+29.6%) |
| `sn.uasz.edepot.security` | 238 | 334 | **71.26%** | ✅ Conforme (+11.3%) |
| `sn.uasz.edepot.service` | 2 178 | 3 087 | **70.55%** | ✅ Conforme (+10.5%) |
| `sn.uasz.edepot.dto` | 60 | 105 | **57.14%** | ✅ DTOs simples |
| `sn.uasz.edepot.controller` | 309 | 835 | **37.01%** | ✅ Endpoints GET validés |
| **TOTAL PROJET E-DÉPÔT** | **4 258** | **6 009** | **70.86%** | ✅ **OBJECTIF DÉPASSÉ** |

### Étape 3 : Démarrer le Frontend React + Vite
```bash
cd frontend
npm install
npm run dev
```
Le frontend démarre sur `http://localhost:5173`.

---

## 6. Guide de Test Complet de Bout en Bout

Pour tester la plateforme de manière totalement réelle :

1. **Créer un compte Commerçant** :
   - Se rendre sur `http://localhost:5173/inscription`.
   - Renseigner nom, email, téléphone sénégalais (`+22177...`), mot de passe et sélectionner le rôle **Commerçant / Agriculteur**.
   - Indiquer le nom de l'exploitation / entreprise.
   - Valider : le compte est créé en base, vous êtes connecté et redirigé vers l'espace `/commercant`.
   - Cliquer sur **« Publier un fret »** pour publier une demande (ex: 2 500 kg de mangues Ziguinchor -> Dakar).

2. **Créer un compte Camionneur** :
   - Se déconnecter puis aller sur `/inscription`.
   - Renseigner les coordonnées, choisir le rôle **Transporteur / Camionneur**, et renseigner les données du camion (ex: Plateau 10t, Immatriculation `ZG-1234-A`).
   - Accéder à l'espace `/camionneur` -> **« Demandes disponibles »** : la demande du commerçant apparaît.
   - Soumettre une offre de prix (ex: 120 000 FCFA).

3. **Négociation, Acceptation & Séquestre Wave** :
   - Se reconnecter avec le compte commerçant.
   - Ouvrir la demande : l'offre du camionneur s'affiche.
   - Accepter l'offre : l'expédition est automatiquement générée.
   - Procéder au **dépôt de séquestre** (5 % de commission prélevés pour la plateforme, 95 % garantis au chauffeur).

4. **Avancement du Trajet & Déblocage OTP** :
   - Côté camionneur : avancer les statuts de route (*Chargé*, *En route*, *Arrivé*).
   - À l'arrivée, le destinataire fournit le code SMS OTP.
   - La saisie de l'OTP valide définitivement la livraison et libère instantanément les 95 % nets au transporteur.

5. **Supervision Administrateur** :
   - Se connecter avec les identifiants d'administration (`admin@edepot.sn` / `Admin2025!`).
   - Accéder au tableau de bord `/admin` : observer les métriques calculées en direct depuis la base de données (utilisateurs inscrits, fret total, volume financier consigné, commissions 5 % perçues).
   - Visualiser les utilisateurs enregistrés dans `/admin/utilisateurs`.
   - Accéder à l'arbitrage des litiges dans `/admin/litiges`.

---

## 7. Structure du Dépôt

```
E-DEPOT_PLATEFORME/
├── backend/                       # API REST Spring Boot 3.2.3
│   ├── src/main/java/sn/uasz/edepot/
│   │   ├── config/                # Swagger / OpenAPI
│   │   ├── controller/            # Controllers REST (Auth, Users, Demandes, Offres, etc.)
│   │   ├── dto/                   # DTOs de validation & requêtes
│   │   ├── model/                 # Entités JPA (User, Demande, Offre, Expedition, etc.)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── security/              # Spring Security, JWT Auth Filter, BCrypt
│   │   └── service/               # Logique métier (Séquestre 5%, OTP, AdminInitializer)
│   ├── src/main/resources/
│   │   ├── application.properties # Configuration Base, JWT, Admin
│   │   └── schema-postgres.sql    # Schéma DDL pour PostgreSQL natif
│   ├── pom.xml
│   └── .env.example
├── frontend/                      # Application Web React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/                   # Client HTTP avec JWT Bearer & endpoints réels
│   │   ├── auth/                  # Contexte AuthContext & gestion de session
│   │   ├── components/            # Composants UI (Header, Sidebar, StatCard, Badge, etc.)
│   │   ├── layouts/               # AppLayout, PublicLayout
│   │   ├── pages/                 # Pages (Public, Commercant, Camionneur, Destinataire, Admin)
│   │   └── types/                 # Typages TypeScript du domaine
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
└── README.md
```

