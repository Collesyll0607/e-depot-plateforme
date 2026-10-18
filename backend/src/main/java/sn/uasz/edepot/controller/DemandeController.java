package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.model.DemandeTransport;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.service.DemandeService;
import sn.uasz.edepot.service.SequestreService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/demandes")
@Tag(name = "Demandes de Fret", description = "Publication et recherche de cargaisons en Casamance")
public class DemandeController {

    private final DemandeService demandeService;
    private final SequestreService sequestreService;

    public DemandeController(DemandeService demandeService, SequestreService sequestreService) {
        this.demandeService = demandeService;
        this.sequestreService = sequestreService;
    }

    @GetMapping
    @Operation(summary = "Lister les annonces de transport avec filtres facultatifs")
    public ResponseEntity<List<DemandeTransport>> getDemandes(
            @RequestParam(required = false) String commercantId,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String zone
    ) {
        return ResponseEntity.ok(demandeService.getDemandes(commercantId, statut, zone));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'une demande de fret")
    public ResponseEntity<?> getDemandeById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(demandeService.getById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Publier une nouvelle annonce de transport (Expéditeur / Commerçant)")
    public ResponseEntity<?> creerDemande(
            @RequestBody DemandeTransport demande,
            @AuthenticationPrincipal User user
    ) {
        try {
            DemandeTransport created = demandeService.creerDemande(demande, user);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/annuler")
    @Operation(summary = "Annuler une annonce de transport")
    public ResponseEntity<?> annulerDemande(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(demandeService.annulerDemande(id, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // --- Endpoints de compatibilité existants pour Sequestre / OTP direct ---
    @PostMapping("/{id}/sequestre")
    @Operation(summary = "Bloquer les fonds en séquestre Wave Sandbox")
    public ResponseEntity<?> initierSequestre(@PathVariable String id, @RequestParam double montant) {
        DemandeTransport d = demandeService.getById(id);
        return ResponseEntity.ok(sequestreService.bloquerFondsSequestre(d, montant));
    }

    @PostMapping("/{id}/valider-otp")
    @Operation(summary = "Valider l'OTP de réception et libérer le paiement Wave")
    public ResponseEntity<?> validerOtp(@PathVariable String id, @RequestParam String otp) {
        DemandeTransport d = demandeService.getById(id);
        return ResponseEntity.ok(sequestreService.validerOtpEtLibererFonds(d, otp));
    }
}
