package sn.uasz.edepot;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import sn.uasz.edepot.dto.AuthResponse;
import sn.uasz.edepot.dto.LoginRequest;
import sn.uasz.edepot.dto.RegisterRequest;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.UserRepository;
import sn.uasz.edepot.service.*;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("Tests d'Intégration — Authentification Réelle & Scénarios Métier E-Dépôt")
class AuthAndBusinessIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private DemandeService demandeService;

    @Autowired
    private OffreService offreService;

    @Autowired
    private SequestreService sequestreService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("1 & 3: Création de compte expéditeur et connexion avec mot de passe haché")
    void testInscriptionEtConnexionCommercant() {
        String email = "commercant.test." + System.currentTimeMillis() + "@edepot.sn";
        RegisterRequest regReq = new RegisterRequest(
                "Awa Diop",
                email,
                "+221771112233",
                "SecretPass2025!",
                UserRole.COMMERCANT,
                "GIE Casamance Bio",
                "Fruits & Légumes",
                null, null, null, null,
                "Marché Tilène",
                "Ziguinchor"
        );

        AuthResponse regRes = authService.register(regReq);
        assertNotNull(regRes);
        assertNotNull(regRes.token());
        assertEquals(email, regRes.user().getEmail());
        assertEquals(UserRole.COMMERCANT, regRes.user().getRole());

        // Vérifier que le mot de passe est bien haché en base (non en clair)
        User inDb = userRepository.findById(regRes.user().getId()).orElseThrow();
        assertNotEquals("SecretPass2025!", inDb.getMotDePasse());
        assertTrue(inDb.getMotDePasse().startsWith("$2a$") || inDb.getMotDePasse().startsWith("$2b$"));

        // Connexion avec mot de passe valide
        AuthResponse loginRes = authService.login(new LoginRequest(email, "SecretPass2025!"));
        assertNotNull(loginRes.token());
        assertEquals(regRes.user().getId(), loginRes.user().getId());
    }

    @Test
    @DisplayName("2: Création d'un compte transporteur avec caractéristiques du camion")
    void testInscriptionTransporteurAvecCamion() {
        String email = "camionneur.test." + System.currentTimeMillis() + "@edepot.sn";
        RegisterRequest regReq = new RegisterRequest(
                "Ousmane Sané",
                email,
                "+221774445566",
                "CamionPass2025!",
                UserRole.CAMIONNEUR,
                null, null,
                "Plateau ridelles",
                12000,
                "ZG-4321-B",
                List.of("Ziguinchor", "Kolda", "Bignona"),
                "Garage Routier",
                "Bignona"
        );

        AuthResponse regRes = authService.register(regReq);
        assertNotNull(regRes);
        assertEquals(UserRole.CAMIONNEUR, regRes.user().getRole());
        assertEquals("Plateau ridelles", regRes.user().getTypeCamion());
        assertEquals(12000, regRes.user().getCapaciteKg());
        assertEquals("ZG-4321-B", regRes.user().getImmatriculation());
    }

    @Test
    @DisplayName("4: Rejet d'un mot de passe erroné lors de la connexion")
    void testEchecFauxMotDePasse() {
        String email = "fail.test." + System.currentTimeMillis() + "@edepot.sn";
        authService.register(new RegisterRequest(
                "Moussa Diallo", email, "+221778889900", "BonMotDePasse123",
                UserRole.COMMERCANT, null, null, null, null, null, null, null, null
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            authService.login(new LoginRequest(email, "MauvaisMotDePasse"));
        });
    }

    @Test
    @DisplayName("5: Empêcher les doublons d'email à l'inscription")
    void testDoublonEmailInterdit() {
        String email = "unique.email." + System.currentTimeMillis() + "@edepot.sn";
        authService.register(new RegisterRequest(
                "Personne 1", email, "+221770001122", "MdpSecurise1!",
                UserRole.COMMERCANT, null, null, null, null, null, null, null, null
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(new RegisterRequest(
                    "Personne 2", email, "+221770003344", "AutreMdp2!",
                    UserRole.COMMERCANT, null, null, null, null, null, null, null, null
            ));
        });
    }

    @Test
    @DisplayName("6: Interdiction stricte de s'attribuer le rôle ADMIN à l'inscription publique")
    void testAttributionAdminInterdite() {
        String email = "hacker.admin." + System.currentTimeMillis() + "@edepot.sn";
        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(new RegisterRequest(
                    "Faux Admin", email, "+221779998877", "TentativeHack2025!",
                    UserRole.ADMIN, null, null, null, null, null, null, null, null
            ));
        });
    }

    @Test
    @DisplayName("8 & 9: Parcours bout en bout (Publication fret, offre transporteur, acceptation, séquestre & OTP)")
    void testParcoursBoutEnBoutTransportEtSequestre() {
        // 1. Inscription commerçant
        AuthResponse comm = authService.register(new RegisterRequest(
                "Sidy Fall", "sidy." + System.currentTimeMillis() + "@edepot.sn", "+221772223344", "PassSidy123!",
                UserRole.COMMERCANT, "Coopérative Mangues", "Fruits", null, null, null, null, "Marché", "Ziguinchor"
        ));

        // 2. Inscription camionneur
        AuthResponse cam = authService.register(new RegisterRequest(
                "Modou Faye", "modou." + System.currentTimeMillis() + "@edepot.sn", "+221775556677", "PassModou123!",
                UserRole.CAMIONNEUR, null, null, "Benne", 8000, "KL-1234-A", List.of("Ziguinchor"), "Garage", "Kolda"
        ));

        // 3. Commerçant publie une demande
        DemandeTransport d = new DemandeTransport();
        d.setOrigine("Ziguinchor");
        d.setDestination("Cap Skirring");
        d.setTypeMarchandise("Sacs d'oranges et papayes");
        d.setPoidsKg(2500.0);
        d.setPrixPropose(85000.0);
        d.setDateChargement("2025-11-01");
        d.setDestinataire(new DemandeTransport.DestinataireDto("Khadija Ba", "+221778901234", "Boutique Hôtel", "Cap Skirring"));

        DemandeTransport savedD = demandeService.creerDemande(d, comm.user());
        assertNotNull(savedD.getId());
        assertEquals(StatutDemande.OUVERTE, savedD.getStatut());

        // 4. Camionneur soumet une offre
        OffreTransport off = new OffreTransport();
        off.setDemandeId(savedD.getId());
        off.setPrixPropose(80000.0);
        off.setDateDisponible("2025-11-01");
        off.setConditions("Prise en charge bâchée garantie");

        OffreTransport savedOff = offreService.creerOffre(off, cam.user());
        assertNotNull(savedOff.getId());
        assertEquals(StatutOffre.EN_ATTENTE, savedOff.getStatut());

        // 5. Commerçant accepte l'offre -> Génère l'expédition
        Map<String, Object> acceptRes = offreService.accepterOffre(savedOff.getId(), comm.user());
        Expedition exp = (Expedition) acceptRes.get("expedition");
        assertNotNull(exp);
        assertEquals(StatutExpedition.A_PAYER, exp.getStatut());
        assertEquals(80000.0, exp.getPrixConvenu());

        // 6. Commerçant verse le séquestre Wave
        Transaction tx = sequestreService.payerSequestreExpedition(exp, "+221772223344");
        assertNotNull(tx);
        assertEquals(StatutPaiement.CONFIRME_SEQUESTRE, tx.getStatut());
        assertEquals(4000.0, tx.getMontantCommission(), "Commission de 5 % = 4 000 FCFA");
        assertEquals(76000.0, tx.getMontantNetTransporteur(), "Net chauffeur 95 % = 76 000 FCFA");

        // 7. Validation OTP à la livraison
        assertNotNull(exp.getCodeOtp());
        Map<String, Object> otpRes = sequestreService.validerOtpExpedition(exp, exp.getCodeOtp());
        assertTrue((Boolean) otpRes.get("success"));
        assertEquals(StatutExpedition.LIVREE, exp.getStatut());
    }
}
