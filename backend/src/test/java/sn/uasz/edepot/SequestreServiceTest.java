package sn.uasz.edepot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import sn.uasz.edepot.model.DemandeTransport;
import sn.uasz.edepot.model.StatutDemande;
import sn.uasz.edepot.service.SequestreService;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests Unitaires — Module Séquestre Wave & OTP E-Dépôt")
class SequestreServiceTest {

    private SequestreService sequestreService;
    private DemandeTransport demande;

    @BeforeEach
    void setUp() {
        sequestreService = new SequestreService();
        demande = new DemandeTransport("Amadou Ba", "+221775123456", "Oussouye", "Ziguinchor", 350.0, "Mangues", 45000.0);
        demande.setId(101L);
    }

    @Test
    @DisplayName("TC01 : Blocage effectif des fonds et statut mis à jour")
    void testBloquerFondsSequestre() {
        Map<String, Object> res = sequestreService.bloquerFondsSequestre(demande, 45000.0);

        assertNotNull(res);
        assertEquals(StatutDemande.SEQUESTRE_BLOQUE, demande.getStatut());
        assertEquals(45000.0, res.get("montantBloqueFCFA"));
        assertNotNull(res.get("otpEnvoyeAuDestinataire"));
    }

    @Test
    @DisplayName("TC02 : Libération des fonds avec calcul exact de la commission de 5%")
    void testValiderOtpEtLibererFondsNominal() {
        Map<String, Object> blocage = sequestreService.bloquerFondsSequestre(demande, 45000.0);
        String otp = (String) blocage.get("otpEnvoyeAuDestinataire");

        Map<String, Object> validation = sequestreService.validerOtpEtLibererFonds(demande, otp);

        assertEquals(StatutDemande.LIVRE_SEQUESTRE_LIBERE, demande.getStatut());
        assertEquals(42750.0, (Double) validation.get("versementCamionneurFCFA"), "95 % doit être versé au camionneur");
        assertEquals(2250.0, (Double) validation.get("commissionPlateformeFCFA"), "5 % doit être retenu par la plateforme E-Dépôt");
    }

    @Test
    @DisplayName("TC03 : Échec en cas de code OTP erroné (Sécurité anti-fraude)")
    void testValiderOtpInvalide() {
        sequestreService.bloquerFondsSequestre(demande, 45000.0);

        assertThrows(IllegalArgumentException.class, () -> {
            sequestreService.validerOtpEtLibererFonds(demande, "000000");
        });
    }
}
