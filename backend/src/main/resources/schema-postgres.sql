-- =============================================================================
-- E-DÉPÔT : Script SQL de Création de Schéma pour PostgreSQL 14+
-- Projet L3 Ingénierie Informatique - UASZ (Université Assane Seck de Ziguinchor)
-- =============================================================================

-- Extension pour la génération d'UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(64) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    avatar_url TEXT,
    adresse TEXT,
    ville VARCHAR(128),
    date_inscription TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verifie BOOLEAN DEFAULT FALSE,
    note_moyenne DOUBLE PRECISION DEFAULT 5.0,
    nombre_avis INTEGER DEFAULT 0,
    nom_entreprise VARCHAR(255),
    secteur_activite VARCHAR(255),
    type_camion VARCHAR(128),
    capacite_kg DOUBLE PRECISION,
    immatriculation VARCHAR(64),
    disponible BOOLEAN DEFAULT TRUE,
    permis_valide BOOLEAN DEFAULT TRUE,
    carte_grise_valide BOOLEAN DEFAULT TRUE,
    assurance_valide BOOLEAN DEFAULT TRUE
);

-- Zones desservies par les camionneurs
CREATE TABLE IF NOT EXISTS user_zones (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zone VARCHAR(128) NOT NULL,
    PRIMARY KEY (user_id, zone)
);

-- Demandes de Fret publiées par les commerçants
CREATE TABLE IF NOT EXISTS demandes_transport (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL UNIQUE,
    commercant_id VARCHAR(64) NOT NULL REFERENCES users(id),
    commercant_nom VARCHAR(255),
    commercant_telephone VARCHAR(64),
    titre VARCHAR(255) NOT NULL,
    type_marchandise VARCHAR(128),
    poids_kg DOUBLE PRECISION,
    volume_m3 DOUBLE PRECISION,
    lieu_depart VARCHAR(255),
    lieu_arrivee VARCHAR(255),
    distance_km DOUBLE PRECISION,
    duree_estimee VARCHAR(64),
    date_chargement VARCHAR(64),
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(32) NOT NULL,
    prix_propose_commercant DOUBLE PRECISION,
    description TEXT,
    destinataire_nom VARCHAR(255),
    destinataire_telephone VARCHAR(64),
    destinataire_entreprise VARCHAR(255),
    destinataire_adresse VARCHAR(255)
);

-- Offres soumises par les camionneurs
CREATE TABLE IF NOT EXISTS offres_transport (
    id VARCHAR(64) PRIMARY KEY,
    demande_id VARCHAR(64) NOT NULL REFERENCES demandes_transport(id) ON DELETE CASCADE,
    demande_reference VARCHAR(64),
    camionneur_id VARCHAR(64) NOT NULL REFERENCES users(id),
    camionneur_nom VARCHAR(255),
    camionneur_telephone VARCHAR(64),
    camionneur_note DOUBLE PRECISION,
    camionneur_type_camion VARCHAR(128),
    camionneur_immatriculation VARCHAR(64),
    prix_propose DOUBLE PRECISION NOT NULL,
    date_disponible VARCHAR(64),
    conditions TEXT,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(32) NOT NULL,
    contre_proposition_prix DOUBLE PRECISION,
    contre_proposition_message TEXT,
    contre_proposition_auteur VARCHAR(32),
    contre_proposition_date TIMESTAMPTZ
);

-- Expéditions actives et contrats de transport
CREATE TABLE IF NOT EXISTS expeditions (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL UNIQUE,
    demande_id VARCHAR(64) NOT NULL REFERENCES demandes_transport(id),
    offre_id VARCHAR(64) NOT NULL REFERENCES offres_transport(id),
    commercant_id VARCHAR(64) NOT NULL REFERENCES users(id),
    camionneur_id VARCHAR(64) NOT NULL REFERENCES users(id),
    commercant_nom VARCHAR(255),
    commercant_telephone VARCHAR(64),
    camionneur_nom VARCHAR(255),
    camionneur_telephone VARCHAR(64),
    titre VARCHAR(255),
    type_marchandise VARCHAR(128),
    poids_kg DOUBLE PRECISION,
    lieu_depart VARCHAR(255),
    lieu_arrivee VARCHAR(255),
    prix_convenu DOUBLE PRECISION NOT NULL,
    commission_plateforme DOUBLE PRECISION NOT NULL,
    net_transporteur DOUBLE PRECISION NOT NULL,
    statut VARCHAR(32) NOT NULL,
    code_otp VARCHAR(16) NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_chargement VARCHAR(64),
    date_livraison_estimee VARCHAR(64),
    date_livraison_effective TIMESTAMPTZ,
    sequestre_depose BOOLEAN DEFAULT FALSE,
    paiement_libere BOOLEAN DEFAULT FALSE,
    destinataire_nom VARCHAR(255),
    destinataire_telephone VARCHAR(64),
    destinataire_adresse VARCHAR(255),
    anomalie_signalee BOOLEAN DEFAULT FALSE,
    description_anomalie TEXT
);

-- Historique de traçabilité des étapes du fret
CREATE TABLE IF NOT EXISTS evenements_historique (
    id BIGSERIAL PRIMARY KEY,
    expedition_id VARCHAR(64) NOT NULL REFERENCES expeditions(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(32) NOT NULL,
    description TEXT,
    auteur VARCHAR(255),
    localisation VARCHAR(255)
);

-- Transactions financières et séquestre Wave Sandbox
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL UNIQUE,
    expedition_id VARCHAR(64) NOT NULL REFERENCES expeditions(id),
    expedition_reference VARCHAR(64),
    commercant_id VARCHAR(64) NOT NULL REFERENCES users(id),
    camionneur_id VARCHAR(64) NOT NULL REFERENCES users(id),
    type_operation VARCHAR(32) NOT NULL,
    montant_total DOUBLE PRECISION NOT NULL,
    montant_commission DOUBLE PRECISION NOT NULL,
    montant_net_transporteur DOUBLE PRECISION NOT NULL,
    statut VARCHAR(32) NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_liberation TIMESTAMPTZ,
    reference_wave VARCHAR(128),
    telephone_wave VARCHAR(64)
);

-- Litiges et arbitrage administrateur
CREATE TABLE IF NOT EXISTS litiges (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL UNIQUE,
    expedition_id VARCHAR(64) NOT NULL REFERENCES expeditions(id),
    expedition_reference VARCHAR(64),
    demandeur_id VARCHAR(64) NOT NULL REFERENCES users(id),
    demandeur_nom VARCHAR(255),
    demandeur_role VARCHAR(32),
    motif VARCHAR(255) NOT NULL,
    description TEXT,
    statut VARCHAR(32) NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_resolution TIMESTAMPTZ,
    resolution VARCHAR(64),
    motif_resolution TEXT,
    montant_rembourse DOUBLE PRECISION
);

-- Évaluations et réputation bilatérale
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(64) PRIMARY KEY,
    expedition_id VARCHAR(64) NOT NULL REFERENCES expeditions(id),
    auteur_id VARCHAR(64) NOT NULL REFERENCES users(id),
    auteur_nom VARCHAR(255),
    auteur_role VARCHAR(32),
    cible_id VARCHAR(64) NOT NULL REFERENCES users(id),
    cible_nom VARCHAR(255),
    cible_role VARCHAR(32),
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_demandes_commercant ON demandes_transport(commercant_id);
CREATE INDEX IF NOT EXISTS idx_demandes_statut ON demandes_transport(statut);
CREATE INDEX IF NOT EXISTS idx_offres_demande ON offres_transport(demande_id);
CREATE INDEX IF NOT EXISTS idx_offres_camionneur ON offres_transport(camionneur_id);
CREATE INDEX IF NOT EXISTS idx_expeditions_commercant ON expeditions(commercant_id);
CREATE INDEX IF NOT EXISTS idx_expeditions_camionneur ON expeditions(camionneur_id);
CREATE INDEX IF NOT EXISTS idx_transactions_expedition ON transactions(expedition_id);
