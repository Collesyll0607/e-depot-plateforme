package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.dto.ContrePropositionRequest;
import sn.uasz.edepot.model.OffreTransport;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.service.OffreService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/offres")
@Tag(name = "Offres de Transport", description = "Propositions tarifaires des camionneurs et négociation")
public class OffreController {

    private final OffreService offreService;

    public OffreController(OffreService offreService) {
        this.offreService = offreService;
    }

    @GetMapping
    @Operation(summary = "Lister les offres avec filtres par demande ou par camionneur")
    public ResponseEntity<List<OffreTransport>> getOffres(
            @RequestParam(required = false) String demandeId,
            @RequestParam(required = false) String camionneurId
    ) {
        return ResponseEntity.ok(offreService.getOffres(demandeId, camionneurId));
    }

    @PostMapping
    @Operation(summary = "Soumettre une offre tarifaire pour une cargaison (Transporteur)")
    public ResponseEntity<?> creerOffre(
            @RequestBody OffreTransport offre,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(offreService.creerOffre(offre, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/accepter")
    @Operation(summary = "Accepter une offre de transport et initier l'expédition (Commerçant)")
    public ResponseEntity<?> accepterOffre(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(offreService.accepterOffre(id, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/refuser")
    @Operation(summary = "Refuser une offre de transport")
    public ResponseEntity<?> refuserOffre(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(offreService.refuserOffre(id, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/contre-proposition")
    @Operation(summary = "Faire une contre-proposition tarifaire négociée")
    public ResponseEntity<?> contreProposition(
            @PathVariable String id,
            @RequestBody ContrePropositionRequest req,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(offreService.faireContreProposition(id, req, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
