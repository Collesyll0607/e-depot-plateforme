import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireRole } from './auth/RequireRole';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';

// Pages publiques
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { Fonctionnement } from './pages/public/Fonctionnement';
import { SuiviPublic } from './pages/public/SuiviPublic';
import { Legal } from './pages/public/Legal';

// Pages Commerçant
import { CommercantDashboard } from './pages/commercant/CommercantDashboard';
import { PublierDemande } from './pages/commercant/PublierDemande';
import { MesDemandes } from './pages/commercant/MesDemandes';
import { OffresRecues } from './pages/commercant/OffresRecues';
import { ExpeditionsCommercant } from './pages/commercant/ExpeditionsCommercant';

// Pages Camionneur
import { CamionneurDashboard } from './pages/camionneur/CamionneurDashboard';
import { DemandesDisponiblesPage } from './pages/camionneur/DemandesDisponiblesPage';
import { MesTransports } from './pages/camionneur/MesTransports';

// Pages Destinataire
import { DestinataireDashboard } from './pages/destinataire/DestinataireDashboard';

// Pages Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UtilisateursAdmin } from './pages/admin/UtilisateursAdmin';
import { DemandesExpeditionsAdmin } from './pages/admin/DemandesExpeditionsAdmin';
import { TransactionsAdmin } from './pages/admin/TransactionsAdmin';

// Pages Partagées
import { LitigesPage } from './pages/shared/LitigesPage';
import { ProfilPage } from './pages/shared/ProfilPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Espace Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/fonctionnement" element={<Fonctionnement />} />
            <Route
              path="/suivi"
              element={
                <RequireRole allowedRoles={['COMMERCANT', 'CAMIONNEUR', 'DESTINATAIRE', 'ADMIN']}>
                  <SuiviPublic />
                </RequireRole>
              }
            />
            <Route path="/cgu" element={<Legal />} />
            <Route path="/confidentialite" element={<Legal />} />
          </Route>

          {/* Espace Connecté (AppLayout) */}
          <Route element={<AppLayout />}>
            {/* Profil Partagé */}
            <Route
              path="/profil"
              element={
                <RequireRole allowedRoles={['COMMERCANT', 'CAMIONNEUR', 'DESTINATAIRE', 'ADMIN']}>
                  <ProfilPage />
                </RequireRole>
              }
            />

            {/* Espace Commerçant */}
            <Route
              path="/commercant"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <CommercantDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/commercant/publier"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <PublierDemande />
                </RequireRole>
              }
            />
            <Route
              path="/commercant/demandes"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <MesDemandes />
                </RequireRole>
              }
            />
            <Route
              path="/commercant/offres"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <OffresRecues />
                </RequireRole>
              }
            />
            <Route
              path="/commercant/expeditions"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <ExpeditionsCommercant />
                </RequireRole>
              }
            />
            <Route
              path="/commercant/litiges"
              element={
                <RequireRole allowedRoles={['COMMERCANT']}>
                  <LitigesPage />
                </RequireRole>
              }
            />

            {/* Redirections Commerçant vers les pages unifiées */}
            <Route
              path="/commercant/paiements"
              element={<Navigate to="/commercant/expeditions" replace />}
            />
            <Route
              path="/commercant/evaluations"
              element={<Navigate to="/commercant/litiges?tab=avis" replace />}
            />

            {/* Espace Camionneur */}
            <Route
              path="/camionneur"
              element={
                <RequireRole allowedRoles={['CAMIONNEUR']}>
                  <CamionneurDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/camionneur/demandes-disponibles"
              element={
                <RequireRole allowedRoles={['CAMIONNEUR']}>
                  <DemandesDisponiblesPage />
                </RequireRole>
              }
            />
            <Route
              path="/camionneur/mes-transports"
              element={
                <RequireRole allowedRoles={['CAMIONNEUR']}>
                  <MesTransports />
                </RequireRole>
              }
            />

            {/* Redirections Camionneur vers les pages unifiées */}
            <Route
              path="/camionneur/demandes"
              element={<Navigate to="/camionneur/demandes-disponibles" replace />}
            />
            <Route
              path="/camionneur/transports"
              element={<Navigate to="/camionneur/mes-transports" replace />}
            />
            <Route
              path="/camionneur/mes-offres"
              element={<Navigate to="/camionneur/mes-transports?tab=offres" replace />}
            />
            <Route
              path="/camionneur/revenus"
              element={<Navigate to="/camionneur/mes-transports?tab=revenus" replace />}
            />
            <Route
              path="/camionneur/suivi-gps"
              element={<Navigate to="/camionneur/mes-transports" replace />}
            />
            <Route
              path="/camionneur/documents"
              element={<Navigate to="/profil" replace />}
            />
            <Route
              path="/camionneur/evaluations"
              element={<Navigate to="/camionneur/mes-transports" replace />}
            />

            {/* Espace Destinataire */}
            <Route
              path="/destinataire"
              element={
                <RequireRole allowedRoles={['DESTINATAIRE']}>
                  <DestinataireDashboard />
                </RequireRole>
              }
            />

            {/* Espace Administrateur */}
            <Route
              path="/admin"
              element={
                <RequireRole allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/demandes"
              element={
                <RequireRole allowedRoles={['ADMIN']}>
                  <DemandesExpeditionsAdmin />
                </RequireRole>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <RequireRole allowedRoles={['ADMIN']}>
                  <TransactionsAdmin />
                </RequireRole>
              }
            />
            <Route
              path="/admin/utilisateurs"
              element={
                <RequireRole allowedRoles={['ADMIN']}>
                  <UtilisateursAdmin />
                </RequireRole>
              }
            />

            {/* Redirections Admin vers les pages unifiées */}
            <Route
              path="/admin/expeditions"
              element={<Navigate to="/admin/demandes?tab=expeditions" replace />}
            />
            <Route
              path="/admin/commissions"
              element={<Navigate to="/admin/transactions?tab=commissions" replace />}
            />
            <Route
              path="/admin/litiges"
              element={<Navigate to="/admin/utilisateurs?tab=litiges" replace />}
            />
            <Route
              path="/admin/avis"
              element={<Navigate to="/admin/utilisateurs" replace />}
            />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
