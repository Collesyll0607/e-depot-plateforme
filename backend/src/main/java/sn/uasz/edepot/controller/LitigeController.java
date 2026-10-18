package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.dto.ArbitrageRequest;
import sn.uasz.edepot.model.Litige;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.service.LitigeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/litiges")
@Tag(name = "Litiges & Arbitrage", description = "Gestion des réclamations et procédure de médiation")
public class LitigeController {

    private final LitigeService litigeService;

    public LitigeController(LitigeService litigeService) {
        this.litigeService = litigeService;
    }

    @GetMapping
    @Operation(summary = "Lister les litiges")
    public ResponseEntity<List<Litige>> getLitiges() {
        return ResponseEntity.ok(litigeService.getAll());
    }

    @PostMapping
    @Operation(summary = "Déposer une réclamation de transport (Commerçant ou Camionneur)")
    public ResponseEntity<?> creerLitige(
            @RequestBody Litige litige,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(litigeService.creerLitige(litige, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/arbitrer")
    @Operation(summary = "Prononcer une décision d'arbitrage officiel (Administrateur)")
    public ResponseEntity<?> arbitrerLitige(
            @PathVariable String id,
            @RequestBody ArbitrageRequest req,
            @AuthenticationPrincipal User admin
    ) {
        try {
            return ResponseEntity.ok(litigeService.arbitrer(id, req, admin));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
