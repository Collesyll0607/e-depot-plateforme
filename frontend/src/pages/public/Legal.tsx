import React from 'react';

export const Legal: React.FC = () => {
  return (
    <div className="public-container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Conditions Générales & Confidentialité</h1>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--color-text-main)' }}>
        <section>
          <h3>1. Objet du service</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
            E-Dépôt est une plateforme numérique de mise en relation logistique conçue pour faciliter le fret agricole
            et commercial en Casamance et au Sénégal. La plateforme intervient en qualité d'intermédiaire technique
            et tiers de confiance financier.
          </p>
        </section>

        <section>
          <h3>2. Fonctionnement du séquestre</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
            Les paiements de fret sont collectés via l'API Wave Sandbox pour sécuriser l'exécution de la mission de transport.
            Une commission de plateforme de 5 % TTC est prélevée lors de la clôture définitive validée par code OTP.
          </p>
        </section>

        <section>
          <h3>3. Protection des données personnelles</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
            Conformément à la réglementation sénégalaise relative aux données à caractère personnel (loi n° 2008-12),
            les coordonnées téléphoniques et géolocalisations collectées ne sont partagées qu'entre les intervenants
            d'une même mission de transport.
          </p>
        </section>

        <section>
          <h3>4. Cadre académique</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
            Cette plateforme s'inscrit dans le cadre du module de Gestion de Projet Informatique Avancée (L3 Informatique,
            Université Assane Seck de Ziguinchor - UASZ).
          </p>
        </section>
      </div>
    </div>
  );
};
