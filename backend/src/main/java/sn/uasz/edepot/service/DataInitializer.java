package sn.uasz.edepot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.*;

import java.time.Instant;
import java.util.List;

/**
 * Initialiseur de données réelles pour la plateforme E-Dépôt.
 * Initialise les profils utilisateurs pour chaque rôle (Commerçant, Camionneur, Destinataire, Admin)
 * ainsi qu'un jeu d'opérations de fret en Casamance (demandes, offres, expéditions avec séquestre, litige).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DemandeRepository demandeRepository;
    private final OffreRepository offreRepository;
    private final ExpeditionRepository expeditionRepository;
    private final TransactionRepository transactionRepository;
    private final LitigeRepository litigeRepository;
    private final EvaluationRepository evaluationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${edepot.admin.email:admin@edepot.sn}")
    private String adminEmail;

    @Value("${edepot.admin.password:Admin2025!}")
    private String adminPassword;

    public DataInitializer(
            UserRepository userRepository,
            DemandeRepository demandeRepository,
            OffreRepository offreRepository,
            ExpeditionRepository expeditionRepository,
            TransactionRepository transactionRepository,
            LitigeRepository litigeRepository,
            EvaluationRepository evaluationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.demandeRepository = demandeRepository;
        this.offreRepository = offreRepository;
        this.expeditionRepository = expeditionRepository;
        this.transactionRepository = transactionRepository;
        this.litigeRepository = litigeRepository;
        this.evaluationRepository = evaluationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("==> Initialisation des données réelles E-Dépôt...");

        initUsers();
        initBusinessData();

        log.info("==> Initialisation terminée. Prêt pour les tests avec comptes configurés.");
    }

    private void initUsers() {
        // 1. Admin
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = new User();
            admin.setId("admin-root-01");
            admin.setEmail(adminEmail.toLowerCase().trim());
            admin.setNom("Directeur E-Dépôt");
            admin.setTelephone("+221770000000");
            admin.setMotDePasse(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);
            admin.setVerifie(true);
            admin.setVille("Ziguinchor");
            admin.setAdresse("Direction Générale E-Dépôt, Tilène, Ziguinchor");
            userRepository.save(admin);
            log.info("Compte Administrateur configuré : {}", adminEmail);
        } else {
            userRepository.findByEmailIgnoreCase(adminEmail).ifPresent(admin -> {
                if (admin.getNom() != null && (admin.getNom().contains("Ã") || admin.getNom().contains(""))) {
                    admin.setNom("Directeur E-Dépôt");
                    userRepository.save(admin);
                    log.info("Correction de l'encodage du nom Administrateur.");
                }
            });
        }

        // 2. Commerçante (Aïssatou Diatta)
        createUserIfNotExists(
                "comm-aissatou-01",
                "aissatou@edepot.sn",
                "Aïssatou Diatta",
                "+221771234567",
                "Passer123!",
                UserRole.COMMERCANT,
                "GIE Terroir Casamance",
                "Commerce agricole & transformation fruitière",
                "Ziguinchor",
                "Marché Tilène, Allée des grossistes"
        );
        // Alias commercant@edepot.sn pour facilité d'accès
        createUserIfNotExists(
                "comm-generique-01",
                "commercant@edepot.sn",
                "Aïssatou Diatta (Commerçante)",
                "+221771234568",
                "Passer123!",
                UserRole.COMMERCANT,
                "GIE Terroir Casamance",
                "Fruits & Céréales de Casamance",
                "Ziguinchor",
                "Tilène, Ziguinchor"
        );

        // 3. Camionneur (Moussa Badji)
        User camionneur = createUserIfNotExists(
                "cam-moussa-01",
                "moussa@edepot.sn",
                "Moussa Badji",
                "+221772345678",
                "Passer123!",
                UserRole.CAMIONNEUR,
                null,
                null,
                "Ziguinchor",
                "Gare routière de Ziguinchor, Poste Sud"
        );
        if (camionneur != null) {
            camionneur.setTypeCamion("PLATEAU_10T");
            camionneur.setCapaciteKg(10000);
            camionneur.setImmatriculation("ZG-4592-A");
            camionneur.setDisponible(true);
            camionneur.setZonesDesservies(List.of("Ziguinchor", "Bignona", "Sédhiou", "Kolda", "Dakar"));
            userRepository.save(camionneur);
        }

        // Alias camionneur@edepot.sn
        User camAlias = createUserIfNotExists(
                "cam-generique-01",
                "camionneur@edepot.sn",
                "Moussa Badji (Transporteur)",
                "+221772345679",
                "Passer123!",
                UserRole.CAMIONNEUR,
                null,
                null,
                "Bignona",
                "Axe Ziguinchor - Bignona"
        );
        if (camAlias != null) {
            camAlias.setTypeCamion("BENNE_15T");
            camAlias.setCapaciteKg(15000);
            camAlias.setImmatriculation("ZG-8811-B");
            camAlias.setDisponible(true);
            userRepository.save(camAlias);
        }

        // 4. Destinataire (Ousmane Sané)
        createUserIfNotExists(
                "dest-ousmane-01",
                "ousmane@edepot.sn",
                "Ousmane Sané",
                "+221773456789",
                "Passer123!",
                UserRole.DESTINATAIRE,
                "Marché Tilène Fruits & Légumes",
                "Distribution & Vente en gros",
                "Ziguinchor",
                "Marché Tilène, Entrepôt D-12, Ziguinchor"
        );
        // Alias destinataire@edepot.sn
        createUserIfNotExists(
                "dest-generique-01",
                "destinataire@edepot.sn",
                "Ousmane Sané (Destinataire)",
                "+221773456780",
                "Passer123!",
                UserRole.DESTINATAIRE,
                "Grossiste Fret Casamance",
                "Agroalimentaire",
                "Ziguinchor",
                "Boutique Centrale Tilène"
        );
    }

    private User createUserIfNotExists(
            String id, String email, String nom, String telephone, String password,
            UserRole role, String nomEntreprise, String secteur, String ville, String adresse) {
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            User u = new User();
            u.setId(id);
            u.setEmail(email.toLowerCase().trim());
            u.setNom(nom);
            u.setTelephone(telephone);
            u.setMotDePasse(passwordEncoder.encode(password));
            u.setRole(role);
            u.setVerifie(true);
            u.setVille(ville);
            u.setAdresse(adresse);
            u.setNomEntreprise(nomEntreprise);
            u.setSecteurActivite(secteur);
            User saved = userRepository.save(u);
            log.info("Utilisateur créé [{}] : {}", role, email);
            return saved;
        }
        return userRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    private void initBusinessData() {
        if (demandeRepository.existsById("dem-cas-001")) {
            log.info("Données métier Casamance déjà présentes en base de données.");
            return;
        }

        log.info("Peuplement initial des données métier (Demandes, Offres, Expéditions, Séquestre, Litiges)...");

        // 1. Demande 1 : Mangues Kent (OUVERTE avec 1 offre de Moussa Badji)
        DemandeTransport d1 = new DemandeTransport();
        d1.setId("dem-cas-001");
        d1.setReference("DEM-CAS-2025-001");
        d1.setCommercantId("comm-aissatou-01");
        d1.setCommercantNom("Aïssatou Diatta");
        d1.setCommercantTelephone("+221771234567");
        d1.setOrigine("Ziguinchor (Vergers de Boutoute)");
        d1.setDestination("Dakar (Marché Syndicat)");
        d1.setDateChargement("Demain, 06h30");
        d1.setDateLivraisonSouhaitee("Sous 24h");
        d1.setTypeMarchandise("Mangues Kent fraîches (en cagettes aérées)");
        d1.setPoidsKg(3500.0);
        d1.setVolumeM3(8.5);
        d1.setPrixPropose(250000.0);
        d1.setInstructionsManutention("Chargement délicat, arrimage soigné, bâche étanche obligatoire.");
        d1.setDestinataireNom("Amadou Fall");
        d1.setDestinataireTelephone("+221776543210");
        d1.setDestinataireAdresse("Marché Syndicat Pikine, Hangar 4");
        d1.setDestinataireVille("Dakar");
        d1.setStatut(StatutDemande.OUVERTE);
        d1.setNombreOffres(1);
        demandeRepository.save(d1);

        // Offre sur Demande 1
        OffreTransport o1 = new OffreTransport();
        o1.setId("off-cas-001");
        o1.setDemandeId(d1.getId());
        o1.setDemandeReference(d1.getReference());
        o1.setCamionneurId("cam-moussa-01");
        o1.setCamionneurNom("Moussa Badji");
        o1.setCamionneurTelephone("+221772345678");
        o1.setCamionneurNote(4.9);
        o1.setPrixPropose(280000.0);
        o1.setDateDisponible("Demain matin à 06h00");
        o1.setConditions("Camion plateau 10t avec bâche étanche neuve et sangles de sécurité.");
        o1.setStatut(StatutOffre.EN_ATTENTE);
        offreRepository.save(o1);

        // 2. Demande 2 : Sacs de Riz de Sédhiou (OUVERTE)
        DemandeTransport d2 = new DemandeTransport();
        d2.setId("dem-cas-002");
        d2.setReference("DEM-CAS-2025-002");
        d2.setCommercantId("comm-aissatou-01");
        d2.setCommercantNom("Aïssatou Diatta");
        d2.setCommercantTelephone("+221771234567");
        d2.setOrigine("Sédhiou (Vallée rizicole de Djibabou)");
        d2.setDestination("Ziguinchor (Marché Tilène)");
        d2.setDateChargement("Dans 2 jours");
        d2.setTypeMarchandise("Sacs de Riz local de vallée (50 kg)");
        d2.setPoidsKg(6000.0);
        d2.setVolumeM3(12.0);
        d2.setPrixPropose(140000.0);
        d2.setInstructionsManutention("Éviter tout contact avec l'humidité, plancher surélevé.");
        d2.setDestinataireNom("Ousmane Sané");
        d2.setDestinataireTelephone("+221773456789");
        d2.setDestinataireAdresse("Marché Tilène, Entrepôt D-12");
        d2.setDestinataireVille("Ziguinchor");
        d2.setStatut(StatutDemande.OUVERTE);
        d2.setNombreOffres(0);
        demandeRepository.save(d2);

        // 3. Demande 3 : Agrumes & Oranges de Bignona (OUVERTE)
        DemandeTransport d3 = new DemandeTransport();
        d3.setId("dem-cas-003");
        d3.setReference("DEM-CAS-2025-003");
        d3.setCommercantId("comm-aissatou-01");
        d3.setCommercantNom("Aïssatou Diatta");
        d3.setCommercantTelephone("+221771234567");
        d3.setOrigine("Bignona (Coopérative agricole)");
        d3.setDestination("Cap Skirring (Hôtels & Restaurants)");
        d3.setDateChargement("Vendredi matin");
        d3.setTypeMarchandise("Paniers d'Oranges et Mandarines");
        d3.setPoidsKg(2000.0);
        d3.setVolumeM3(5.0);
        d3.setPrixPropose(85000.0);
        d3.setDestinataireNom("Khadija Ba");
        d3.setDestinataireTelephone("+221778901234");
        d3.setDestinataireAdresse("Zone hôtelière du Cap");
        d3.setDestinataireVille("Cap Skirring");
        d3.setStatut(StatutDemande.OUVERTE);
        d3.setNombreOffres(0);
        demandeRepository.save(d3);

        // 4. Expédition 1 : En Route avec Séquestre Wave Déposé et OTP prêt à valider
        Expedition exp1 = new Expedition();
        exp1.setId("exp-cas-001");
        exp1.setReference("EXP-CAS-2025-001");
        exp1.setDemandeId("dem-cas-000-prev");
        exp1.setCommercantId("comm-aissatou-01");
        exp1.setCommercantNom("Aïssatou Diatta");
        exp1.setCamionneurId("cam-moussa-01");
        exp1.setCamionneurNom("Moussa Badji");
        exp1.setCamionneurTelephone("+221772345678");
        exp1.setDestinataireNom("Ousmane Sané");
        exp1.setDestinataireTelephone("+221773456789");
        exp1.setDestinataireAdresse("Marché Tilène, Entrepôt D-12");
        exp1.setDestinataireVille("Ziguinchor");
        exp1.setOrigine("Oussouye");
        exp1.setDestination("Port de Ziguinchor");
        exp1.setTypeMarchandise("Noix d'anacarde brutes (sacs de 80 kg)");
        exp1.setPoidsKg(4000.0);
        exp1.setPrixConvenu(150000.0);
        exp1.setStatut(StatutExpedition.EN_ROUTE);
        exp1.setCodeOtp("7392"); // Code OTP prêt à être validé par le destinataire ou camionneur
        exp1.setOtpValide(false);
        exp1.setPositionLat(12.5620);
        exp1.setPositionLng(-16.2730);
        exp1.setPositionDerniereMaj(Instant.now().toString());
        exp1.setPositionSource("GPS_CAMION");
        exp1.setDateLivraisonEstimee("Aujourd'hui à 18h00");

        exp1.getHistorique().add(new EvenementHistorique(StatutExpedition.A_PAYER, "Contrat validé entre Aïssatou Diatta et Moussa Badji", "Système E-Dépôt"));
        exp1.getHistorique().add(new EvenementHistorique(StatutExpedition.PAYEE_SEQUESTRE, "Séquestre Wave consigné avec succès (150 000 FCFA)", "Wave Sandbox"));
        exp1.getHistorique().add(new EvenementHistorique(StatutExpedition.CHARGEE, "Marchandise chargée à Oussouye avec contrôle du tonnage", "Moussa Badji"));
        exp1.getHistorique().add(new EvenementHistorique(StatutExpedition.EN_ROUTE, "Camion en route sur l'axe Oussouye - Ziguinchor", "Moussa Badji"));
        expeditionRepository.save(exp1);

        // Transaction de Séquestre Wave pour Expédition 1 (150 000 FCFA : 7 500 commission, 142 500 net)
        Transaction tx1 = new Transaction();
        tx1.setId("tx-wave-001");
        tx1.setReference("TX-WAVE-CAS-001");
        tx1.setExpeditionId(exp1.getId());
        tx1.setExpeditionReference(exp1.getReference());
        tx1.setCommercantId(exp1.getCommercantId());
        tx1.setCommercantNom(exp1.getCommercantNom());
        tx1.setCamionneurId(exp1.getCamionneurId());
        tx1.setCamionneurNom(exp1.getCamionneurNom());
        tx1.setMontantTotal(150000.0);
        tx1.setMontantSequestre(150000.0);
        tx1.setMontantCommission(7500.0); // 5 %
        tx1.setMontantNetTransporteur(142500.0); // 95 %
        tx1.setWaveReference("WAVE-SN-9823412-SBX");
        tx1.setStatut(StatutPaiement.CONFIRME_SEQUESTRE);
        tx1.getOperations().add(new OperationFinanciere("DEPOT_SEQUESTRE", 150000.0, "Dépôt de séquestre sécurisé via Wave Sandbox (+221771234567)", "SUCCES"));
        transactionRepository.save(tx1);

        // 5. Expédition 2 : Déjà Livrée avec Succès (Fret historique pour voir les stats & évaluations)
        Expedition exp2 = new Expedition();
        exp2.setId("exp-cas-002");
        exp2.setReference("EXP-CAS-2025-002");
        exp2.setDemandeId("dem-cas-prev-002");
        exp2.setCommercantId("comm-aissatou-01");
        exp2.setCommercantNom("Aïssatou Diatta");
        exp2.setCamionneurId("cam-moussa-01");
        exp2.setCamionneurNom("Moussa Badji");
        exp2.setCamionneurTelephone("+221772345678");
        exp2.setDestinataireNom("Ousmane Sané");
        exp2.setDestinataireTelephone("+221773456789");
        exp2.setDestinataireAdresse("Marché Tilène, Entrepôt D-12");
        exp2.setDestinataireVille("Ziguinchor");
        exp2.setOrigine("Nyassia");
        exp2.setDestination("Ziguinchor");
        exp2.setTypeMarchandise("Miel de mangrove & Huile de palme");
        exp2.setPoidsKg(800.0);
        exp2.setPrixConvenu(60000.0);
        exp2.setStatut(StatutExpedition.LIVREE);
        exp2.setCodeOtp("5184");
        exp2.setOtpValide(true);
        exp2.setDateLivraisonEstimee("Hier");

        exp2.getHistorique().add(new EvenementHistorique(StatutExpedition.PAYEE_SEQUESTRE, "Séquestre Wave consigné (60 000 FCFA)", "Wave Sandbox"));
        exp2.getHistorique().add(new EvenementHistorique(StatutExpedition.EN_ROUTE, "Acheminement direct", "Moussa Badji"));
        exp2.getHistorique().add(new EvenementHistorique(StatutExpedition.LIVREE, "Livraison confirmée par code OTP 5184. Paiement débloqué.", "Ousmane Sané"));
        expeditionRepository.save(exp2);

        // Transaction libérée pour Expédition 2
        Transaction tx2 = new Transaction();
        tx2.setId("tx-wave-002");
        tx2.setReference("TX-WAVE-CAS-002");
        tx2.setExpeditionId(exp2.getId());
        tx2.setExpeditionReference(exp2.getReference());
        tx2.setCommercantId(exp2.getCommercantId());
        tx2.setCommercantNom(exp2.getCommercantNom());
        tx2.setCamionneurId(exp2.getCamionneurId());
        tx2.setCamionneurNom(exp2.getCamionneurNom());
        tx2.setMontantTotal(60000.0);
        tx2.setMontantSequestre(0.0);
        tx2.setMontantCommission(3000.0);
        tx2.setMontantNetTransporteur(57000.0);
        tx2.setWaveReference("WAVE-SN-4432190-SBX");
        tx2.setStatut(StatutPaiement.LIBERE);
        tx2.getOperations().add(new OperationFinanciere("DEPOT_SEQUESTRE", 60000.0, "Dépôt séquestre initial", "SUCCES"));
        tx2.getOperations().add(new OperationFinanciere("COMMISSION_PLATEFORME", 3000.0, "Commission 5 % perçue par E-Dépôt", "SUCCES"));
        tx2.getOperations().add(new OperationFinanciere("VIREMENT_TRANSPORTEUR", 57000.0, "Virement net 95 % vers Wave Moussa Badji (+221772345678)", "SUCCES"));
        transactionRepository.save(tx2);

        // 6. Évaluation pour Expédition 2
        Evaluation ev1 = new Evaluation();
        ev1.setId("eval-cas-001");
        ev1.setExpeditionId(exp2.getId());
        ev1.setAuteurId("comm-aissatou-01");
        ev1.setAuteurNom("Aïssatou Diatta");
        ev1.setAuteurRole("COMMERCANT");
        ev1.setCibleId("cam-moussa-01");
        ev1.setCibleNom("Moussa Badji");
        ev1.setNote(5);
        ev1.setCommentaire("Excellent transporteur, très ponctuel et respectueux de la marchandise. Je recommande vivement pour tous trajets en Casamance.");
        evaluationRepository.save(ev1);

        // 7. Litige de démonstration (sur Expédition 1) pour l'espace Administrateur (/admin/litiges)
        Litige lit1 = new Litige();
        lit1.setId("lit-cas-001");
        lit1.setReference("LIT-CAS-2025-001");
        lit1.setExpeditionId(exp1.getId());
        lit1.setExpeditionReference(exp1.getReference());
        lit1.setDeclarantId("comm-aissatou-01");
        lit1.setDeclarantNom("Aïssatou Diatta");
        lit1.setDeclarantRole("COMMERCANT");
        lit1.setMotif("Retard important et déchirure de deux sacs d'anacarde");
        lit1.setDescription("Le transporteur a pris 3 heures de retard sur l'horaire de chargement prévu à Oussouye, et deux sacs ont été abîmés lors de la manutention. Je demande une indemnisation partielle sur les frais de transport.");
        lit1.setStatut(StatutLitige.OUVERT);
        litigeRepository.save(lit1);

        log.info("==> Jeu de données complet généré avec succès en base de données !");
    }
}
