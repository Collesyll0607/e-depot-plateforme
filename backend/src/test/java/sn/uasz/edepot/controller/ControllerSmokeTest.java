package sn.uasz.edepot.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "admin@edepot.sn", roles = {"ADMIN", "COMMERCANT", "TRANSPORTEUR"})
@DisplayName("Tests des Contrôleurs REST E-Dépôt (Smoke Tests)")
class ControllerSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/health - Endpoint de santé public accessible")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/admin/stats - Accessible")
    void testAdminStatsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/demandes - Lister demandes ouvertes")
    void testGetDemandes() throws Exception {
        mockMvc.perform(get("/api/v1/demandes?statut=OUVERTE"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/offres - Lister offres")
    void testGetOffres() throws Exception {
        mockMvc.perform(get("/api/v1/offres"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/expeditions - Lister expéditions")
    void testGetExpeditions() throws Exception {
        mockMvc.perform(get("/api/v1/expeditions"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/transactions - Lister transactions")
    void testGetTransactions() throws Exception {
        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/litiges - Lister litiges")
    void testGetLitiges() throws Exception {
        mockMvc.perform(get("/api/v1/litiges"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/evaluations - Lister évaluations")
    void testGetEvaluations() throws Exception {
        mockMvc.perform(get("/api/v1/evaluations"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/users - Lister utilisateurs")
    void testGetUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk());
    }
}
