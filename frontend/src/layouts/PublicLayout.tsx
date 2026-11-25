import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';
import { DemoBanner } from '../components/domain/DemoBanner';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="public-layout">
      <DemoBanner />

      <header className="public-header">
        <div className="public-container">
          <nav className="public-nav">
            <Logo variant="dark" size="sm" />

            <ul className="public-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink to="/fonctionnement" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Comment ça marche
                </NavLink>
              </li>
              {user && (
                <li>
                  <NavLink to="/suivi" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Suivi d'expédition
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="public-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <Link
                  to={
                    user.role === 'ADMIN'
                      ? '/admin'
                      : user.role === 'COMMERCANT'
                      ? '/commercant'
                      : user.role === 'CAMIONNEUR'
                      ? '/camionneur'
                      : '/destinataire'
                  }
                >
                  <Button variant="primary" size="sm">
                    Mon Espace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/connexion">
                    <Button variant="outline" size="sm" icon={<LogIn size={14} />}>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/inscription">
                    <Button variant="accent" size="sm" icon={<UserPlus size={14} />}>
                      S'inscrire
                    </Button>
                  </Link>
                </>
              )}

              <button
                type="button"
                aria-label="Menu de navigation"
                className="public-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="public-mobile-drawer">
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
            Accueil
          </NavLink>
          <NavLink to="/fonctionnement" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
            Comment ça marche
          </NavLink>
          {user && (
            <NavLink to="/suivi" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              Suivi d'expédition
            </NavLink>
          )}
        </div>
      )}

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-grid">
          <div>
            <Logo variant="light" size="md" />
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#B5C4B5', lineHeight: 1.6 }}>
              Plateforme technologique de mise en relation de fret et transport en Casamance. Sécurisation des paiements
              par séquestre Wave Sandbox, optimisation des trajets retours et valorisation des récoltes locales.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1rem' }}>Solutions</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <li><Link to="/fonctionnement" style={{ color: '#B5C4B5' }}>Pour les commerçants</Link></li>
              <li><Link to="/fonctionnement" style={{ color: '#B5C4B5' }}>Pour les transporteurs</Link></li>
              <li><Link to={user ? "/suivi" : "/connexion"} style={{ color: '#B5C4B5' }}>Suivi d'expédition</Link></li>
              <li><Link to="/fonctionnement" style={{ color: '#B5C4B5' }}>Séquestre Wave 5%</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1rem' }}>Zones d'activité</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#B5C4B5' }}>
              <li>Ziguinchor & Marché Tilène</li>
              <li>Kafountine & Bignona</li>
              <li>Oussouye & Cap Skirring</li>
              <li>Marsassoum & Sédhiou</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1rem' }}>Légal & Contact</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <li><Link to="/cgu" style={{ color: '#B5C4B5' }}>Conditions d'utilisation</Link></li>
              <li><Link to="/confidentialite" style={{ color: '#B5C4B5' }}>Confidentialité</Link></li>
              <li style={{ color: '#B5C4B5' }}>Support : support@edepot.sn</li>
              <li style={{ color: '#B5C4B5' }}>Ziguinchor, Sénégal</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} E-Dépôt. Tous droits réservés. Projet L3 Informatique UASZ Ziguinchor.</span>
          <span>Conçu pour le désenclavement et l'agritech en Casamance.</span>
        </div>
      </footer>
    </div>
  );
};
