package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.dto.OtpValidationRequest;
import sn.uasz.edepot.dto.PaiementSequestreRequest;
import sn.uasz.edepot.dto.UpdateStatusRequest;
import sn.uasz.edepot.model.Expedition;
import sn.uasz.edepot.model.Transaction;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.service.ExpeditionService;
import sn.uasz.edepot.service.SequestreService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expeditions")
@Tag(name = "Expéditions & Suivi", description = "Gestion des trajets, paiements en séquestre et validation OTP")
public class ExpeditionController {

    private final ExpeditionService expeditionService;
    private final SequestreService sequestreService;

    public ExpeditionController(ExpeditionService expeditionService, SequestreService sequestreService) {
        this.expeditionService = expeditionService;
        this.sequestreService = sequestreService;
    }

    @GetMapping
    @Operation(summary = "Lister les expéditions avec filtres (Commerçant, Camionneur, Destinataire)")
    public ResponseEntity<List<Expedition>> getExpeditions(
            @RequestParam(required = false) String commercantId,
            @RequestParam(required = false) String camionneurId,
            @RequestParam(required = false) String destinataireTelephone
    ) {
        return ResponseEntity.ok(expeditionService.getExpeditions(commercantId, camionneurId, destinataireTelephone));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail d'une expédition")
    public ResponseEntity<?> getExpeditionById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(expeditionService.getById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/payer-sequestre")
    @Operation(summary = "Bloquer les fonds en séquestre Wave Sandbox (Commerçant)")
    public ResponseEntity<?> payerSequestre(
            @PathVariable String id,
            @RequestBody PaiementSequestreRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            Expedition exp = expeditionService.getById(id);
            Transaction tx = sequestreService.payerSequestreExpedition(exp, req.waveNumero());
            return ResponseEntity.ok(tx);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    @Operation(summary = "Mettre à jour l'avancement de la cargaison (Chargement, Départ, Arrivée)")
    public ResponseEntity<?> updateStatut(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            Expedition updated = expeditionService.mettreAJourStatut(id, req.statut(), req.note(), user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/valider-otp")
    @Operation(summary = "Valider l'OTP destinataire et débloquer le virement Wave (Chauffeur)")
    public ResponseEntity<?> validerOtp(
            @PathVariable String id,
            @RequestBody OtpValidationRequest req
    ) {
        try {
            Expedition exp = expeditionService.getById(id);
            Map<String, Object> result = sequestreService.validerOtpExpedition(exp, req.codeOtp());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
