package sn.uasz.edepot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import sn.uasz.edepot.dto.*;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.ExpeditionRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests d'Intégration Complets — Parcours Métier & API REST Sécurisée JWT")
class BusinessFlowsAndApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpeditionRepository expeditionRepository;

    private String adminToken;
    private String commercantToken;
    private String camionneurToken;

    @BeforeEach
    void authenticateSeededUsers() throws Exception {
        adminToken = loginAndGetToken("admin.test@edepot.sn", "AdminTest2025!");
        commercantToken = loginAndGetToken("aissatou@edepot.sn", "Passer123!");
        camionneurToken = loginAndGetToken("moussa@edepot.sn", "Passer123!");
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    @Test
    @DisplayName("1. Auth API : /login, /register, /me avec JWT réel et cas d'erreur")
    void testAuthEndpointsAndJwtFilter() throws Exception {
        // /me avec JWT valide
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("aissatou@edepot.sn"));

        // /me sans JWT -> 401
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());

        // /me avec JWT corrompu -> 401
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());

        // /login avec mauvais mot de passe -> 401
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("aissatou@edepot.sn", "WrongPass!"))))
                .andExpect(status().isUnauthorized());

        // /register valide
        String uniqueEmail = "dest.api." + System.currentTimeMillis() + "@edepot.sn";
        RegisterRequest regReq = new RegisterRequest(
                "Mamadou Sarr", uniqueEmail, "+221779998877", "Passer123!",
                UserRole.DESTINATAIRE, null, null, null, null, null, null,
                "Marché Castor", "Dakar"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // /register doublon -> 400
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("2. Cycle complet : Demande -> Contre-proposition -> Offre -> Séquestre -> Statuts GPS -> Validation OTP")
    void testFullFreightSequestreAndOtpFlow() throws Exception {
        // A. Créer une demande de fret
        DemandeTransport demande = new DemandeTransport();
        demande.setOrigine("Ziguinchor");
        demande.setDestination("Dakar");
        demande.setTypeMarchandise("Mangues Kent Bio");
        demande.setPoidsKg(2500.0);
        demande.setPrixPropose(150000.0);
        demande.setDateChargement("2026-12-01");
        demande.setDestinataireNom("Amadou Fall");
        demande.setDestinataireTelephone("+221776543210");
        demande.setDestinataireAdresse("Marché Syndicat");
        demande.setDestinataireVille("Dakar");

        MvcResult demRes = mockMvc.perform(post("/api/v1/demandes")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(demande)))
                .andExpect(status().isOk())
                .andReturn();
        String demandeId = objectMapper.readTree(demRes.getResponse().getContentAsString()).get("id").asText();

        // Consulter demande par ID + filtres + 404
        mockMvc.perform(get("/api/v1/demandes/" + demandeId)
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.typeMarchandise").value("Mangues Kent Bio"));

        mockMvc.perform(get("/api/v1/demandes/id-inexistant")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/demandes?commercantId=comm-aissatou-01&statut=OUVERTE&zone=Ziguinchor")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        // Un camionneur ne peut pas créer de demande -> 400
        mockMvc.perform(post("/api/v1/demandes")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(demande)))
                .andExpect(status().isBadRequest());

        // B. Créer deux offres par le camionneur
        OffreTransport offre1 = new OffreTransport();
        offre1.setDemandeId(demandeId);
        offre1.setPrixPropose(140000.0);
        offre1.setDateDisponible("2026-12-01");
        offre1.setConditions("Camion frigorifique prêt");

        MvcResult off1Res = mockMvc.perform(post("/api/v1/offres")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offre1)))
                .andExpect(status().isOk())
                .andReturn();
        String offre1Id = objectMapper.readTree(off1Res.getResponse().getContentAsString()).get("id").asText();

        OffreTransport offre2 = new OffreTransport();
        offre2.setDemandeId(demandeId);
        offre2.setPrixPropose(160000.0);
        offre2.setDateDisponible("2026-12-02");
        offre2.setConditions("Départ matinal");
        MvcResult off2Res = mockMvc.perform(post("/api/v1/offres")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offre2)))
                .andExpect(status().isOk())
                .andReturn();
        String offre2Id = objectMapper.readTree(off2Res.getResponse().getContentAsString()).get("id").asText();

        // Filtrer les offres
        mockMvc.perform(get("/api/v1/offres?demandeId=" + demandeId + "&camionneurId=cam-moussa-01")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        // Contre-proposition sur offre1
        ContrePropositionRequest cpReq = new ContrePropositionRequest(135000.0, "Pouvez-vous faire 135 000 FCFA ?", "COMMERCANT");
        mockMvc.perform(post("/api/v1/offres/" + offre1Id + "/contre-proposition")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cpReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("CONTRE_PROPOSITION"));

        // Refuser offre2
        mockMvc.perform(post("/api/v1/offres/" + offre2Id + "/refuser")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("REFUSEE"));

        // Accepter offre1 -> génère l'expédition
        MvcResult accRes = mockMvc.perform(post("/api/v1/offres/" + offre1Id + "/accepter")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andReturn();
        String expId = objectMapper.readTree(accRes.getResponse().getContentAsString())
                .get("expedition").get("id").asText();

        // C. Consulter expéditions avec filtres et par ID + 404
        mockMvc.perform(get("/api/v1/expeditions?commercantId=comm-aissatou-01&camionneurId=cam-moussa-01&destinataireTelephone=%2B221776543210")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/expeditions/" + expId)
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/expeditions/exp-inexistante")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isNotFound());

        // D. Payer le séquestre Wave Sandbox
        PaiementSequestreRequest payReq = new PaiementSequestreRequest("+221771234567");
        MvcResult txRes = mockMvc.perform(post("/api/v1/expeditions/" + expId + "/payer-sequestre")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("CONFIRME_SEQUESTRE"))
                .andReturn();
        String txId = objectMapper.readTree(txRes.getResponse().getContentAsString()).get("id").asText();

        // Consulter transactions filtrées et par ID + 404
        mockMvc.perform(get("/api/v1/transactions?commercantId=comm-aissatou-01&camionneurId=cam-moussa-01")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/transactions/" + txId)
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/transactions/tx-inexistante")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isNotFound());

        // E. Progression des statuts GPS par le camionneur
        mockMvc.perform(patch("/api/v1/expeditions/" + expId + "/statut")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStatusRequest(StatutExpedition.CHARGEE, "Chargement effectué à Boutoute"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("CHARGEE"));

        mockMvc.perform(patch("/api/v1/expeditions/" + expId + "/statut")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStatusRequest(StatutExpedition.EN_ROUTE, "Passage pont de Farafenni"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_ROUTE"));

        mockMvc.perform(patch("/api/v1/expeditions/" + expId + "/statut")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStatusRequest(StatutExpedition.LIVREE_A_CONFIRMER, ""))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("LIVREE_A_CONFIRMER"));

        // Rejet si le commerçant essaie de changer le statut de route -> 400
        mockMvc.perform(patch("/api/v1/expeditions/" + expId + "/statut")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStatusRequest(StatutExpedition.EN_ROUTE, "Tentative non autorisée"))))
                .andExpect(status().isBadRequest());

        // F. Validation OTP (mauvais code -> 400, puis bon code -> 200)
        mockMvc.perform(post("/api/v1/expeditions/" + expId + "/valider-otp")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpValidationRequest("0000"))))
                .andExpect(status().isBadRequest());

        Expedition expInDb = expeditionRepository.findById(expId).orElseThrow();
        String realOtp = expInDb.getCodeOtp();
        assertNotNull(realOtp);

        mockMvc.perform(post("/api/v1/expeditions/" + expId + "/valider-otp")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpValidationRequest(realOtp))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expedition.statut").value("LIVREE"));

        // G. Tester aussi l'annulation sur une autre demande
        MvcResult dem2Res = mockMvc.perform(post("/api/v1/demandes")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(demande)))
                .andExpect(status().isOk())
                .andReturn();
        String dem2Id = objectMapper.readTree(dem2Res.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/demandes/" + dem2Id + "/annuler")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANNULEE"));
    }

    @Test
    @DisplayName("3. Litiges & Arbitrage Administrateur (Libération, Remboursement Total & Partiel)")
    void testLitigeCreationAndAllArbitrageResolutions() throws Exception {
        // Créer 3 expéditions avec séquestre pour tester les 3 résolutions d'arbitrage
        ResolutionLitige[] resolutions = {
                ResolutionLitige.LIBERATION_CAMIONNEUR,
                ResolutionLitige.REMBOURSEMENT_TOTAL,
                ResolutionLitige.REMBOURSEMENT_PARTIEL
        };

        for (ResolutionLitige resType : resolutions) {
            String expId = createPaidExpedition();

            Litige litigeReq = new Litige();
            litigeReq.setExpeditionId(expId);
            litigeReq.setMotif("Avarie partielle constatée à l'arrivée");
            litigeReq.setDescription("Quelques cagettes endommagées durant le trajet.");

            MvcResult litRes = mockMvc.perform(post("/api/v1/litiges")
                            .header("Authorization", "Bearer " + commercantToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(litigeReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.statut").value("OUVERT"))
                    .andReturn();
            String litigeId = objectMapper.readTree(litRes.getResponse().getContentAsString()).get("id").asText();

            // Tentative d'arbitrage par un commerçant -> 400
            ArbitrageRequest arbReq = new ArbitrageRequest(resType, "Décision arbitrale test " + resType, 50000.0);
            mockMvc.perform(post("/api/v1/litiges/" + litigeId + "/arbitrer")
                            .header("Authorization", "Bearer " + commercantToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(arbReq)))
                    .andExpect(status().isBadRequest());

            // Arbitrage officiel par l'administrateur -> 200
            mockMvc.perform(post("/api/v1/litiges/" + litigeId + "/arbitrer")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(arbReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.statut").value("RESOLU"))
                    .andExpect(jsonPath("$.typeResolution").value(resType.name()));
        }

        // Litige sur expédition inexistante -> 400
        Litige badLitige = new Litige();
        badLitige.setExpeditionId("exp-inexistante");
        badLitige.setMotif("Test erreur");
        mockMvc.perform(post("/api/v1/litiges")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLitige)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4. Évaluations & Recalcul de la Note Moyenne du Transporteur")
    void testEvaluationCreationAndFiltering() throws Exception {
        Evaluation ev = new Evaluation();
        ev.setExpeditionId("exp-demo-01");
        ev.setCibleId("cam-moussa-01");
        ev.setCibleNom("Moussa Badji");
        ev.setNote(5);
        ev.setCommentaire("Livraison impeccable et très ponctuelle !");

        mockMvc.perform(post("/api/v1/evaluations")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ev)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value(5))
                .andExpect(jsonPath("$.auteurId").value("comm-aissatou-01"));

        mockMvc.perform(get("/api/v1/evaluations?cibleId=cam-moussa-01&auteurId=comm-aissatou-01")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("5. Gestion des Profils Utilisateurs (/api/v1/users/{id} GET & PATCH + RBAC)")
    void testUserProfileEndpointsAndPermissions() throws Exception {
        // GET user par ID + 404
        mockMvc.perform(get("/api/v1/users/cam-moussa-01")
                        .header("Authorization", "Bearer " + camionneurToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("moussa@edepot.sn"));

        mockMvc.perform(get("/api/v1/users/user-inexistant")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());

        // PATCH complet par le camionneur sur son propre profil
        Map<String, Object> updates = new HashMap<>();
        updates.put("nom", "Moussa Badji");
        updates.put("telephone", "+221772345678");
        updates.put("adresse", "Gare routière Ziguinchor");
        updates.put("ville", "Ziguinchor");
        updates.put("nomEntreprise", "Transports Badji");
        updates.put("secteurActivite", "Fret Agricole");
        updates.put("typeCamion", "PLATEAU_10T");
        updates.put("immatriculation", "ZG-4592-A");
        updates.put("disponible", true);
        updates.put("capaciteKg", 12000);
        updates.put("zonesDesservies", List.of("Ziguinchor", "Bignona", "Dakar"));

        mockMvc.perform(patch("/api/v1/users/cam-moussa-01")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capaciteKg").value(12000));

        // PATCH par un autre utilisateur non-admin -> 403 Forbidden
        mockMvc.perform(patch("/api/v1/users/cam-moussa-01")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("ville", "Kaolack"))))
                .andExpect(status().isForbidden());

        // PATCH validation compte par l'administrateur -> 200 OK
        mockMvc.perform(patch("/api/v1/users/cam-moussa-01")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("verifie", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verifie").value(true));

        // PATCH utilisateur inexistant -> 404
        mockMvc.perform(patch("/api/v1/users/user-inexistant")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("verifie", true))))
                .andExpect(status().isNotFound());
    }

    private String createPaidExpedition() throws Exception {
        DemandeTransport d = new DemandeTransport();
        d.setOrigine("Bignona");
        d.setDestination("Dakar");
        d.setTypeMarchandise("Noix de cajou");
        d.setPoidsKg(1800.0);
        d.setPrixPropose(110000.0);
        d.setDateChargement("2026-12-05");
        d.setDestinataireNom("Ousmane Sané");
        d.setDestinataireTelephone("+221778889900");
        d.setDestinataireAdresse("Port de Dakar");
        d.setDestinataireVille("Dakar");

        MvcResult demRes = mockMvc.perform(post("/api/v1/demandes")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(d)))
                .andExpect(status().isOk())
                .andReturn();
        String demId = objectMapper.readTree(demRes.getResponse().getContentAsString()).get("id").asText();

        OffreTransport o = new OffreTransport();
        o.setDemandeId(demId);
        o.setPrixPropose(100000.0);
        o.setDateDisponible("2026-12-05");
        MvcResult offRes = mockMvc.perform(post("/api/v1/offres")
                        .header("Authorization", "Bearer " + camionneurToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(o)))
                .andExpect(status().isOk())
                .andReturn();
        String offId = objectMapper.readTree(offRes.getResponse().getContentAsString()).get("id").asText();

        MvcResult accRes = mockMvc.perform(post("/api/v1/offres/" + offId + "/accepter")
                        .header("Authorization", "Bearer " + commercantToken))
                .andExpect(status().isOk())
                .andReturn();
        String expId = objectMapper.readTree(accRes.getResponse().getContentAsString())
                .get("expedition").get("id").asText();

        mockMvc.perform(post("/api/v1/expeditions/" + expId + "/payer-sequestre")
                        .header("Authorization", "Bearer " + commercantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaiementSequestreRequest("+221771234567"))))
                .andExpect(status().isOk());

        return expId;
    }
}
