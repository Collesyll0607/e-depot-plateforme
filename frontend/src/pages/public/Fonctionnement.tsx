import React from 'react';
import { ShieldCheck, Truck, Smartphone, CheckCircle, Scale, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const Fonctionnement: React.FC = () => {
  return (
    <div className="public-container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="section-tag">Guide complet</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Comment fonctionne E-Dépôt</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem' }}>
          Découvrez en détail l'architecture de confiance de notre plateforme logistique dédiée à la Casamance.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Pilier 1 : La mise en relation intelligente */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={32} color="#E88945" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>1. Mise en relation et optimisation des retours à vide</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              En Casamance, les camions assurant l'approvisionnement en matériaux ou produits manufacturés depuis Dakar ou Kaolack
              retournent fréquemment à vide. E-Dépôt permet aux agriculteurs et groupements d'intérêt économique (GIE) de publier
              leurs besoins de transport (mangues, riz local, noix de cajou, poisson séché, légumes frais). Les transporteurs
              soumettent des propositions tarifaires compétitives adaptées à leur gabarit.
            </p>
          </div>
        </div>

        {/* Pilier 2 : Le séquestre Wave 5% */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', backgroundColor: '#EAF7EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={32} color="#1E7E45" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>2. Le séquestre Wave Sandbox à 5 %</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Dès qu'une offre est acceptée, le commerçant consigne le montant total convenu par transfert Mobile Money
              sécurisé. La plateforme retient 5 % de frais d'intermédiation et conserve 95 % sous séquestre. Ni le commerçant
              ni le chauffeur ne peuvent détourner les fonds : ceux-ci sont cantonnés jusqu'à la livraison effective.
            </p>
          </div>
        </div>

        {/* Pilier 3 : La validation OTP à destination */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', backgroundColor: '#E8F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={32} color="#1F6F8B" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>3. Déblocage irrévocable par code SMS (OTP)</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              À l'arrivée des marchandises au marché ou à l'entrepôt, le destinataire désigné contrôle l'intégrité des colis.
              S'il est satisfait, il transmet au chauffeur son code confidentiel à 4 chiffres (OTP). La saisie du code valide
              immédiatement le déblocage du paiement vers le compte Wave du camionneur.
            </p>
          </div>
        </div>

        {/* Pilier 4 : Arbitrage et litiges */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', backgroundColor: '#FFF8E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={32} color="#B57414" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>4. Arbitrage transparent des litiges</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Si une anomalie survient (avarie, retard abusif, refus de marchandise), l'une des parties peut déclarer un litige.
              Le séquestre reste automatiquement gelé. L'administrateur étudie les pièces justificatives et prononce une décision :
              libération intégrale, remboursement total du commerçant, ou remboursement partiel avec indemnité.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
        <Link to="/inscription">
          <Button variant="primary" size="lg">
            Rejoindre la plateforme E-Dépôt
          </Button>
        </Link>
      </div>
    </div>
  );
};
